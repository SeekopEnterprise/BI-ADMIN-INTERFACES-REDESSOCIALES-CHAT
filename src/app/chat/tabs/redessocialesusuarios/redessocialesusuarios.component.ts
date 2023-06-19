import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpClient } from '@angular/common/http';
import { RedesUsuarios } from './redesusuarios.model';
import { RedSocial } from '../redessociales/redsocial.model';
import Swal from 'sweetalert2';
import { FormBuilder, Validators, FormGroup, AbstractControl } from '@angular/forms'

@Component({
  selector: 'app-redessocialesusuarios',
  templateUrl: './redessocialesusuarios.component.html',
  styleUrls: ['./redessocialesusuarios.component.scss']
})
export class RedessocialesusuariosComponent implements OnInit {

  redesusuariosForm: FormGroup;

  redesSelect: any;
  distribuidoresSelect: any;
  usuariosRedesSelect: any;
  submitted = false;
  newRedesUsuarios: Partial<RedesUsuarios> = {
    idred: '',
    iddistribuidor: '',
    idcliente: '',
    identificadorplataforma: '',
    nombrepagina: '',
    token: '',
    fechacreacion: new Date("2000-01-01"),
    fechavencimimiento: new Date("2000-01-01")
  };

  modal: any;

  constructor(private modalService: NgbModal, private http: HttpClient,
    private fb: FormBuilder) { }

  ngOnInit(): void {
    this.loadRedesSocialesUsuarios();
    this.loadRedesSociales();
    this.loadDistribuidores();

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
    this.newRedesUsuarios = {
      idred: '',
      iddistribuidor: '',
      idcliente: '',
      identificadorplataforma: '',
      nombrepagina: '',
      token: '',
      fechacreacion: new Date(fechacreacion),
      fechavencimimiento: new Date("2000-01-01")
    }


    this.redesusuariosForm = this.fb.group({
      idred: ['', Validators.required],
      iddistribuidor: ['', Validators.required],
      idcliente: ['', [Validators.required, Validators.pattern('[A-Za-z0-9\s]*')]],
      nombrepagina: ['', [Validators.required, Validators.pattern('^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$')]],
    });

  }

  openUsuarioRedSocialModal(content) {
    this.modal = this.modalService.open(content, {
      centered: true,
      size: 'lg'
    });
  }

  openContactsModalEdit(content) {
    this.modalService.open(content, {
      centered: true,
      size: 'lg'
    });
  }

  changeRedSocial(e) {

    this.getRedSocial.setValue(e.target.value, {
      onlySelf: true
    })
    // return this.redesusuariosForm.get('nombreRedSocial');
  }

  get getRedSocial() {
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

  validateForm() {
    this.submitted = true;

    if (this.redesusuariosForm.invalid) {
      return;
    }

    console.log(this.redesusuariosForm.value);
  }

  asociarCuenta() {
    if (this.redesusuariosForm.valid) {
      const datos = this.redesusuariosForm.value;
      this.http.post('https://ti3pwepc47.execute-api.us-west-1.amazonaws.com/dev/redesusuarios', datos).subscribe(
        response => {
          console.log(response);
          this.modal.close('Cross click');
          this.loadRedesSocialesUsuarios();
          const iddistribuidor = this.redesusuariosForm.get('iddistribuidor').value;
          const newWindow = window.open(`http://auth.mercadolibre.com.mx/authorization?response_type=code&client_id=7024360621079096&redirect_uri=https://06qe3dt50i.execute-api.us-west-1.amazonaws.com/dev&state=${iddistribuidor}`);
          window.focus(); // Trae el foco de nuevo a la ventana principal
        },
        error => {
          console.error(error);
        }
      );
    }
  }


  loadRedesSociales() {
    this.http.get<RedSocial[]>('https://ti3pwepc47.execute-api.us-west-1.amazonaws.com/dev/redessociales').subscribe(
      redsocial => {
        // Creamos un Set para mantener un registro único de los 'idred'
        const idredSet = new Set();
        // Filtramos la lista original para mantener solo los elementos con un 'idred' único
        const uniqueRedsocial = redsocial.filter(item => {
          if (!idredSet.has(item.idred)) {
            idredSet.add(item.idred);
            return true;
          }
          return false;
        });
        // Ordenamos la lista filtrada
        const sorted = uniqueRedsocial.sort((a, b) => a.nombre > b.nombre ? 1 : -1);
        this.redesSelect = sorted;
      },
      error => {
        console.error(error);
      }
    );
  }


  loadDistribuidores(): void {
    this.http.get<any>('https://ti3pwepc47.execute-api.us-west-1.amazonaws.com/dev/grupos').subscribe(
      distribuidor => {
        const sorted = distribuidor.sort((a, b) => a.nombredistribuidor > b.nombredistribuidor ? 1 : -1);
        console.log("sortted: " + sorted);
        const arrayValue = [];
        for (const { index, value } of sorted.map((value, index) => ({ index, value }))) {
          arrayValue.push(value);
        }
        this.distribuidoresSelect = arrayValue;
      },
      error => {
        console.error(error);
      }
    );
  }


  loadRedesSocialesUsuarios(): void {
    this.http.get<any>('https://ti3pwepc47.execute-api.us-west-1.amazonaws.com/dev/redesusuarios').subscribe(
      redesSocialesUsuarios => {
        const sorted = redesSocialesUsuarios.sort((a, b) => {
          if(a.red !== b.red) {
            return a.red > b.red ? 1 : -1;
          } else {
            return a.user > b.user ? 1 : -1;
          }
        });

        const grouped = sorted.reduce((groups, item) => {
          const group = item.red ? item.red : 'Sin Red Asignada';
          groups[group] = groups[group] || [];
          groups[group].push(item);

          return groups;
        }, {});

        this.usuariosRedesSelect = Object.keys(grouped).map(key => ({ key, usuarios: grouped[key] }));
      },
      error => {
        console.error(error);
      }
    );
  }



}
