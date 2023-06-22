import { Component, OnInit, ViewChild,ElementRef } from '@angular/core';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { HttpClient,HttpHeaders  } from '@angular/common/http';
import { Metodos } from './metodos.model';
import { RedSocial } from '../redessociales/redsocial.model';
import Swal from 'sweetalert2';
// import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import {FormGroup, FormControl, Validators,FormBuilder} from '@angular/forms';
import { eventListeners } from '@popperjs/core';
/* import { retry, catchError } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs'; */

// @ViewChild('content_eliminar') editModal : ElementRef<any>;
@Component({
  selector: 'app-metodos',
  templateUrl: './metodos.component.html',
  styleUrls: ['./metodos.component.scss']
})
export class MetodosComponent implements OnInit{
  [x: string]: any;
  @ViewChild('rama_edit') rama_edit: ElementRef;
  @ViewChild('content_eliminar') modalRef: ElementRef<any>;
  @ViewChild('content_edit') modalEditRef: ElementRef<any>;
  
  // metodoForm: FormGroup; 
  // metodoForm: FormControl;

  idMetodo;
  metodoForm: FormGroup = new FormGroup({
    nombreRedSocial: new FormControl(''), 
    tipometodo: new FormControl(''),
    tipoSolicitud: new FormControl(''),
    rama: new FormControl(''),
    resultado: new FormControl(''),
    etiquetavalor: new FormControl(''), 
  });


  metodoEditForm: FormGroup= new FormGroup({
    nombreRedSocial_edit: new FormControl(''), 
    tipo_metodo_edit: new FormControl(''),
    tipoSolicitud_edit: new FormControl(''),
    rama_edit: new FormControl(''),
    resultado_edit: new FormControl(''),
    etiquetavalor_edit: new FormControl(''),
  });
  
 

  submitted= false;
  list="";

  MetodosList: any;
  redesSelect: any;
  tipoSolicitudSelect: any;
  metodo: Metodos[];
  newMetodo: Partial<Metodos> = {
    
    // idred: 0,
    // idsolicitud: 0,
    tipometodo: '' ,
    rama: '',
    // resultado: 0,
    etiquetavalor: '',
  };

  IdMetodo: Partial<Metodos> = {
    idmetodo:0
  };

  editMet: Partial<Metodos> = {
    // idmetodo:0,
    //idred: 0,
    // idsolicitud: 0,
    rama: '',
    tipometodo: '' ,
    resultado: 0,
    etiquetavalor: '',
  };

  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    }),
  };


  constructor(private modalService: NgbModal, private http: HttpClient,private fb: FormBuilder) { 
      
      this.metodoForm= this.fb.group({
        nombreRedSocial: ['', [Validators.required]], 
        tipometodo: ['', [Validators.required]],
        tipoSolicitud: ['', [Validators.required]], 
        rama: ['', [Validators.required]],
        resultado: ['', [Validators.required]],
        etiquetavalor: ['', [Validators.required]]  
      }); 

      this.metodoEditForm= this.fb.group({
        nombreRedSocial_edit: ['', [Validators.required]], 
        tipo_metodo_edit: ['', [Validators.required]], 
        tipoSolicitud_edit: ['', [Validators.required]],
        rama_edit: ['', [Validators.required]],
        resultado_edit: ['', [Validators.required]],
        etiquetavalor_edit: ['', [Validators.required]],
      }); 

      

    }

  ngOnInit(): void {
    
    this.loadMetodos();
    this.loadRedesSociales();
    this.loadTipoSolicitud();
  }

  
  changeResultado(e) {
    this.getResultado.setValue(e.target.value, {
      onlySelf: true
    })
  }
  changeTipoSolicitud(e) {
    this.getTipoSolicitud.setValue(e.target.value, {
      onlySelf: true
    })
  }

  changeTipoMetodo(e) {
    this.getTipoMetodo.setValue(e.target.value, {
      onlySelf: true
    })
  } 

  changeRedSocial(e) {
    console.log("datos changed: "+this.metodoForm.valid);
    // const selectedValue = e.target.value;

    this.getRedSocial.setValue(e.target.value, {
      onlySelf: true
    }) 
  }

  changeEtiqueta(e) {
    this.getEtiqueta.setValue(e.target.value, {
      onlySelf: true
    })
  }

  get getResultado() { 
    return this.metodoForm.get('resultado');   
  }

  get getTipoSolicitud() { 
    return this.metodoForm.get('tipoSolicitud');
  }

  get getTipoMetodo() { 
    return this.metodoForm.get('tipometodo');
  }

  get getRedSocial() { 
    return this.metodoForm.get('nombreRedSocial');
  }

  get getEtiqueta() { 
    return this.metodoForm.get('etiquetavalor');
  }

  get getRama() { 
    return this.metodoForm.get('rama');
 } 

 get f()  {
  return this.metodoForm.controls;
}

get fe()  {
  return this.metodoEditForm.controls;
}

  validateForm(): void{
    this.submitted = true;
    const var_inv= document.getElementsByClassName('ng-invalid');
    // console.log("datos form: "+this.newMetodo.tipometodo);

    if (this.metodoForm.valid) {
      
      this.submitted = true;
      // console.log("datos validos: "+this.metodoForm.value);
      this.addNewMetodo();
      // return true;
		} else {
      return console.log(this.metodoForm.value);
		} 
    
  }

  validateUpdateForm(): void{
    this.submitted = true;
    // console.log("form: "+this.metodoEditForm.valid);
    if (this.metodoEditForm.valid) {
      this.submitted = true;
      this.updateMetodo();

		} else {
      return console.log(this.metodoEditForm.value);
		} 
    
  }

  openMetodosModal(content) {
    this.modalService.open(content, { centered: true });
  }


  openModalDelete(content_eliminar){
    // alert("Okkk");
    // const values = Object.keys(content).map(key => content[key]);
    // console.log("content: "+values);
    // this.modalService.open(this.content_eliminar,{ centered: true });
    // this.content_eliminar.show();
    /* this.modalService.open(content_eliminar, {
      size: 'xl'
    }); */

    this.modalService.open(this.modalRef, { ariaLabelledBy: 'modal-basic-title' }).result.then(
			(result) => {
				// this.closeResult = `Closed with: ${result}`;
        const dismissReason = this.getDismissReason(result);
			},
			(reason) => {
				// this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
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

  openMetodosModalEdit(content_edit,
    idmetodo:any,
    idred:any,
    nombrered:any,
    tipometodo:any,
    idsolicitud:any,
    nombresolicitud:any,
    tipoaccion:any,
    rama:any,
    resultado:any,
    etiquetavalor:any){
    /*
      this.editMet = {

        rama: '',
        tipometodo: '' ,
        resultado: 0,
        etiquetavalor: '',
      };*/

    this.editMet = {
      // idmetodo:idmetodo,
      idred:idred,
      idsolicitud: idsolicitud,
      rama: rama,
      tipometodo: tipometodo,
      resultado: resultado,
      etiquetavalor: etiquetavalor
    };

    this.IdMetodo=idmetodo;
    console.log("idsolicitud editar: "+idsolicitud);
    // this.modalService.open(content_edit, { centered: true });
    this.modalService.open(this.modalEditRef, { ariaLabelledBy: 'modal-basic-title' }).result.then(
			(result) => {
				this.closeResult = `Closed with: ${result}`;
			},
			(reason) => {
				this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
			},
		);
  }

  addNewMetodo() { 
    // console.log(this.newMetodo);  
    const data={
      "idred":this.newMetodo.idred,
      "idsolicitud":this.newMetodo.idsolicitud,
      "rama":this.newMetodo.rama,
      "tipometodo":this.newMetodo.tipometodo,
      "resultado":this.newMetodo.resultado,
      "etiquetavalor":this.newMetodo.etiquetavalor
    };

    console.log(
      "id red: "+data.idred
      +" idsolicitud: "+data.idsolicitud
      +" rama: "+data.rama
      +" tipo metodo: "+data.tipometodo
      +" resultado: "+data.resultado
      +" etiqueta"+data.etiquetavalor);
    const url = 'https://ti3pwepc47.execute-api.us-west-1.amazonaws.com/dev/metodos';
    
    
    this.http.post<Metodos>(url, data).subscribe(
      response => {
        // Limpia el formulario y recarga la lista de redes sociales
        /*
        this.newMetodo = {
          etiquetavalor: '',
          nombrered: '',
          nombresolicitud: '',
          rama: '',
          tipometodo: '' 
        }; */

        this.loadMetodos();

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
          text: 'Hubo un problema al agregar la red social. Por favor, inténtalo más tarde.',
          confirmButtonText: 'Entendido'
        });
      }
    ); 
  }

  loadMetodos(): void {
    this.http.get<Metodos[]>('https://ti3pwepc47.execute-api.us-west-1.amazonaws.com/dev/metodos').subscribe(
      metodos => {
        
        const sorted = metodos.sort((a, b) => a.nombrered > b.nombrered ? 1 : -1);
        const arrayValue=[];
        
        for (const { index, value } of sorted.map((value, index) => ({ index, value }))) {
          // console.log(index); // 0, 1, 2
          // console.log(value); // 9, 2, 5
          arrayValue.push(value);
          
      } 

      document.getElementById('bodyMetodos').innerHTML="";
      // document.getElementById('etiquetavalor_edit').innerText="";
      

      const tbody = document.getElementById('bodyMetodos');

      /*
      this.metodoEditForm= {
        nombreRedSocial_edit: '', 
        tipo_metodo_edit: '',
        tipoSolicitud_edit: '',
        rama_edit: '',
        resultado_edit: '',
        etiquetavalor_edit: '',
      }; */

      // this.metodoEditForm.controls['etiquetavalor_edit'].reset();
      // this.etiquetavalor_p=""; 

      for(let obj in arrayValue) {

        const 
        idmetodo_p=0,
        idred_p=0,
        nombrered_p="",
        tipometodo_p="",
        idsolicitud_p=0,
        nombresolicitud_p=0,
        tipoaccion_p=0,
        rama_p="",
        resultado_p="",
        etiquetavalor_p=""; 
        
        
        this.idmetodo_p= arrayValue[obj].idmetodo.toString();
        this.idred_p= arrayValue[obj].idred.toString();
        this.nombrered_p= arrayValue[obj].nombrered.toString();
        this.tipometodo_p= arrayValue[obj].tipometodo.toString();
        this.idsolicitud_p= arrayValue[obj].idsolicitud.toString();
        this.nombresolicitud_p= arrayValue[obj].nombresolicitud.toString();
        this.tipoaccion_p= arrayValue[obj].tipoaccion.toString();
        this.rama_p= arrayValue[obj].rama.toString();
        this.resultado_p= arrayValue[obj].resultado.toString();
        this.etiquetavalor_p= arrayValue[obj].etiquetavalor.toString(); 

        const fila = document.createElement('tr');
  
        const nombrered = document.createElement('td');
        nombrered.className="text";
        nombrered.textContent = arrayValue[obj].nombrered.toString();
        fila.appendChild(nombrered);
        
        const nombresolicitud = document.createElement('td');
        nombresolicitud.textContent = arrayValue[obj].nombresolicitud.toString();
        nombresolicitud.className="text";
        fila.appendChild(nombresolicitud);

        const rama = document.createElement('td');
        rama.textContent = arrayValue[obj].rama.toString();
        rama.className="text";
        fila.appendChild(rama);

        const tipometodo = document.createElement('td');
        tipometodo.textContent = arrayValue[obj].tipometodo.toString();
        tipometodo.className="text";
        fila.appendChild(tipometodo);

        const resultado = document.createElement('td');
        resultado.textContent = arrayValue[obj].resultado.toString();
        resultado.className="number";
        fila.appendChild(resultado);

        const etiquetavalor = document.createElement('td');
        etiquetavalor.textContent = arrayValue[obj].etiquetavalor.toString();
        etiquetavalor.className="text";
        fila.appendChild(etiquetavalor);

        const tdbtn = document.createElement('td');
        
        const btneditar = document.createElement('a');
        const ieditar = document.createElement('i');
        btneditar.innerHTML=""
        btneditar.type = "button";
        btneditar.className="link link-primary";
        ieditar.setAttribute('class',"ri-ball-pen-fill");
        btneditar.appendChild(ieditar);
        // btneditar.className="btn btn-primary";

        btneditar.setAttribute('data-toggle', 'modal');
        // this.renderer.setAttribute(btneditar, 'data-target', '#editMetodos-exampleModal');
        btneditar.setAttribute('data-target','#editMetodos-exampleModalLabel');
        // btneditar.addEventListener("click", this.openModalDelete);
        btneditar.addEventListener('click', () => {

          // arrayValue[obj].idmetodo.toString()
          this.openMetodosModalEdit(
                                      this.content_edit,
                                      arrayValue[obj].idmetodo,
                                      arrayValue[obj].idred,
                                      arrayValue[obj].nombrered,
                                      arrayValue[obj].tipometodo,
                                      arrayValue[obj].idsolicitud,
                                      arrayValue[obj].nombresolicitud,
                                      arrayValue[obj].tipoaccion,
                                      arrayValue[obj].rama,
                                      arrayValue[obj].resultado,
                                      arrayValue[obj].etiquetavalor
            ); 

            // console.log("etiquetavalor_p:"+arrayValue[obj].etiquetavalor.toString(), event);
            
        });


        const btneliminar = document.createElement('a');
        const i = document.createElement('i');
        btneliminar.innerHTML=""
        btneliminar.type = "button";
        btneliminar.className="link link-danger"; // "btn btn-danger";
        i.setAttribute('class', "ri-delete-bin-6-fill");

        btneliminar.appendChild(i);
        btneliminar.setAttribute('data-toggle', 'modal');
        // this.renderer.setAttribute(btneliminar, 'data-target', '#editMetodos-exampleModal');
        btneliminar.setAttribute('data-target','#eliminarMetodos-exampleModalLabel');
        // btneliminar.addEventListener("click", this.openModalDelete);
        btneliminar.addEventListener('click', () => {
            this.openModalDelete(this.content_eliminar);
            this.idMetodo=arrayValue[obj].idmetodo.toString();
            console.log("idMetodo: "+this.idMetodo);
        });
        /* btneditar.onclick =function (){
          // alert("Editar");
        };*/

        

        /*
        btneditar.onclick = function handleClick() {
          // console.log('element clicked', event);
          btneditar.textContent = arrayValue[obj].idmetodo.toString();
          // console.log("Id:"+arrayValue[obj].idmetodo.toString(), event);
        }; */



        /*
        btneliminar.onclick = function handleClick(event:MouseEvent) {
          // console.log('element clicked', event);
          // btneditar.textContent = arrayValue[obj].idmetodo.toString();
          console.log("Id:"+arrayValue[obj].idmetodo.toString(), event);
          // this.modalService.open(, { centered: true });
          // this.myModal.nativeElement.className = 'modal fade show';
        }; */
/*
        btneliminar?.addEventListener('click', function openModalDelete() {
          console.log('button clicked');
          console.log(event);
          console.log(event.target);

        });*/


      tdbtn.appendChild(btneditar);  
      tdbtn.appendChild(btneliminar);      
      fila.appendChild(tdbtn);
        
      // btneditar.textContent = arrayValue[obj].idmetodo.toString();
      // fila.appendChild(btneditar);

        tbody.appendChild(fila);
      }

      // console.log(this.list);
      // document.getElementById('list_tablemetodos').innerHTML= this.list;
      
      /*
      sorted.forEach((value, index) => {
        // console.log(index); // 0, 1, 2
        console.log(value); // 9, 2, 5
    });*/

      this.MetodosList=arrayValue;

      // document.getElementById('list_tablemetodos').innerHTML= 'none';

      },
      error => {
        console.error(error);
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
      // console.log(".......... red social: "+this.redesSelect);
      },
      error => {
        console.error(error);
      }
    );

  }
  
  loadTipoSolicitud() {
    this.http.get<any>('https://ti3pwepc47.execute-api.us-west-1.amazonaws.com/dev/tiposdesolicitud').subscribe(
      tiposolicitud => {
        
        const sorted = tiposolicitud.sort((a, b) => a.nombre > b.nombre ? 1 : -1);
        const arrayValue=[];
        for (const { index, value } of sorted.map((value, index) => ({ index, value }))) {
          // console.log("index"+value.idred); // 9, 2, 5
          arrayValue.push(value);
      } 

        this.tipoSolicitudSelect=arrayValue;
        // console.log("......... "+arrayValue);
      },
      error => {
        console.error(error);
      }
    );

  }

  deleteMetodo(event: any, id: any){
    // console.log("Hola:"+id.idMetodo);
    // this.modalRef.nativeElement.click();
    const val=id.idMetodo;
    
    this.http.delete('https://ti3pwepc47.execute-api.us-west-1.amazonaws.com/dev/metodos/'+val)
    .subscribe({
        next: data => {
            // this.status = 'Delete successful';
            // console.log("se eliminó correctamente");
            this.loadMetodos();

            Swal.fire({
              icon: 'success',
              title: '¡Éxito!',
              text: 'Se eliminó correctamente!',
              confirmButtonText: 'Ok'
            });
            
            // this.modalService.dismissAll();
            // this.modalRef.nativeElement.dismissAll();
            // this.modalService.dismissAll();
            this.modalRef.nativeElement.click();
        },
        error: error => {
            // this.errorMessage = error.message;
            console.error('Hubo un error!', error);
        }
    });  
   
  }

  updateMetodo(){
    // console.log("idmetodo: "+this.IdMetodo);

    const data={
      "idred":this.editMet.idred,
      "idsolicitud":this.editMet.idsolicitud,
      "rama":this.editMet.rama,
      "tipometodo":this.editMet.tipometodo,
      "resultado":this.editMet.resultado,
      "etiquetavalor":this.editMet.etiquetavalor
    };

    /*
    console.log(data);
    console.log(
    // " idmetodo: "+this.editMet.idmetodo
    " idred: "+this.editMet.idred
    +" tipometodo: "+this.editMet.tipometodo
    +" idsolicitud: "+this.editMet.idsolicitud
    +" rama: "+this.editMet.rama
    +" resultado: "+this.editMet.resultado
    +" etiquetavalor: "+this.editMet.etiquetavalor); */

    
    const url = 'https://ti3pwepc47.execute-api.us-west-1.amazonaws.com/dev/metodos/' + this.IdMetodo + '.json';
    
    this.http.put(url, data)
    .subscribe(
      () => {

        
        this.editMet = {
          rama: '',
          tipometodo: '' ,
          resultado: 0,
          etiquetavalor: '',
        }; 
        
        this.loadMetodos();

        Swal.fire({
          icon: 'success',
          title: '¡Éxito!',
          text: 'Se actualizó correctamente!',
          confirmButtonText: 'Ok'
        });

        this.modalService.dismissAll();
      },
      error => {
        console.error(error);

        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Hubo un error en la actualización. Por favor, inténtalo más tarde.',
          confirmButtonText: 'Entendido'
        });
      }
      ); 
   
  }

}
