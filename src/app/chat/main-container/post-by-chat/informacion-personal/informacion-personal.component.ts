import { Component, Input, OnInit } from '@angular/core';
import { BodyKpiPostChat, Publicacion } from '../../../../interfaces/kpi-post-chat.interface';

@Component({
  selector: 'app-informacion-personal',
  templateUrl: './informacion-personal.component.html',
  styleUrls: ['./informacion-personal.component.scss']
})
export class InformacionPersonalComponent implements OnInit{
  @Input() bodyCardPost: BodyKpiPostChat;
   publicacion: Publicacion;
  ngOnInit() {
    this.publicacion = this.bodyCardPost.publicaciones[0];
  }
}
