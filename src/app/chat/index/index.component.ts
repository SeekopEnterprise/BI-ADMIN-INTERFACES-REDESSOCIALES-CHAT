import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { chat, groups } from './data';
import { Conversacion, ApiResponse, ResponseItem, Grupos, GroupedResponseItem } from './chat.model';

import { Lightbox } from 'ngx-lightbox';

import { environment } from '../../../environments/environment';
import { AuthenticationService } from '../../core/services/auth.service';
import { AuthfakeauthenticationService } from '../../core/services/authfake.service';
import { Subscription } from 'rxjs';
import { NotificacionesService } from '../../chat/notificaciones/notificaciones.service';
import { GlobalUserService } from '../../services/global-user.service';
import Swal from 'sweetalert2';
// Date Format
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss']
})

/**
 * Chat-component
 */
export class IndexComponent implements OnInit {

  private chatSubscription: Subscription;

  public activetab = 2;
  apiResponse: ApiResponse[];
  //chat: ResponseItem[];
  public chat: GroupedResponseItem[] = [];
  groups: Grupos[];
  formData!: FormGroup;
  @ViewChild('scrollRef') scrollRef: any;
  emoji = '';
  isreplyMessage = false;
  isgroupMessage = false;
  mode: string | undefined;
  public isCollapsed = true;

  public nuevoMensaje = false;
  public datosMensajeNuevo;
  public selectedChatId: any;

  public Distribuidor: string;
  public RedSocial: string;
  public Email: string;
  public IdPublicacionLead: string;
  public LinkPublicacion: SafeResourceUrl;  // string;
  public modalDatos: any;

  public Telefono: string;
  public LastName: string;
  public idMensajeLeads;
  public idDistribuidor: string;
  public nombreDistribuidor: string;

  public hideMenu: boolean;

  listLang = [
    { text: 'English', flag: 'assets/images/flags/us.jpg', lang: 'en' },
    { text: 'Spanish', flag: 'assets/images/flags/spain.jpg', lang: 'es' },
    { text: 'German', flag: 'assets/images/flags/germany.jpg', lang: 'de' },
    { text: 'Italian', flag: 'assets/images/flags/italy.jpg', lang: 'it' },
    { text: 'Russian', flag: 'assets/images/flags/russia.jpg', lang: 'ru' },
  ];

  TABS = {
    '': 2,
    'perfil': 1,
    'conversaciones': 2,
    'distribuidores': 3,
    'redes-sociales': 4,
    'distribuidores-redes-sociales': 6,
    'metodos': 7,

  };

  ROUTES = {
    1: 'perfil',
    2: 'conversaciones',
    3: 'distribuidores',
    4: 'redes-sociales',
    6: 'distribuidores-redes-sociales',
    7: 'metodos',

  };

  lang: string;
  images: { src: string; thumb: string; caption: string }[] = [];

  constructor(private globalUserService: GlobalUserService, private notificacionService: NotificacionesService, private authFackservice: AuthfakeauthenticationService, private authService: AuthenticationService,
    private router: Router, private route: ActivatedRoute, public translate: TranslateService, private modalService: NgbModal, private offcanvasService: NgbOffcanvas,
    public formBuilder: FormBuilder, private datePipe: DatePipe, private lightbox: Lightbox, private http: HttpClient, private sanitizer: DomSanitizer) {
    this.formData = this.formBuilder.group({
      message: ['', [Validators.required]],
    });

  }

  /**
  * Open lightbox
  */
  openImage(index: number, i: number): void {
    // open lightbox
    this.lightbox.open(this.message[index].imageContent, i, {
      showZoom: true
    });

  }

  senderName: any;
  senderProfile: any;
  async ngOnInit() {
    this.route.queryParams.subscribe(params => {
      try {
        const tabId = params['tab'];
        this.activetab = tabId === undefined ? 2 : this.TABS[tabId];
        this.hideMenu = tabId !== '' && tabId !== undefined;
      } catch (error) {
        this.activetab = 2;
        this.hideMenu = false;
      }
    });
    try {
      await this.loadGrupos();
      await this.loadRecuperacionMensajes();
    } catch (error) {
      console.error('Error cargando grupos o recuperando mensajes:', error);
      return;
    }

    this.chatSubscription = this.notificacionService.connect('wss://namj4mlg8g.execute-api.us-west-1.amazonaws.com/dev')
      .subscribe((event: MessageEvent) => {
        const data = JSON.parse(event.data);

        if (event.type === 'open') {
          this.notificacionService.send({
            accion: 'setApp',
            nombreApp: 'proveedoresDigitales'
          });
        } else if (event.type === 'message') {

          this.notificacionService = data.mensaje;

          const chatToUpdate = this.chat
            .map(group => group.prospects)
            .reduce((a, b) => a.concat(b), [])
            .find(prospect => prospect.IdPublicacion === data.idPublicacion);

          if (chatToUpdate) {
            const newMessage = {
              id: data.idMensaje,
              texto: data.mensaje,
              unreadCount: 0,
              align: "left",
              ultimoMensaje: true, // El nuevo mensaje es el último
            };
            chatToUpdate.Conversacion.push(newMessage);

            // Marcamos todos los mensajes como no últimos
            chatToUpdate.Conversacion.forEach(mensaje => mensaje.ultimoMensaje = false);

            // El nuevo mensaje es el último
            newMessage.ultimoMensaje = true;

            // this.idMensajeLeads=data.idMensaje;
            // console.log("este es el idmensaje a enviar: "+newMessage);

            // Incrementa el contador de mensajes no leídos
            chatToUpdate.unreadCount = (chatToUpdate.unreadCount || 0) + 1;

            this.chat.sort((a, b) => a.prospects.includes(chatToUpdate) ? -1 : b.prospects.includes(chatToUpdate) ? 1 : 0);

            const groupToUpdate = this.chat.find(group => group.prospects.includes(chatToUpdate));
            if (groupToUpdate) {
              groupToUpdate.prospects.sort((a, b) => a === chatToUpdate ? -1 : b === chatToUpdate ? 1 : 0);
            }
          }

          this.showNewMessageNotification(chatToUpdate);
          this.onListScroll();
        }
      });



    document.body.setAttribute('data-layout-mode', 'light');

    // Validation

    // Escucha los mensajes que llegan del padre
    window.addEventListener('message', (event) => {
      // ...

      // Almacena el usuario en el servicio
      this.globalUserService.setCurrentUser(event.data);
    });


    // Recupera el usuario del servicio o del localStorage
    let user = this.globalUserService.getCurrentUser();
    if (!user) {
      try {
        user = JSON.parse(localStorage.getItem('currentUser'));
      } catch (error) {
        console.error('Error al acceder a localStorage:', error);
      }
    }

    if (!user) {
      const emailCookie = this.getCookie('correo');
      if (emailCookie) {
        user = {
          email: emailCookie,
          username: emailCookie,
          token: 'fake-jwt-token',
          profile: 'avatar-1.jpg'
        };
      }
    }

    if (user && user.token) {
      this.senderName = user.username;
      this.senderProfile = 'assets/images/users/' + user.profile;
    }

    this.lang = this.translate.currentLang;
    this.onListScroll();
  }

  getCookie(name: string): string {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return '';
  }

  ngAfterViewInit() {
    this.scrollRef.SimpleBar.getScrollElement().scrollTop = 100;

    const iframeElement = document.getElementById("iframePub") as HTMLIFrameElement;
    const iframeWindow = iframeElement.contentWindow;
    const iframeDocument = iframeWindow.document;
    const bodyElement = iframeDocument.getElementsByTagName("body")[0];
    bodyElement.setAttribute("id", "idIframe");
  }

  ngOnDestroy(): void {
    this.chatSubscription.unsubscribe();
    this.notificacionService.close();
  }

  getLastMessage(conversacion: Conversacion[]): Conversacion {
    // this.idMensajeLeads.push(conversacion.length > 0 ? conversacion[conversacion.length - 1] : null);
    return conversacion.length > 0 ? conversacion[conversacion.length - 1] : null;
  }


  showNewMessageNotification(chat: ResponseItem): void {
    // Mostrar un aviso de "nuevo mensaje" en la interfaz del usuario.
    // Aquí puedes agregar el código para mostrar la notificación según cómo hayas implementado tu interfaz.
    // Por ejemplo, puedes cambiar una variable "newMessage" a true y usarla para mostrar un elemento en tu HTML.
    // this.nuevoMensaje = true;
    // this.datosMensajeNuevo = chat.Nombre;  // Guardar el nombre del chat para mostrarlo en la notificación.
  }

  /**
   * Show user profile
   */
  // tslint:disable-next-line: typedef
  showUserProfile() {
    document.getElementById('profile-detail').style.display = 'block';
  }

  showTabMetodos(tabId: string) {
    this.hideMenu = false;
    this.activetab = Number(tabId);
  }


  /**
   * Close user chat
   */
  // tslint:disable-next-line: typedef
  closeUserChat() {
    document.getElementById('chat-room').classList.remove('user-chat-show');
  }

  /**
   * Logout the user
   */
  logout() {
    if (environment.defaultauth === 'firebase') {
      this.authService.logout();
    } else if (environment.defaultauth === 'fackbackend') {
      this.authFackservice.logout();
    }
    this.router.navigate(['/account/login']);
  }

  /**
   * Set language
   * @param lang language
   */
  setLanguage(lang) {
    this.translate.use(lang);
    this.lang = lang;
  }

  openCallModal(content) {
    this.modalService.open(content, { centered: true });
  }

  openVideoModal(videoContent) {
    this.modalDatos = this.modalService.open(videoContent, { centered: true });
  }

  /**
   * Show user chat
   */
  // tslint:disable-next-line: typedef
  userName: any = 'Doris Brown';
  userStatus: any = 'En línea';
  userProfile: any = '';
  urlPublicacion: any = ''; // "https://auto.mercadolibre.com.mx/MLM-1952360720-volkswagen-t-cross-2022-_JM#position=35&search_layout=grid&type=item&tracking_id=bcfdd2c2-d303-4fc3-8424-f071854cf10f"
  message: any;
  showChat(event: any, id: any) { // alert("este es el id seleccionado: "+id);
    var removeClass = document.querySelectorAll('.chat-user-list li');
    removeClass.forEach((element: any) => {
      element.classList.remove('active');
    });

    document.querySelector('.user-chat').classList.add('user-chat-show')
    document.querySelector('.chat-welcome-section').classList.add('d-none');
    document.querySelector('.user-chat').classList.remove('d-none');
    event.target.closest('li').classList.add('active');
    /*  var data = this.chat.flatMap(group => group.prospects).filter((prospect: any) => {
       return prospect.Email === id;
     }); */


    var IdUltimoMensaje = [];
    var data = this.chat
      .map(group => group.prospects)
      .reduce((a, b) => a.concat(b), [])
      .filter((prospect: any) => {

        let val = "";
        if (prospect.Email === id) {
          // console.log("=========> "+JSON.stringify(prospect.Conversacion[0].id));
          IdUltimoMensaje.push(prospect.Conversacion);
        }

        return prospect.Email === id;
      });

    for (let key in IdUltimoMensaje[0]) {

      if (IdUltimoMensaje[0][key].ultimoMensaje == true) {
        // console.log("ultimoMensaje: "+IdUltimoMensaje[0][key].id);
        this.idMensajeLeads = IdUltimoMensaje[0][key].id;
      }
    }

    // console.log(Object.values(IdUltimoMensaje[0][0]))

    data[0].unreadCount = 0;
    this.userName = data[0].Nombre;
    this.Distribuidor = data[0].NombreGrupo;
    this.RedSocial = "Mercado Libre"
    this.Email = data[0].Email;
    this.IdPublicacionLead = data[0].IdPublicacion;
    this.urlPublicacion = data[0].urlpublicacion;
    // this.LinkPublicacion = "https://autos.mercadolibre.com.mx/#redirectedFromVip=https%3A%2F%2Fauto.mercadolibre.com.mx%2FMLM-1952360720-volkswagen-t-cross-2022-_JM";
    this.LinkPublicacion = this.sanitizer.bypassSecurityTrustResourceUrl(this.urlPublicacion);
    this.Telefono = data[0].Telefono;
    this.LastName = data[0].Apellido;
    // this.idMensajeLeads.push(data[0].IdProspecto);
    this.idDistribuidor = data[0].IdDistribuidor;
    this.nombreDistribuidor = data[0].NombreGrupo;

    this.userStatus = "En línea"
    this.userProfile = '';
    this.message = data[0].Conversacion
    this.selectedChatId = data[0].IdPublicacion;
    this.onListScroll();

    // console.log("esta es la url => "+this.urlPublicacion+" => username =>  "+this.userName);
  }

  // Contact Search
  ContactSearch() {
    var input: any, filter: any, ul: any, li: any, a: any | undefined, i: any, txtValue: any;
    input = document.getElementById("searchContact") as HTMLAreaElement;
    filter = input.value.toUpperCase();
    ul = document.querySelectorAll(".chat-user-list");
    ul.forEach((item: any) => {
      li = item.getElementsByTagName("li");
      for (i = 0; i < li.length; i++) {
        a = li[i].getElementsByTagName("h5")[0];
        txtValue = a?.innerText;
        if (txtValue?.toUpperCase().indexOf(filter) > -1) {
          li[i].style.display = "";
        } else {
          li[i].style.display = "none";
        }
      }
    })
  }

  // Message Search
  MessageSearch() {
    var input: any, filter: any, ul: any, li: any, a: any | undefined, i: any, txtValue: any;
    input = document.getElementById("searchMessage") as HTMLAreaElement;
    filter = input.value.toUpperCase();
    ul = document.getElementById("users-conversation");
    li = ul.getElementsByTagName("li");
    for (i = 0; i < li.length; i++) {
      a = li[i].getElementsByTagName("p")[0];
      txtValue = a?.innerText;
      if (txtValue?.toUpperCase().indexOf(filter) > -1) {
        li[i].style.display = "";
      } else {
        li[i].style.display = "none";
      }
    }
  }

  // Filter Offcanvas Set
  onChatInfoClicked(content: TemplateRef<any>) {
    this.offcanvasService.open(content, { position: 'end' });
  }

  /**
   * Returns form
   */
  get form() {
    return this.formData.controls;
  }

  /**
   * Save the message in chat
   */
  messageSave() {
    var groupMsg = document.querySelector('.pills-groups-tab.active');
    const message = this.formData.get('message')!.value;
    if (!groupMsg) {
      document.querySelector('.chat-user-list li.active .chat-user-message').innerHTML = message ? message : this.img;
    }
    var img = this.img ? this.img : '';
    var status = this.img ? true : '';
    var dateTime = this.datePipe.transform(new Date(), "h:mm a");
    var chatReplyUser = this.isreplyMessage == true ? (document.querySelector(".replyCard .replymessage-block .flex-grow-1 .conversation-name") as HTMLAreaElement).innerHTML : '';
    var chatReplyMessage = this.isreplyMessage == true ? (document.querySelector(".replyCard .replymessage-block .flex-grow-1 .mb-0") as HTMLAreaElement).innerText : '';
    var newMessage = {
      id: 1,
      texto: message,
      name: this.senderName,
      profile: this.senderProfile,
      time: null,
      align: 'right',
      isimage: status,
      ultimoMensaje: false,
      imageContent: [img],
      replayName: chatReplyUser,
      replaymsg: chatReplyMessage,
    };

    // Encuentra la conversación a la que pertenece este mensaje
    // const chatToUpdate = this.chat.flatMap(group => group.prospects).find(prospect => prospect.IdPublicacion === this.selectedChatId);
    const chatToUpdate = this.chat
      .map(group => group.prospects)
      .reduce((a, b) => a.concat(b), [])
      .find(prospect => prospect.IdPublicacion === this.selectedChatId);


    if (chatToUpdate) {
      chatToUpdate.Conversacion.push(newMessage);
      // Marca todos los mensajes como no últimos
      chatToUpdate.Conversacion.forEach(mensaje => mensaje.ultimoMensaje = false);
      // Marca el nuevo mensaje como el último
      newMessage.ultimoMensaje = true;
    }

    // Solo empuja a this.message si no es el mismo que chatToUpdate.Conversacion
    if (chatToUpdate && this.message !== chatToUpdate.Conversacion) {
      this.message.push(newMessage);
    }

    this.onListScroll();

    // Set Form Data Reset
    this.formData = this.formBuilder.group({
      message: null,
    });
    this.isreplyMessage = false;
    this.emoji = '';
    this.img = '';
    chatReplyUser = '';
    chatReplyMessage = '';
    document.querySelector('.replyCard')?.classList.remove('show');
  }

  onListScroll() {
    if (this.scrollRef !== undefined) {
      setTimeout(() => {
        this.scrollRef.SimpleBar.getScrollElement().scrollTop = this.scrollRef.SimpleBar.getScrollElement().scrollHeight;
      }, 500);
    }
  }

  // Emoji Picker
  showEmojiPicker = false;
  sets: any = [
    'native',
    'google',
    'twitter',
    'facebook',
    'emojione',
    'apple',
    'messenger'
  ]
  set: any = 'twitter';
  toggleEmojiPicker() {
    this.showEmojiPicker = !this.showEmojiPicker;
  }

  addEmoji(event: any) {
    const { emoji } = this;
    const text = `${emoji}${event.emoji.native}`;
    this.emoji = text;
    this.showEmojiPicker = false;
  }

  onFocus() {
    this.showEmojiPicker = false;
  }
  onBlur() {
  }

  closeReplay() {
    document.querySelector('.replyCard')?.classList.remove('show');
  }

  // Copy Message
  copyMessage(event: any) {
    navigator.clipboard.writeText(event.target.closest('.chats').querySelector('.messageText').innerHTML);
    document.getElementById('copyClipBoard')?.classList.add('show');
    setTimeout(() => {
      document.getElementById('copyClipBoard')?.classList.remove('show');
    }, 1000);
  }

  // Delete Message
  deleteMessage(event: any) {
    event.target.closest('.chats').remove();
  }

  // Delete All Message
  deleteAllMessage(event: any) {
    var allMsgDelete: any = document.getElementById('users-conversation')?.querySelectorAll('.chats');
    allMsgDelete.forEach((item: any) => {
      item.remove();
    })
  }

  // Replay Message
  replyMessage(event: any, align: any) {
    this.isreplyMessage = true;
    document.querySelector('.replyCard')?.classList.add('show');
    var copyText = event.target.closest('.chats').querySelector('.messageText').innerHTML;
    (document.querySelector(".replyCard .replymessage-block .flex-grow-1 .mb-0") as HTMLAreaElement).innerHTML = copyText;
    var msgOwnerName: any = event.target.closest(".chats").classList.contains("right") == true ? 'You' : document.querySelector('.username')?.innerHTML;
    (document.querySelector(".replyCard .replymessage-block .flex-grow-1 .conversation-name") as HTMLAreaElement).innerHTML = msgOwnerName;
  }

  /**
  * Open center modal
  * @param centerDataModal center modal data
  */
  centerModal(centerDataModal: any) {
    this.modalService.open(centerDataModal, { centered: true });
  }

  // File Upload
  imageURL: string | undefined;
  img: any;
  fileChange(event: any) {
    let fileList: any = (event.target as HTMLInputElement);
    let file: File = fileList.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      this.imageURL = reader.result as string;
      this.img = this.imageURL;
    }
    reader.readAsDataURL(file)
  }

  /**
   * Topbar Light-Dark Mode Change
   */
  changeMode(mode: string) {
    this.mode = mode;
    switch (mode) {
      case 'light':
        document.body.setAttribute('data-layout-mode', "light");
        break;
      case 'dark':
        document.body.setAttribute('data-layout-mode', "dark");
        break;
      default:
        document.body.setAttribute('data-layout-mode', "light");
        break;
    }
  }

  /***
   * ========== Group Msg ============
   */
  /**
 * Show user chat
 */
  // tslint:disable-next-line: typedef
  showGroupChat(event: any, id: any) {
    var removeClass = document.querySelectorAll('.chat-list li');
    removeClass.forEach((element: any) => {
      element.classList.remove('active');
    });
    document.querySelector('.user-chat').classList.add('user-chat-show')
    document.querySelector('.chat-welcome-section').classList.add('d-none');
    document.querySelector('.user-chat').classList.remove('d-none');
    event.target.closest('li').classList.add('active');
    var data = this.groups.filter((group: any) => {
      return group.idgrupo === id;
    });
    this.userName = data[0].nombredistribuidor
    this.userProfile = ''
    this.message = ''
  }

  /**
   * Open add group modal
   * @param content content
   */
  // tslint:disable-next-line: typedef
  openGroupModal(content: any) {
    this.modalService.open(content, { centered: true });
  }

  // Group Search
  GroupSearch() {
    var input: any, filter: any, ul: any, li: any, a: any | undefined, i: any, txtValue: any;
    input = document.getElementById("searchGroup") as HTMLAreaElement;
    filter = input.value.toUpperCase();
    ul = document.querySelectorAll(".group-list");
    ul.forEach((item: any) => {
      li = item.getElementsByTagName("li");
      for (i = 0; i < li.length; i++) {
        a = li[i].getElementsByTagName("h5")[0];
        txtValue = a?.innerText;
        if (txtValue?.toUpperCase().indexOf(filter) > -1) {
          li[i].style.display = "";
        } else {
          li[i].style.display = "none";
        }
      }
    })
  }

  loadRecuperacionMensajes(socketData = null): Promise<void> {
    return new Promise((resolve, reject) => {
      this.http.get<ApiResponse>('https://fhfl0x34wa.execute-api.us-west-1.amazonaws.com/dev/recuperarmsjs').subscribe(
        res => {
          let prospects = res.body;

          prospects.forEach(prospect => {
            prospect.unreadCount = 0;  // Añadimos un contador de mensajes no leídos
            if (prospect.Conversacion && prospect.Conversacion.length > 0) {
              // Aseguramos que todos los mensajes tengan la propiedad 'ultimoMensaje'
              prospect.Conversacion.forEach(message => {
                message.ultimoMensaje = false;
              });

              // Marcamos el último mensaje como tal
              prospect.Conversacion[prospect.Conversacion.length - 1].ultimoMensaje = true;

              // Se asigna el ultimo idmensaje para el envió de datos hacia sicop
              console.log("este es el ultimo idmsj: " + prospect.Conversacion[prospect.Conversacion.length - 1].ultimoMensaje);
              // this.idMensajeLeads.push({"if idmensaje": prospect.Conversacion[prospect.Conversacion.length - 1].id});

            }
          });

          // Agrupar prospectos por distribuidor
          const grouped = prospects.reduce((groups, prospect) => {
            const grupo = this.groups.find(group => group.iddistribuidor == prospect.IdDistribuidor)?.nombredistribuidor || 'Sin Distribuidor';
            groups[grupo] = groups[grupo] || [];
            groups[grupo].push(prospect);

            return groups;
          }, {});

          this.chat = Object.keys(grouped).map(key => ({ key, prospects: grouped[key] }));

          if (socketData) {
            const chatToUpdate = this.chat
              .map(group => group.prospects)
              .reduce((a, b) => a.concat(b), [])
              .find(prospect => prospect.IdPublicacion === socketData.idPublicacion);

            const groupToUpdate = this.chat.find(group => group.prospects.includes(chatToUpdate));

            if (groupToUpdate) {
              groupToUpdate.prospects.sort((a, b) => a === chatToUpdate ? -1 : b === chatToUpdate ? 1 : 0);
            }

            this.showNewMessageNotification(chatToUpdate);
          }
          resolve();
        },
        error => {
          console.error(error);
          reject(error);
        }
      );
    });
  }


  loadGrupos(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.http.get<Grupos[]>('https://ti3pwepc47.execute-api.us-west-1.amazonaws.com/dev/grupos').subscribe(
        res => {
          this.groups = res;
          console.log("Estos son los grupos", this.groups);
          resolve();
        },
        error => {
          console.error(error);
          reject(error);
        }
      );
    });
  }

  confirmSend() {

    /*
    console.log(
                "Username: "+this.userName+
                "Apellido: "+this.LastName+
                "Email: "+this.Email+
                "Telefono: "+this.Telefono+
                "idMsj: "+this.idMensaje+
                "idDistribuidor: "+this.idDistribuidor+
                "Distribuidor: "+this.nombreDistribuidor); */

    const headers = {
      'Authorization': 'Bearer ODc5MGZiZTI0ZGJkYmY4NGU4YzNkYWNhNzI1MTQ4YmQ=',
      //'My-Custom-Header': 'foobar'
      accept: 'application/json'
    };

    const data = {
      "prospect": {
        "status": "new",
        "id": this.idMensajeLeads, //  "000000001", // idmsj "123456710"
        "requestdate": "2023-06-13 16:00:00",
        "vehicle": {
          "interest": "buy",
          "status": "new",
          "make": "Nissan", // Nissan
          "year": "2023",
          "model": "Sentra"
        },
        "customer": {
          "contact": {
            "name": [
              {
                "part": "first",
                "value": this.userName // "Marino"
              },
              {
                "part": "middle",
                "value": this.LastName // "Vargas"
              },
              {
                "part": "last",
                "value": "" // "Chavez"
              }
            ],
            "email": this.Email, // "marino@gmail.com",
            "phone": [
              this.Telefono // "5511223344"
            ]
          },
          "comments": " Prospecto enviado desde Mercado Libre de Comunity Manager  "
        },
        "vendor": {
          "source": "MERCADOLIBRE",
          "id": this.idDistribuidor, // this.idDistribuidor,// 158814  "609024", // id distribuidor al que se asigan el prospecto
          "name": this.nombreDistribuidor,// "Suzuki Queretaro" // Nombre del distribuior
        }
      },
      "provider": {
        "name": "MERCADOLIBRE"
      }
    };


    Swal.fire({
      title: '¿Seguro que deseas enviarlos?',
      showDenyButton: true,
      confirmButtonText: `Enviar`,
      denyButtonText: `Cancelar`,
    }).then((result) => {

      if (result.isConfirmed) {

        console.log("Estos son los datos a enviar: " + data);
        const url = 'https://www.answerspip.com/apidms/dms/v1/rest/leads/adfv2';

        this.http.post<any>(url, data, { headers }).subscribe(
          response => {

            // console.log("esta es la respuesta: "+response.status);
            console.log("esta es la respuesta: " + response);
            if (response == null) {
              Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Servicio inactivo ...',
                confirmButtonText: 'Ok'
              });

              this.modalDatos.close('Close click');
            }
            else {
              Swal.fire({
                icon: 'success',
                title: '¡Éxito!',
                text: 'Se enviaron correctamente los datos a Seekop',
                confirmButtonText: 'Ok'
              });

              this.modalDatos.close('Close click');
            }
          },
          error => {
            console.error(error);
            // Muestra una alerta de error
            if (error == "El Lead ya existe") {
              Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Ya existe el leads en Seekop...',
                confirmButtonText: 'Entendido'
              });
            }
            else {
              Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Hubo un problema al agregar la red social. Por favor, inténtalo más tarde.',
                confirmButtonText: 'Entendido'
              });
            }
          }
        );

      }

    });
  }
  // })
}

// }

