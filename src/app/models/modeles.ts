export interface Commentaire {
  nom: string;
  message: string;
  note: number;
}


export interface Coque {
  id: string;
  nom: string;
  photo: string;
  prix: number;
  disponible: boolean;
  dateAjout: Date;
  modele: string;
  couleur: string;
  comments: Commentaire[];
}

export interface CompteAdministrateur {
  id: string;
  login: string;
  motDePasse: string;
}
