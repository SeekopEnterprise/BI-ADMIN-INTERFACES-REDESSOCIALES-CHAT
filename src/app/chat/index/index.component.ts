import { Component, OnInit, ViewChild, TemplateRef, Renderer2, ElementRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, Validators, FormGroup, FormControl} from '@angular/forms';
import { HttpClient, HttpHeaders  } from '@angular/common/http';

// import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

import { chat, groups } from './data';
import { Conversacion, ApiResponse, ResponseItem, Grupos, GroupedResponseItem, Interesado } from './chat.model';

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

declare var Highcharts: any;

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
  submitted= false;
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
  public LinkPublicacion: SafeResourceUrl | undefined;  // string;
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
  public chatByRedSocial: any = {}
  public vistaPorDistribuidor: boolean = true;
  public chatByDistributorThenRedSocial: any;
  public lastSentMessage = '';


  public par_IdPublicacionLead: string;
  public par_idDistribuidor: string;
  public par_idRedSocial: string;
  public isContainerVisible: boolean = false;
  public isContainerVisibleKPIs: boolean = false;

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

  lang: string;
  images: { src: string; thumb: string; caption: string }[] = [];

  constructor(private globalUserService: GlobalUserService, private notificacionService: NotificacionesService, private authFackservice: AuthfakeauthenticationService, private authService: AuthenticationService,
    private router: Router, private route: ActivatedRoute, public translate: TranslateService, private modalService: NgbModal, private offcanvasService: NgbOffcanvas,
    public formBuilder: FormBuilder, private datePipe: DatePipe, private lightbox: Lightbox, private http: HttpClient, private sanitizer: DomSanitizer, private renderer: Renderer2, private el: ElementRef) {
    this.formData = this.formBuilder.group({
      message: ['', [Validators.required]],
    });

    this.interesadoForm= this.formBuilder.group({
      nombre: ['', [Validators.required,Validators.maxLength(20)]],
      apellidoP: ['', [Validators.required,Validators.maxLength(20)]],
      apellidoM: ['', [Validators.required,Validators.maxLength(20)]],
      telefono: ['', [Validators.required,Validators.minLength(10),Validators.maxLength(10)]],
      email: ['', [Validators.required,Validators.email]],
      comentarios: ['', [Validators.required,Validators.maxLength(20)]],
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
          // Primero verifica si data.idMensaje existe para llamar a detectarSentimiento.
          const promesaSentimiento = data.idMensaje ? this.detectarSentimiento(data.idMensaje) : Promise.resolve();

          promesaSentimiento.then(() => {
            this.loadRecuperacionMensajes(data).then(() => {
              // Busca el chat para actualizar con el nuevo mensaje y actualiza el contador de mensajes no leídos
              const chatToUpdate = [].concat(...this.chat
                .map(group => group.prospects))
                .find(prospect => prospect.ultimoMensaje.id === data.idMensaje + "");

              /*    if (chatToUpdate) {
                   chatToUpdate.unreadCount = (chatToUpdate.unreadCount || 0) + 1;
                 } */

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

          });
        }
      });




    document.body.setAttribute('data-layout-mode', 'light');


    this.lang = this.translate.currentLang;
    this.onListScroll();
    this.loadScripts();
  }

  initiateChart() {
    // Función que se llama en el evento de renderizado del gráfico
    if (typeof Highcharts !== 'undefined') {
      function renderIcons() {
        this.series.forEach(series => {
          if (!series.icon) {
            series.icon = this.renderer
              .text(
                `<i class="fa fa-${series.options.custom.icon}"></i>`,
                0,
                0,
                true
              )
              .attr({
                zIndex: 10
              })
              .css({
                color: series.options.custom.iconColor,
                fontSize: '1.5em'
              })
              .add(this.series[2].group);
          }
          series.icon.attr({
            x: this.chartWidth / 2 - 15,
            y: this.plotHeight / 2 -
              series.points[0].shapeArgs.innerR -
              (
                series.points[0].shapeArgs.r -
                series.points[0].shapeArgs.innerR
              ) / 2 +
              8
          });
        });
      }

      // La configuración de colores y opacidad de las pistas del gráfico
      const trackColors = Highcharts.getOptions().colors.map(color =>
        new Highcharts.Color(color).setOpacity(0.3).get()
      );


      // Creación del gráfico
      Highcharts.chart('container', {

        chart: {
          type: 'solidgauge',
          height: '80%',
          events: {
            render: renderIcons
          }
        },

        title: {
          text: 'Perfomance Del Día',
          style: {
            fontSize: '24px'
          }
        },

        tooltip: {
          borderWidth: 0,
          backgroundColor: 'none',
          shadow: false,
          style: {
            fontSize: '16px'
          },
          valueSuffix: '%',
          pointFormat: '{series.name}<br>' +
            '<span style="font-size: 2em; color: {point.color}; ' +
            'font-weight: bold">{point.y}</span>',
          positioner: function (labelWidth) {
            return {
              x: (this.chart.chartWidth - labelWidth) - 150 ,
              y: (this.chart.plotHeight / 2) + 20
            };
          }
        },

        pane: {
          startAngle: 0,
          endAngle: 360,
          background: [
            {
              outerRadius: '100%',
              innerRadius: '90%',
              backgroundColor: Highcharts.color("#2caffe").setOpacity(1).get(), // Más transparente
              borderWidth: 0
            },
            {
              outerRadius: '90%',
              innerRadius: '80%',
              backgroundColor: Highcharts.color("#544fc5").setOpacity(0.10).get(), // Más transparente
              borderWidth: 0
            },
            {
              outerRadius: '80%',
              innerRadius: '70%',
              backgroundColor: Highcharts.color("#BC2866").setOpacity(0.10).get(), // Más transparente
              borderWidth: 0
            },
            {
              outerRadius: '70%',
              innerRadius: '60%',
              backgroundColor: Highcharts.color("#fe6a35").setOpacity(0.10).get(), // Más transparente
              borderWidth: 0
            },
            {
              outerRadius: '60%',
              innerRadius: '50%',
              backgroundColor: Highcharts.color("#f7f022").setOpacity(0.10).get(), // Más transparente
              borderWidth: 0
            }
          ]
        },

        yAxis: {
          min: 0,
          max: 100,
          lineWidth: 0,
          tickPositions: []
        },

        plotOptions: {
          solidgauge: {
            dataLabels: {
              enabled: false
            },
            linecap: 'round',
            stickyTracking: false,
            rounded: true
          }
        },
        legend: {
          with: "90px",
          verticalAlign: "middle",
          position: 'relative',
          margingTop: 10,
          margin: 10,
          top: 100,
          paddingTop: 50,
          align: 'left',
          layout: 'vertical',
          useHTML: true,
          color: 'black',
          labelFormatter: function () {
            return '<span style="border:1px; text-weight:bold;color:' + this.userOptions.color + ';">' + this.name + '</span>';
          },
          itemHiddenStyle: { "color": "#a3bd36" },
          symbolWidth: 60,
          //itemStyle:{"display": "none"},
          //itemCheckboxStyle:{"width": "13px", "height": "13px", "position":"absolute", "color": "#a3bd36"}
        },

        navigation: {
          buttonOptions: {
            symbolFill: "#a3bd36",
            symbolStroke: "#a3bd36"
          }
        },

        series: [
          {
            color: "#2caffe", // Azul para mensajes recibidos
            name: 'Mensajes Recibidos',
            data: [{
              color: "#2caffe",
              radius: '100%',
              innerRadius: '90%',
              y: 100 // Ejemplo: 200 mensajes recibidos
            }],
            custom: {
              icon: 'envelope',
              iconColor: '#303030'
            },
            showInLegend: true
          },
          {
            color: "#544fc5", // Verde para mensajes contestados
            name: 'Mensajes Contestados',
            data: [{
              color: "#544fc5",
              radius: '90%',
              innerRadius: '80%',
              y: 60 // Ejemplo: 180 mensajes contestados
            }],
            custom: {
              icon: 'comments-o',
              iconColor: '#ffffff'
            },
            showInLegend: true
          },
          {
            color: "#BC2866", // Rojo para mensajes no contestados
            name: 'Mensajes No Contestados',
            data: [{
              color: "#BC2866",
              radius: '80%',
              innerRadius: '70%',
              y: 40 // Ejemplo: 20 mensajes no contestados
            }],
            custom: {
              icon: 'commenting-o',
              iconColor: '#303030'
            },
            showInLegend: true
          },
          {
            color: "#fe6a35", // Naranja para mensajes negativos
            name: 'Mensajes Negativos',
            data: [{
              color: "#544fc5",
              radius: '70%',
              innerRadius: '60%',
              y: 20 // Ejemplo: 10 mensajes negativos
            }],
            custom: {
              icon: 'thumbs-down',
              iconColor: '#303030'
            },
            showInLegend: true
          },
          {
            color: "#f7f022", // Amarillo para mensajes positivos
            name: 'Mensajes Positivos',
            data: [{
              color: "#f7f022",
              radius: '60%',
              innerRadius: '50%',
              y: 67 // Ejemplo: 170 mensajes positivos
            }],
            custom: {
              icon: 'thumbs-up',
              iconColor: '#303030'
            },
            showInLegend: true
          }
        ]
        // ... (otras configuraciones)
      });

    } else {
      console.error('Highcharts no está definido');
    }
  }

  loadScripts() {
    this.loadScript('https://code.highcharts.com/highcharts.js', () => {
      this.loadScript('https://code.highcharts.com/highcharts-more.js', () => {
        this.loadScript('https://code.highcharts.com/modules/solid-gauge.js', () => {
          this.loadScript('https://code.highcharts.com/modules/exporting.js', () => {
            this.loadScript('https://code.highcharts.com/modules/export-data.js', () => {
              this.loadScript('https://code.highcharts.com/modules/accessibility.js', this.initiateChart);
            });
          });
        });
      });
    });
  }

  loadScript(src: string, onLoad: () => void) {
    const script = this.renderer.createElement('script');
    script.src = src;
    script.onload = onLoad;
    this.renderer.appendChild(this.el.nativeElement, script);
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

  onInputFocus() {
    if (this.activeChatId) {
      const activeChat = [].concat(...this.chat.map(group => group.prospects))
        .find(prospect => prospect.idPregunta === this.activeChatId);

      if (activeChat) {
        // Marca el mensaje como leído
        activeChat.unreadCount = 0;
        // Adicionalmente, lógica para comunicar al backend
        // que el mensaje ha sido leído, mover aquí
      }
    }
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
    this.enviadoaseekop == false
    console.log(id);
    this.activeChatId = id;
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
        if (prospect.ultimoMensaje.id === id) {
          // console.log("=========> "+JSON.stringify(prospect.Conversacion[0].id));
          IdUltimoMensaje.push(prospect.Conversacion);
        }

        return prospect.ultimoMensaje.id === id;
      });

    for (let key in IdUltimoMensaje[0]) {

      if (IdUltimoMensaje[0][key].ultimoMensaje == true) {
        // console.log("ultimoMensaje: "+IdUltimoMensaje[0][key].id);
        this.idMensajeLeads = IdUltimoMensaje[0][key].id;

      }
    }

    // console.log(Object.values(IdUltimoMensaje[0][0]))
    //
    data[0].unreadCount = 0;
    this.userName = data[0].Nombre;
    this.Distribuidor = data[0].NombreGrupo;
    this.RedSocial = data[0].redSocial
    this.Email = data[0].Email;
    this.IdPublicacionLead = data[0].IdPublicacion;
    this.urlPublicacion = data[0].urlpublicacion;
    // this.LinkPublicacion = "https://autos.mercadolibre.com.mx/#redirectedFromVip=https%3A%2F%2Fauto.mercadolibre.com.mx%2FMLM-1952360720-volkswagen-t-cross-2022-_JM";
    this.LinkPublicacion = this.sanitizer.bypassSecurityTrustResourceUrl("https://auto.mercadolibre.com.mx/MLM-1946997981-tiguan-comfortline-2023-_JM"); // (this.urlPublicacion);
    this.Telefono = data[0].Telefono; // this.sanitizer.bypassSecurityTrustResourceUrl
    this.apellidoPaterno = data[0].Apellido;
    // this.idMensajeLeads.push(data[0].IdProspecto);
    this.idDistribuidor = data[0].IdDistribuidor;
    this.nombreDistribuidor = data[0].NombreGrupo;

    this.idRedSocial = data[0]['idred'];
    // console.log("data: "+data[0]['idred']);

    // this.enviadoaseekop = true;

    this.userStatus = "En línea"
    this.userProfile = '';
    this.message = data[0].Conversacion
    this.selectedChatId = data[0].ultimoMensaje.id;
    this.onListScroll();


    const btnEnviarSeekop = document.getElementById("btnEnviarSeekop_" + this.idMensajeLeads);



    if (this.IdPublicacionLead == '') {
      this.par_IdPublicacionLead = null;
    } else {
      this.par_IdPublicacionLead = this.IdPublicacionLead;
    }
    if (this.idDistribuidor == '') {
      this.par_idDistribuidor = null;
    } else {
      this.par_idDistribuidor = this.idDistribuidor;
    }
    if (this.idRedSocial == '') {
      this.par_idRedSocial = null;
    } else {
      this.par_idRedSocial = this.idRedSocial;
    }

    const apiUrl = `https://fhfl0x34wa.execute-api.us-west-1.amazonaws.com/dev/recuperarmsjs?enviarprospecto=${this.idMensajeLeads}&idpublicacion=${this.par_IdPublicacionLead}&idmensaje=${this.idMensajeLeads}&idDistribuidor=${this.par_idDistribuidor}&idredsocial=${this.par_idRedSocial}&existe=true`;

    this.http.get(apiUrl).subscribe(response => {
      if (response && response['body']) {
        this.enviadoaseekop = response['body']['exists'];
        console.log("estatus envio: " + this.enviadoaseekop);
        if (this.enviadoaseekop) {
          // Deshabilitar el botón de enviar seekop
          btnEnviarSeekop?.setAttribute('disabled', 'true');
          // btnEnviarSeekop?.removeAttribute('tooltip');
          // btnEnviarSeekop?.setAttribute('title', 'Hello...');
          // btnEnviarSeekop?.setAttribute('title', 'This is a tooltip text.');
          document.getElementById('btnenviarleads_' + this.idMensajeLeads).style.display = 'none';
          document.getElementById('btnenviadoleads_' + this.idMensajeLeads).style.display = 'block';

          /* let clickTooltip: Tooltip = new Tooltip({
              opensOn: 'Click',
              content: 'Tooltip from click'
          });
          clickTooltip.appendTo('#'+btnEnviarSeekop);
          */


        } else {
          btnEnviarSeekop?.removeAttribute('disabled');
        }
      }
    }, error => {
      console.error("Hubo un error al obtener los datos de la API:", error);
    });

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

    // Verifica si el mensaje está vacío o es un duplicado del último mensaje enviado
    if (!message || message === this.lastSentMessage) {
      console.log("Mensaje duplicado o vacío, no se enviará.");
      return; // No continuar si el mensaje está vacío o es un duplicado
    }

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
    console.log("id actual: ", this.selectedChatId);
    console.log("chat: ", this.chat);
    const chatToUpdate = this.chat
      .map(group => group.prospects)
      .reduce((a, b) => a.concat(b), [])
      .find(prospect => prospect.ultimoMensaje.id === this.selectedChatId + "");

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

      this.lastSentMessage = message; // Actualiza el último mensaje enviado

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

          // Agrupar por red social y distribuidor
          const groupedByRedSocial = prospects.reduce((groups, prospect) => {
            const red = prospect.redSocial;
            if (!groups[red]) {
              groups[red] = {};
            }
            const grupo = this.groups.find(group => group.iddistribuidor == prospect.IdDistribuidor)?.nombredistribuidor || 'Sin Distribuidor';
            if (!groups[red][grupo]) {
              groups[red][grupo] = [];
            }
            groups[red][grupo].push(prospect);
            return groups;
          }, {});

          this.chatByRedSocial = groupedByRedSocial;

          // Agrupar por distribuidor, luego por red social
          const groupedByDistributorThenRedSocial = prospects.reduce((groups, prospect) => {
            const grupo = this.groups.find(group => group.iddistribuidor == prospect.IdDistribuidor)?.nombredistribuidor || 'Sin Distribuidor';
            const red = prospect.redSocial;

            if (!groups[grupo]) {
              groups[grupo] = {};
            }
            if (!groups[grupo][red]) {
              groups[grupo][red] = [];
            }

            groups[grupo][red].push(prospect);
            return groups;
          }, {});

          this.chatByDistributorThenRedSocial = groupedByDistributorThenRedSocial;

          // El código anterior para agrupar solo por distribuidor
          const grouped = prospects.reduce((groups, prospect) => {
            const grupo = this.groups.find(group => group.iddistribuidor == prospect.IdDistribuidor)?.nombredistribuidor || 'Sin Distribuidor';
            groups[grupo] = groups[grupo] || [];
            groups[grupo].push(prospect);
            return groups;
          }, {});

          this.chat = Object.keys(grouped).map(key => ({ key, prospects: grouped[key] }));

          // Ordena los grupos por fecha
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

    // this.interesadoForm.value);
    this.userName=JSON.stringify(this.interesadoForm.value.nombre);
    this.apellidoPaterno=JSON.stringify(this.interesadoForm.value.apellidoP);
    this.apellidoMaterno=JSON.stringify(this.interesadoForm.value.apellidoM);
    this.Telefono=JSON.stringify(this.interesadoForm.value.telefono);
    this.Email=JSON.stringify(this.interesadoForm.value.email);
    const comentarios=JSON.stringify(this.interesadoForm.value.comentarios);

    console.log("esto es lo que vas enviar: "+this.Telefono);
    
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
                "value": this.apellidoPaterno // "Vargas"
              },
              {
                "part": "last",
                "value": this.apellidoMaterno // "Chavez"
              }
            ],
            "email": this.Email, // "test@gmail.com", // this.Email, // "marino@gmail.com",
            "phone": [
              this.Telefono // "5511223344"
            ]
          },
          "comments": comentarios // " Prospecto enviado desde Mercado Libre de Comunity Manager  "
        },
        "vendor": {
          "source": this.RedSocial, // "MERCADOLIBRE",
          "id": this.idDistribuidor, // this.idDistribuidor,// 158814  "609024", // id distribuidor al que se asigan el prospecto
          "name": this.nombreDistribuidor,// "Suzuki Queretaro" // Nombre del distribuior
        }
      },
      "provider": {
        "name": (this.RedSocial.replace(/\s/g, '')) // "MERCADOLIBRE"
      }
    };

    // console.log("Estos son los datos a enviar: " + JSON.stringify(data));

    if (this.enviadoaseekop == false) {
      //alert("alert");
      //this.enviadoaseekop=true;

      Swal.fire({
        title: '¿Desea enviar los datos hacia Seekop?',
        showDenyButton: true,
        confirmButtonText: `Enviar`,
        denyButtonText: `Cancelar`,
      }).then((result) => {

        if (result.isConfirmed) {
          // this.addNewProspecto();
          // alert("alerta");
          console.log("Estos son los datos a enviar: " + JSON.stringify(data));
          const url = 'https://www.answerspip.com/apidms/dms/v1/rest/leads/adfv2';

          // if(this.enviadoaseekop==false){

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
                // this.enviadoaseekop = true;
                // const btnEnviarSeekop = document.getElementById("btnEnviarSeekop");
                // btnEnviarSeekop?.setAttribute('disabled', 'true');
                this.addNewProspecto();

                Swal.fire({
                  icon: 'success',
                  title: '¡Éxito!',
                  text: 'Se enviaron correctamente los datos a Seekop',
                  confirmButtonText: 'Ok'

                });

                this.newInteresadoForm={
                  nombre: "",
                  apellidop: "",
                  apellidom: "",
                  telefono: "",
                  email: "",
                  comentarios: ""
                }; 

                this.modalDatos.close('Close click');
                this.modalService.dismissAll();
              }
            },
            error => {
              console.error(error);
              this.addNewProspecto();
              // Muestra una alerta de error
              if (error == "El Lead ya existe") {
                Swal.fire({
                  icon: 'error',
                  title: 'Error',
                  text: 'El leads ya existe en Seekop ...',
                  confirmButtonText: 'Entendido'
                });

                this.modalDatos.close('Close click');
                this.modalService.dismissAll();

              }
              else {
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

    }
    else {
      // alert("else");

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

  addNewProspecto() {
    // enviarprospecto,idpublicacion,idmensaje,idDistribuidor,idredsocial
    let data = {
      "enviarprospecto": this.idMensajeLeads,
      "idpublicacion": this.IdPublicacionLead,
      "idmensaje": this.idMensajeLeads,
      "idDistribuidor": this.idDistribuidor,
      "idredsocial": this.idRedSocial
    };

    console.log("data: " + JSON.stringify(data));
    // console.log("esta es la url", `https://fhfl0x34wa.execute-api.us-west-1.amazonaws.com/dev/recuperarmsjs?enviarprospecto=${this.idMensajeLeads}&idpublicacion=${this.IdPublicacionLead}&idmensaje=${this.idMensajeLeads}&idDistribuidor=${this.idDistribuidor}&idredsocial=${this.idRedSocial}`)
    this.http.get<any>(`https://fhfl0x34wa.execute-api.us-west-1.amazonaws.com/dev/recuperarmsjs?enviarprospecto=${this.idMensajeLeads}&idpublicacion=${this.par_IdPublicacionLead}&idmensaje=${this.idMensajeLeads}&idDistribuidor=${this.par_idDistribuidor}&idredsocial=${this.par_idRedSocial}`)
      .toPromise()
      .then(res => {
        this.enviadoaseekop = JSON.parse(res.body.enviadoaseekop);
        console.log("res: " + this.enviadoaseekop);
      })
      .catch(error => {
        console.error('Error al a:', error);
      });
  }

  validateForm(): void{
    
    this.submitted = true;
    const var_inv= document.getElementsByClassName('ng-invalid');
    
    if (this.interesadoForm.valid) {

      this.submitted = true;
      // this.addNewSocial();
      // return true;
		}else {
      return console.log(this.interesadoForm.value);
		}
  }

  get f()  {
    return this.interesadoForm.controls;
  }

  onInputChange(event: Event): void {
    // Acceder al valor del input
    const inputValue = (event.target as HTMLInputElement).value;
    console.log('Valor del input:', inputValue);

    // const fbylada = '52';
    // const fbytelefono = '7226650170';

    // const apiUrl = `https://api.sicopweb.com/datamaster/dev/serialestelefonicos?fbylada=${fbylada}&fbytelefono=${fbytelefono}`;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': 'http://localhost:4200',
      // 'Connection': 'keep-alive',
      // 'Content-Length': '148',
      // 'x-amzn-RequestId': '33b6bc0d-346a-444e-9f04-973116be1505',
      // 'Host': '<calculated when request is sent>',
      // 'User-Agent': 'PostmanRuntime/7.36.1',
      // 'Accept': '*/*',
      // 'Accept-Encoding': 'gzip, deflate, br',
      // 'Connection': 'keep-alive',
      // 'Origin': 'http://localhost:4200'
      // 'x-amz-apigw-id': 'TCD2ZEDkyK4EDbg=',
      // 'X-Amzn-Trace-Id': 'Root=1-65ca4cf5-72253dee179cea001b8a51b8;Parent=5286178c7cb2851d;Sampled=0;lineage=40f10397:0',
    });

    const fbylada = '52';
    const fbytelefono = '7226650170';

const apiUrl = `https://api.sicopweb.com/datamaster/dev/serialestelefonicos?fbylada=${fbylada}&fbytelefono=${fbytelefono}`;

this.http.get(apiUrl).subscribe(
  (data) => {
    console.log('Datos recibidos:', data);
  },
  (error) => {
    console.error('Error al obtener datos:', error);
  }
);


  }

  

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

  toggleContainerVisibility() {
    if (this.isContainerVisibleKPIs) {
      this.isContainerVisibleKPIs = false;
    }
    this.isContainerVisible = !this.isContainerVisible;
    this.loadScripts();
  }

  toggleContainerVisibilityKPIs() {
    if (this.isContainerVisible) {
      this.isContainerVisible = false;
    }
    this.isContainerVisibleKPIs = !this.isContainerVisibleKPIs;
  }



}


