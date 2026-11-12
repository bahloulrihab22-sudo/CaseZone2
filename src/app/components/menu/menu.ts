import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-menu',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <header class="site-header">
      <nav class="container site-nav" aria-label="Menu visiteur">
        <a class="brand" routerLink="/coques">Case<span>Zone.</span></a>
        <div class="nav-links">
          <a routerLink="/coques" routerLinkActive="active">Coques</a>
          <a routerLink="/infos" routerLinkActive="active">Infos</a>
          <a routerLink="/admin">Admin</a>
        </div>
      </nav>
    </header>
    <main class="container"><router-outlet></router-outlet></main>
  `
})
export class Menu {}
