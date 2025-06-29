export interface Conversacion {
  id: any;
  texto: string;
  align: string;
  ultimoMensaje: boolean;
  name?: string,
  profile?: any,
  time?: any,
  isimage?: any,
  imageContent?: any,
  replayName?: any,
  replaymsg?: any,
  fechaCreacion?: any,
  fechaRespuesta?: any,
}

export interface GroupedResponseItem {
  key: string;
  prospects: ResponseItem[];
}

export interface ResponseItem {
  profilePicture: string;
  IdPublicacion: string;
  idPregunta: string;
  fechaRespuestaUltimoMensaje?: string;
  IdDistribuidor: string;
  NombreGrupo: string;
  idRed: string;
  redSocial: string;
  IdProspecto: string;
  FotoPerfilUrl: string;
  Nombre: string;
  Apellido: string;
  Email: string;
  urlpublicacion: string;
  Telefono: string;
  Conversacion: Conversacion[];
  unreadCount?: number;
  IdHilo?: string;
  ultimoMensaje?: UltimoMensaje;
  claveUnica?: any;
}

export interface ApiResponse {
  statusCode: number;
  body: ResponseItem[];
}

export interface Chats {
  id: number;
  name: string;
  profilePicture?: string;
  status?: string;
  lastMessage?: string;
  time: string;
  unRead?: string;
  isActive?: boolean;
  isTyping?: boolean;
  messages?: Array<{
    id?: any;
    message?: string;
    name?: string;
    profile?: string;
    time?: any;
    align?: string,
    isimage?: any;
    imageContent?: any;
    replayName?: any;
    replaymsg?: any;
  }>;
}

export interface Grupos {
  iddistribuidor: string;
  nombredistribuidor: string;
  descripcion?: string;
}

export interface UltimoMensaje {
  id: any;
  texto: string;
  align: string;
  ultimoMensaje: boolean;
  name?: string,
  profile?: any,
  time?: any,
  isimage?: any,
  imageContent?: any,
  replayName?: any,
  replaymsg?: any,
  fechaCreacion?: any,
  fechaRespuesta?: any,
}

export interface Interesado {
  nombre: string;
  apellidop: string;
  apellidom: string;
  telefono: string;
  email: string;
  comentarios: string;
}