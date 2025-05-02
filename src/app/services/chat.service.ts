import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ResponseMessages } from '../interfaces/messages.interface';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  private apiUrl = 'https://ia-dev.sicopweb.net/ai/agentes/textEnhanceOrGenerateContext';

  constructor(private http: HttpClient) { }

  enviarMensajes(conversacion: any, tipo: string): Observable<any> {
    // Aquí ajustamos el cuerpo de la solicitud para que sea correcto
    const body = {
      conversacion: conversacion, // Asegurarnos de que "conversacion" no esté envuelto de nuevo
      tipo: tipo
    };

    return this.http.post(this.apiUrl, conversacion);
  }
  getMessagesByDistribuidor(): Observable<ResponseMessages> {
    const apiUrlMessages = 'https://fhfl0x34wa.execute-api.us-west-1.amazonaws.com/dev/recuperarmsjs';

    const userName ='default.pruebas@seekoop.com';
    const params = new HttpParams().set('usuario', userName);
    return this.http
    .get<ResponseMessages>(apiUrlMessages, { params });
  }
}
