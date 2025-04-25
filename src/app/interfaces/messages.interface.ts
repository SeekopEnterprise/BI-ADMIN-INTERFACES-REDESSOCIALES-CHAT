export interface Conversacion {
    id: string;
    texto: string;
    align: 'left' | 'right';
    ultimoMensaje: boolean;
    fechaCreacion: string;
    sentimiento?: number;
    fechaRespuesta?: string;
  }
  
  export interface UltimoMensaje {
    id: string;
    texto: string;
    align: 'left' | 'right';
    ultimoMensaje: boolean;
    fechaCreacion: string;
    sentimiento?: number;
    fechaRespuesta?: string;
  }
  
  export interface DetailMessage {
    claveUnica: string;
    IdPublicacion: string;
    idPregunta: string;
    IdDistribuidor: number;
    NombreGrupo: string;
    idred: number;
    redSocial: string;
    IdProspecto: string;
    Nombre: string;
    Apellido: string;
    Email: string;
    urlpublicacion: string;
    Telefono: string;
    Conversacion: Conversacion[];
    unreadCount: number;
    ultimoMensaje: UltimoMensaje;
    fechaRespuestaUltimoMensaje: string;
  }
  
  export interface ResponseMessages {
    statusCode: number;
    body: DetailMessage[];
  }
  