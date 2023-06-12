import { Injectable } from '@angular/core';
import { Observable, Observer, Subject } from 'rxjs';

@Injectable()
export class NotificacionesService {
  private ws: WebSocket;
  private subject: Subject<MessageEvent>;
  private reconnectInterval: number = 5000; // intervalo de reconexión en milisegundos

  public connect(url: string): Subject<MessageEvent> {
    this.ws = new WebSocket(url);

    let observable = new Observable((obs: Observer<MessageEvent>) => {
      this.ws.onopen = event => {
        console.log('Web Socket abierto');
        this.send({ accion: 'setApp', nombreApp: 'proveedoresDigitales' });
      };
      this.ws.onmessage = obs.next.bind(obs);
      this.ws.onerror = obs.error.bind(obs);
      this.ws.onclose = event => {
        console.log('Web Socket cerrado. Reconectando...');
        setTimeout(() => this.connect(url), this.reconnectInterval);
        obs.complete.bind(obs);
      };

      return this.ws.close.bind(this.ws);
    });

    let observer = {
      next: (data: Object) => {
        if (this.ws.readyState === WebSocket.OPEN) {
          this.ws.send(JSON.stringify(data));
        }
      },
    };

    this.subject = Subject.create(observer, observable);

    return this.subject;
  }

  public send(data: any): void {
    this.subject.next(data);
  }

  public close(): void {
    this.ws.close();
  }
}
