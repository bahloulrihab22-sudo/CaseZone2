
import { Component, inject, OnInit, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { form, FormRoot, FormField, required, min, max, maxLength, pattern } from '@angular/forms/signals';
import { Coque, Commentaire } from '../../models/modeles';
import { CoqueService } from '../../services/coque-service';
import { DisponibilitePipe } from '../../pipes/disponibilite-pipe';

@Component({
  selector: 'app-coque-detail',
  imports: [DatePipe, DecimalPipe, RouterLink, DisponibilitePipe, FormRoot, FormField],
  templateUrl: './detail.html'
})

export class CoqueDetail implements OnInit {

  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly coqueService = inject(CoqueService);

  // SIGNAUX

  readonly coque = signal<Coque | undefined>(undefined);
  readonly chargement = signal<boolean>(false);
  readonly envoi = signal<boolean>(false);
  readonly erreur = signal<string>('');
  readonly message = signal<string>('');

  readonly commentaire = signal<Commentaire>({
    nom: '',
    message: '',
    note: 5
  });


  // FORMULAIRE ET VALIDATION

  commentaireForm = form(this.commentaire, path => {

    required(path.nom, {
      message: 'Votre nom est obligatoire.'
    });

    pattern(path.nom, /\S/, {
      message: 'Votre nom ne peut pas être vide.'
    });

    maxLength(path.nom, 60, {
      message: 'Nom : 60 caractères maximum.'
    });

    required(path.message, {
      message: 'Le commentaire est obligatoire.'
    });

    pattern(path.message, /\S/, {
      message: 'Le commentaire ne peut pas contenir seulement des espaces.'
    });

    maxLength(path.message, 500, {
      message: 'Commentaire : 500 caractères maximum.'
    });

    required(path.note, {
      message: 'Choisissez une note.'
    });

    min(path.note, 1, {
      message: 'La note doit être au moins 1.'
    });

    max(path.note, 5, {
      message: 'La note doit être au plus 5.'
    });

  });


  // INITIALISATION

  ngOnInit(): void {
    this.charger();
  }


  // RECUPERER LA COQUE SELECTIONNEE

  charger(): void {
    const id = this.activatedRoute.snapshot.paramMap.get('id');
    if (!id) {
      return;
    }

    this.chargement.set(true);
    this.erreur.set('');

    this.coqueService.getCoqueById(id).subscribe({

      next: coque => {

        this.coque.set({
          ...coque,
          dateAjout: new Date(coque.dateAjout)
        });

        this.chargement.set(false);
      },

      error: erreur => {

        this.chargement.set(false);

        if (erreur.status === 404) {
          this.erreur.set('Cette coque n’existe plus.');
        } else {
          this.erreur.set('Impossible de charger la coque. Vérifiez le serveur JSON.');
        }
      }
    });
  }


  // AJOUTER UN COMMENTAIRE

  ajouterCommentaire(): void {

    const coque = this.coque();

    if (!coque || this.commentaireForm().invalid() || this.envoi()) {
      return;
    }
    const valeur = this.commentaire();
    if (!Number.isInteger(valeur.note)) {
      this.erreur.set('La note doit être un entier entre 1 et 5.');
      return;
    }

    this.envoi.set(true);
    this.erreur.set('');
    this.message.set('');

    // GET : récupérer la version récente de la coque

    this.coqueService.getCoqueById(coque.id).subscribe({

      next: actuelle => {

        const nouveauCommentaire: Commentaire = {
          nom: valeur.nom.trim(),
          message: valeur.message.trim(),
          note: valeur.note
        };

        // PUT : ajouter le commentaire

        this.coqueService.ajouterCommentaire(
          actuelle,
          nouveauCommentaire
        ).subscribe({

          next: modifiee => {

            this.coque.set({
              ...modifiee,
              dateAjout: new Date(modifiee.dateAjout)
            });

            this.commentaire.set({
              nom: '',
              message: '',
              note: 5
            });

            this.envoi.set(false);
            this.message.set('Votre commentaire a été ajouté.');
          },

          error: () => {
            this.echecCommentaire();
          }

        });
      },
      error: () => {
        this.echecCommentaire();
      }

    });
  }

  // GESTION DES ERREURS

  private echecCommentaire(): void {
    this.envoi.set(false);
    this.erreur.set(
      'Le commentaire n’a pas pu être enregistré. Votre saisie est conservée.'
    );
  }

}
