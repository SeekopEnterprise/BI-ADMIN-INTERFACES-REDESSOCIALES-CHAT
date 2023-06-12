export interface Conversacion {
  id: string;
  texto: string;
  align: string;
  ultimoMensaje: boolean;
}

export interface ResponseItem {
  IdPublicacion: string;
  IdProspecto: string;
  Nombre: string;
  Apellido: string;
  Email: string;
  urlpublicacion: string;
  Telefono: string;
  Conversacion: Conversacion[];
  unreadCount?: number;
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
    isimage?:any;
    imageContent?:any;
    replayName?:any;
    replaymsg?:any;
  }>;
}

export interface Grupos {
  idgrupo: number;
  nombregrupo: string;
  descripcion?: string;
}

