import { Component, Input, OnInit } from '@angular/core';
import { DetailMessage } from '../../../interfaces/messages.interface';

@Component({
  selector: 'app-side-menu-chat',
  templateUrl: './side-menu-chat.component.html',
  styleUrls: ['./side-menu-chat.component.scss']
})
export class SideMenuChatComponent implements OnInit {
  @Input() mensajes: DetailMessage[] = []; 
  groupedMessages: { [redSocial: string]: DetailMessage[] } = {};


  ngOnInit() {
    console.log('Mensajes en el side menu:', this.mensajes);
    this.groupByRedSocial();
  }
  
  groupByRedSocial(): void {
    this.mensajes.forEach(mensaje => {
      if (!this.groupedMessages[mensaje.redSocial]) {
        this.groupedMessages[mensaje.redSocial] = [];
      }
      this.groupedMessages[mensaje.redSocial].push(mensaje);
    });
    console.log(this.groupedMessages);
  }
  objectKeys(obj: any): string[] {
    return Object.keys(obj);
  }

}

