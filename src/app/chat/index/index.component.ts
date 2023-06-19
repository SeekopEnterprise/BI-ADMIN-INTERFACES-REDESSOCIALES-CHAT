import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

import { chat, groups } from './data';
import { Conversacion, ApiResponse, ResponseItem, Grupos, GroupedResponseItem } from './chat.model';

import { Lightbox } from 'ngx-lightbox';

import { environment } from '../../../environments/environment';
import { AuthenticationService } from '../../core/services/auth.service';
import { AuthfakeauthenticationService } from '../../core/services/authfake.service';
import { Subscription } from 'rxjs';
import { NotificacionesService } from '../../chat/notificaciones/notificaciones.service';

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

  activetab = 2;
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
  public LinkPublicacion: string;

  listLang = [
    { text: 'English', flag: 'assets/images/flags/us.jpg', lang: 'en' },
    { text: 'Spanish', flag: 'assets/images/flags/spain.jpg', lang: 'es' },
    { text: 'German', flag: 'assets/images/flags/germany.jpg', lang: 'de' },
    { text: 'Italian', flag: 'assets/images/flags/italy.jpg', lang: 'it' },
    { text: 'Russian', flag: 'assets/images/flags/russia.jpg', lang: 'ru' },
  ];

  lang: string;
  images: { src: string; thumb: string; caption: string }[] = [];

  constructor(private notificacionService: NotificacionesService, private authFackservice: AuthfakeauthenticationService, private authService: AuthenticationService,
    private router: Router, public translate: TranslateService, private modalService: NgbModal, private offcanvasService: NgbOffcanvas,
    public formBuilder: FormBuilder, private datePipe: DatePipe, private lightbox: Lightbox, private http: HttpClient) {
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

          // Código para actualizar la conversación en memoria
          //const chatToUpdate = this.chat.flatMap(group => group.prospects).find(prospect => prospect.IdPublicacion === data.idPublicacion);
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
              ultimoMensaje: false, // Cada nuevo mensaje no es el último al inicio
            };
            chatToUpdate.Conversacion.push(newMessage);

            // Marcamos todos los mensajes como no últimos
            chatToUpdate.Conversacion.forEach(mensaje => mensaje.ultimoMensaje = false);

            // Si el mensaje es el último, lo establecemos como último
            newMessage.ultimoMensaje = true;

            // Incrementa el contador de mensajes no leídos
            chatToUpdate.unreadCount = (chatToUpdate.unreadCount || 0) + 1;

            // Reordena la lista de grupos para colocar el grupo con el chat actualizado al inicio
            this.chat.sort((a, b) => a.prospects.includes(chatToUpdate) ? -1 : b.prospects.includes(chatToUpdate) ? 1 : 0);

            // Reordena la lista de prospectos dentro del grupo correcto para colocar el chat actualizado al inicio
            const groupToUpdate = this.chat.find(group => group.prospects.includes(chatToUpdate));
            if (groupToUpdate) {
              groupToUpdate.prospects.sort((a, b) => a === chatToUpdate ? -1 : b === chatToUpdate ? 1 : 0);
            }
          }

          // Notificar al usuario sobre el nuevo mensaje
          this.showNewMessageNotification(chatToUpdate);
          this.onListScroll();
        }
      });




    document.body.setAttribute('data-layout-mode', 'light');

    // Validation


    const user = window.localStorage.getItem('currentUser');
    this.senderName = JSON.parse(user).username
    this.senderProfile = 'assets/images/users/' + JSON.parse(user).profile

    this.lang = this.translate.currentLang;
    this.onListScroll();
  }

  ngAfterViewInit() {
    this.scrollRef.SimpleBar.getScrollElement().scrollTop = 100;
  }

  ngOnDestroy(): void {
    this.chatSubscription.unsubscribe();
    this.notificacionService.close();
  }

  getLastMessage(conversacion: Conversacion[]): Conversacion {
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

  showTabMetodos(tab:string){

    // alert(tab);
    if(tab=='1'){
      // document.getElementById('tabMetodos').style.display = 'none';
      // document.getElementById('chat-welcome-section').style.display = 'block';
      
    }

    if(tab=='2'){
      document.getElementById('tabMetodos').style.display = 'none';
      document.getElementById('chat-welcome-section').style.display = 'block';
      
    }
    
    else if(tab=='7'){ 
      
      document.getElementById('chat-welcome-section').style.display = 'none';
      document.getElementById('tabMetodos').style.display = 'block';
    }
    else{

    }
    
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
    this.modalService.open(videoContent, { centered: true });
  }

  /**
   * Show user chat
   */
  // tslint:disable-next-line: typedef
  userName: any = 'Doris Brown';
  userStatus: any = 'En línea';
  userProfile: any = '';
  message: any;
  showChat(event: any, id: any) {
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
    var data = this.chat
      .map(group => group.prospects)
      .reduce((a, b) => a.concat(b), [])
      .filter((prospect: any) => {
        return prospect.Email === id;
      });

    data[0].unreadCount = 0;
    this.userName = data[0].Nombre;
    this.Distribuidor = data[0].NombreGrupo;
    this.RedSocial = "Mercado Libre"
    this.Email = data[0].Email;
    this.IdPublicacionLead = data[0].IdPublicacion;
    this.LinkPublicacion = "https://autos.mercadolibre.com.mx/#redirectedFromVip=https%3A%2F%2Fauto.mercadolibre.com.mx%2FMLM-1952360720-volkswagen-t-cross-2022-_JM";
    this.userStatus = "En línea"
    this.userProfile = '';
    this.message = data[0].Conversacion
    this.selectedChatId = data[0].IdPublicacion;
    this.onListScroll();
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
    this.userName = data[0].nombregrupo
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

          // Agrupar prospectos por distribuidor
          const grouped = prospects.reduce((groups, prospect) => {
            const grupo = this.groups.find(group => group.idgrupo == prospect.IdDistribuidor)?.nombregrupo || 'Grupo Desconocido';
            groups[grupo] = groups[grupo] || [];
            groups[grupo].push(prospect);

            return groups;
          }, {});

          this.chat = Object.keys(grouped).map(key => ({ key, prospects: grouped[key] }));

          // Si se nos proporcionó datos del socket, ordenamos la lista para que el chat correspondiente esté en la parte superior de su grupo
          if (socketData) {
            //const chatToUpdate = this.chat.flatMap(group => group.prospects).find(prospect => prospect.IdPublicacion === socketData.idPublicacion);
            const chatToUpdate = this.chat
              .map(group => group.prospects)
              .reduce((a, b) => a.concat(b), [])
              .find(prospect => prospect.IdPublicacion === socketData.idPublicacion);

            const groupToUpdate = this.chat.find(group => group.prospects.includes(chatToUpdate));

            if (groupToUpdate) {
              groupToUpdate.prospects.sort((a, b) => a === chatToUpdate ? -1 : b === chatToUpdate ? 1 : 0);
            }
            // Notificar al usuario sobre el nuevo mensaje
            this.showNewMessageNotification(chatToUpdate);  // Asumiendo que el chat con la notificación más reciente está ahora en la parte superior
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

}

