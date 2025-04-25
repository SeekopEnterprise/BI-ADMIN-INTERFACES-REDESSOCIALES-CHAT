import { Component, OnInit } from '@angular/core';
import { DetailMessage } from '../../interfaces/messages.interface';
import { ChatService } from '../../services/chat.service';


@Component({
  selector: 'app-main-container',
  templateUrl: './main-container.component.html',
  styleUrls: ['./main-container.component.scss']
})
export class MainContainerComponent implements OnInit {
  mensajes: DetailMessage[] = [];
  mensajeSeleccionado: DetailMessage | null = null;

  ngOnInit() {
    this.getMessagesByDistribuidor();
  }
  constructor(private chatService: ChatService) { }
  getMessagesByDistribuidor(): void {
    this.chatService.getMessagesByDistribuidor().subscribe({
      next: (res) => {
        this.mensajes = res.body; // Los datos ya están disponibles aquí
        console.log('Mensajes recibidos:', this.mensajes);
      },
      error: (err) => {
        console.error('Error al obtener mensajes:', err);
      }
    });
  }

  seleccionarMensaje(mensaje: DetailMessage) {
    this.mensajeSeleccionado = mensaje;
  }


}
