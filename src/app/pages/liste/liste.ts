import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CoqueService } from '../../services/coque-service';
import { CoqueCard } from '../../components/coque/coque';

@Component({ selector: 'app-coque-list', imports: [CoqueCard], templateUrl: './liste.html' })
export class CoqueList implements OnInit {
  private readonly coqueService = inject(CoqueService);
  coques = this.coqueService.coques;
  recherche = signal('');
  disponiblesSeulement = signal(false);
  chargement = signal(false);
  erreur = signal('');

  // Les deux critères peuvent être utilisés séparément ou ensemble.
  coquesAffichees = computed(() => this.coques().filter(coque =>
    coque.nom.toLowerCase().includes(this.recherche().trim().toLowerCase()) &&
    (!this.disponiblesSeulement() || coque.disponible)
  ));

  ngOnInit(): void {
    this.charger();
  }

  charger(): void {
    this.chargement.set(true);
    this.erreur.set('');
    this.coqueService.getCoques().subscribe({
      next: () => this.chargement.set(false),
      error: () => {
        this.chargement.set(false);
        this.erreur.set('Impossible de charger les coques. Vérifiez que le serveur JSON est démarré.');
      }
    });
  }
}
