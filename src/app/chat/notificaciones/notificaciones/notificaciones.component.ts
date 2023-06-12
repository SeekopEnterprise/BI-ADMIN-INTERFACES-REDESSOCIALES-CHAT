import { Component, OnInit, OnDestroy } from '@angular/core';
import { NotificacionesService } from '../notificaciones.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-notificaciones',
  templateUrl: './notificaciones.component.html',
  styleUrls: ['./notificaciones.component.scss']
})
export class NotificacionesComponent implements OnInit, OnDestroy {
  private subscription: Subscription;
  public notificationMessage: string;

  constructor(private webSocketService: NotificacionesService) { }

  ngOnInit(): void {
    this.subscription = this.webSocketService.connect('wss://namj4mlg8g.execute-api.us-west-1.amazonaws.com/dev')
      .subscribe((event: MessageEvent) => {
        const data = JSON.parse(event.data);
        if (event.type === 'open') {
          this.webSocketService.send({
            accion: 'setApp',
            nombreApp: 'proveedoresDigitales'
          });
        } else if (event.type === 'message') {
          this.notificationMessage = data.mensaje;
        }
      });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.webSocketService.close();
  }
}
