import { Component, Input, OnInit } from '@angular/core';
import { DetailMessage } from '../../../interfaces/messages.interface';

@Component({
  selector: 'app-chat-content',
  templateUrl: './chat-content.component.html',
  styleUrls: ['./chat-content.component.scss']
})
export class ChatContentComponent implements OnInit  {
  @Input() mensaje: DetailMessage | null = null;
  nuevoMensaje: string = '';

  ngOnInit() {
    console.log(this.mensaje)
  }
}
