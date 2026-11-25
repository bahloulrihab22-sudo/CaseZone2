
import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Coque, Commentaire } from '../models/modeles';
import { environment } from '../../environments/environment';

const URL = environment.apiUrl + '/coques';

@Injectable({ providedIn: 'root' })
export class CoqueService {
  private readonly http = inject(HttpClient);
  private readonly _coques = signal<Coque[]>([]);
  coques = this._coques.asReadonly();


  // GET : RECUPERER TOUTES LES COQUES

  getCoques(): Observable<Coque[]> {
    return this.http.get<Coque[]>(URL).pipe(
      tap(coques => {
        const liste = coques.map(coque => ({
          ...coque,
          dateAjout: new Date(coque.dateAjout)
        }));
        this._coques.set(liste);

      })

    );
  }
  // GET : RECUPERER UNE SEULE COQUE
  getCoqueById(id: string): Observable<Coque> {
    return this.http.get<Coque>(URL + '/' + id);

  }


  // POST : AJOUTER UNE COQUE
  ajouter(coque: Coque): Observable<Coque> {
    const { id, ...donnees } = coque;
    return this.http.post<Coque>(URL, donnees).pipe(
      tap(ajoutee => {
        const nouvelleCoque = {
          ...ajoutee,
          dateAjout: new Date(ajoutee.dateAjout)
        };

        this._coques.update(coques =>
          [...coques, nouvelleCoque]
        );

      })

    );
  }


  // PUT : MODIFIER UNE COQUE

  modifier(coque: Coque): Observable<Coque> {
    return this.http.put<Coque>(URL + '/' + coque.id, coque).pipe(
      tap(modifiee => {
        this._coques.update(coques =>
          coques.map(c => {
            if (c.id === modifiee.id) {
              return {
                ...modifiee,
                dateAjout: new Date(modifiee.dateAjout)
              };

            } else {

              return c;

            }

          })

        );

      })

    );
  }


  // DELETE : SUPPRIMER UNE COQUE

  supprimer(id: string): Observable<void> {

    return this.http.delete<void>(URL + '/' + id).pipe(
      tap(() => {
        this._coques.update(coques =>
          coques.filter(c => c.id !== id)
        );

      })

    );
  }
  // AJOUTER UN COMMENTAIRE
  ajouterCommentaire(coque: Coque, commentaire: Commentaire): Observable<Coque> {
    const commentaires = [...coque.comments, commentaire];
    const coqueModifiee: Coque = {
      ...coque,
      comments: commentaires
    };

    return this.modifier(coqueModifiee);

  }

}
