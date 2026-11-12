import { Routes } from '@angular/router';
import { Menu } from './components/menu/menu';
import { CoqueList } from './pages/liste/liste';
import { CoqueDetail } from './pages/detail/detail';
import { Informations } from './pages/infos/infos';
import { Admin } from './pages/admin/admin';

export const routes: Routes = [
  { path: 'admin', component: Admin },
  {
    path: '', component: Menu, children: [
      { path: 'coques', component: CoqueList },
      { path: 'coques/:id', component: CoqueDetail },
      { path: 'infos', component: Informations },
      { path: '', redirectTo: 'coques', pathMatch: 'full' }
    ]
  },
  { path: '**', redirectTo: 'coques' }
];

