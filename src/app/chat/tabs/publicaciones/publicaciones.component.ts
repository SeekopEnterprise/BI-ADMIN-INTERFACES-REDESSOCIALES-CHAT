import { Component, OnInit, ViewChild,ElementRef } from '@angular/core';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { HttpClient,HttpHeaders  } from '@angular/common/http';
import {FormGroup, FormControl, Validators,FormBuilder} from '@angular/forms';


@Component({
  selector: 'app-publicaciones',
  templateUrl: './publicaciones.component.html',
  styleUrls: ['./publicaciones.component.scss']
})


  export class PublicacionesComponent {
    openModal: boolean = false;
    selectedOption: string = 'facebook';
    textoEnlaces: string = '';

    constructor() { }

  submitForm() {
    // Aquí puedes manejar la lógica para guardar los datos del formulario
    console.log("Publicar en:", this.selectedOption);
    console.log("Texto y Enlaces:", this.textoEnlaces);
    // Añade más lógica según sea necesario
    this.openModal = false; // Cierra el modal después de enviar el formulario
  }
  
  }