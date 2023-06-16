import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpClient } from '@angular/common/http';
import { RedesUsuarios } from './redesusuarios.model';
import { RedSocial } from '../redessociales/redsocial.model';
import Swal from 'sweetalert2';
import {FormBuilder,Validators,FormGroup,AbstractControl} from '@angular/forms' 

@Component({
  selector: 'app-redessocialesusuarios',
  templateUrl: './redessocialesusuarios.component.html',
  styleUrls: ['./redessocialesusuarios.component.scss']
})
export class RedessocialesusuariosComponent implements OnInit{
  
  redesusuariosForm: FormGroup;

  redesSelect: any;
  usuariosSelect: any;
  usuariosRedesSelect: any;
  submitted = false;
  newRedesUsuarios: Partial<RedesUsuarios> = {
    // idredusuario:0,
    idred:0,
    idusuario:'',
    idcliente: '',
    identificadorplataforma: '',
    nombrepagina: '',
    token: '',
    fechacreacion: new Date("2000-01-01"),
    fechavencimimiento: new Date("2000-01-01")
  };

  constructor(private modalService: NgbModal, private http: HttpClient,
    private fb: FormBuilder) { }

  ngOnInit(): void {
    this.loadRedesSocialesUsuarios();
    this.loadRedesSociales();
    this.loadUsuarios();

    const today = new Date();
const day = today.getDate();
const month = today.getMonth() + 1;
const year = today.getFullYear();
let conca_day = "";
let conca_month = "";

if (day >= 1 && day <= 9) {
  conca_day += "0" + day;
} else {
  conca_day += day;
}

if (month >= 1 && month <= 9) {
  conca_month += "0" + month;
} else {
  conca_month += month;
}

const fechacreacion = `${year}-${conca_month}-${conca_day}`;
this.newRedesUsuarios={
  idred:0,
  idusuario:'',
  idcliente: '',
  identificadorplataforma: '',
  nombrepagina: '',
  token: '',
  fechacreacion: new Date(fechacreacion),
  fechavencimimiento: new Date("2000-01-01")
  }

  /*
  this.redesusuariosForm =new FormGroup({
    nombreRedSocial: new FormControl('', Validators.required),
  }); */

  this.redesusuariosForm= this.fb.group({
    nombreRedSocial: ['', [Validators.required]],
    usuario: ['', [Validators.required]],
    noCliente: ['', [Validators.required]],
    pagina: ['', [Validators.required]],
    token: ['', [Validators.required]],
    fechavencimimiento: ['', [Validators.required]]
  }); 

  /*
  this.redesusuariosForm = new FormGroup({
      nombreRedSocial: new FormControl('', Validators.required)
  });*/

}

  openUsuarioRedSocialModal(content) {
    this.modalService.open(content, {
       centered: true,
       size:'lg'
      });
  }

  openContactsModalEdit(content) {
    this.modalService.open(content, { 
      centered: true, 
      size:'lg'
    });
  }

  changeRedSocial(e){
    
    this.getRedSocial.setValue(e.target.value, {
      onlySelf: true
    })
    // return this.redesusuariosForm.get('nombreRedSocial');
  }

  get getRedSocial(){
    // alert("red social");
    return this.redesusuariosForm.get('nombreRedSocial');
  }

  get f() {
    return this.redesusuariosForm.controls;
  }
/*
  public handleError = (controlName: string, errorName: string) => {
    return this.redesusuariosForm.controls[controlName].hasError(errorName);
  }; */

  validateForm(){
    
    this.submitted = true;
    console.log(this.redesusuariosForm.value);
    
    if (this.redesusuariosForm.valid) {
      this.submitted = true;
      console.log("form valid: "+this.redesusuariosForm.value)
    }
    else{
    } 
  }

  asociarCuenta(){
    window.open("http://auth.mercadolibre.com.mx/authorization?response_type=code&client_id=7024360621079096&redirect_uri=https://06qe3dt50i.execute-api.us-west-1.amazonaws.com/dev&state=%7BidDistribuidor%7D");
  }

  addNewUsuarioRedesSociales() { 
    
    // console.log("array: "+this.newRedesUsuarios);
    // console.log(this.newMetodo);  

    this.http.post<RedesUsuarios>('https://ti3pwepc47.execute-api.us-west-1.amazonaws.com/dev/redesusuarios', 
    this.newRedesUsuarios).subscribe(
      response => {
        // Limpia el formulario y recarga la lista de redes sociales
        this.newRedesUsuarios={
          idred:0,
          idusuario:'',
          idcliente: '',
          identificadorplataforma: '',
          nombrepagina: '',
          token: '',
          fechacreacion: new Date("2000-01-01"),
          fechavencimimiento: new Date("2000-01-01")
        }

        this.loadRedesSocialesUsuarios();

        // Muestra una alerta de éxito y cierra el modal
        Swal.fire({
          icon: 'success',
          title: '¡Éxito!',
          text: 'El método ha sido agregado correctamente.',
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
          text: 'Hubo un problema al agregar un usuario de red social. Por favor, inténtalo más tarde.',
          confirmButtonText: 'Entendido'
        });
      }
    );
  }


  loadRedesSociales() { // https://ti3pwepc47.execute-api.us-west-1.amazonaws.com/dev/redessociales
    this.http.get<RedSocial[]>('https://ti3pwepc47.execute-api.us-west-1.amazonaws.com/dev/redessociales').subscribe(
      redsocial => {
        
        const sorted = redsocial.sort((a, b) => a.nombre > b.nombre ? 1 : -1);
        //console.log(sorted);
        const arrayValue=[];
        for (const { index, value } of sorted.map((value, index) => ({ index, value }))) {
          // console.log("index"+value.idred); // 9, 2, 5
          arrayValue.push(value);

      } 

      this.redesSelect=arrayValue;
      
      },
      error => {
        console.error(error);
      }
    );
  }

  loadUsuarios():void { 
    this.http.get<any>('https://ti3pwepc47.execute-api.us-west-1.amazonaws.com/dev/usuarios').subscribe(
      usuario => {
        const sorted = usuario.sort((a, b) => a.user > b.user ? 1 : -1);
        console.log("sortted: "+sorted);
        const arrayValue=[];
        for (const { index, value } of sorted.map((value, index) => ({ index, value }))) {
          // console.log("index"+value.idred); // 9, 2, 5
          arrayValue.push(value);
      } 
      this.usuariosSelect=arrayValue;
      },
      error => {
        console.error(error);
      }
    );
  }

  loadRedesSocialesUsuarios(): void {
    // console.log("###################");
    this.http.get<any>('https://ti3pwepc47.execute-api.us-west-1.amazonaws.com/dev/redesusuarios').subscribe(
      redesSocialesUsuarios => {
        const sorted = redesSocialesUsuarios.sort((a, b) => a.red > b.red ? 1 : -1);
        console.log("sortted: "+sorted);
        const arrayValue=[];
        for (const { index, value } of sorted.map((value, index) => ({ index, value }))) {
          // console.log("index"+value.idred); // 9, 2, 5
          arrayValue.push(value);
      } 
      this.usuariosRedesSelect=arrayValue;
      console.log("..........................................."+arrayValue);
      },
      error => {
        console.error(error);
      }
    );
  }

  

}
