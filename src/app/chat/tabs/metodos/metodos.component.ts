import { Component, OnInit, ViewChild,ElementRef } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
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
  metodoForm: FormGroup; 
  metodoEditForm: FormGroup= new FormGroup({
    nombreRedSocial_edit: new FormControl(''), 
    tipo_metodo_edit: new FormControl(''),
    tipoSolicitud_edit: new FormControl(''),
    rama_edit: new FormControl(''),
    resultado_edit: new FormControl(''),
    etiquetavalor_edit: new FormControl(''),
  });
  
  /* = new FormGroup({
    nombreRedSocial: new FormControl('') /*, 
    tipometodo: new FormControl(''),
    tipoSolicitud: new FormControl(''),
    rama: new FormControl(''),
    resultado: new FormControl(''),
    etiquetavalor: new FormControl(''), 
  }); */

  submitted= false;
  list="";

  MetodosList: any;
  redesSelect: any;
  tipoSolicitudSelect: any;
  metodo: Metodos[];
  newMetodo: Partial<Metodos> = {
    
    idred: 0,
    idsolicitud: 0,
    tipometodo: '' ,
    rama: '',
    resultado: 0,
    etiquetavalor: '',
  };

/*
  form: Partial<Metodos> = {
    etiquetavalor: '',
    idmetodo: 0, 
    idred: 0,
    idsolicitud: 0,
    nombrered: '',
    nombresolicitud: '',
    rama: '',
    resultado: 0,
    tipoaccion: 0,
    tipometodo: '' 
  }; */


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

  /*
  "idred":select_redsocial,
  "idsolicitud":select_tiposolicitud,
  "tipometodo":select_metodo,
  "rama":rama,
  "resultado":select_resultado,
  "etiquetavalor":etiqueta
  */ 
  
  constructor(private modalService: NgbModal, private http: HttpClient,private fb: FormBuilder) { 

      /*
      this.metodoForm = new FormGroup({
        nombreRedSocial : new FormControl('', [
          Validators.required
        ])
      }); */
      
      
      this.metodoForm= this.fb.group({
        nombreRedSocial: ['', [Validators.required]], /*
        tipometodo: ['', [Validators.required]],
        resultado: ['', [Validators.required]],
        tipoSolicitud: ['', [Validators.required]],
        rama: ['', [Validators.required]],
        etiquetavalor: ['', [Validators.required]]  */
      }); 

      this.metodoEditForm= this.fb.group({
        nombreRedSocial_edit: ['', [Validators.required]], 
        tipo_metodo_edit: ['', [Validators.required]], 
        tipoSolicitud_edit: ['', [Validators.required]],
        rama_edit: ['', [Validators.required]],
        resultado_edit: ['', [Validators.required]],
        etiquetavalor_edit: ['', [Validators.required]],
      }); 

      /*
      this.metodoForm = new FormGroup({
        nombreRedSocial: new FormControl('', Validators.required)
      }); */

    }

  ngOnInit(): void {
    this.loadMetodos();
    this.loadRedesSociales();
    this.loadTipoSolicitud();
    // this.validateForm();
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
    console.log("datos: "+this.metodoForm.valid);
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
    const var_inv= document.getElementsByClassName('ng-invalid')
    // console.log("value: "+JSON.stringify(this.metodoForm.value, null, 4));
    // console.log(" -> "+JSON.stringify(this.metodoForm.value, null, 4));
    console.log("datos: "+this.metodoForm.valid);
    // console.log(JSON.stringify(this.metodoForm, null, 2));
    if (this.metodoForm.valid) {
      alert("ok");
      this.submitted = true;
      console.log("datos: "+this.newMetodo);
      // this.addNewMetodo();
      // return true;
		} else {
      return console.log(this.metodoForm.value);
		} 
    
  }

  validateEditForm(): void{
    this.submitted = true;
    // const var_inv= document.getElementsByClassName('ng-invalid')
    // console.log("value: "+JSON.stringify(this.metodoForm.value, null, 4));
    // console.log(" -> "+JSON.stringify(this.metodoForm.value, null, 4));
    console.log("form: "+this.metodoEditForm.valid);
    // console.log(JSON.stringify(this.metodoForm, null, 2));
    if (this.metodoEditForm.valid) {
      alert("ok");
      this.submitted = true;
      console.log("datos: "+this.editMet);

		} else {
      return console.log(this.metodoEditForm.value);
		} 
    
  }
  /*
  onReset() {
    this.submitted = false;
    this.metodoForm.reset();
  } */ 

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
				this.closeResult = `Closed with: ${result}`;
			},
			(reason) => {
				this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
			},
		);
  }

  openMetodosModalEdit(content_edit,idmetodo:any,
    idred:any,nombrered:any,tipometodo:any,idsolicitud:any,nombresolicitud:any,tipoaccion:any,rama:any,resultado:any,etiquetavalor:any) {
    
    this.editMet = {
      // idmetodo:idmetodo,
      idred:idred,
      idsolicitud: idsolicitud,
      rama: rama,
      tipometodo: tipometodo,
      resultado: resultado,
      etiquetavalor: etiquetavalor,
    };

    this.IdMetodo=idmetodo;
    console.log("idsolicitud editar: "+this.idsolicitud);
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
    this.http.post<Metodos>('https://ti3pwepc47.execute-api.us-west-1.amazonaws.com/dev/metodos', this.newMetodo).subscribe(
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

      const tbody = document.getElementById('bodyMetodos');
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
        nombrered.textContent = arrayValue[obj].nombrered.toString();
        fila.appendChild(nombrered);
        
        const nombresolicitud = document.createElement('td');
        nombresolicitud.textContent = arrayValue[obj].nombresolicitud.toString();
        fila.appendChild(nombresolicitud);

        const rama = document.createElement('td');
        rama.textContent = arrayValue[obj].rama.toString();
        fila.appendChild(rama);

        const tipometodo = document.createElement('td');
        tipometodo.textContent = arrayValue[obj].tipometodo.toString();
        fila.appendChild(tipometodo);

        const resultado = document.createElement('td');
        resultado.textContent = arrayValue[obj].resultado.toString();
        fila.appendChild(resultado);

        const etiquetavalor = document.createElement('td');
        etiquetavalor.textContent = arrayValue[obj].etiquetavalor.toString();
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
            this.openMetodosModalEdit(
                                      this.content_edit,
                                      this.idmetodo_p,
                                      this.idred_p,
                                      this.nombrered_p,
                                      this.tipometodo_p,
                                      this.idsolicitud_p,
                                      this.nombresolicitud_p,
                                      this.tipoaccion_p,
                                      this.rama_p,
                                      this.resultado_p,
                                      this.etiquetavalor_p);
            // this.idMetodo=arrayValue[obj].idmetodo.toString();
            // console.log("idMetodo: "+this.idMetodo);
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
        //console.log(sorted);
        const arrayValue=[];
        for (const { index, value } of sorted.map((value, index) => ({ index, value }))) {
          // console.log("index"+value.idred); // 9, 2, 5
          arrayValue.push(value);
      } 

      this.tipoSolicitudSelect=arrayValue;
      // console.log(arrayValue);
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

  editMetodo(){
    // console.log("valor idmetodo:"+this.IdMetodo);
    this.http.put('https://ti3pwepc47.execute-api.us-west-1.amazonaws.com/dev/metodos/'+this.IdMetodo+'.json',this.editMet)
    .subscribe(data => {
      // console.log(data);

      this.loadMetodos();

        // Muestra una alerta de éxito y cierra el modal
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
      // Muestra una alerta de error
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Hubo un error en la actualización. Por favor, inténtalo más tarde.',
        confirmButtonText: 'Entendido'
      });
    }
    );     
   
  }

  /*
  handleError(error: any) {
    let errorMessage = '';
    if (error.error instanceof ErrorEvent) {
      // Get client-side error
      errorMessage = error.error.message;
    } else {
      // Get server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    window.alert(errorMessage);
    return throwError(() => {
      return errorMessage;
    });
  }*/ 

}
