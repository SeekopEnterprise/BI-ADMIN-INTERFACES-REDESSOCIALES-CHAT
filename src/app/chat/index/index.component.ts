import {
  Component,
  OnInit,
  ViewChild,
  TemplateRef,
  Renderer2,
  ElementRef,
  ChangeDetectorRef
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { map, filter, take, tap } from 'rxjs/operators';
import {
  FormBuilder,
  Validators,
  FormGroup,
  FormControl
} from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

import { chat, groups } from './data';
import {
  Conversacion,
  ApiResponse,
  ResponseItem,
  Grupos,
  GroupedResponseItem,
  Interesado
} from './chat.model';
import { ChatService } from '../../services/chat.service'; // Ajusta la ruta si es necesario

import { Lightbox } from 'ngx-lightbox';

import { environment } from '../../../environments/environment';
import { AuthfakeauthenticationService } from '../../core/services/authfake.service';
import { Subscription } from 'rxjs';
import { NotificacionesService } from '../../chat/notificaciones/notificaciones.service';
import { GlobalUserService } from '../../services/global-user.service';
import Swal from 'sweetalert2';
// Date Format
import { DatePipe } from '@angular/common';

declare var Highcharts: any;

/* =====================================================================
 *  NUEVOS helpers ( solo dentro de este archivo )
 * ===================================================================*/
/** Devuelve el código de red social existente, cualquiera que sea el nombre
 *  de la propiedad que venga desde la API. */
function getIdRed(prospect: any): string {
  return (
    prospect.idred ??
    prospect.idRed ??
    prospect.idredsocial ??
    prospect.idRedSocial ??
    prospect.IdRedSocial ??
    prospect.idredSocial ??
    ''
  ).toString();
}

/** Devuelve el id de distribuidor con compatibilidad de nombres */
function getIdDistribuidor(prospect: any): string {
  return (prospect.IdDistribuidor ?? prospect.idDistribuidor ?? '').toString();
}

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss']
})

/**
 * Chat-component
 */
export class IndexComponent implements OnInit {
  
  private primeraNotificacionRecibida = false;
  private readonly socketUrl = 'wss://namj4mlg8g.execute-api.us-west-1.amazonaws.com/dev';

  collapsedGroups: { [key: string]: boolean } = {};

  // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
  // Variable para mostrar/ocultar el loader mientras se descargan mensajes
  public isLoadingMensajesIniciales: boolean = false;
  // <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
  isLoading: boolean = false;

  // Suscripción para WebSocket
  private chatSubscription: Subscription;

  // Control del formulario
  submitted = false;
  public activetab = 2;        // Tab activo
  apiResponse: ApiResponse[];  // Respuesta de la API

  // Chat principal
  public chat: GroupedResponseItem[] = [];
  groups: Grupos[];

  // Form principal para mensajes
  formData!: FormGroup;

  // Tooltip para botón del Bot
  tooltipText: string = "Proponer mensaje";

  // Sugerencias base de mensajes para el Bot
  botMessageSuggestions = {
    default: "Este es un mensaje automático del bot.",
    custom: "Aquí va una sugerencia personalizada."
  };

  // Referencia para el scroll
  @ViewChild('scrollRef') scrollRef: any;

  // Control de emojis
  emoji = '';
  showEmojiPicker = false;
  isreplyMessage = false;
  isgroupMessage = false;
  mode: string | undefined;
  public isCollapsed = true;

  // Control de nuevos mensajes
  public nuevoMensaje = false;
  public datosMensajeNuevo;
  public selectedChatId: any;

  // Datos del usuario y la publicación
  public Distribuidor: string;
  public RedSocial: string;
  public Email: string;
  public IdPublicacionLead: string;
  public LinkPublicacion: SafeResourceUrl | undefined;
  public modalDatos: any;
  public Telefono: string;
  public apellidoPaterno: string;
  public apellidoMaterno: string;
  public idMensajeLeads;
  public idDistribuidor: string;
  public nombreDistribuidor: string;
  public eventHandlerAdded = false;
  public yaEstaSeteado = false;
  public usuarioCorreo: string;
  public AutoDeInteres = "Sentra";
  public idRedSocial: string;
  public idMensaje: string;
  public hideMenu: boolean;
  public enviadoaseekop: boolean = false;
  public activeChatId: string | null = null;
  public activeConversationKey: string | null = null; 

  // Variables para agrupar
  public chatByRedSocial: any = {};
  public vistaPorDistribuidor: boolean = true;
  public chatByDistributorThenRedSocial: any;

  // Control del último mensaje enviado (para evitar duplicados)
  public lastSentMessage = '';

  // Parámetros usados para la API
  public par_IdPublicacionLead: string;
  public par_idDistribuidor: string;
  public par_idRedSocial: string;

  // Control de contenedores para KPI
  public isContainerVisible: boolean = false;
  public isContainerVisibleKPIs: boolean = false;

  // Variables y listado de Bots
  selectedBot: string = '';  // Bot seleccionado
  bots = [
    { value: 'bot1', name: 'Bot de Respuesta Rápida' },
    { value: 'bot2', name: 'Bot de Seguimiento' },
    { value: 'bot3', name: 'Bot de Ventas' }
  ];
  botActive: boolean = false; // Para saber si un bot está activo

  // Lista de lenguajes
  listLang = [
    { text: 'English', flag: 'assets/images/flags/us.jpg', lang: 'en' },
    { text: 'Spanish', flag: 'assets/images/flags/spain.jpg', lang: 'es' },
    { text: 'German', flag: 'assets/images/flags/germany.jpg', lang: 'de' },
    { text: 'Italian', flag: 'assets/images/flags/italy.jpg', lang: 'it' },
    { text: 'Russian', flag: 'assets/images/flags/russia.jpg', lang: 'ru' },
  ];

  // Mapeo de tabs
  TABS = {
    '': 2,
    'perfil': 1,
    'conversaciones': 2,
    'distribuidores': 3,
    'redes-sociales': 4,
    'distribuidores-redes-sociales': 6,
    'metodos': 7,
    'publicaciones': 8,
    'calendario-publicaciones': 9
  };

  // Mapeo de rutas
  ROUTES = {
    1: 'perfil',
    2: 'conversaciones',
    3: 'distribuidores',
    4: 'redes-sociales',
    6: 'distribuidores-redes-sociales',
    7: 'metodos',
    8: 'publicaciones',
    9: 'calendario-publicaciones'
  };

  // Form de interesado
  newInteresadoForm: Partial<Interesado> = {
    nombre: '',
    apellidop: '',
    apellidom: '',
    telefono: '',
    email: '',
    comentarios: ''
  };

  interesadoForm: FormGroup = new FormGroup({
    nombre: new FormControl(''),
    apellidoP: new FormControl(''),
    apellidoM: new FormControl(''),
    telefono: new FormControl(''),
    email: new FormControl(''),
    comentarios: new FormControl('')
  });

  telefonoInput: string = '';

  // Manejo de idioma
  lang: string;

  // Control de imágenes en Lightbox
  images: { src: string; thumb: string; caption: string }[] = [];

  // Varios
  senderName: any;
  senderProfile: any;

  constructor(
    private globalUserService: GlobalUserService,
    private notificacionService: NotificacionesService,
    private chatService: ChatService,
    private authFackservice: AuthfakeauthenticationService,
    private router: Router,
    private route: ActivatedRoute,
    public translate: TranslateService,
    private modalService: NgbModal,
    private offcanvasService: NgbOffcanvas,
    public formBuilder: FormBuilder,
    private datePipe: DatePipe,
    private lightbox: Lightbox,
    private http: HttpClient,
    private sanitizer: DomSanitizer,
    private cdr: ChangeDetectorRef,
    private renderer: Renderer2,
    private el: ElementRef
  ) {
    // Form para mensajes
    this.formData = this.formBuilder.group({
      message: ['', [Validators.required]]
    });

    // Form para interesado
    this.interesadoForm = this.formBuilder.group({
      nombre: ['', [Validators.required, Validators.maxLength(20)]],
      apellidoP: ['', [Validators.required, Validators.maxLength(20)]],
      apellidoM: ['', [Validators.required, Validators.maxLength(20)]],
      telefono: [
        '',
        [Validators.required, Validators.minLength(10), Validators.maxLength(10)]
      ],
      email: ['', [Validators.required, Validators.email]],
      comentarios: ['', [Validators.required, Validators.maxLength(20)]]
    });
  }

  toggleGroupCollapse(key: string): void {
  this.collapsedGroups[key] = !this.collapsedGroups[key];
}

  /**
   * Abre la imagen en Lightbox
   */
  openImage(index: number, i: number): void {
    // open lightbox
    this.lightbox.open(this.message[index].imageContent, i, {
      showZoom: true
    });
  }

  /**
 * Conecta al WebSocket y:
 *  1) Espera la PRIMERA notificación con idDistribuidor.
 *  2) Cuando llega, descarga todo, apaga el loader y
 *     deja el flujo normal para las demás notificaciones.
 */
  private iniciarWebSocket(): void {
    this.chatSubscription = this.notificacionService
      .connect(this.socketUrl)

      /* RxJS: parsea los mensajes entrantes */
      .pipe(map((e: MessageEvent) => JSON.parse(e.data)))

      /* -------- PRIMER mensaje con idDistribuidor -------- */
      .pipe(
        filter(m => !!m.idDistribuidor), // sólo los que traen idDistribuidor
        take(1),                         // ¡el primero y basta!
        tap(async primeraData => {
          this.primeraNotificacionRecibida = true;
          this.idDistribuidor = primeraData.idDistribuidor;

          try {
            await this.loadGrupos();
            await this.descargarMensajesIniciales();   // ⬅️  quítalo si no lo necesitas
            await this.loadRecuperacionMensajes();
          } catch (e) {
            console.error('Fallo carga inicial:', e);
          } finally {
            this.isLoadingMensajesIniciales = false;   // quita el spinner
          }
        })
      )

      /* ---- A partir de aquí TODAS las notificaciones ---- */
      .subscribe(
        data => this.agregarMensajeSocket(data),
        err  => console.error('WS error:', err)
      );

    /* Time-out de seguridad — opcional pero aconsejado */
    setTimeout(() => {
      if (this.isLoadingMensajesIniciales && !this.primeraNotificacionRecibida) {
        this.isLoadingMensajesIniciales = false;
        console.warn('Timeout: no llegó ninguna notificación en 30 s');
      }
    }, 30_000);
  }

  /**
   * Inicialización del componente
   */
  async ngOnInit() {
    // Manejo de queryParams para establecer el tab activo
    this.route.queryParams.subscribe(params => {
      try {
        const tabId = params['tab'];
        this.activetab = tabId === undefined ? 2 : this.TABS[tabId];
        this.hideMenu = tabId !== '' && tabId !== undefined;
        if (params['currentDistribuidor']) {
          this.idDistribuidor = params['currentDistribuidor'];
          console.log('[Chat hijo] idDistribuidor recibido:', this.idDistribuidor);
        }
        // Si no hay distribuidor, muestra advertencia y no continúes:
        if (!this.idDistribuidor) {
          console.warn('[Chat hijo] No se recibió idDistribuidor, no se cargarán mensajes');
          return;
        }
      } catch (error) {
        this.activetab = 2;
        this.hideMenu = false;
      }
    });

    // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
    // Activamos el loader ANTES de iniciar la secuencia de descarga
    this.isLoadingMensajesIniciales = true;
    // <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<

    // 1. Abrimos el socket de inmediato, para que reciba notificaciones
  /*   this.chatSubscription = this.notificacionService
      .connect('wss://namj4mlg8g.execute-api.us-west-1.amazonaws.com/dev')
      .subscribe((event: MessageEvent) => {
        const data = JSON.parse(event.data);
        console.log("WS data recibida:", data);

        if (data.idMensaje) {
          const promesaSentimiento = this.detectarSentimiento(data.idMensaje);
          promesaSentimiento
            .then(() => {
              this.agregarMensajeSocket(data);
              // Opcional: this.loadRecuperacionMensajes();
            })
            .catch(err => console.error('Error detectando sentimiento:', err));
        } else {
          console.log('Notificación WS sin idMensaje, data:', data);
        }
      });
 */
    this.isLoadingMensajesIniciales = true;

  /*   Sustituye la apertura antigua por esta línea */
  this.iniciarWebSocket();

    try {
      // 2. Recupera el usuario del servicio o del localStorage
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

        // 3. Cargar grupos primero
        await this.loadGrupos();

        // 4. Primero se descarga (inserta en la BD) para que el socket notifique
        await this.descargarMensajesIniciales();

        // 5. Luego cargamos lo que se haya guardado en base
        await this.loadRecuperacionMensajes();
      }

    } catch (error) {
      console.log('Error cargando grupos o recuperando mensajes:', error);
      return;
    } finally {
      // Apagamos el loader al concluir o fallar la secuencia
      this.isLoadingMensajesIniciales = false;
      // --- NOTIFICACIÓN AL PADRE ---
      setTimeout(() => {
        window.parent?.postMessage({ type: 'CONVERS_READY' }, '*');
      });
    }

    document.body.setAttribute('data-layout-mode', 'light');
    this.lang = this.translate.currentLang;
 document.body.setAttribute('data-layout-mode', 'light');
    this.lang = this.translate.currentLang;

    /*  NOTA: la clave única solo puede calcularse cuando ya hay datos
        de la conversación; por eso se asigna dentro de showChat()
        y se elimina el cálculo temprano que se había añadido aquí. */

    this.onListScroll();
  }


/**
 * Inserta o crea la conversación que llega por WebSocket.
 *  ▸ Evita duplicados
 *  ▸ Mantiene contador/orden
 *  ▸ Si el prospecto aún no existe, lo genera “en caliente”
 */
private async agregarMensajeSocket(data: any): Promise<void> {

  /* ------------------------------------------------------------
   * 1. Clave única y localización del prospecto
   * ---------------------------------------------------------- */
  const claveUnicaWS =
        `${data.idPublicacion}-${data.idRedSocial}--${data.idDistribuidor}`;

  const findProspect = () =>
    this.chat.flatMap(g => g.prospects)
             .find(p => String(p.claveUnica) === claveUnicaWS);

  let prospect = findProspect();

  /* ------------------------------------------------------------
   * 2. ¿No existe?  Intentamos recargar y volvemos a buscar
   * ---------------------------------------------------------- */
  if (!prospect) {
    await this.loadRecuperacionMensajes();
    prospect = findProspect();
  }

  /* ------------------------------------------------------------
   * 3. Si sigue sin existir, creamos un stub minimal
   * ---------------------------------------------------------- */
  if (!prospect) {

    const grupoNombre  = this.groups.find(g => g.iddistribuidor === data.idDistribuidor)
                         ?.nombredistribuidor || 'Sin Distribuidor';

    prospect = {
      /* ===== meta-datos ===== */
      IdPublicacion : data.idPublicacion,
      IdDistribuidor: data.idDistribuidor,
      idRed         : data.idRedSocial,
      redSocial     : data.idRedSocial,   // ← usa lo que tengas
      NombreGrupo   : grupoNombre,
      Nombre        : '(Nuevo prospecto)',
      Apellido      : '',
      Email         : '',
      Telefono      : '',
      /* ===== runtime ===== */
      Conversacion  : [],
      unreadCount   : 0,
      claveUnica    : claveUnicaWS
    } as any as ResponseItem;            // cast rápido

    /* lo alojamos en el grupo correcto (creándolo si hace falta) */
    let grupo = this.chat.find(c => c.key === grupoNombre);
    if (!grupo) {
      grupo = { key: grupoNombre, prospects: [] };
      this.chat.push(grupo);
    }
    grupo.prospects.push(prospect);
  }

  /* ------------------------------------------------------------
   * 4. Evitar duplicados
   * ---------------------------------------------------------- */
  if (prospect.Conversacion.some(m => m.id === data.idMensaje)) {
    return; // ya está, nada que hacer
  }

  /* ------------------------------------------------------------
   * 5. Insertamos el nuevo mensaje
   * ---------------------------------------------------------- */
  prospect.Conversacion.forEach(m => (m.ultimoMensaje = false));

  const nuevoMensaje: Conversacion = {
    id            : data.idMensaje,
    texto         : data.mensaje || data.mensajeDelSocket || '(Notificación)',
    name          : data.appNotificada || 'Cliente',
    align         : 'left',
    ultimoMensaje : true,
    isimage       : false,
    imageContent  : []
  };

  prospect.Conversacion.push(nuevoMensaje);
  prospect.ultimoMensaje = nuevoMensaje;

  /* ------------------------------------------------------------
   * 6. Contadores / panel derecho
   * ---------------------------------------------------------- */
  const abierta = this.activeConversationKey === claveUnicaWS;

  if (!abierta) {
    prospect.unreadCount = (prospect.unreadCount || 0) + 1;
  } else {
    this.message        = [...prospect.Conversacion];
    prospect.unreadCount = 0;
    this.activeChatId    = nuevoMensaje.id;
    this.selectedChatId  = nuevoMensaje.id;
    this.onListScroll();
  }

  /* ------------------------------------------------------------
   * 7. Re-ordenar la lista izquierda (descendente por fecha)
   * ---------------------------------------------------------- */
  this.chat.sort((a, b) => {
    const la = a.prospects[0].ultimoMensaje;
    const lb = b.prospects[0].ultimoMensaje;
    const ta = new Date(la?.fechaRespuesta || la?.fechaCreacion || 0).getTime();
    const tb = new Date(lb?.fechaRespuesta || lb?.fechaCreacion || 0).getTime();
    return tb - ta;
  });
}






  /**
   * Se ejecuta después de que la vista inicie
   */
  ngAfterViewInit() {
    // Escucha los mensajes que llegan del padre
    window.addEventListener('message', async event => {
      if (!this.yaEstaSeteado) {
        // Almacena el usuario en el servicio
        this.globalUserService.setCurrentUser(event.data);
        console.log('esta funcionando o no aquí lo sabremos: ', event.data);
        this.usuarioCorreo = event.data.username;
        if (this.usuarioCorreo) {
          this.senderName = this.usuarioCorreo;
          this.senderProfile = 'assets/images/users/' + event.data.profile;
          await this.loadGrupos();
          await this.loadRecuperacionMensajes();
        }
        this.yaEstaSeteado = true;
      }
    });

    this.scrollRef.SimpleBar.getScrollElement().scrollTop = 100;

    const iframeElement = document.getElementById(
      'iframePub'
    ) as HTMLIFrameElement;
    if (iframeElement) {
      const iframeWindow = iframeElement.contentWindow;
      const iframeDocument = iframeWindow.document;
      const bodyElement = iframeDocument.getElementsByTagName('body')[0];
      bodyElement.setAttribute('id', 'idIframe');
    } else {
      console.log('El iframe no se encuentra en el DOM.');
    }
  }

  /**
   * Se destruye la suscripción del WebSocket
   */
  ngOnDestroy(): void {
    this.chatSubscription.unsubscribe();
    this.notificacionService.close();
  }

  /**
   * Obtiene el último mensaje de una conversación
   */
  getLastMessage(conversacion: Conversacion[]): Conversacion {
    return conversacion.length > 0 ? conversacion[conversacion.length - 1] : null;
  }

  /**
   * Muestra la notificación de nuevo mensaje (placeholder si se requiere)
   */
  showNewMessageNotification(chat: ResponseItem): void {
    // Implementar lógica de notificación si se requiere
  }

  /**
   * Muestra el perfil del usuario
   */
  showUserProfile() {
    document.getElementById('profile-detail').style.display = 'block';
  }

  /**
   * Control de cambio de tab
   */
  showTabMetodos(tabId: string) {
    this.hideMenu = false;
    this.activetab = Number(tabId);
  }

  /**
   * Cierra el chat de usuario
   */
  closeUserChat() {
    document.getElementById('chat-room').classList.remove('user-chat-show');
  }

  /**
   * Cambia el idioma
   */
  setLanguage(lang) {
    this.translate.use(lang);
    this.lang = lang;
  }

  /**
   * Abre el modal de la publicación (Ver Publicación)
   */
  openCallModal(content) {
    this.modalService.open(content, { centered: true });
  }

  /**
   * Abre el modal de Video (Enviar a Seekop)
   */
  openVideoModal(videoContent) {
    this.modalDatos = this.modalService.open(videoContent, { centered: true });
  }

  /**
   * Evento al enfocar el input de mensaje
   */
  onInputFocus() {
    if (this.activeChatId) {
      const activeChat = []
        .concat(...this.chat.map(group => group.prospects))
        .find(prospect => prospect.idPregunta === this.activeChatId);

      if (activeChat) {
        // Marca el mensaje como leído
        activeChat.unreadCount = 0;
        // Lógica extra de leído si se requiere
      }
    }
  }

  // Nombre de usuario y estatus en la parte superior del chat
  userName: any = 'Doris Brown';
  userStatus: any = 'En línea';
  userProfile: any = '';
  urlPublicacion: any = '';
  message: any;

  /**
   * Muestra el chat
   */
  showChat(event: any, id: any) {
    this.enviadoaseekop == false;
    this.activeChatId = id;
    console.log('ID Chat seleccionado:', id);

    const removeClass = document.querySelectorAll('.chat-user-list li');
    removeClass.forEach((element: any) => {
      element.classList.remove('active');
    });

    document.querySelector('.user-chat').classList.add('user-chat-show');
    document.querySelector('.chat-welcome-section').classList.add('d-none');
    document.querySelector('.user-chat').classList.remove('d-none');
    event.target.closest('li').classList.add('active');

    // Buscamos la data relacionada con el ID seleccionado
    const IdUltimoMensaje = [];
    const data = this.chat
      .map(group => group.prospects)
      .reduce((a, b) => a.concat(b), [])
      .filter((prospect: any) => {
        if (prospect.ultimoMensaje.id === id) {
          IdUltimoMensaje.push(prospect.Conversacion);
        }
        return prospect.ultimoMensaje.id === id;
      });

    // Se busca el "IdMensajeLeads"
    for (let key in IdUltimoMensaje[0]) {
      if (IdUltimoMensaje[0][key].ultimoMensaje == true) {
        this.idMensajeLeads = IdUltimoMensaje[0][key].id;
      }
    }

    data[0].unreadCount = 0; // Marcamos la conversación como leída
    this.userName = data[0].Nombre;
    this.Distribuidor = data[0].NombreGrupo;
    this.RedSocial = data[0].redSocial;
    this.Email = data[0].Email;
    this.IdPublicacionLead = data[0].IdPublicacion;
    this.urlPublicacion = data[0].urlpublicacion;
    this.apellidoPaterno = data[0].Apellido;
    this.Telefono = data[0].Telefono;
    this.Email = data[0].Email;

    // Precarga del formulario con datos
    this.newInteresadoForm = {
      nombre: this.userName,
      apellidop: this.apellidoPaterno,
      apellidom: this.apellidoMaterno,
      telefono: this.Telefono,
      email: this.Email,
      comentarios: ''
    };

    // Asignación de datos para la vista
    this.LinkPublicacion = this.sanitizer.bypassSecurityTrustResourceUrl(
      'https://auto.mercadolibre.com.mx/MLM-1946997981-tiguan-comfortline-2023-_JM'
    );
    this.idDistribuidor = data[0].IdDistribuidor;
    this.nombreDistribuidor = data[0].NombreGrupo;
    this.idRedSocial = data[0]['idred'];
    this.userStatus = 'En línea';
    this.userProfile = '';
    this.message = data[0].Conversacion;
    this.selectedChatId = data[0].ultimoMensaje.id;

     this.activeConversationKey =
      `${this.IdPublicacionLead}-${this.idRedSocial}--${this.idDistribuidor}`;

    this.onListScroll();

    // Obtiene el botón para cambiar su estado si ya fue enviado
    const btnEnviarSeekop = document.getElementById(
      'btnEnviarSeekop_' + this.idMensajeLeads
    );

    // Parametrizamos los datos para la API
    this.par_IdPublicacionLead = this.IdPublicacionLead || null;
    this.par_idDistribuidor = this.idDistribuidor || null;
    this.par_idRedSocial = this.idRedSocial || null;

    const apiUrl = `https://fhfl0x34wa.execute-api.us-west-1.amazonaws.com/dev/recuperarmsjs?enviarprospecto=${this.idMensajeLeads}&idpublicacion=${this.par_IdPublicacionLead}&idmensaje=${this.idMensajeLeads}&idDistribuidor=${this.par_idDistribuidor}&idredsocial=${this.par_idRedSocial}&existe=true`;

    this.http.get(apiUrl).subscribe(
      response => {
        if (response && response['body']) {
          this.enviadoaseekop = response['body']['exists'];
          console.log('estatus envio: ' + this.enviadoaseekop);

          if (this.enviadoaseekop) {
            btnEnviarSeekop?.setAttribute('disabled', 'true');
            document.getElementById(
              'btnenviarleads_' + this.idMensajeLeads
            ).style.display = 'none';
            document.getElementById(
              'btnenviadoleads_' + this.idMensajeLeads
            ).style.display = 'block';
          } else {
            btnEnviarSeekop?.removeAttribute('disabled');
          }
        }
      },
      error => {
        console.error('Hubo un error al obtener los datos de la API:', error);
      }
    );
  }

  /**
   * Búsqueda de contactos
   */
  ContactSearch() {
    const input = document.getElementById(
      'searchContact'
    ) as HTMLInputElement;
    const filter = input.value.toUpperCase();
    const chatUserList = document.querySelectorAll('.chat-user-list li');
    const groupDivs = document.querySelectorAll(
      '.chat-user-list .font-weight-bold.text-primary'
    );

    chatUserList.forEach(li => {
      if (!(li instanceof HTMLElement)) {
        return;
      }

      let groupName = '';
      let previousElement: Element | null = li.previousElementSibling;
      while (previousElement) {
        if (
          previousElement.classList.contains('font-weight-bold') &&
          previousElement.classList.contains('text-primary')
        ) {
          groupName = previousElement.textContent || '';
          break;
        }
        previousElement = previousElement.previousElementSibling;
      }

      const userName = li.querySelector('h5')?.textContent || '';
      const userMessage =
        li.querySelector('p.chat-user-message')?.textContent || '';

      if (
        groupName.toUpperCase().includes(filter) ||
        userName.toUpperCase().includes(filter) ||
        userMessage.toUpperCase().includes(filter)
      ) {
        li.style.display = '';
      } else {
        li.style.display = 'none';
      }
    });

    groupDivs.forEach(div => {
      if (!(div instanceof HTMLElement)) {
        return;
      }
      let hasVisibleChild = false;
      let nextElement: Element | null = div.nextElementSibling;
      while (
        nextElement &&
        !nextElement.classList.contains('font-weight-bold')
      ) {
        if (
          nextElement instanceof HTMLElement &&
          nextElement.style.display !== 'none'
        ) {
          hasVisibleChild = true;
          break;
        }
        nextElement = nextElement.nextElementSibling;
      }
      if (hasVisibleChild) {
        div.style.display = '';
      } else {
        div.style.display = 'none';
      }
    });
  }

  /**
   * Búsqueda de mensajes
   */
  MessageSearch() {
    const input: any = document.getElementById('searchMessage');
    const filter = input.value.toUpperCase();
    const ul = document.getElementById('users-conversation');
    const li = ul.getElementsByTagName('li');
    for (let i = 0; i < li.length; i++) {
      const a = li[i].getElementsByTagName('p')[0];
      const txtValue = a?.innerText;
      if (txtValue?.toUpperCase().indexOf(filter) > -1) {
        li[i].style.display = '';
      } else {
        li[i].style.display = 'none';
      }
    }
  }

  /**
   * Muestra la barra lateral con la información del usuario
   */
  onChatInfoClicked(content: TemplateRef<any>) {
    this.offcanvasService.open(content, { position: 'end' });
  }

  /**
   * Getter para el form (acceso rápido)
   */
  get form() {
    return this.formData.controls;
  }


/**
 * Envía el mensaje que hay en el input y lo muestra
 * de manera optimista.  El refresco real llegará por
 * WebSocket; por eso NO volvemos a llamar a
 * loadRecuperacionMensajes().
 */
async messageSave() {
  const texto = this.formData.get('message')!.value?.trim();
  if (!texto || texto === this.lastSentMessage) {
    console.log('Mensaje vacío o duplicado; se ignora.');
    return;
  }

  /* ---------- construimos el mensaje local --------------------- */
  const nuevoMensaje: Conversacion = {
    id           : Date.now(),           // id temporal (se sobrescribirá)
    texto        : texto,
    name         : this.senderName,
    profile      : this.senderProfile,
    time         : null,
    align        : 'right',
    isimage      : false,
    ultimoMensaje: true,
    imageContent : [],
    replayName   : null,
    replaymsg    : null
  };

  /* ---------- lo insertamos en la conversación visible ---------- */
  const prospecto = this.chat
    .flatMap(g => g.prospects)
    .find(p => p.ultimoMensaje.id === this.selectedChatId + '');

  if (prospecto) {
    prospecto.Conversacion.forEach(m => (m.ultimoMensaje = false));
    prospecto.Conversacion.push(nuevoMensaje);
    prospecto.ultimoMensaje = nuevoMensaje;      //  ← referencia actualizada
    prospecto.unreadCount = 0;
  }

  /* ---------- panel derecho y scroll --------------------------- */
  if (this.message !== prospecto?.Conversacion) {
    this.message = prospecto!.Conversacion;
  }
  this.onListScroll();

  /* ---------- POST al backend ---------------------------------- */
  try {
    await this.http.post(
      'https://uje1rg6d36.execute-api.us-west-1.amazonaws.com/dev/enviamsjs',
      { IdPregunta: this.selectedChatId, Mensaje: texto },
      { responseType: 'text' }
    ).toPromise();

    this.lastSentMessage = texto;
    // 👇 YA NO recargamos la lista – esperamos al WebSocket
  } catch (err) {
    console.error('Fallo al enviar:', err);
    // aquí podrías implementar un retry o marcar el mensaje como no enviado
  }

  /* ---------- limpiamos el input ------------------------------- */
  this.formData.reset();
}


  /**
   * Hace scroll al final de la conversación
   */
  onListScroll() {
    if (this.scrollRef !== undefined) {
      setTimeout(() => {
        this.scrollRef.SimpleBar.getScrollElement().scrollTop =
          this.scrollRef.SimpleBar.getScrollElement().scrollHeight;
      }, 500);
    }
  }

  // Config Emojis
  sets: any = [
    'native',
    'google',
    'twitter',
    'facebook',
    'emojione',
    'apple',
    'messenger'
  ];
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
  onBlur() { }

  closeReplay() {
    document.querySelector('.replyCard')?.classList.remove('show');
  }

  /**
   * Copia el texto de un mensaje
   */
  copyMessage(event: any) {
    navigator.clipboard.writeText(
      event.target.closest('.chats').querySelector('.messageText').innerHTML
    );
    document.getElementById('copyClipBoard')?.classList.add('show');
    setTimeout(() => {
      document.getElementById('copyClipBoard')?.classList.remove('show');
    }, 1000);
  }

  /**
   * Elimina un mensaje
   */
  deleteMessage(event: any) {
    event.target.closest('.chats').remove();
  }

  /**
   * Elimina todos los mensajes
   */
  deleteAllMessage(event: any) {
    const allMsgDelete: any = document
      .getElementById('users-conversation')
      ?.querySelectorAll('.chats');
    allMsgDelete.forEach((item: any) => {
      item.remove();
    });
  }

  /**
   * Responder un mensaje
   */
  replyMessage(event: any, align: any) {
    this.isreplyMessage = true;
    document.querySelector('.replyCard')?.classList.add('show');
    const copyText = event.target
      .closest('.chats')
      .querySelector('.messageText').innerHTML;

    (
      document.querySelector(
        '.replyCard .replymessage-block .flex-grow-1 .mb-0'
      ) as HTMLAreaElement
    ).innerHTML = copyText;

    const msgOwnerName: any =
      event.target.closest('.chats').classList.contains('right') == true
        ? 'You'
        : document.querySelector('.username')?.innerHTML;

    (
      document.querySelector(
        '.replyCard .replymessage-block .flex-grow-1 .conversation-name'
      ) as HTMLAreaElement
    ).innerHTML = msgOwnerName;
  }

  /**
   * Abre un modal centrado
   */
  centerModal(centerDataModal: any) {
    this.modalService.open(centerDataModal, { centered: true });
  }

  // Subida de archivos
  imageURL: string | undefined;
  img: any;

  fileChange(event: any) {
    const fileList: any = event.target as HTMLInputElement;
    const file: File = fileList.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      this.imageURL = reader.result as string;
      this.img = this.imageURL;
    };
    reader.readAsDataURL(file);
  }

  /**
   * Cambia el modo (light/dark)
   */
  changeMode(mode: string) {
    this.mode = mode;
    switch (mode) {
      case 'light':
        document.body.setAttribute('data-layout-mode', 'light');
        break;
      case 'dark':
        document.body.setAttribute('data-layout-mode', 'dark');
        break;
      default:
        document.body.setAttribute('data-layout-mode', 'light');
        break;
    }
  }

  /**
   * Mostrar chat de grupo (placeholder si se requiere)
   */
  showGroupChat(event: any, id: any) {
    const removeClass = document.querySelectorAll('.chat-list li');
    removeClass.forEach((element: any) => {
      element.classList.remove('active');
    });
    document.querySelector('.user-chat').classList.add('user-chat-show');
    document.querySelector('.chat-welcome-section').classList.add('d-none');
    document.querySelector('.user-chat').classList.remove('d-none');
    event.target.closest('li').classList.add('active');
    const data = this.groups.filter((group: any) => {
      return group.idgrupo === id;
    });
    this.userName = data[0].nombredistribuidor;
    this.userProfile = '';
    this.message = '';
  }

  /**
   * Abre modal para crear grupo (placeholder si se requiere)
   */
  openGroupModal(content: any) {
    this.modalService.open(content, { centered: true });
  }

  /**
   * Búsqueda dentro de grupos
   */
  GroupSearch() {
    const input: any = document.getElementById('searchGroup');
    const filter = input.value.toUpperCase();
    const ul = document.querySelectorAll('.group-list');
    ul.forEach((item: any) => {
      const li = item.getElementsByTagName('li');
      for (let i = 0; i < li.length; i++) {
        const a = li[i].getElementsByTagName('h5')[0];
        const txtValue = a?.innerText;
        if (txtValue?.toUpperCase().indexOf(filter) > -1) {
          li[i].style.display = '';
        } else {
          li[i].style.display = 'none';
        }
      }
    });
  }

/**
 * Descarga las conversaciones y genera TODAS las
 * estructuras que la plantilla usa (chat, chatByRedSocial,
 * chatByDistributorThenRedSocial, collapsedGroups).
 */
loadRecuperacionMensajes(): Promise<void> {
  return new Promise((resolve, reject) => {
    this.http
      .get<ApiResponse>(
        'https://fhfl0x34wa.execute-api.us-west-1.amazonaws.com/dev/recuperarmsjs',
        { params: { idDistribuidor: this.idDistribuidor } }
      )
      .subscribe(
        res => {
          const prospects = res.body;

          /* ---------- claveUnica en cada prospecto ---------------- */
          prospects.forEach(p => {
            p.claveUnica =
              `${p.IdPublicacion}-${getIdRed(p)}--${getIdDistribuidor(p)}`;
          });

          /* ---------- 1) Agrupación SOLO por red social ----------- */
          this.chatByRedSocial = prospects.reduce((acc, p) => {
            (acc[p.redSocial] = acc[p.redSocial] || []).push(p);
            return acc;
          }, {} as { [red: string]: ResponseItem[] });

          /* reiniciamos estado de colapsado */
          Object.keys(this.chatByRedSocial).forEach(
            red => (this.collapsedGroups[red] = false)
          );

          /* ---------- 2) Distribuidor → Red social ---------------- */
          this.chatByDistributorThenRedSocial = prospects.reduce(
            (acc, p) => {
              const dist = this.groups.find(
                g => g.iddistribuidor == p.IdDistribuidor
              )?.nombredistribuidor || 'Sin Distribuidor';

              acc[dist] = acc[dist] || {};
              acc[dist][p.redSocial] = acc[dist][p.redSocial] || [];
              acc[dist][p.redSocial].push(p);
              return acc;
            },
            {} as { [dist: string]: { [red: string]: ResponseItem[] } }
          );

          /* ---------- 3) Agrupación FINAL (chat) ------------------ */
          const groupedByDist = prospects.reduce((acc, p) => {
            const dist = this.groups.find(
              g => g.iddistribuidor == p.IdDistribuidor
            )?.nombredistribuidor || 'Sin Distribuidor';

            (acc[dist] = acc[dist] || []).push(p);
            return acc;
          }, {} as { [dist: string]: ResponseItem[] });

          this.chat = Object.keys(groupedByDist).map(key => ({
            key,
            prospects: groupedByDist[key]
          }));

          /* ---------- 4) Ordenar por último mensaje --------------- */
          this.chat.sort((a, b) => {
            const la = a.prospects[0].Conversacion.slice(-1)[0];
            const lb = b.prospects[0].Conversacion.slice(-1)[0];
            const ta = new Date(la.fechaRespuesta || la.fechaCreacion).getTime();
            const tb = new Date(lb.fechaRespuesta || lb.fechaCreacion).getTime();
            return tb - ta;
          });

          /* ---------- 5) Reset unread de la conversación abierta -- */
          if (this.activeConversationKey) {
            const abierta = this.chat
              .flatMap(g => g.prospects)
              .find(p => p.claveUnica === this.activeConversationKey);
            if (abierta) abierta.unreadCount = 0;
          }

          resolve();
        },
        err => {
          console.error(err);
          reject(err);
        }
      );
  });
}


  /**
   * Carga de grupos
   */
  loadGrupos(): Promise<void> {
    return new Promise((resolve, reject) => {
      const userName = this.senderName || this.usuarioCorreo;
      this.http
        .get<Grupos[]>(
          `https://ti3pwepc47.execute-api.us-west-1.amazonaws.com/dev/grupos/${userName}`
        )
        .subscribe(
          res => {
            this.groups = res;
            resolve();
          },
          error => {
            console.error('Error al cargar los grupos:', error);
            reject(error);
          }
        );
    });
  }

  /**
   * Validación de prospecto en Seekop (placeholder)
   */
  validarProspectoEnviadoSeekop() {
    // Implementar si se requiere
  }

  /**
   * Confirmación de envío de datos a Seekop
   */
  confirmSend() {
    this.userName = JSON.stringify(this.interesadoForm.value.nombre);
    this.apellidoPaterno = JSON.stringify(this.interesadoForm.value.apellidoP);
    this.apellidoMaterno = JSON.stringify(this.interesadoForm.value.apellidoM);
    this.Telefono = JSON.stringify(this.interesadoForm.value.telefono);
    this.Email = JSON.stringify(this.interesadoForm.value.email);
    const comentarios = JSON.stringify(this.interesadoForm.value.comentarios);

    console.log('Esto es lo que vas enviar: ' + this.Telefono);

    const headers = {
      Authorization: 'Bearer ODc5MGZiZTI0ZGJkYmY4NGU4YzNkYWNhNzI1MTQ4YmQ=',
      accept: 'application/json'
    };

    const data = {
      prospect: {
        status: 'new',
        id: this.idMensajeLeads,
        requestdate: '2023-06-13 16:00:00',
        vehicle: {
          interest: 'buy',
          status: 'new',
          make: 'Nissan',
          year: '2023',
          model: this.AutoDeInteres
        },
        customer: {
          contact: {
            name: [
              {
                part: 'first',
                value: this.userName
              },
              {
                part: 'middle',
                value: this.apellidoPaterno
              },
              {
                part: 'last',
                value: this.apellidoMaterno
              }
            ],
            email: this.Email,
            phone: [this.Telefono]
          },
          comments: comentarios
        },
        vendor: {
          source: this.RedSocial,
          id: this.idDistribuidor,
          name: this.nombreDistribuidor
        }
      },
      provider: {
        name: this.RedSocial.replace(/\s/g, '')
      }
    };

    if (this.enviadoaseekop == false) {
      Swal.fire({
        title: '¿Desea enviar los datos hacia Seekop?',
        showDenyButton: true,
        confirmButtonText: `Enviar`,
        denyButtonText: `Cancelar`
      }).then(result => {
        if (result.isConfirmed) {
          const url = 'https://www.answerspip.com/apidms/dms/v1/rest/leads/adfv2';

          this.http.post<any>(url, data, { headers }).subscribe(
            response => {
              if (response == null) {
                Swal.fire({
                  icon: 'error',
                  title: 'Error',
                  text: 'Hubo un problema al enviar los datos hacia Seekop. Por favor, inténtalo más tarde.',
                  confirmButtonText: 'Ok'
                });
                this.modalDatos.close('Close click');
              } else {
                this.addNewProspecto();
                Swal.fire({
                  icon: 'success',
                  title: '¡Éxito!',
                  text: 'Se enviaron correctamente los datos a Seekop',
                  confirmButtonText: 'Ok'
                });
                this.newInteresadoForm = {
                  nombre: '',
                  apellidop: '',
                  apellidom: '',
                  telefono: '',
                  email: '',
                  comentarios: ''
                };
                this.modalDatos.close('Close click');
                this.modalService.dismissAll();
              }
            },
            error => {
              console.error(error);
              this.addNewProspecto();
              if (error == 'El Lead ya existe') {
                Swal.fire({
                  icon: 'error',
                  title: 'Error',
                  text: 'El leads ya existe en Seekop ...',
                  confirmButtonText: 'Entendido'
                });
                this.modalDatos.close('Close click');
                this.modalService.dismissAll();
              } else {
                Swal.fire({
                  icon: 'error',
                  title: 'Error',
                  text: 'Hubo un problema al enviar los datos hacia Seekop. Por favor, inténtalo más tarde.',
                  confirmButtonText: 'Entendido'
                });
                this.modalDatos.close('Close click');
                this.modalService.dismissAll();
              }
            }
          );
        }
      });
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'El leads ya existe en Seekop...',
        confirmButtonText: 'Entendido'
      });
      this.modalDatos.close('Close click');
      this.modalService.dismissAll();
    }
  }

  /**
   * Llama al endpoint para guardar prospecto como enviado
   */
  addNewProspecto() {
    const data = {
      enviarprospecto: this.idMensajeLeads,
      idpublicacion: this.IdPublicacionLead,
      idmensaje: this.idMensajeLeads,
      idDistribuidor: this.idDistribuidor,
      idredsocial: this.idRedSocial
    };

    console.log('data:', JSON.stringify(data));

    this.http
      .get<any>(
        `https://fhfl0x34wa.execute-api.us-west-1.amazonaws.com/dev/recuperarmsjs?enviarprospecto=${this.idMensajeLeads}&idpublicacion=${this.par_IdPublicacionLead}&idmensaje=${this.idMensajeLeads}&idDistribuidor=${this.par_idDistribuidor}&idredsocial=${this.par_idRedSocial}`
      )
      .toPromise()
      .then(res => {
        this.enviadoaseekop = JSON.parse(res.body.enviadoaseekop);
        console.log('res:', this.enviadoaseekop);
      })
      .catch(error => {
        console.error('Error al a:', error);
      });
  }

  /**
   * Validación del formulario
   */
  validateForm(): void {
    this.submitted = true;

    if (this.interesadoForm.valid) {
      this.submitted = true;
      this.confirmSend();
    } else {
      return console.log(this.interesadoForm.value);
    }
  }

  /**
   * Getter de acceso rápido para los controles del form de interesado
   */
  get f() {
    return this.interesadoForm.controls;
  }

  /**
   * Manejo de cambios en el input de teléfono y verificación
   */
  onInputChange(event: Event): void {
    const inputValue = (event.target as HTMLInputElement).value;
    console.log('Valor del input:', inputValue);

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': 'http://localhost:4200'
    });

    const fbylada = '52';
    const fbytelefono = inputValue;

    const apiUrl = `https://api.sicopweb.com/datamaster/dev/serialestelefonicos?fbylada=${fbylada}&fbytelefono=${fbytelefono}`;

    this.http.get(apiUrl).subscribe(
      data => {
        console.log('Datos recibidos:', data['correcto']);
        if (data['correcto'] == 1) {
          document.getElementById(
            'btnVerificado_' + this.idMensajeLeads
          ).style.display = 'block';
          document.getElementById(
            'btnNoVerificado_' + this.idMensajeLeads
          ).style.display = 'none';
        } else {
          document.getElementById(
            'btnNoVerificado_' + this.idMensajeLeads
          ).style.display = 'block';
          document.getElementById(
            'btnVerificado_' + this.idMensajeLeads
          ).style.display = 'none';
        }
      },
      error => {
        console.error('Error al obtener datos:', error);
      }
    );
  }

  /**
   * Detección de sentimiento
   */
  detectarSentimiento(idMensaje): Promise<void> {
    return new Promise((resolve, reject) => {
      const url = `https://fhfl0x34wa.execute-api.us-west-1.amazonaws.com/dev/detectarsentimiento?idPregunta=${idMensaje}`;
      this.http.get(url).subscribe(
        response => {
          console.log('Sentimiento detectado:', response);
          resolve();
        },
        error => {
          console.error('Error al detectar sentimiento:', error);
          reject(error);
        }
      );
    });
  }

  /**
   * Alternar visibilidad de contenedor Performance KPI
   */
  toggleContainerVisibility() {
    if (this.isContainerVisibleKPIs) {
      this.isContainerVisibleKPIs = false;
    }
    this.isContainerVisible = !this.isContainerVisible;
  }

  /**
   * Alternar visibilidad de contenedor KPI
   */
  toggleContainerVisibilityKPIs() {
    if (this.isContainerVisible) {
      this.isContainerVisible = false;
    }
    this.isContainerVisibleKPIs = !this.isContainerVisibleKPIs;
  }

  /**
   * Abre el modal de selección de Bot
   */
  openBotModal(content: any) {
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' });
  }

  /**
   * Activa el bot seleccionado
   */
  activateBot() {
    if (this.selectedBot) {
      this.botActive = true;
      console.log('Bot activado:', this.selectedBot);
    } else {
      console.log('No se ha seleccionado ningún bot');
    }
  }

  /**
   * Proponer mensaje desde Bot
   */
  proposeBotMessage() {
    const currentMessage = this.formData.get('message')!.value;
    const tipo = currentMessage ? 'mejora' : 'creacion';
    console.log('Tipo de mensaje:', tipo);

    this.enviarUltimosMensajes(tipo).subscribe(
      response => {
        console.log('Respuesta de la API:', response);
        this.formData.patchValue({ message: response.mensaje });
        this.updateTooltip();
      },
      error => {
        console.error('Error al enviar los mensajes:', error);
        alert('Hubo un error al obtener el mensaje del bot');
      }
    );
  }

  /**
   * Actualiza el tooltip del botón de Bot (crear/mejorar)
   */
  updateTooltip() {
    const currentMessage = this.formData.get('message')!.value;
    this.tooltipText = currentMessage
      ? 'Enriquecer mensaje'
      : 'Proponer mensaje';
  }

  /**
   * Envia los últimos mensajes del chat a la API para que el Bot genere respuesta
   */
  enviarUltimosMensajes(tipo: string) {
    const mensajesAgrupados = this.chat.slice(-20);

    const conversacion = {
      idProspecto: '123456789',
      idEjecutivo: '123456789',
      idDistribuidor: '123456789',
      messages: []
    };

    mensajesAgrupados.forEach(group => {
      group.prospects.forEach(prospect => {
        prospect.Conversacion.forEach(conversacionItem => {
          conversacion.messages.push({
            role: conversacionItem.align === 'right' ? 'ejecutivo' : 'prospecto',
            name: conversacionItem.name || prospect.Nombre,
            message: conversacionItem.texto
          });
        });
      });
    });

    const payload = {
      conversacion,
      mensaje: '',
      tipo: tipo
    };

    console.log('Payload enviado a la API:', payload);
    return this.chatService.enviarMensajes(payload, tipo);
  }

  /**
   * Método para descargar mensajes desde el motor de conversaciones
   */
  async descargarMensajesIniciales(): Promise<void> {
    if (!this.idDistribuidor) {
      console.warn('No hay idDistribuidor definido. No se descargan mensajes.');
      return;
    }
    const url = `https://uje1rg6d36.execute-api.us-west-1.amazonaws.com/dev/descargamensajes?idDistribuidor=${this.idDistribuidor}&plataforma=both&days=10`;

    this.isLoading = true;

    return new Promise((resolve, reject) => {
      this.http.get(url).subscribe({
        next: (resp: any) => {
          console.log('Mensajes descargados con éxito:', resp);
          resolve();
        },
        error: (err) => {
          console.error('Error al llamar a la API de descargamensajes:', err);
          reject(err);
        },
        complete: () => {
          this.isLoading = false;
        }
      });
    });
  }

  getHoraMensaje(msg: Conversacion): string {
    if (msg.time) return msg.time;
    let fecha: string | Date = msg.fechaRespuesta || msg.fechaCreacion;
    if (!fecha) return '';
    const fechaObj = fecha instanceof Date ? fecha : new Date(fecha);
    if (isNaN(fechaObj.getTime())) return '';
    return fechaObj.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
  }


}
