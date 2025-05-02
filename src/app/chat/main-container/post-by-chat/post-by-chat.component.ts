import { Component, Input, OnInit } from '@angular/core';
import { DetailMessage } from '../../../interfaces/messages.interface';
import { PostsService } from '../../../services/posts.service';
import { ResponseKpiPostChat } from '../../../interfaces/kpi-post-chat.interface';

@Component({
  selector: 'app-post-by-chat',
  templateUrl: './post-by-chat.component.html',
  styleUrls: ['./post-by-chat.component.scss']
})
export class PostByChatComponent implements OnInit {
  @Input() mensaje: DetailMessage | null = null;
  postConversacionKpiData!: ResponseKpiPostChat;
  tabs = [
    { key: 'origen', icon: 'mdl-file-eye', label: 'Publicación de origen' },
    { key: 'informacionPersonal', icon: 'mdl-file-eye', label: 'Informacion personal' },
    { key: 'kpiConversacion', icon: 'mdl-file-eye', label: 'KPI Conversacion' },
    { key: 'detalles', icon: 'mdl-file-eye', label: 'Enviar a Seekop' },
  ];
  selectedTab = 'origen';

  constructor(private postsService: PostsService) { }
  ngOnInit() {
    this.getPostConversacionKpiData();
  }

  getPostConversacionKpiData() {

    this.postsService.getKpiPostChatByIdPublicacion(this.mensaje.IdPublicacion).subscribe({
      next: (response) => {
        this.postConversacionKpiData = response;
        console.log('Data:', this.postConversacionKpiData);
      },
      error: (err) => {
        console.error('Error al cargar KPI:', err);
      }
    });
  }
  get selectedTabLabel(): string {
    const found = this.tabs.find(t => t.key === this.selectedTab);
    return found ? found.label : '';
  }
}
