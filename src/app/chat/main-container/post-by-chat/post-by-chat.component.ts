import { Component, Input, OnInit } from '@angular/core';
import { DetailMessage } from '../../../interfaces/messages.interface';

@Component({
  selector: 'app-post-by-chat',
  templateUrl: './post-by-chat.component.html',
  styleUrls: ['./post-by-chat.component.scss']
})
export class PostByChatComponent implements OnInit {
  @Input() mensajes: DetailMessage[] = [];
  ngOnInit() {}
}
