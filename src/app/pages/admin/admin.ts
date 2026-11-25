
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { form, FormRoot, FormField, required, min, minLength, maxLength, pattern } from '@angular/forms/signals';

import { CoqueService } from '../../services/coque-service';
import { CompteService } from '../../services/compte-service';
import { Coque } from '../../models/modeles';
import { DisponibilitePipe } from '../../pipes/disponibilite-pipe';

@Component({
  selector: 'app-admin',
  imports: [RouterLink, FormRoot, FormField, DatePipe, DecimalPipe, DisponibilitePipe],
  templateUrl: './admin.html'
})

export class Admin implements OnInit {

  private readonly coqueService = inject(CoqueService);
  private readonly compteService = inject(CompteService);

  compte = this.compteService.compte;
  coques = this.coqueService.coques;



  // RECHERCHE ET STATISTIQUES

  readonly recherche = signal<string>('');

  coquesAffichees = computed(() =>
    this.coques().filter(c =>
      c.nom.toLowerCase().includes(
        this.recherche().trim().toLowerCase()
      )
    )
  );

  disponibles = computed(() =>
    this.coques().filter(c => c.disponible).length
  );

  epuisees = computed(() =>
    this.coques().length - this.disponibles()
  );


  // FORMULAIRE DE CONNEXION

  readonly connexion = signal<{ login: string; motDePasse: string }>({
    login: '',
    motDePasse: ''
  });

  connexionForm = form(this.connexion, path => {
    required(path.login, { message: 'Le login est obligatoire.' });

    pattern(path.login, /\S/, {
      message: 'Le login ne peut pas être vide.'
    });

    required(path.motDePasse, {
      message: 'Le mot de passe est obligatoire.'
    });
  });


  // FORMULAIRE AJOUT ET MODIFICATION

  readonly selection = signal<Coque | undefined>(undefined);

  readonly produit = signal<{
    nom: string;
    photo: string;
    prix: number;
    disponible: boolean;
    dateAjout: string;
    modele: string;
    couleur: string;
  }>(this.produitVide());

  produitForm = form(this.produit, path => {

    required(path.nom, { message: 'Le nom est obligatoire.' });

    pattern(path.nom, /\S/, {
      message: 'Le nom ne peut pas contenir seulement des espaces.'
    });

    maxLength(path.nom, 100, {
      message: 'Nom : 100 caractères maximum.'
    });

    required(path.photo, {
      message: 'La photo est obligatoire.'
    });

    pattern(path.photo, /^(images\/|https?:\/\/).+$/, {
      message: 'Photo : chemin images/… ou URL http(s).'
    });

    required(path.prix, {
      message: 'Le prix est obligatoire.'
    });

    min(path.prix, 0.01, {
      message: 'Le prix doit être supérieur à zéro.'
    });

    required(path.modele, {
      message: 'Le modèle est obligatoire.'
    });

    pattern(path.modele, /\S/, {
      message: 'Le modèle ne peut pas être vide.'
    });

    required(path.couleur, {
      message: 'La couleur est obligatoire.'
    });

    pattern(path.couleur, /\S/, {
      message: 'La couleur ne peut pas être vide.'
    });

    required(path.dateAjout, {
      message: 'La date est obligatoire.'
    });
  });


  // FORMULAIRE MOT DE PASSE

  readonly motDePasse = signal<{ ancien: string; nouveau: string; confirmation: string }>({
    ancien: '',
    nouveau: '',
    confirmation: ''
  });

  motDePasseForm = form(this.motDePasse, path => {

    required(path.ancien, {
      message: 'L’ancien mot de passe est obligatoire.'
    });

    required(path.nouveau, {
      message: 'Le nouveau mot de passe est obligatoire.'
    });

    minLength(path.nouveau, 6, {
      message: 'Le nouveau mot de passe doit avoir au moins 6 caractères.'
    });

    pattern(path.nouveau, /\S/, {
      message: 'Le mot de passe ne peut pas contenir seulement des espaces.'
    });

    required(path.confirmation, {
      message: 'La confirmation est obligatoire.'
    });
  });


  // INITIALISATION

  ngOnInit(): void {
    if (this.compte()) {
      this.charger();
    }
  }


  produitVide() {
    return {
      nom: '',
      photo: 'images/coque-rose.png',
      prix: 0,
      disponible: true,
      dateAjout: '',
      modele: '',
      couleur: ''
    };
  }


  // RECUPERATION DES COQUES

  // Indique qu'une requête est en cours et bloque les doubles envois.
  readonly attente = signal<boolean>(false);

  charger(): void {

    if (!this.compte() || this.attente()) {
      return;
    }

    this.attente.set(true);
    this.erreur.set('');

    this.coqueService.getCoques().subscribe({

      next: () => {
        this.attente.set(false);
      },

      error: () => {
        this.echec('Impossible de charger le catalogue. Vérifiez le serveur JSON.');
      }

    });
  }


  // CONNEXION

  connecter(): void {

    if (this.connexionForm().invalid() || this.attente()) {
      return;
    }

    this.attente.set(true);
    this.erreur.set('');
    this.message.set('');

    const donnees = this.connexion();

    this.compteService.connecter(
      donnees.login.trim(),
      donnees.motDePasse
    ).subscribe({

      next: () => {

        this.attente.set(false);

        if (this.compte()) {

          this.connexion.set({
            login: '',
            motDePasse: ''
          });

          this.charger();

        } else {
          this.erreur.set('Login ou mot de passe incorrect.');
        }
      },

      error: () => {
        this.echec('Connexion impossible. Vérifiez le serveur JSON.');
      }

    });
  }


  // DECONNEXION

  deconnecter(): void {

    if (this.attente()) {
      return;
    }

    this.compteService.deconnecter();

    this.annuler();

    this.suppression.set(undefined);

    this.motDePasse.set({
      ancien: '',
      nouveau: '',
      confirmation: ''
    });

    this.recherche.set('');
    this.erreur.set('');
    this.message.set('');
  }


  // SELECTIONNER UNE COQUE A MODIFIER

  choisir(coque: Coque): void {

    if (!this.compte() || this.attente()) {
      return;
    }

    this.selection.set(coque);

    const date = new Date(coque.dateAjout)
      .toISOString().slice(0, 10);

    this.produit.set({
      nom: coque.nom,
      photo: coque.photo,
      prix: coque.prix,
      disponible: coque.disponible,
      dateAjout: date,
      modele: coque.modele,
      couleur: coque.couleur
    });

    this.erreur.set('');
    this.message.set('');
  }


  // REINITIALISER LE FORMULAIRE

  annuler(): void {

    this.selection.set(undefined);
    this.produit.set(this.produitVide());

  }


  // AJOUTER OU MODIFIER UNE COQUE

  enregistrer(): void {

    if (!this.compte() || this.produitForm().invalid() || this.attente()) {
      return;
    }

    const valeur = this.produit();
    const actuelle = this.selection();
    const date = new Date(valeur.dateAjout);

    if (!Number.isFinite(valeur.prix)) {
      this.erreur.set('Le prix doit être un nombre valide.');
      return;
    }

    if (Number.isNaN(date.getTime())) {
      this.erreur.set('La date est invalide.');
      return;
    }

    const coque: Coque = {
      id: '',
      nom: valeur.nom.trim(),
      photo: valeur.photo,
      prix: valeur.prix,
      disponible: valeur.disponible,
      dateAjout: date,
      modele: valeur.modele.trim(),
      couleur: valeur.couleur.trim(),
      comments: []
    };

    // Si on modifie une coque,
    // conserver son identifiant et ses commentaires.

    if (actuelle) {
      coque.id = actuelle.id || '';
      coque.comments = actuelle.comments || [];
    }

    this.attente.set(true);
    this.erreur.set('');
    this.message.set('');

    let requete: Observable<Coque>;

    if (actuelle) {
      requete = this.coqueService.modifier(coque);
    } else {
      requete = this.coqueService.ajouter(coque);
    }

    requete.subscribe({

      next: () => {

        this.attente.set(false);

        if (actuelle) {
          this.message.set('Coque modifiée.');
        } else {
          this.message.set('Coque ajoutée.');
        }

        this.annuler();
      },

      error: () => {
        this.echec('Enregistrement impossible. Vos saisies sont conservées.');
      }

    });
  }


  // SUPPRIMER UNE COQUE

  readonly suppression = signal<Coque | undefined>(undefined);

  supprimer(): void {

    const coque = this.suppression();

    if (!this.compte() || !coque || this.attente()) {
      return;
    }

    this.attente.set(true);
    this.erreur.set('');
    this.message.set('');

    this.coqueService.supprimer(coque.id).subscribe({

      next: () => {

        this.attente.set(false);
        this.suppression.set(undefined);

        const selectionnee = this.selection();

        if (selectionnee && selectionnee.id === coque.id) {
          this.annuler();
        }

        this.message.set('Coque supprimée.');
      },

      error: () => {
        this.echec('Suppression impossible. La coque est conservée.');
      }

    });
  }


  // CHANGER LE MOT DE PASSE

  changerMotDePasse(): void {

    if (!this.compte() || this.motDePasseForm().invalid() || this.attente()) {
      return;
    }

    this.attente.set(true);
    this.erreur.set('');
    this.message.set('');

    const valeurs = this.motDePasse();

    if (valeurs.nouveau !== valeurs.confirmation) {
      this.echec('Les deux nouveaux mots de passe doivent être identiques.');
      return;
    }

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

            this.motDePasse.set({
              ancien: '',
              nouveau: '',
              confirmation: ''
            });
          },

          error: () => {
            this.echec('Le mot de passe n’a pas pu être modifié.');
          }

        });
      },

      error: () => {
        this.echec('Impossible de vérifier l’ancien mot de passe.');
      }

    });
  }


  // GESTION DES ERREURS

  readonly erreur = signal<string>('');

  // Confirmation affichée après une opération réussie.
  readonly message = signal<string>('');

  private echec(message: string): void {
    this.attente.set(false);
    this.erreur.set(message);
  }

}
