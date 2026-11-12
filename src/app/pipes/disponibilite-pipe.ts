import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'disponibilite' })
export class DisponibilitePipe implements PipeTransform {
  transform(disponible: boolean): string {
    return disponible ? 'Disponible' : 'Épuisée';
  }
}
