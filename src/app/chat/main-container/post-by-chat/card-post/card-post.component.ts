import { Component, Input, OnInit } from '@angular/core';
import { BodyKpiPostChat, Publicacion } from '../../../../interfaces/kpi-post-chat.interface';

@Component({
  selector: 'app-card-post',
  templateUrl: './card-post.component.html',
  styleUrls: ['./card-post.component.scss']
})
export class CardPostComponent implements OnInit {


  //queda pendiente checar si si se actualiza el bodyCardPost al cambio de seleccion y al consultar el servicio en el componente p
  //padre -- actualmente no se puede reflejar kq mock
 
  @Input() bodyCardPost: BodyKpiPostChat;
  publicacion: Publicacion;

  ngOnInit() {
    console.log(this.bodyCardPost);
    this.publicacion = this.bodyCardPost.publicaciones[0];
  }
}
