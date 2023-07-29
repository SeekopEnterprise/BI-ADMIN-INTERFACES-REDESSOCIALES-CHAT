import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { RedSocial } from './redsocial.model';
import Swal from 'sweetalert2';
import { GlobalUserService } from '../../../services/global-user.service';
import {FormGroup, FormControl, Validators,FormBuilder} from '@angular/forms';
@Component({
  selector: 'app-redessociales',
  templateUrl: './redessociales.component.html',
  styleUrls: ['./redessociales.component.scss']
})

export class RedesSocialesComponent implements OnInit {
  redSocial: RedSocial[];
  redesSocialesList: any;
  submitted= false;
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

  redessocialesForm: FormGroup = new FormGroup({
    nombreRedSocial: new FormControl(''),
    endpointApi: new FormControl(''),
    apiKey: new FormControl(''),
    secretKey: new FormControl(''),
    urlLogotipo: new FormControl('')
  });

  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    }),
  };

  constructor(private globalUserService: GlobalUserService, private modalService: NgbModal, 
    private http: HttpClient, private fb: FormBuilder) {

    this.redessocialesForm= this.fb.group({
      nombreRedSocial: ['', [Validators.required,Validators.maxLength(20)]],
      endpointApi: ['', [Validators.required,Validators.maxLength(400),Validators.pattern(/(http|https):\/\/(\w+:{0,1}\w*)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%!\-\/]))?/)]], 
      apiKey: ['', [Validators.required,Validators.maxLength(100),Validators.pattern(/^[a-zA-Z0-9]{1,}[\w.-]{0,}$/)]],
      secretKey: ['', [Validators.required,Validators.maxLength(100),Validators.pattern(/^[a-zA-Z]{1,}[\w.-]{0,}$/)]],
      urlLogotipo: ['', [Validators.maxLength(400),Validators.pattern(/(http|https):\/\/(\w+:{0,1}\w*)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%!\-\/]))?/)]],
    });
   }

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

  get f()  {
    return this.redessocialesForm.controls;
  }

  validateForm(): void{
    this.submitted = true;
    const var_inv= document.getElementsByClassName('ng-invalid');

    if (this.redessocialesForm.valid) {

      this.submitted = true;
      // console.log("datos validos: "+this.redessocialesForm.value);
      this.addNewSocial();
      // return true;
		} else {
      return console.log(this.redessocialesForm.value);
		}

  }

  addNewSocial() {
    // Valida que newRedSocial no sea nulo y que no esté vacío
    // if (this.newRedSocial && Object.values(this.newRedSocial).every(x => x !== null && x !== '')) {
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
    /* } else {
      // Muestra una alerta indicando que el formulario no puede estar vacío
      Swal.fire({
        icon: 'warning',
        title: 'Advertencia',
        text: 'El formulario no puede estar vacío.',
        confirmButtonText: 'Entendido'
      });
     } */
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

  resetForm() {
    this.newRedSocial = {
      idred: null,
      nombre: '',
      endpointapi: '',
      apikey: '',
      secretkey: '',
      urllogotipo: '',
      idgrupo: null,
      nombredistribuidor: ''
    };
  }


}
