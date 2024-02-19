import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Publicacion } from './publicaciones.model';
import { RedSocial } from '../redessociales/redsocial.model';
import Swal from 'sweetalert2';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-publicaciones',
  templateUrl: './publicaciones.component.html',
  styleUrls: ['./publicaciones.component.scss']
})
export class PublicacionesComponent implements OnInit {
  @ViewChild('rama_edit') rama_edit: ElementRef;
  @ViewChild('content_eliminar') modalRef: ElementRef<any>;
  @ViewChild('content_edit') modalEditRef: ElementRef<any>;

  idPublicacion;
  closeResult = '';
  publicacionForm: FormGroup = new FormGroup({
    nombreRedSocial: new FormControl(''),
    tipoPublicacion: new FormControl(''),
    contenido: new FormControl(''),
  });

  publicacionEditForm: FormGroup = new FormGroup({
    nombreRedSocial_edit: new FormControl(''),
    tipo_publicacion_edit: new FormControl(''),
    contenido_edit: new FormControl(''),
  });

  submitted = false;
  list = "";

  PublicacionesList: any;
  redesSelect: any;
  newPublicacion: Partial<Publicacion> = {
    idred: null,
    tipoPublicacion: '',
    contenido: '',
  };

  editPub: Partial<Publicacion> = {
    idred: null,
    tipoPublicacion: '',
    contenido: '',
  };

  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    }),
  };

  constructor(private modalService: NgbModal, private http: HttpClient, private fb: FormBuilder) {
    this.publicacionForm = this.fb.group({
      nombreRedSocial: ['', [Validators.required]],
      tipoPublicacion: ['', [Validators.required]],
      contenido: ['', [Validators.required]],
    });

    this.publicacionEditForm = this.fb.group({
      nombreRedSocial_edit: ['', [Validators.required]],
      tipo_publicacion_edit: ['', [Validators.required]],
      contenido_edit: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {
    this.loadPublicaciones();
    this.loadRedesSociales();
  }

  get f() {
    return this.publicacionForm.controls;
  }

  get fe() {
    return this.publicacionEditForm.controls;
  }

  validateForm(): void {
    this.submitted = true;
    if (this.publicacionForm.valid) {
      this.submitted = true;
      this.addNewPublicacion();
    } else {
      return console.log(this.publicacionForm.value);
    }
  }

  validateUpdateForm(): void {
    this.submitted = true;
    if (this.publicacionEditForm.valid) {
      this.submitted = true;
      this.updatePublicacion();
    } else {
      return console.log(this.publicacionEditForm.value);
    }
  }

  openPublicacionesModal(content) {
    this.modalService.open(content, { centered: true });
  }

  openModalDelete(content_eliminar) {
    this.modalService.open(this.modalRef, { ariaLabelledBy: 'modal-basic-title' }).result.then(
      (result) => {
        const dismissReason = this.getDismissReason(result);
      },
      (reason) => {
        const dismissReason = this.getDismissReason(reason);
      },
    );
  }

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
        return 'by pressing ESC key';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
        return 'by clicking on a backdrop';
    } else {
        return `with: ${reason}`;
    }
}


openPublicacionesModalEdit(content_edit, idPublicacion: any, titulo: string, contenido: string, autor: string, fechaPublicacion: Date, idred: any, nombrered: any, tipoPublicacion: any) {
  this.editPub = {
    idred: idred,
    tipoPublicacion: tipoPublicacion,
    contenido: contenido,
    titulo: titulo,
    autor: autor,
    fechaPublicacion: fechaPublicacion
  };
  this.idPublicacion = idPublicacion;
  this.modalService.open(this.modalEditRef, { ariaLabelledBy: 'modal-basic-title' }).result.then(
    (result) => {
      this.closeResult = `Closed with: ${result}`; // Usa la propiedad aquí
    },
    (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`; // Y aquí
    },
  );
}


  addNewPublicacion() {
    const data = {
      "idred": this.newPublicacion.idred,
      "tipoPublicacion": this.newPublicacion.tipoPublicacion,
      "contenido": this.newPublicacion.contenido,
    };

    const url = 'https://ti3pwepc47.execute-api.us-west-1.amazonaws.com/dev/publicaciones';

    this.http.post<Publicacion>(url, data).subscribe(
      response => {
        this.loadPublicaciones();
        Swal.fire({
          icon: 'success',
          title: '¡Éxito!',
          text: 'La publicación ha sido agregada correctamente.',
          confirmButtonText: 'Ok'
        });
        this.modalService.dismissAll();
      },
      error => {
        console.log(error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Hubo un problema al agregar la publicación. Por favor, inténtalo más tarde.',
          confirmButtonText: 'Entendido'
        });
      }
    );
  }

  loadPublicaciones(): void {
    // Implement loadPublicaciones logic here
  }

  loadRedesSociales() {
    // Implement loadRedesSociales logic here
  }

  deletePublicacion(event: any, id: any) {
    // Implement deletePublicacion logic here
  }

  updatePublicacion() {
    // Implement updatePublicacion logic here
  }
}
