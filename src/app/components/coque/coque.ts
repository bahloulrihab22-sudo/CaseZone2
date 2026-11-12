import { Component, input } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Coque } from '../../models/modeles';
import { DisponibilitePipe } from '../../pipes/disponibilite-pipe';

@Component({
  selector: 'app-coque-card',
  imports: [RouterLink, DecimalPipe, DisponibilitePipe],
  templateUrl: './coque.html'
})
export class CoqueCard {
  readonly coque = input.required<Coque>();
}
