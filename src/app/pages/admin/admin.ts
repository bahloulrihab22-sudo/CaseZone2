import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { form, FormField, required, min, minLength, maxLength, pattern, validate } from '@angular/forms/signals';
import { CoqueService } from '../../services/coque-service';
import { CompteService } from '../../services/compte-service';
import { Coque } from '../../models/modeles';
import { DisponibilitePipe } from '../../pipes/disponibilite-pipe';

@Component({
  selector: 'app-admin',
  imports: [RouterLink, FormField, DatePipe, DecimalPipe, DisponibilitePipe],
  templateUrl: './admin.html'
})
export class Admin {
  private readonly coqueService = inject(CoqueService);
  private readonly compteService = inject(CompteService);
  compte = this.compteService.compte;
  coques = this.coqueService.coques;
  recherche = signal('');
  attente = signal(false);
  erreur = signal('');
  message = signal('');
  selection = signal<Coque | undefined>(undefined);
  suppression = signal<Coque | undefined>(undefined);
  coquesAffichees = computed(() => this.coques().filter(c =>
    c.nom.toLowerCase().includes(this.recherche().trim().toLowerCase())
  ));
  disponibles = computed(() => this.coques().filter(c => c.disponible).length);
  epuisees = computed(() => this.coques().length - this.disponibles());

  connexion = signal({ login: '', motDePasse: '' });
  connexionForm = form(this.connexion, p => {
    required(p.login, { message: 'Le login est obligatoire.' });
    pattern(p.login, /\S/, { message: 'Le login ne peut pas être vide.' });
    required(p.motDePasse, { message: 'Le mot de passe est obligatoire.' });
  });

  produit = signal(this.produitVide());
  produitForm = form(this.produit, p => {
    required(p.nom, { message: 'Le nom est obligatoire.' });
    pattern(p.nom, /\S/, { message: 'Le nom ne peut pas contenir seulement des espaces.' });
    maxLength(p.nom, 100, { message: 'Nom : 100 caractères maximum.' });
    required(p.photo, { message: 'La photo est obligatoire.' });
    validate(p.photo, ({ value }) =>
      value().startsWith('images/') || value().startsWith('https://') || value().startsWith('http://')
        ? undefined : { kind: 'photo', message: 'Photo : chemin images/… ou URL http(s).' });
    required(p.prix, { message: 'Le prix est obligatoire.' });
    min(p.prix, 0.01, { message: 'Le prix doit être supérieur à zéro.' });
    validate(p.prix, ({ value }) => Number.isFinite(value()) ? undefined :
      { kind: 'prix', message: 'Le prix doit être un nombre valide.' });
    required(p.modele, { message: 'Le modèle est obligatoire.' });
    pattern(p.modele, /\S/, { message: 'Le modèle ne peut pas être vide.' });
    required(p.couleur, { message: 'La couleur est obligatoire.' });
    pattern(p.couleur, /\S/, { message: 'La couleur ne peut pas être vide.' });
    required(p.dateAjout, { message: 'La date est obligatoire.' });
    validate(p.dateAjout, ({ value }) => !Number.isNaN(new Date(value()).getTime()) ? undefined :
      { kind: 'date', message: 'La date est invalide.' });
  });

  motDePasse = signal({ ancien: '', nouveau: '', confirmation: '' });
  motDePasseForm = form(this.motDePasse, p => {
    required(p.ancien, { message: 'L’ancien mot de passe est obligatoire.' });
    required(p.nouveau, { message: 'Le nouveau mot de passe est obligatoire.' });
    minLength(p.nouveau, 6, { message: 'Le nouveau mot de passe doit avoir au moins 6 caractères.' });
    pattern(p.nouveau, /\S/, { message: 'Le mot de passe ne peut pas contenir seulement des espaces.' });
    required(p.confirmation, { message: 'La confirmation est obligatoire.' });
    validate(p.confirmation, ({ value, valueOf }) => value() === valueOf(p.nouveau) ? undefined :
      { kind: 'confirmation', message: 'Les deux nouveaux mots de passe doivent être identiques.' });
  });

  constructor() {
    if (this.compte()) this.charger();
  }

  produitVide() {
    return { nom: '', photo: 'images/coque-rose.svg', prix: 0, disponible: true,
      dateAjout: '', modele: '', couleur: '' };
  }

  charger(): void {
    if (!this.compte() || this.attente()) return;
    this.attente.set(true);
    this.erreur.set('');
    this.coqueService.getCoques().subscribe({
      next: () => this.attente.set(false),
      error: () => this.echec('Impossible de charger le catalogue. Vérifiez le serveur JSON.')
    });
  }

  connecter(event: Event): void {
    event.preventDefault();
    if (this.connexionForm().invalid() || this.attente()) return;
    this.attente.set(true);
    this.erreur.set('');
    this.message.set('');
    const donnees = this.connexion();
    this.compteService.connecter(donnees.login.trim(), donnees.motDePasse).subscribe({
      next: () => {
        this.attente.set(false);
        if (!this.compte()) {
          this.erreur.set('Login ou mot de passe incorrect.');
          return;
        }
        this.connexionForm().reset({ login: '', motDePasse: '' });
        this.charger();
      },
      error: () => this.echec('Connexion impossible. Vérifiez le serveur JSON.')
    });
  }

  deconnecter(): void {
    if (this.attente()) return;
    this.compteService.deconnecter();
    this.annuler();
    this.suppression.set(undefined);
    this.motDePasseForm().reset({ ancien: '', nouveau: '', confirmation: '' });
    this.recherche.set('');
    this.erreur.set('');
    this.message.set('');
  }

  choisir(coque: Coque): void {
    if (!this.compte() || this.attente()) return;
    this.selection.set(coque);
    this.produitForm().reset({
      nom: coque.nom, photo: coque.photo, prix: coque.prix, disponible: coque.disponible,
      dateAjout: new Date(coque.dateAjout).toISOString().slice(0, 10),
      modele: coque.modele, couleur: coque.couleur
    });
    this.erreur.set('');
    this.message.set('');
  }

  annuler(): void {
    this.selection.set(undefined);
    this.produitForm().reset(this.produitVide());
  }

  enregistrer(event: Event): void {
    event.preventDefault();
    if (!this.compte() || this.produitForm().invalid() || this.attente()) return;
    const valeur = this.produit();
    const actuelle = this.selection();
    const coque: Coque = {
      ...valeur, id: actuelle?.id || '', nom: valeur.nom.trim(),
      modele: valeur.modele.trim(), couleur: valeur.couleur.trim(),
      dateAjout: new Date(valeur.dateAjout), comments: actuelle?.comments || []
    };
    this.attente.set(true);
    this.erreur.set('');
    this.message.set('');
    const requete = actuelle ? this.coqueService.modifier(coque) : this.coqueService.ajouter(coque);
    requete.subscribe({
      next: () => {
        this.attente.set(false);
        this.message.set(actuelle ? 'Coque modifiée.' : 'Coque ajoutée.');
        this.annuler();
      },
      error: () => this.echec('Enregistrement impossible. Vos saisies sont conservées.')
    });
  }

  supprimer(): void {
    const coque = this.suppression();
    if (!this.compte() || !coque || this.attente()) return;
    this.attente.set(true);
    this.erreur.set('');
    this.message.set('');
    this.coqueService.supprimer(coque.id).subscribe({
      next: () => {
        this.attente.set(false);
        this.suppression.set(undefined);
        if (this.selection()?.id === coque.id) this.annuler();
        this.message.set('Coque supprimée.');
      },
      error: () => this.echec('Suppression impossible. La coque est conservée.')
    });
  }

  changerMotDePasse(event: Event): void {
    event.preventDefault();
    if (!this.compte() || this.motDePasseForm().invalid() || this.attente()) return;
    this.attente.set(true);
    this.erreur.set('');
    this.message.set('');
    const valeurs = this.motDePasse();
    this.compteService.verifier().subscribe({
      next: compte => {
        if (compte.motDePasse !== valeurs.ancien) {
          this.echec('L’ancien mot de passe est incorrect.');
          return;
        }
        this.compteService.changerMotDePasse(valeurs.nouveau).subscribe({
          next: () => {
            this.attente.set(false);
            this.message.set('Mot de passe modifié.');
            this.motDePasseForm().reset({ ancien: '', nouveau: '', confirmation: '' });
          },
          error: () => this.echec('Le mot de passe n’a pas pu être modifié.')
        });
      },
      error: () => this.echec('Impossible de vérifier l’ancien mot de passe.')
    });
  }

  private echec(message: string): void {
    this.attente.set(false);
    this.erreur.set(message);
  }
}
