import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpClient } from '@angular/common/http';
import { RedSocial } from './redsocial.model';
import Swal from 'sweetalert2';
import { GlobalUserService } from '../../../services/global-user.service';

@Component({
  selector: 'app-redessociales',
  templateUrl: './redessociales.component.html',
  styleUrls: ['./redessociales.component.scss']
})

export class RedesSocialesComponent implements OnInit {
  redSocial: RedSocial[];
  redesSocialesList: any;

  public yaEstaSeteado = false;
  public usuarioCorreo: string;

  // Nueva red social a agregar
  newRedSocial: Partial<RedSocial> = {
    nombre: '',
    endpointapi: '',
    apikey: '',
    secretkey: '',
    urllogotipo: ''
  };

  constructor(private globalUserService: GlobalUserService, private modalService: NgbModal, private http: HttpClient) { }

  ngOnInit(): void {

    try {

      // Recupera el usuario del servicio o del localStorage
      let user = this.globalUserService.getCurrentUser();
      if (!user || user.type.toLowerCase().includes("web") ) {
        try {
          user = JSON.parse(localStorage.getItem('currentUser'));
        } catch (error) {
          console.log('Error al acceder a localStorage para redes :', error);
        }
      }

      if (user && user.token) {
        this.usuarioCorreo=user.username;
        this.loadRedesSociales();
      }

    } catch (error) {
      console.log('Error cargando grupos o recuperando mensajes:', error);
      return;
    }
  }

  openContactsModal(content) {
    this.modalService.open(content, { centered: true });
  }

  ngAfterViewInit() {
    // Escucha los mensajes que llegan del padre
    window.addEventListener('message', async (event) => { // marcado como async
      if (!this.yaEstaSeteado) {
        // Almacena el usuario en el servicio
        this.globalUserService.setCurrentUser(event.data);
        console.log("esta funcionando o no aquí lo sabremos: ", event.data);
        this.usuarioCorreo = event.data.username;
        if (this.usuarioCorreo) {
          this.loadRedesSociales();
        }
        this.yaEstaSeteado = true;
      }
    });
  }


  addNewSocial() {
    this.http.post<RedSocial>('https://ti3pwepc47.execute-api.us-west-1.amazonaws.com/dev/redessociales', this.newRedSocial).subscribe(
      response => {
        // Limpia el formulario y recarga la lista de redes sociales
        this.newRedSocial = {
          nombre: '',
          endpointapi: '',
          apikey: '',
          secretkey: '',
          urllogotipo: ''
        };
        this.loadRedesSociales();

        // Muestra una alerta de éxito y cierra el modal
        Swal.fire({
          icon: 'success',
          title: '¡Éxito!',
          text: 'La red social ha sido agregada correctamente.',
          confirmButtonText: 'Ok'
        });
        this.modalService.dismissAll();
      },
      error => {
        console.log(error);
        // Muestra una alerta de error
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Hubo un problema al agregar la red social. Por favor, inténtalo más tarde.',
          confirmButtonText: 'Entendido'
        });
      }
    );
  }


  loadRedesSociales(): void {
    this.http.get<RedSocial[]>('https://ti3pwepc47.execute-api.us-west-1.amazonaws.com/dev/redessociales').subscribe(
      redesSociales => {
        const sorted = redesSociales.sort((a, b) => a.nombre > b.nombre ? 1 : -1);
        this.redesSocialesList = sorted;
      },
      error => {
        console.log(error);
      }
    );
  }

}
