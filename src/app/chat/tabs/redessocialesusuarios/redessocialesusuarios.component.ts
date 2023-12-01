import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
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
  @ViewChild('content_edit') modalEditRef: ElementRef<any>;
  @ViewChild('content_eliminar') modalRef: ElementRef<any>;
  public isButtonDisabled: boolean = true;
  public isButtonSaveDisabled: boolean = true;
  public isButtonDisabledEdit: boolean = true;
  public isButtonSaveDisabledEdit: boolean = true;

  public yaEstaSeteado = false;
  public usuarioCorreo: string;
  redesusuariosForm: FormGroup;
  redesusuariosEditForm: FormGroup;


  /*
  redesusuariosForm = new FormGroup({
    idred: new FormControl({disabled: true}),
    iddistribuidor: new FormControl({disabled: true})
  });*/

  idredusuario:any;
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

  newRedesUsuariosEdit: Partial<RedesUsuarios> = {
    idred: '',
    iddistribuidor: '',
    idcliente: '',
    identificadorplataforma: '-',
    nombrepagina: '',
    token: '',
    fechacreacion: new Date("2000-01-01"),
    fechavencimimiento: new Date("2000-01-01")
  };

  nombreRed:any;
  
  modal: any;
  closeResult: string;
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
          // this.redesusuariosEditForm.get('nombrepaginaedit').disabled;
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
      // idcliente: ['', [Validators.required, Validators.pattern('[A-Za-z0-9\s]*')]],
      // nombrepagina: ['', [Validators.required, Validators.pattern('^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$')]],
    }); 

    
    this.redesusuariosForm.get('idred').valueChanges.subscribe(value=>{


      if(value!=''){
        const filterred= this.redesSelect.filter((red) => red.idred==value);
        this.nombreRed=filterred[0]['nombre'];
      }
      
      /*
      console.log("red init: "+this.nombreRed);
      if(this.nombreRed=='Facebook' || this.nombreRed=='Instagram' || this.nombreRed=='TikTok'
      || this.nombreRed=='Pinterest'){
        this.selectionChange(value);
      }else{ */
        this.redesusuariosForm.removeControl('idcliente');
        this.redesusuariosForm.removeControl('nombrepagina');
      // } 
      // this.selectionChange(value);
    }) 
    

    /*
    this.redesusuariosForms = this.fb.group({
      // idred: ['', Validators.required],
      // iddistribuidor: ['', Validators.required],
      idcliente: ['', [Validators.required, Validators.pattern('[A-Za-z0-9\s]*')]],
      nombrepagina: ['', [Validators.required, Validators.pattern('^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$')]],
    }); */

    this.redesusuariosEditForm = this.fb.group({
      idred: ['', Validators.required],
      iddistribuidor: ['', Validators.required]
      // idcliente: ['', [Validators.required, Validators.pattern('[A-Za-z0-9\s]*')]],
      // nombrepagina: ['', [Validators.required, Validators.pattern('^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$')]],
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

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC key';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }

  openRedSocialUsuariosEditModal(content_edit,idred,nombre,idredusuario,
    idcliente,nombrepagina,iddistribuidor){

    this.redesusuariosEditForm.get('idcliente')?.setValue(idcliente);
    this.redesusuariosEditForm.get('nombrepagina')?.setValue(nombrepagina);

    this.idredusuario=idredusuario;
    // alert(iddistribuidor);

    this.newRedesUsuariosEdit = {
      idred: idred,
      iddistribuidor: iddistribuidor
    }

    this.modalService.open(this.modalEditRef, { ariaLabelledBy: 'modal-basic-title' }).result.then(
      (result) => {
        this.closeResult = `Closed with: ${result}`;
      },
      (reason) => {
        this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
      },
    );

  }

  openRedSocialUsuariosDeleteModal(content_delete,idredusuario){
    this.idredusuario=idredusuario; 
    // alert(this.idredusuario);
  
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

  changeRedSocialEdit(e) {

    this.getRedSocialEdit.setValue(e.target.value, {
      onlySelf: true
    })
    // return this.redesusuariosForm.get('nombreRedSocial');
  }

  get getRedSocial() {
    // alert("red social");
    return this.redesusuariosForm.get('nombreRedSocial');
  }

  get getRedSocialEdit() {
    // alert("red social");
    return this.redesusuariosEditForm.get('nombreRedSocial');
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
    // console.log(this.redesusuariosForm.value);
  }

  validateFormEdit() {
    this.submitted = true;

    if (this.redesusuariosEditForm.invalid) {
      return;
    }
    else {
      // this.isButtonDisabled = false;

    }
    // console.log(this.redesusuariosForm.value);
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

  changeDistribuidorEdit(event: KeyboardEvent) {
    this.submitted = true;

    if (this.redesusuariosEditForm.invalid) {
      this.isButtonDisabledEdit = true;
      return;
    }
    else {

      this.isButtonDisabledEdit = false;

    }
  }

  public selectionChange(value) {
        
        this.redesusuariosForm.addControl('idcliente', new FormControl('', [Validators.required, Validators.pattern('[A-Za-z0-9\s]*')]));
        this.redesusuariosForm.addControl('nombrepagina', new FormControl('', [Validators.required, Validators.pattern('^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$')]));
        // this.redesusuariosForm.controls["idcliente"].setValidators([Validators.required, Validators.pattern('[A-Za-z0-9\s]*')]);
        // this.redesusuariosForm.controls["nombrepagina"].setValidators([Validators.required, Validators.pattern('^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$')]);
        this.redesusuariosForm.updateValueAndValidity(); 
  }

  selectRedSocial(event: KeyboardEvent) {
    this.submitted = true;

    // console.log("log idred seleccionado: "+this.redesusuariosForm.value.idred);
    /* if(this.redesusuariosForm.value.idred!=''){
      var idred=this.redesusuariosForm.value.idred;
      const filterred= this.redesSelect.filter((red) => red.idred==idred);
      this.nombreRed=filterred[0]['nombre'];

    } */
  
    if (this.redesusuariosForm.invalid) {
      this.isButtonDisabled = true;
      return;
    }
    else {
      this.isButtonDisabled = false;
    }

  }

  selectRedSocialEdit(event: KeyboardEvent) {
    this.submitted = true;

    if (this.redesusuariosEditForm.invalid) {
      this.isButtonDisabledEdit = true;
      return;
    }
    else {
      // alert("prueba");
      this.isButtonDisabledEdit = false;
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

  onKeyUpEdit(event: KeyboardEvent) {

    this.submitted = true;

    if (this.redesusuariosEditForm.invalid) {
      this.isButtonDisabledEdit = true;
      return;
    }
    else {
      // alert("prueba");
      this.isButtonDisabledEdit = false;

    }
    // console.log(this.redesusuariosForm.value);
  }

  asociarCuenta() {
    
    var idred_select:string;
    var idredselect:string;
    idredselect= this.redesusuariosForm.value.idred;  
    const filterred= this.redesSelect.filter((red) => red.idred==idredselect);
    idred_select=filterred[0]['nombre'];
    const iddistribuidor = this.redesusuariosForm.get('iddistribuidor').value;

    var url :string;
    var datos: any;  
    if (this.redesusuariosForm.valid){  
      
      console.log("datos form: "+JSON.stringify(this.redesusuariosForm.value));
      if(idred_select=="Facebook"){ // Facebook
        url = `https://www.facebook.com/v14.0/dialog/oauth?client_id=501368951544804&redirect_uri=https%3A%2F%2Fwww.sicopweb.com%2Fapiseekop%2Fresources%2Frest%2Ffb%2Fcallback&state=${iddistribuidor}&auth_type=rerequest&scope=pages_show_list%2Cpages_read_engagement%2Cads_management%2Cpages_manage_ads%2Cbusiness_management%2Cleads_retrieval%2Cpages_manage_metadata%2Cpages_read_user_content%2Cpages_read_user_content`;
        // datos = this.redesusuariosForm.value;
        datos={
          idred:this.redesusuariosForm.value.idred,
          iddistribuidor:this.redesusuariosForm.value.iddistribuidor,
          idcliente:"",
          nombrepagina:""
        };
      }
      else if(idred_select=="Mercado Libre"){ // Mercado L
        url = `http://auth.mercadolibre.com.mx/authorization?response_type=code&client_id=7024360621079096&redirect_uri=https://06qe3dt50i.execute-api.us-west-1.amazonaws.com/dev&state=${iddistribuidor}`;
        datos={
          idred:this.redesusuariosForm.value.idred,
          iddistribuidor:this.redesusuariosForm.value.iddistribuidor,
          idcliente:"",
          nombrepagina:""
        };
      }
      else if(idred_select=="Instagram"){ // Instagram
        url = `https://www.facebook.com/v14.0/dialog/oauth?client_id=501368951544804&redirect_uri=https%3A%2F%2Fwww.sicopweb.com%2Fapiseekop%2Fresources%2Frest%2Ffb%2Fcallback&state=${iddistribuidor}&auth_type=rerequest&scope=pages_show_list%2Cpages_read_engagement%2Cads_management%2Cpages_manage_ads%2Cbusiness_management%2Cleads_retrieval%2Cpages_manage_metadata%2Cpages_read_user_content%2Cpages_read_user_content`;
        // datos = this.redesusuariosForm.value;
        datos={
          idred:this.redesusuariosForm.value.idred,
          iddistribuidor:this.redesusuariosForm.value.iddistribuidor,
          idcliente:"",
          nombrepagina:""
        };
      }
      else if(idred_select=="TikTok"){ // TikTok
        url = `https://business-api.tiktok.com/portal/auth?app_id=7247688267519246337&state=${iddistribuidor}&redirect_uri=https%3A%2F%2Fapi.sicopweb.com%2Ftiktok%2Fdev%2Fauth`;
        // datos = this.redesusuariosForm.value;
        datos={
          idred:this.redesusuariosForm.value.idred,
          iddistribuidor:this.redesusuariosForm.value.iddistribuidor,
          idcliente:"",
          nombrepagina:""
        };
      }
      else if(idred_select=="Pinterest"){ // Pinterest
        url = `https://www.facebook.com/v14.0/dialog/oauth?client_id=501368951544804&redirect_uri=https%3A%2F%2Fwww.sicopweb.com%2Fapiseekop%2Fresources%2Frest%2Ffb%2Fcallback&state=${iddistribuidor}&auth_type=rerequest&scope=pages_show_list%2Cpages_read_engagement%2Cads_management%2Cpages_manage_ads%2Cbusiness_management%2Cleads_retrieval%2Cpages_manage_metadata%2Cpages_read_user_content%2Cpages_read_user_content`;
        // datos = this.redesusuariosForm.value;
        datos={
          idred:this.redesusuariosForm.value.idred,
          iddistribuidor:this.redesusuariosForm.value.iddistribuidor,
          idcliente:"",
          nombrepagina:""
        };
      }
      else{ // Instagram
        
      }
      
      
      this.http.post('https://ti3pwepc47.execute-api.us-west-1.amazonaws.com/dev/redesusuarios', datos).subscribe(
        response => {
          // console.log(response);

          this.newRedesUsuarios = {
            idred: "",
            iddistribuidor: "",
            idcliente: '',
            nombrepagina: '',
          }

          this.redesusuariosForm.reset();


          this.modal.close('Cross click');
          this.loadRedesSocialesUsuarios();
          
          const newWindow = window.open(url);
          window.focus(); // Trae el foco de nuevo a la ventana principal
        },
        error => {
          console.log(error);
        }
      ); 
    } 
  }

  asociarCuenta_EditarUsuario() { 
    // Oye Gil, para editar un usuario de red social es el mismo endpoint ?
    const datos = this.redesusuariosEditForm.value;
    console.log(datos);

    var idred_select:string;
    var idredselect:string;
    idredselect= this.redesusuariosEditForm.value.idred;  
    const filterred= this.redesSelect.filter((red) => red.idred==idredselect);
    idred_select=filterred[0]['nombre'];
    const iddistribuidor = this.redesusuariosEditForm.get('iddistribuidor').value;

    var url :string;
      if(idred_select=="Facebook"){ // Facebook
        
        // alert("Face");
        url = `https://www.facebook.com/v14.0/dialog/oauth?client_id=501368951544804&redirect_uri=https%3A%2F%2Fwww.sicopweb.com%2Fapiseekop%2Fresources%2Frest%2Ffb%2Fcallback&state=${iddistribuidor}&auth_type=rerequest&scope=pages_show_list%2Cpages_read_engagement%2Cads_management%2Cpages_manage_ads%2Cbusiness_management%2Cleads_retrieval%2Cpages_manage_metadata%2Cpages_read_user_content%2Cpages_read_user_content`;
        
      }
      else if(idred_select=="Mercado Libre"){ // Mercado L
        
        // alert("Mercado libre");
        url = `http://auth.mercadolibre.com.mx/authorization?response_type=code&client_id=7024360621079096&redirect_uri=https://06qe3dt50i.execute-api.us-west-1.amazonaws.com/dev&state=${iddistribuidor}`;
          
      }
      else if(idred_select=="Instagram"){ // Instagram
        // alert("Instagram");
        url = `https://www.facebook.com/v14.0/dialog/oauth?client_id=501368951544804&redirect_uri=https%3A%2F%2Fwww.sicopweb.com%2Fapiseekop%2Fresources%2Frest%2Ffb%2Fcallback&state=${iddistribuidor}&auth_type=rerequest&scope=pages_show_list%2Cpages_read_engagement%2Cads_management%2Cpages_manage_ads%2Cbusiness_management%2Cleads_retrieval%2Cpages_manage_metadata%2Cpages_read_user_content%2Cpages_read_user_content`;
        
      }
      else if(idred_select=="TikTok"){ // Instagram
        
        url = `https://business-api.tiktok.com/portal/auth?app_id=7247688267519246337&state=${iddistribuidor}&redirect_uri=https%3A%2F%2Fapi.sicopweb.com%2Ftiktok%2Fdev%2Fauth`;
        
      }
      else if(idred_select=="Pinterest"){ // Pinterest
        
        url = `https://www.facebook.com/v14.0/dialog/oauth?client_id=501368951544804&redirect_uri=https%3A%2F%2Fwww.sicopweb.com%2Fapiseekop%2Fresources%2Frest%2Ffb%2Fcallback&state=${iddistribuidor}&auth_type=rerequest&scope=pages_show_list%2Cpages_read_engagement%2Cads_management%2Cpages_manage_ads%2Cbusiness_management%2Cleads_retrieval%2Cpages_manage_metadata%2Cpages_read_user_content%2Cpages_read_user_content`;
        
      }
      else{
        
      }

    
    if (this.redesusuariosEditForm.valid) {
      const datos = this.redesusuariosEditForm.value;
      // this.http.post('https://ti3pwepc47.execute-api.us-west-1.amazonaws.com/dev/redesusuarios', datos).subscribe(
      
      this.http.put('https://ti3pwepc47.execute-api.us-west-1.amazonaws.com/dev/redesusuarios/redusuario/'+this.idredusuario, datos).subscribe(
      response => {
          console.log(response);
          // this.modal.close('Cross click');
          this.modalService.dismissAll();
          this.loadRedesSocialesUsuarios();
          const iddistribuidor = this.redesusuariosEditForm.get('iddistribuidor').value;
          // const newWindow = window.open(`http://auth.mercadolibre.com.mx/authorization?response_type=code&client_id=7024360621079096&redirect_uri=https://06qe3dt50i.execute-api.us-west-1.amazonaws.com/dev&state=${iddistribuidor}`);
          const newWindow = window.open(url);
          
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

    var idred_select:string;
    var idredselect:string;
    idredselect= this.redesusuariosForm.value.idred;  
    const filterred= this.redesSelect.filter((red) => red.idred==idredselect);
    idred_select=filterred[0]['nombre'];

    // console.log("ok "+ JSON.stringify(filterred[0]['nombre']));
    testConnection();
    // const FetchButton = document.getElementById("nombrepagina") as HTMLInputElement;
    // FetchButton.disabled=true;    

    const response = false;

    async function testConnection() {
      console.log("this id is: "+idred_select);
      // const val=(document.getElementById('nombrepagina') as HTMLInputElement).disabled = false;
      // const nombrepagina = document.getElementById('nombrepagina') as HTMLInputElement;
      
      var url :string;
      if(idred_select=="Facebook"){ // Facebook
        
        const token = 'APP_UR4158433912938780-041117-';
        url = `https://fzq9t36ec9.execute-api.us-west-1.amazonaws.com/dev/probarconexion?token=${token}`;
        
      }
      else if(idred_select=="Mercado Libre"){ // Mercado L
        
        const token = 'APP_UR4158433912938780-041117-';
        url = `https://fzq9t36ec9.execute-api.us-west-1.amazonaws.com/dev/probarconexion?token=${token}`;
          
      }
      else if(idred_select=="Instagram"){ // Instagram
        // alert("probar conection con Instagram");
        const token = 'APP_UR4158433912938780-041117-';
        url = `https://fzq9t36ec9.execute-api.us-west-1.amazonaws.com/dev/probarconexion?token=${token}`;
          
      }
      else if(idred_select=="TikTok"){ // TikTok
        // alert("probar conection con Instagram");
       
        const token = 'APP_UR4158433912938780-041117-';
        url = `https://fzq9t36ec9.execute-api.us-west-1.amazonaws.com/dev/probarconexion?token=${token}`;
          
      }
      else if(idred_select=="Pinterest"){ // Pinterest
        // alert("probar conection con Instagram");
        
        const token = 'APP_UR4158433912938780-041117-';
        url = `https://fzq9t36ec9.execute-api.us-west-1.amazonaws.com/dev/probarconexion?token=${token}`;
          
      }
      else{ // 
        
      }


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

  testConexionEdit() {
    // alert("ok test");

    // const nombrepagina = document.getElementById('nombrepagina') as HTMLInputElement;
    // console.log("ok: "+nombrepagina.value);
    var idred_select:string;
    var idredselect:string;
    idredselect= this.redesusuariosEditForm.value.idred;  
    const filterred= this.redesSelect.filter((red) => red.idred==idredselect);
    idred_select=filterred[0]['nombre'];

    testConnection();
    // const FetchButton = document.getElementById("nombrepagina") as HTMLInputElement;
    // FetchButton.disabled=true;
    const response = false;

    async function testConnection() {

      // const val=(document.getElementById('nombrepagina') as HTMLInputElement).disabled = false;
      // const nombrepagina = document.getElementById('nombrepagina') as HTMLInputElement;


      // const token = 'APP_UR4158433912938780-041117-';
      // const url = `https://fzq9t36ec9.execute-api.us-west-1.amazonaws.com/dev/probarconexion?token=${token}`;
      var url :string;
      if(idred_select=="Facebook"){ // Facebook
        
        const token = 'APP_UR4158433912938780-041117-';
        url = `https://fzq9t36ec9.execute-api.us-west-1.amazonaws.com/dev/probarconexion?token=${token}`;
        
      }
      else if(idred_select=="Mercado Libre"){ // Mercado L
        
        const token = 'APP_UR4158433912938780-041117-';
        url = `https://fzq9t36ec9.execute-api.us-west-1.amazonaws.com/dev/probarconexion?token=${token}`;
          
      }
      else if(idred_select=="Instagram"){ // Instagram
        
        const token = 'APP_UR4158433912938780-041117-';
        url = `https://fzq9t36ec9.execute-api.us-west-1.amazonaws.com/dev/probarconexion?token=${token}`;
          
      }
      else if(idred_select=="TikTok"){ // TikTok
        
        const token = 'APP_UR4158433912938780-041117-';
        url = `https://fzq9t36ec9.execute-api.us-west-1.amazonaws.com/dev/probarconexion?token=${token}`;
          
      }
      else if(idred_select=="Pinterest"){ // Pinterest
        
        const token = 'APP_UR4158433912938780-041117-';
        url = `https://fzq9t36ec9.execute-api.us-west-1.amazonaws.com/dev/probarconexion?token=${token}`;
          
      }
      else{ // 
        
      }

      const button = document.getElementById('testConnectionButtonEdit');
      const nombrepagina = document.getElementById("nombrepaginaedit");
      const idred = document.getElementById("idrededit");
      const iddistribuidor = document.getElementById("iddistribuidoredit");
      const idcliente = document.getElementById("idclienteedit");

      const btnGuardarUsuario = document.getElementById("btnEditarUsuario");

      
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

        } else {
          

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
  }

  deleteUsuarioRedSocial(event: any, id: any){
    const val=id.idredusuario;
    // alert(id.idredusuario); 
    console.log(" id => "+id.idredusuario);
    this.http.delete('https://ti3pwepc47.execute-api.us-west-1.amazonaws.com/dev/redesusuarios/redusuario/'+val)
    .subscribe({
        next: data => {
            // this.status = 'Delete successful';
            // console.log("se eliminó correctamente");
            this.loadRedesSocialesUsuarios();
            // console.log("respuesta: "+JSON.stringify(data));
            Swal.fire({
              icon: 'success',
              title: '¡Éxito!',
              text: 'Se eliminó correctamente!',
              confirmButtonText: 'Ok'
            });
            this.modalService.dismissAll();
            // this.modalService.dismissAll();
            // this.modalRef.nativeElement.dismissAll();
            // this.modalService.dismissAll();
            // this.modalRef.nativeElement.click();
        },
        error: error => {
            // this.errorMessage = error.message;
            console.log('Hubo un error!', error);
        }
    });  
  } 

}
