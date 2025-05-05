export interface ResponseKpiPostChat {
    statusCode: number;
    body: BodyKpiPostChat;
  }
  
  export interface BodyKpiPostChat {
    distribuidorId: string;
    nombreDistribuidor: string;
    publicaciones: Publicacion[];
  }
  
  export interface Publicacion {
    idRedSocial: string;
    nombreRedSocial: string;
    informacionPersonal: InformacionPersonal;
    publicacionesDetail: PublicacionesDetail;
    kpiConversacion: KpiConversacion;
  }
  
  export interface InformacionPersonal {
    nombre: string;
    apellidoPaterno: string;
    telefono: string;
    email: string;
    user: string;
  }
  
  export interface PublicacionesDetail {
    idPublicacion: string;
    archivoAdjunto: string;
    fileType: string;
    descripcionPublicacion: string;
    publicada: boolean;
    tipoPublicacion: string;
    fechaPublicacion: string;
  }
  
  export interface KpiConversacion {
    mensajesRecibidos: string;
    tiempoPromRespuesta: string;
    contestados: string;
    noContestados: string;
    positivos: string;
    negativos: string;
  }
  