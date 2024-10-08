import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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
}
