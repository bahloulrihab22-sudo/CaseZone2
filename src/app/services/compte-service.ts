import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { CompteAdministrateur } from '../models/modeles';

const URL = '/api/administrateurs';

@Injectable({ providedIn: 'root' })
export class CompteService {
  private readonly http = inject(HttpClient);
  private readonly _compte = signal<CompteAdministrateur | undefined>(undefined);
  compte = this._compte.asReadonly();

  // Authentification pédagogique avec le serveur JSON du cours.
  connecter(login: string, motDePasse: string): Observable<CompteAdministrateur[]> {
    this._compte.set(undefined);
    return this.http.get<CompteAdministrateur[]>(URL, {
      params: { login, motDePasse }
    }).pipe(tap(comptes => {
      const compte = comptes.find(c => c.login === login && c.motDePasse === motDePasse);
      this._compte.set(compte);
    }));
  }

  verifier(): Observable<CompteAdministrateur> {
    return this.http.get<CompteAdministrateur>(URL + '/' + this._compte()!.id);
  }

  changerMotDePasse(motDePasse: string): Observable<CompteAdministrateur> {
    const compte = { ...this._compte()!, motDePasse };
    return this.http.put<CompteAdministrateur>(URL + '/' + compte.id, compte).pipe(
      tap(modifie => this._compte.set(modifie))
    );
  }

  deconnecter(): void {
    this._compte.set(undefined);
  }
}
