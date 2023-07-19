import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpClient } from '@angular/common/http';
import { RedesUsuarios } from './redesusuarios.model';
import { RedSocial } from '../redessociales/redsocial.model';
import Swal from 'sweetalert2';
import { GlobalUserService } from '../../../services/global-user.service';
import { FormBuilder, Validators, FormGroup, FormControl } from '@angular/forms'

@Component({
  selector: 'app-redessocialesusuarios',
  templateUrl: './redessocialesusuarios.component.html',
  styleUrls: ['./redessocialesusuarios.component.scss']
})
export class RedessocialesusuariosComponent implements OnInit {

  @ViewChild('idred') idred!: ElementRef;
  @ViewChild('nombrepagina', { static: true }) nombrepaginaInput: ElementRef<HTMLInputElement>;

  public isButtonDisabled: boolean = true;
  public isButtonSaveDisabled: boolean = true;
  public yaEstaSeteado = false;
  public usuarioCorreo: string;
  redesusuariosForm: FormGroup;

  /*
  redesusuariosForm = new FormGroup({
    idred: new FormControl({disabled: true}),
    iddistribuidor: new FormControl({disabled: true})
  });*/

  redesSelect: any;
  distribuidoresSelect: any;
  usuariosRedesSelect: any;
  submitted = false;
  newRedesUsuarios: Partial<RedesUsuarios> = {
    idred: '',
    iddistribuidor: '',
    idcliente: '',
    identificadorplataforma: '-',
    nombrepagina: '',
    token: '',
    fechacreacion: new Date("2000-01-01"),
    fechavencimimiento: new Date("2000-01-01")
  };

  modal: any;

  constructor(private globalUserService: GlobalUserService, private modalService: NgbModal, private http: HttpClient,
    private fb: FormBuilder) {
    /*
          this.redesusuariosForm= this.fb.group({
            idred: [0, [Validators.required]],
            usuario: ['', [Validators.required]],
            noCliente: ['', [Validators.required]],
            pagina: ['', [Validators.required]],
            token: ['', [Validators.required]],
            fechavencimimiento: ['', [Validators.required]]
          }); */


  }

  ngOnInit(): void {

    try {

      // Recupera el usuario del servicio o del localStorage
      let user = this.globalUserService.getCurrentUser();
      if (!user || user.type.toLowerCase().includes("web")) {
        try {
          user = JSON.parse(localStorage.getItem('currentUser'));
        } catch (error) {
          console.log('Error al acceder a localStorage para distribuidores redes :', error);
        }
      }

      if (user && user.token) {
        this.usuarioCorreo = user.username;
        this.loadRedesSocialesUsuarios();
        this.loadRedesSociales();
        this.loadDistribuidores();
      }

    } catch (error) {
      console.log('Error cargando grupos o recuperando mensajes:', error);
      return;
    }



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

  ngAfterViewInit() {
    // Escucha los mensajes que llegan del padre
    window.addEventListener('message', async (event) => { // marcado como async
      if (!this.yaEstaSeteado) {
        // Almacena el usuario en el servicio
        this.globalUserService.setCurrentUser(event.data);
        console.log("esta funcionando o no aquí lo sabremos: ", event.data);
        this.usuarioCorreo = event.data.username;
        if (this.usuarioCorreo) {
          this.loadRedesSocialesUsuarios();
          this.loadRedesSociales();
          this.loadDistribuidores();
        }
        this.yaEstaSeteado = true;
      }
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
    else {
      // this.isButtonDisabled = false;

    }
    console.log(this.redesusuariosForm.value);
  }

  changeDistribuidor(event: KeyboardEvent) {
    this.submitted = true;

    if (this.redesusuariosForm.invalid) {
      this.isButtonDisabled = true;
      return;
    }
    else {

      this.isButtonDisabled = false;

    }
  }

  selectRedSocial(event: KeyboardEvent) {
    this.submitted = true;

    if (this.redesusuariosForm.invalid) {
      this.isButtonDisabled = true;
      return;
    }
    else {
      // alert("prueba");
      this.isButtonDisabled = false;


    }
  }

  onKeyUp(event: KeyboardEvent) {

    this.submitted = true;

    if (this.redesusuariosForm.invalid) {
      this.isButtonDisabled = true;
      return;
    }
    else {
      // alert("prueba");
      this.isButtonDisabled = false;

    }
    // console.log(this.redesusuariosForm.value);
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
          console.log(error);
        }
      );
    }
  }


  loadRedesSociales() {
    this.http.get<RedSocial[]>('https://ti3pwepc47.execute-api.us-west-1.amazonaws.com/dev/redessociales/').subscribe(
      redsocial => {
        // Ordenamos la lista
        const sorted = redsocial.sort((a, b) => a.nombre > b.nombre ? 1 : -1);
        this.redesSelect = sorted;
      },
      error => {
        console.log(error);
      }
    );
  }



  loadDistribuidores(): void {
    this.http.get<any>('https://ti3pwepc47.execute-api.us-west-1.amazonaws.com/dev/grupos/' + this.usuarioCorreo).subscribe(
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
        console.log(error);
      }
    );
  }


  loadRedesSocialesUsuarios(): void {
    this.http.get<any>('https://ti3pwepc47.execute-api.us-west-1.amazonaws.com/dev/redesusuarios/red/' + this.usuarioCorreo).subscribe(
      redesSocialesUsuarios => {
        const sorted = redesSocialesUsuarios.sort((a, b) => {
          if (a.red !== b.red) {
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
        console.log(error);
      }
    );
  }

  probar() {
    alert("alert");
    /*
      this.redesusuariosForm.controls.idred.disable();
      this.redesusuariosForm.controls.iddistribuidor.disable();
      this.redesusuariosForm.controls.idcliente.disable();
      this.redesusuariosForm.controls.nombrepagina.disable();
      this.isButtonSaveDisabled = false; */
  }

  testConexion() {
    // alert("ok test");

    // const nombrepagina = document.getElementById('nombrepagina') as HTMLInputElement;
    // console.log("ok: "+nombrepagina.value);


    testConnection();
    // const FetchButton = document.getElementById("nombrepagina") as HTMLInputElement;
    // FetchButton.disabled=true;
    const response = false;

    async function testConnection() {

      // const val=(document.getElementById('nombrepagina') as HTMLInputElement).disabled = false;
      // const nombrepagina = document.getElementById('nombrepagina') as HTMLInputElement;


      const token = 'APP_UR4158433912938780-041117-';
      const url = `https://fzq9t36ec9.execute-api.us-west-1.amazonaws.com/dev/probarconexion?token=${token}`;
      const button = document.getElementById('testConnectionButton');
      const nombrepagina = document.getElementById("nombrepagina");
      const idred = document.getElementById("idred");
      const iddistribuidor = document.getElementById("iddistribuidor");
      const idcliente = document.getElementById("idcliente");

      const btnGuardarUsuario = document.getElementById("btnGuardarUsuario");


      try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.statusCode === 200) {

          nombrepagina?.setAttribute('disabled', 'true');
          idred?.setAttribute('disabled', 'true');
          iddistribuidor?.setAttribute('disabled', 'true');
          idcliente?.setAttribute('disabled', 'true');
          btnGuardarUsuario?.removeAttribute('disabled');


          button.classList.remove('btn-danger');
          button.classList.add('btn-primary');
          Swal.fire({
            icon: 'success',
            title: 'Conexión exitosa',
            text: 'La conexión fue correcta.',
          });



          /*
                        this.redesusuariosForm.controls.idred.disable();
                        this.redesusuariosForm.controls.iddistribuidor.disable();
                        this.redesusuariosForm.controls.idcliente.disable();
                        this.redesusuariosForm.controls.nombrepagina.disable();

                        this.isButtonSaveDisabled = false; */

        } else {
          /*
                      this.redesusuariosForm.controls.idred.disable();
                      this.redesusuariosForm.controls.iddistribuidor.disable();
                      this.redesusuariosForm.controls.idcliente.disable();
                      this.redesusuariosForm.controls.nombrepagina.disable();

                      this.isButtonSaveDisabled = false; */

          button.classList.remove('btn-primary');
          button.classList.add('btn-danger');
          Swal.fire({
            icon: 'error',
            title: 'Error en la conexión',
            text: 'Conexión errónea.',
          });
        }
      } catch (error) {
        console.log(error);
        button.classList.remove('btn-primary');
        button.classList.add('btn-danger');
        Swal.fire({
          icon: 'error',
          title: 'Error en la conexión',
          text: 'Conexión errónea.',
        });
      }
    }

    // console.log("abc: "+response);
  }

}
