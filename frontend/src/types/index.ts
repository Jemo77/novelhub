export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  rol: "lector" | "autor";
  avatar?: string;
}

export interface Novela {
  id: string;
  titulo: string;
  sinopsis: string;
  portada: string;
  autor: Usuario;
  generos: string[];
  vistas: number;
  likes: number;
  fechaPublicacion: string;
}

export interface Comic {
  id: string;
  titulo: string;
  sinopsis: string;
  portada: string;
  autor: Usuario;
  generos: string[];
  vistas: number;
  likes: number;
  fechaPublicacion: string;
}

export interface Capitulo {
  id: string;
  obraId: string;
  numero: number;
  titulo: string;
  contenido?: string;      // Texto para novelas
  imagenes?: string[];     // URLs para cómics
  fechaPublicacion: string;
}