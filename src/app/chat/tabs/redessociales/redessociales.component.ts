import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpClient } from '@angular/common/http';
import { RedSocial } from './redsocial.model';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-redessociales',
  templateUrl: './redessociales.component.html',
  styleUrls: ['./redessociales.component.scss']
})

export class RedesSocialesComponent implements OnInit {
  redSocial: RedSocial[];
  redesSocialesList: any;

  // Nueva red social a agregar
  newRedSocial: Partial<RedSocial> = {
    nombre: '',
    endpointapi: '',
    apikey: '',
    secretkey: '',
    urllogotipo: ''
  };

  constructor(private modalService: NgbModal, private http: HttpClient) { }

  ngOnInit(): void {
    this.loadRedesSociales();
  }

  openContactsModal(content) {
    this.modalService.open(content, { centered: true });
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
        console.error(error);
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

        const grouped = sorted.reduce((groups, redSocial) => {
          const grupo = redSocial.nombregrupo ? redSocial.nombregrupo : 'Nissan Satelite';
          groups[grupo] = groups[grupo] || [];
          groups[grupo].push(redSocial);

          return groups;
        }, {});

        this.redesSocialesList = Object.keys(grouped).map(key => ({ key, socialRedes: grouped[key] }));
      },
      error => {
        console.error(error);
      }
    );
  }
}
