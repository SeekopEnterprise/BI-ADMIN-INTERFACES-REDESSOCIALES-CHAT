import { Component, Input, OnInit } from '@angular/core';
import { BodyKpiPostChat, Publicacion } from '../../../../interfaces/kpi-post-chat.interface';

@Component({
  selector: 'app-kpi-conversacion',
  templateUrl: './kpi-conversacion.component.html',
  styleUrls: ['./kpi-conversacion.component.scss']
})
export class KpiConversacionComponent implements OnInit {
  @Input() bodyCardPost: BodyKpiPostChat;
  publicacion: Publicacion;
  ngOnInit() {
    this.publicacion = this.bodyCardPost.publicaciones[0];
  }
}
