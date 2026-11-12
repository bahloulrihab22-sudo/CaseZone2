import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Coque, Commentaire } from '../models/modeles';

const URL = '/api/coques';

@Injectable({ providedIn: 'root' })
export class CoqueService {
  private readonly http = inject(HttpClient);
  private readonly _coques = signal<Coque[]>([]);
  coques = this._coques.asReadonly();

  getCoques(): Observable<Coque[]> {
    return this.http.get<Coque[]>(URL).pipe(
      tap(coques => this._coques.set(coques.map(coque => ({
        ...coque, dateAjout: new Date(coque.dateAjout)
      }))))
    );
  }

  getCoqueById(id: string): Observable<Coque> {
    return this.http.get<Coque>(URL + '/' + id);
  }

  ajouter(coque: Coque): Observable<Coque> {
    // Le serveur génère l'identifiant : on ne l'envoie pas dans le POST.
    const { id, ...donnees } = coque;
    return this.http.post<Coque>(URL, donnees).pipe(
      tap(ajoutee => this._coques.update(coques => [
        ...coques, { ...ajoutee, dateAjout: new Date(ajoutee.dateAjout) }
      ]))
    );
  }

  modifier(coque: Coque): Observable<Coque> {
    return this.http.put<Coque>(URL + '/' + coque.id, coque).pipe(
      tap(modifiee => this._coques.update(coques => coques.map(c =>
        c.id === modifiee.id ? { ...modifiee, dateAjout: new Date(modifiee.dateAjout) } : c
      )))
    );
  }

  supprimer(id: string): Observable<void> {
    return this.http.delete<void>(URL + '/' + id).pipe(
      tap(() => this._coques.update(coques => coques.filter(c => c.id !== id)))
    );
  }

  ajouterCommentaire(coque: Coque, commentaire: Commentaire): Observable<Coque> {
    return this.modifier({ ...coque, comments: [...coque.comments, commentaire] });
  }
}
