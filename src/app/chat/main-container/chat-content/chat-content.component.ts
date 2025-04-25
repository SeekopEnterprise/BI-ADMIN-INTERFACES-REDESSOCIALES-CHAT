import { Component, Input, OnInit } from '@angular/core';
import { DetailMessage } from '../../../interfaces/messages.interface';

@Component({
  selector: 'app-chat-content',
  templateUrl: './chat-content.component.html',
  styleUrls: ['./chat-content.component.scss']
})
export class ChatContentComponent implements OnInit  {
  @Input() mensajes: DetailMessage[] = [];
  ngOnInit() {}
}
