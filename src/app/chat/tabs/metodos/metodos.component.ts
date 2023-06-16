import { Component, OnInit, ViewChild,ElementRef } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpClient,HttpHeaders  } from '@angular/common/http';
import { Metodos } from './metodos.model';
import { RedSocial } from '../redessociales/redsocial.model';
import Swal from 'sweetalert2';
// import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import {FormGroup, FormControl, Validators,FormBuilder} from '@angular/forms';
/* import { retry, catchError } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs'; */


@Component({
  selector: 'app-metodos',
  templateUrl: './metodos.component.html',
  styleUrls: ['./metodos.component.scss']
})
export class MetodosComponent implements OnInit{
  @ViewChild('rama_edit') rama_edit: ElementRef;

  // metodoForm: FormGroup; 
  // metodoForm: FormControl;

  
  metodoForm: FormGroup = new FormGroup({
    nombreRedSocial: new FormControl('') /*, 
    tipometodo: new FormControl(''),
    tipoSolicitud: new FormControl(''),
    rama: new FormControl(''),
    resultado: new FormControl(''),
    etiquetavalor: new FormControl(''), */
  }); 

  submitted= false;

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
    idred: 0,
    idsolicitud: 0,
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
  /*
  onReset() {
    this.submitted = false;
    this.metodoForm.reset();
  } */ 

  openMetodosModal(content) {

    this.modalService.open(content, { centered: true });
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
      
      /*
      etiquetavalor: etiquetavalor,
      nombrered: '',
      nombresolicitud: '',
      rama: rama,
      tipometodo: '' */
    };

    this.IdMetodo=idmetodo;
    console.log("idmetodo: "+this.IdMetodo);

    this.modalService.open(content_edit, { centered: true });
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
        //console.log(sorted);
        /*
        const grouped = sorted.reduce(( groups,Metodos) => {
          const grupo = Metodos.nombrered ? Metodos.nombrered : 'Nissan Satelite';
          groups[grupo] = groups[grupo] || [];
          groups[grupo].push(Metodos); 
          const nombrered=Metodos['nombrered'];
          groups[nombrered]=sor;
          return Metodos;
        }, {}); */

        const arrayValue=[];
        for (const { index, value } of sorted.map((value, index) => ({ index, value }))) {
          // console.log(index); // 0, 1, 2
          // console.log(value); // 9, 2, 5
          arrayValue.push(value);
      } 
      
      /*
      sorted.forEach((value, index) => {
        // console.log(index); // 0, 1, 2
        console.log(value); // 9, 2, 5
    });*/

      this.MetodosList=arrayValue;
      // console.log("load metodos"+arrayValue);

        // this.redesSocialesList = Object.keys(grouped).map(key => ({ key, socialRedes: grouped[key] }));
        
        // this.MetodosList =sorted; // Object.keys(metodos).map(key => ({ key, metodos: metodos[key] }));
        // console.log(this.MetodosList['body']);
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
    // console.log("Hola:"+id);

    this.http.delete('https://ti3pwepc47.execute-api.us-west-1.amazonaws.com/dev/metodos/'+id)
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
            this.modalService.dismissAll();
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
