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
  public eventHandlerAdded = false;
  public yaEstaSeteado = false;
  public usuarioCorreo: string;
  public AutoDeInteres = "Sentra";

  public hideMenu: boolean;
  public enviadoaseekop: boolean;

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

      // Recupera el usuario del servicio o del localStorage
      let user = this.globalUserService.getCurrentUser();
      if (!user) {
        try {
          user = JSON.parse(localStorage.getItem('currentUser'));
        } catch (error) {
          console.log('Error al acceder a localStorage nuevo:', error);
        }
      }

      if (user && user.token) {
        this.senderName = user.username;
        this.senderProfile = 'assets/images/users/' + user.profile;
        await this.loadGrupos();
        await this.loadRecuperacionMensajes();
      }



    } catch (error) {
      console.log('Error cargando grupos o recuperando mensajes:', error);
      return;
    }

    // Suscripción al servicio WebSocket para recibir notificaciones en tiempo real
    this.chatSubscription = this.notificacionService.connect('wss://namj4mlg8g.execute-api.us-west-1.amazonaws.com/dev')
      .subscribe((event: MessageEvent) => {
        const data = JSON.parse(event.data);

        // Si la conexión al WebSocket se abre con éxito, se establece la aplicación
        if (event.type === 'open') {
          this.notificacionService.send({
            accion: 'setApp',
            nombreApp: 'proveedoresDigitales'
          });
        } else if (event.type === 'message') {
          this.loadRecuperacionMensajes(data).then(() => {
            // Busca el chat para actualizar con el nuevo mensaje y actualiza el contador de mensajes no leídos
            const chatToUpdate = [].concat(...this.chat
              .map(group => group.prospects))
              .find(prospect => prospect.idPregunta === data.idMensaje + "");

            if (chatToUpdate) {
              chatToUpdate.unreadCount = (chatToUpdate.unreadCount || 0) + 1;
            }

            // Vuelve a ordenar los chats después de actualizar el contador
            // Garantiza que el chat con el mensaje más reciente siempre esté en la parte superior
            this.chat.sort((a, b) => {
              const lastMessageA = a.prospects[0].Conversacion[a.prospects[0].Conversacion.length - 1];
              const lastMessageB = b.prospects[0].Conversacion[b.prospects[0].Conversacion.length - 1];
              const lastMsgDateA = lastMessageA.fechaRespuesta ? new Date(lastMessageA.fechaRespuesta).getTime() : new Date(lastMessageA.fechaCreacion).getTime();
              const lastMsgDateB = lastMessageB.fechaRespuesta ? new Date(lastMessageB.fechaRespuesta).getTime() : new Date(lastMessageB.fechaCreacion).getTime();
              return lastMsgDateB - lastMsgDateA;
            });
          });
        }
      });




    document.body.setAttribute('data-layout-mode', 'light');


    this.lang = this.translate.currentLang;
    this.onListScroll();
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
          this.senderName = this.usuarioCorreo;
          this.senderProfile = 'assets/images/users/' + event.data.profile;
          await this.loadGrupos(); // se agrega await
          await this.loadRecuperacionMensajes(); // se agrega await
        }
        this.yaEstaSeteado = true;
      }
    });
    this.scrollRef.SimpleBar.getScrollElement().scrollTop = 100;

    const iframeElement = document.getElementById("iframePub") as HTMLIFrameElement;
    if (iframeElement) {
      const iframeWindow = iframeElement.contentWindow;
      const iframeDocument = iframeWindow.document;
      const bodyElement = iframeDocument.getElementsByTagName("body")[0];
      bodyElement.setAttribute("id", "idIframe");
    } else {
      console.log('El iframe no se encuentra en el DOM.');
    }
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
        if (prospect.idPregunta === id) {
          // console.log("=========> "+JSON.stringify(prospect.Conversacion[0].id));
          IdUltimoMensaje.push(prospect.Conversacion);
        }

        return prospect.idPregunta === id;
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

    this.enviadoaseekop = true;

    this.userStatus = "En línea"
    this.userProfile = '';
    this.message = data[0].Conversacion
    this.selectedChatId = data[0].idPregunta;
    this.onListScroll();

    const btnEnviarSeekop = document.getElementById("btnEnviarSeekop");
    if (this.enviadoaseekop == true) {
      // Deshabilitar el botón de enviar seekop #btnEnviarSeekop
      btnEnviarSeekop?.setAttribute('disabled', 'true');

    }
    else {
      // Llamar function de envió de prospecto hacia sicop

    }

    // console.log("esta es la url => "+this.urlPublicacion+" => username =>  "+this.userName);
  }

  ContactSearch() {
    const input = document.getElementById("searchContact") as HTMLInputElement;
    const filter = input.value.toUpperCase();
    const chatUserList = document.querySelectorAll(".chat-user-list li");
    const groupDivs = document.querySelectorAll(".chat-user-list .font-weight-bold.text-primary");

    chatUserList.forEach((li) => {
      if (!(li instanceof HTMLElement)) {
        return;
      }

      let groupName = '';
      let previousElement: Element | null = li.previousElementSibling;
      while (previousElement) {
        if (previousElement.classList.contains("font-weight-bold") && previousElement.classList.contains("text-primary")) {
          groupName = previousElement.textContent || "";
          break;
        }
        previousElement = previousElement.previousElementSibling;
      }

      const userName = li.querySelector('h5')?.textContent || "";
      const userMessage = li.querySelector('p.chat-user-message')?.textContent || "";

      if (groupName.toUpperCase().includes(filter) || userName.toUpperCase().includes(filter) || userMessage.toUpperCase().includes(filter)) {
        li.style.display = "";
      } else {
        li.style.display = "none";
      }
    });

    groupDivs.forEach((div) => {
      if (!(div instanceof HTMLElement)) {
        return;
      }

      let hasVisibleChild = false;
      let nextElement: Element | null = div.nextElementSibling;
      while (nextElement && !nextElement.classList.contains("font-weight-bold")) {
        if (nextElement instanceof HTMLElement && nextElement.style.display !== "none") {
          hasVisibleChild = true;
          break;
        }
        nextElement = nextElement.nextElementSibling;
      }

      if (hasVisibleChild) {
        div.style.display = "";
      } else {
        div.style.display = "none";
      }
    });
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
   * Guarda y muestra un nuevo mensaje en la conversación.
   * Además, envía el mensaje a la API para que sea persistido y reflejado en la base de datos.
   */
  async messageSave() {
    // Captura de elementos y valores relevantes de la interfaz de usuario.

    // Comprueba qué grupo de chat está activo.
    const groupMsg = document.querySelector('.pills-groups-tab.active');

    // Obtiene el contenido del mensaje del formulario.
    const message = this.formData.get('message')!.value;

    // Muestra el mensaje en la lista de chat si no hay ningún grupo de chat activo.
    if (!groupMsg) {
      document.querySelector('.chat-user-list li.active .chat-user-message').innerHTML = message ? message : this.img;
    }

    // Configura las propiedades del mensaje, como la imagen y el estado.
    const img = this.img ? this.img : '';
    const status = this.img ? true : '';
    const dateTime = this.datePipe.transform(new Date(), "h:mm a");

    // Captura la información del mensaje de respuesta si existe.
    const chatReplyUser = this.isreplyMessage ? (document.querySelector(".replyCard .replymessage-block .flex-grow-1 .conversation-name") as HTMLAreaElement).innerHTML : '';
    const chatReplyMessage = this.isreplyMessage ? (document.querySelector(".replyCard .replymessage-block .flex-grow-1 .mb-0") as HTMLAreaElement).innerText : '';

    // Construye el objeto del nuevo mensaje.
    const newMessage = {
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

    // Busca la conversación correspondiente para este mensaje.
    const chatToUpdate = this.chat
      .map(group => group.prospects)
      .reduce((a, b) => a.concat(b), [])
      .find(prospect => prospect.idPregunta === this.selectedChatId);

    // Si encontramos la conversación, añade el nuevo mensaje y actualiza los metadatos.
    if (chatToUpdate) {
      chatToUpdate.Conversacion.push(newMessage);
      chatToUpdate.Conversacion.forEach(mensaje => mensaje.ultimoMensaje = false);
      newMessage.ultimoMensaje = true;
    }

    // Asegúrate de que el mensaje se añade a la lista principal si es necesario.
    if (chatToUpdate && this.message !== chatToUpdate.Conversacion) {
      this.message.push(newMessage);
    }

    // Desplaza la vista de chat para mostrar el nuevo mensaje.
    this.onListScroll();

    // Envía el mensaje a la API para persistirlo y reflejarlo en la base de datos.
    try {
      await this.http.post('https://uje1rg6d36.execute-api.us-west-1.amazonaws.com/dev/enviamsjs', {
        IdPregunta: this.selectedChatId,
        Mensaje: message
      }).toPromise();

      // Después de guardar con éxito, recarga la conversación para reflejar cualquier cambio.
      await this.loadRecuperacionMensajes();

    } catch (error) {
      // En caso de error al guardar el mensaje, muestra el error.
      console.error('Error al guardar el mensaje:', error);
    }

    // Restablece los campos y la interfaz de usuario para preparar el próximo mensaje.
    this.formData = this.formBuilder.group({
      message: null,
    });
    this.isreplyMessage = false;
    this.emoji = '';
    this.img = '';
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

  // Método para cargar los mensajes recuperados
  loadRecuperacionMensajes(socketData = null): Promise<void> {
    return new Promise((resolve, reject) => {
      const userName = this.senderName || this.usuarioCorreo;

      this.http.get<ApiResponse>('https://fhfl0x34wa.execute-api.us-west-1.amazonaws.com/dev/recuperarmsjs', { params: { usuario: userName } }).subscribe(
        res => {
          const prospects = res.body;

          // Marcar el último mensaje de cada conversación
          prospects.forEach(prospect => {
            if (prospect.Conversacion && prospect.Conversacion.length > 0) {
              prospect.Conversacion[prospect.Conversacion.length - 1].ultimoMensaje = true;
            }
          });

          // Agrupa los prospectos por distribuidor
          const grouped = prospects.reduce((groups, prospect) => {
            const grupo = this.groups.find(group => group.iddistribuidor == prospect.IdDistribuidor)?.nombredistribuidor || 'Sin Distribuidor';
            groups[grupo] = groups[grupo] || [];
            groups[grupo].push(prospect);
            return groups;
          }, {});

          this.chat = Object.keys(grouped).map(key => ({ key, prospects: grouped[key] }));

          // Ordena los grupos por la fecha del último mensaje en la conversación
          // Esto garantiza que el chat con el mensaje más reciente siempre esté en la parte superior
          // Ordena los grupos por la fecha más reciente entre FechaCreacion y FechaRespuesta del último mensaje en la conversación
          this.chat.sort((a, b) => {
            const lastMessageA = a.prospects[0].Conversacion[a.prospects[0].Conversacion.length - 1];
            const lastMessageB = b.prospects[0].Conversacion[b.prospects[0].Conversacion.length - 1];

            const lastMsgDateA = lastMessageA.fechaRespuesta ? new Date(lastMessageA.fechaRespuesta).getTime() : new Date(lastMessageA.fechaCreacion).getTime();
            const lastMsgDateB = lastMessageB.fechaRespuesta ? new Date(lastMessageB.fechaRespuesta).getTime() : new Date(lastMessageB.fechaCreacion).getTime();

            return lastMsgDateB - lastMsgDateA; // Orden descendente
          });

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
      // Define el nombre de usuario basado en las propiedades de clase
      const userName = this.senderName || this.usuarioCorreo;

      // Realiza la solicitud GET al API usando template strings para construir la URL
      this.http.get<Grupos[]>(`https://ti3pwepc47.execute-api.us-west-1.amazonaws.com/dev/grupos/${userName}`)
        .subscribe(
          res => {
            this.groups = res;
            resolve();
          },
          // Proporciona información más descriptiva en caso de error
          error => {
            console.error('Error al cargar los grupos:', error);
            reject(error);
          }
        );
    });
  }

  validarProspectoEnviadoSeekop() {

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

    // const btnEnviarSeekop = document.getElementById("btnEnviarSeekop");
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
          "model": this.AutoDeInteres // "Sentra"
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
                text: 'Hubo un problema al enviar los datos hacia Seekop. Por favor, inténtalo más tarde.',
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

              this.addNewProspecto();
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
                text: 'Hubo un problema al enviar los datos hacia Seekop. Por favor, inténtalo más tarde.',
                confirmButtonText: 'Entendido'
              });
            }
          }
        );

      }

    });
  }

  addNewProspecto() {
    // enviarprospecto,idpublicacion,idmensaje,idDistribuidor,idredsocial
    const data = {
      "enviarprospecto": this.idMensajeLeads,
      "idpublicacion": this.IdPublicacionLead,
      "idmensaje": this.idMensajeLeads,
      "idDistribuidor": this.idDistribuidor,
      "idredsocial": this.idMensajeLeads,
    };

    const url = 'https://fhfl0x34wa.execute-api.us-west-1.amazonaws.com/dev/recuperarmsjs';
    // https://fhfl0x34wa.execute-api.us-west-1.amazonaws.com/dev/recuperarmsjs?enviarprospecto=2838348&idpublicacion=kasdjlf&idmensaje=45455&idDistribuidor=237237&idredsocial=1828

    this.http.post<any>(url, data).subscribe(
      response => {
        // Muestra una alerta de éxito y cierra el modal
        Swal.fire({
          icon: 'success',
          title: '¡Éxito!',
          text: 'El propecto se agregó correctamente!',
          confirmButtonText: 'Ok'
        });
        this.modalService.dismissAll();
      },
      error => {
        console.log(error);
        // Muestra una alerta de error
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Hubo un problema al agregar el propecto. Por favor, inténtalo más tarde.',
          confirmButtonText: 'Entendido'
        });
      }
    );

  }

}


