import { Component, Input } from '@angular/core';
import { BodyKpiPostChat, InformacionPersonal, Publicacion } from '../../../../interfaces/kpi-post-chat.interface';

@Component({
  selector: 'app-form-prospecto',
  templateUrl: './form-prospecto.component.html',
  styleUrls: ['./form-prospecto.component.scss']
})
export class FormProspectoComponent {
  informacion!: InformacionPersonal;
  publicacion!: Publicacion;

   @Input() bodyCardPost: BodyKpiPostChat;

   ngOnInit(): void {
    if (this.bodyCardPost?.publicaciones?.length > 0) {
      this.publicacion = this.bodyCardPost.publicaciones[0]; 
      this.informacion = this.publicacion.informacionPersonal;
    }
  }
}
