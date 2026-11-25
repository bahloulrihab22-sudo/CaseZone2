import { Component } from '@angular/core';

@Component({
  selector: 'app-infos',
  template: `
    <section class="hero">
      <p class="eyebrow">À propos</p>
      <h1>Bienvenue chez CaseZone.</h1>
      <p>Des coques pour différents modèles de smartphones, à choisir selon votre style.</p>
    </section>
    <section class="panel">
      <p class="eyebrow">Le projet</p>
      <h2 class="mb-4">Une boutique imaginée par Rihab et Wissal.</h2>
      <p>Auteures : <strong>Rihab Bahloul et Wissal Barhoumi</strong></p>
      <p>Classe : DSI 21 — Groupe 1</p>
      <p class="mb-0">Email : bahloulrihab22@gmail.com , barhoumiwissal8@gmail.com</p>
    </section>
  `
})
export class Informations {}
