import { Component, inject, OnInit, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { form, FormField, required, min, max, maxLength, pattern } from '@angular/forms/signals';
import { Coque, Commentaire } from '../../models/modeles';
import { CoqueService } from '../../services/coque-service';
import { DisponibilitePipe } from '../../pipes/disponibilite-pipe';

@Component({
  selector: 'app-coque-detail',
  imports: [DatePipe, DecimalPipe, RouterLink, DisponibilitePipe, FormField],
  templateUrl: './detail.html'
})
export class CoqueDetail implements OnInit {
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly coqueService = inject(CoqueService);
  coque = signal<Coque | undefined>(undefined);
  chargement = signal(false);
  envoi = signal(false);
  erreur = signal('');
  message = signal('');
  commentaire = signal<Commentaire>({ nom: '', message: '', note: 5 });
  commentaireForm = form(this.commentaire, p => {
    required(p.nom, { message: 'Votre nom est obligatoire.' });
    pattern(p.nom, /\S/, { message: 'Votre nom ne peut pas être vide.' });
    maxLength(p.nom, 60, { message: 'Nom : 60 caractères maximum.' });
    required(p.message, { message: 'Le commentaire est obligatoire.' });
    pattern(p.message, /\S/, { message: 'Le commentaire ne peut pas contenir seulement des espaces.' });
    maxLength(p.message, 500, { message: 'Commentaire : 500 caractères maximum.' });
    required(p.note, { message: 'Choisissez une note.' });
    min(p.note, 1, { message: 'La note doit être au moins 1.' });
    max(p.note, 5, { message: 'La note doit être au plus 5.' });
  });

  ngOnInit(): void {
    this.charger();
  }

  charger(): void {
    const id = this.activatedRoute.snapshot.paramMap.get('id');
    if (!id) return;
    this.chargement.set(true);
    this.erreur.set('');
    this.coqueService.getCoqueById(id).subscribe({
      next: coque => {
        this.coque.set({ ...coque, dateAjout: new Date(coque.dateAjout) });
        this.chargement.set(false);
      },
      error: erreur => {
        this.chargement.set(false);
        this.erreur.set(erreur.status === 404 ? 'Cette coque n’existe plus.' :
          'Impossible de charger la coque. Vérifiez le serveur JSON.');
      }
    });
  }

  ajouterCommentaire(event: Event): void {
    event.preventDefault();
    const coque = this.coque();
    if (!coque || this.commentaireForm().invalid() || this.envoi()) return;
    const valeur = this.commentaire();
    if (!Number.isInteger(valeur.note)) {
      this.erreur.set('La note doit être un entier entre 1 et 5.');
      return;
    }
    this.envoi.set(true);
    this.erreur.set('');
    this.message.set('');
    // Relire la coque avant d'ajouter pour conserver les commentaires déjà enregistrés.
    this.coqueService.getCoqueById(coque.id).subscribe({
      next: actuelle => this.coqueService.ajouterCommentaire(actuelle, {
        nom: valeur.nom.trim(), message: valeur.message.trim(), note: valeur.note
      }).subscribe({
        next: modifiee => {
          this.coque.set({ ...modifiee, dateAjout: new Date(modifiee.dateAjout) });
          this.commentaireForm().reset({ nom: '', message: '', note: 5 });
          this.envoi.set(false);
          this.message.set('Votre commentaire a été ajouté.');
        },
        error: () => this.echecCommentaire()
      }),
      error: () => this.echecCommentaire()
    });
  }

  private echecCommentaire(): void {
    this.envoi.set(false);
    this.erreur.set('Le commentaire n’a pas pu être enregistré. Votre saisie est conservée.');
  }
}
