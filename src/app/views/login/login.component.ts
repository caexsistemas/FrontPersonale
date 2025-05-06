/**
 * @description      :
 * @author           : Maricel Jimenez
 * @group            :
 * @created          : 30/07/2021 - 14:41:42
 *
 **/
import { Component, ViewEncapsulation } from "@angular/core";
import { LoginServices } from "../../services/login.service";
import { Router, ActivatedRoute } from "@angular/router";
import { User } from "../../models/users";
import { Tools } from "../../Tools/tools.page";
import { EncryptService } from "../../services/encrypt.service";
import { WebApiService } from "../../services/web-api.service";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { HandlerAppService } from "../../services/handler-app.service";
import { environment } from "../../../environments/environment";
import Swal from "sweetalert2";
import { IpService } from "../../services/ip.service";
import { HttpClient } from "@angular/common/http";

@Component({
  selector: "app-dashboard",
  templateUrl: "login.component.html",
  styleUrls: ["./login.component.css"],
  providers: [LoginServices, Tools],
})
export class LoginComponent {

  public hidePassword: boolean = true;

  public loginData: User;
  public status: string;
  public identity: any;
  public token: any;
  public isLogged: boolean;
  public cuser: any;
  hide = true;

  public loading: boolean = false;
  validateUser = false;

  viewMessage: boolean = false;
  view: string = "login";

  loginForm: FormGroup;
  backgroundImageUrl: string;

  _username: string = '';
  _token: string = '';
  _isForBoss: boolean;

  constructor(
    private _loginService: LoginServices,
    private _router: Router,
    private _route: ActivatedRoute,
    private _tools: Tools,
    private WebApiService: WebApiService,
    private Encrypt: EncryptService,
    public handler: HandlerAppService,
    private ipService: IpService,
    private http: HttpClient
  ) {
    this.loginData = new User(1, "", "", "", "", "", 0);
  }

  ngOnInit(): void {
  
    this.checkSession();
    this.initForm(this.view);

    if (environment.url.length <= 25) {
      this.backgroundImageUrl = '/assets/img/brand/sistema.JPG';
    } else {
      this.backgroundImageUrl = '/360/assets/img/brand/sistema.JPG';
    }

    this._route.queryParams.subscribe(params => {
      const username = params['username'];
      const token = params['token'];

      if (username && token) {
        this.closeSession(username, token);
      }
    });
  }

  closeSession(username, token): void {
    const body = {
      username: username,
      token: token,
    };
  
    this.WebApiService.postRequest('/authorize-close-session', body, {}).subscribe({
      next: (response: any) => {
        Swal.fire('Éxito', response.message, 'success');
      },
      error: (error) => {
        console.error('Error al autorizar:', error);
  
        // Si el backend responde con un mensaje personalizado
        const errorMessage = error?.error?.message || 'No se pudo autorizar el cambio.';
        Swal.fire('Error', errorMessage, 'error');
      }
    });

    this._router.navigate(['/login']);

  }

  checkSession() {
    // ejecutar consulta al servidor para verificar si el token es valido aun...
    this.cuser = JSON.parse(localStorage.getItem("currentUser"));

    //console.log(localStorage.getItem('currentUser'));
    if (this.cuser != null) {
      this.WebApiService.token = this.cuser.token;
      if (
        this.cuser.user != null &&
        this.cuser.token != null &&
        this.cuser.username != null
      ) {
        this._router.navigate(["/dashboard"]);
        this.isLogged = true;
      }
    }
  }

  initForm(type: string) {
    switch (type) {
      case "login":
        this.loginForm = new FormGroup({
          fuser: new FormControl("", [Validators.required]),
          fpass: new FormControl("", Validators.required),
        });
        break;
    }
  }

  onSubmit() {
    this.validateUser = true;

    this._loginService.login(this.loginData).subscribe(
      (response) => {
        this.identity = response.resultado.response;
        this.token = response.resultado.token;
        // PERSISTIR USUARIO
        localStorage.setItem("identity", JSON.stringify(this.identity));
        localStorage.setItem("token", JSON.stringify(this.token));
        localStorage.setItem("cantNoti", "0");

        // redrigir pagina
        this._router.navigate(["./dashboard"]);
      },
      (error) => {
        //console.log(error);
        if (error.status == 500) {
          this._tools.showNotify("error", "PERSONALE", "Error interno");
        }
        if (error.status == 404) {
          this._tools.showNotify(
            "error",
            "PERSONALE",
            <any>error.error.resultado
          );
        }
      }
    );
  }

  signin() {
    if (this.loginForm.valid) {
      let body = {
        fuser: this.loginForm.get("fuser").value,
        fpass: this.Encrypt.encrypt(this.loginForm.get("fpass").value),
        platform: 'web' 
      };
      //console.log('++++++++')
      //console.log(body);
      //console.log(this.Encrypt.encrypt(this.loginForm.get('fpass').value));

      this.loading = true;
      this.WebApiService.postRequest("/login", body, {}).subscribe(
        (data) => {
          if (data.success == true && data.info == false) {
            // seteo localstorage.
            let objData = {
              token: data.token,
              user: data.user,
              username: data.username,
              action: data.action,
              userProfile: data.userProfile,
              role: data.rol,
              iduser: data.iduser,
              idPersonale: data.idPersonale, //+
              matrizarp: data.matrizarp,
              us_red: data.us_red,
              campana: data.campana 
            };
            //console.log(data)
            localStorage.setItem("currentUser", JSON.stringify(objData));
            localStorage.setItem("isLogged", "true");
            this.WebApiService.token = data.token;
            this._tools.isLogged = true;
            this.getIpUser(data.idPersonale);
            this._router.navigate(["/dashboard"]);
          } else if(data.success == true && data.info == true) {
            this.loading = false;
            this._tools.isLogged = false;
            this.loginForm.get("fpass").setValue("");
            this.handler.showInfo(data.message, data.title, '#/login');
          }else{
            this.loading = false;
            this._tools.isLogged = false;
            this.loginForm.get("fpass").setValue("");
            this.handler.shoWarning('¡Atención!', data.message);
          }
        },
        (error) => {
          this.loading = false;
          this._tools.isLogged = false;
          this.loginForm.get("fpass").setValue("");
          //console.error(error);
        }
      );
    } else {
      this.viewMessage = true;
    }
  }

  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }

  getIpUser(values){

    this.ipService.getIpInfo().subscribe((data: any) => {
      let body = {
        ip_real: data.ip,
        region: data.region,
        ciudad: data.city,
        isp: data.org,
        idPersonale: values
      };

      this.WebApiService.postRequest('/ipUser', body, {}).subscribe(() => console.log('true'));
    });

  }

  onClickForgetPassword() {
    Swal.fire({
      title: '¿Has olvidado tu contraseña?',
      text: 'Ingrese su usuario para recibir el enlace en su correo corporativo',
      input: 'number',
      inputPlaceholder: 'Ingrese su Usuario',
      showCancelButton: true,
      cancelButtonText: 'Cancelar',
      confirmButtonText: 'Enviar correo',
      inputValidator: (value) => {
        if (!value) return 'Debe ingresar su Documento de Identidad';
      }
    }).then((result) => {
      if (result.isConfirmed) {
        this.sendEmailForgetPassword(result.value);
      }
    });
  }
  
  sendEmailForgetPassword(username: string) {
    // Mostrar SweetAlert de carga
    Swal.fire({
      title: 'Enviando correo...',
      text: 'Por favor espera un momento',
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
  
    this.WebApiService.postRequest('/login/forget-password', { username }, {}).subscribe(
      (response: any) => {
        Swal.close(); // Cierra el loading
  
        if (response.status === 'success') {
          Swal.fire({
            icon: 'success',
            title: 'Correo enviado',
            text: response.message,
            confirmButtonText: 'Aceptar'
          });
        } else {
          Swal.fire({
            icon: 'warning',
            title: 'Atención',
            text: response.message || 'Hubo un problema al enviar el correo.',
            confirmButtonText: 'Aceptar'
          });
        }
      },
      (error) => {
        Swal.close(); // Cierra el loading
  
        const errorMsg = error?.error?.message || 'Ocurrió un error inesperado. Intenta más tarde.';
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo enviar el correo. ' + errorMsg,
          confirmButtonText: 'Aceptar'
        });
      }
    );
  }
  
  onClickCloseSession() {
    Swal.fire({
      title: '¿Has dejado tu sesión iniciada?',
      text: 'Ingrese su usuario para recibir el enlace de cierre de sesión en su correo corporativo',
      input: 'number',
      inputPlaceholder: 'Ingrese su Usuario',
      showCancelButton: true,
      cancelButtonText: 'Cancelar',
      confirmButtonText: 'Enviar correo',
      inputValidator: (value) => {
        if (!value) return 'Debe ingresar su Documento de Identidad';
      }
    }).then((result) => {
      if (result.isConfirmed) {
        this.sendEmailCloseSession(result.value);
      }
    });
  }
  
  sendEmailCloseSession(username: string) {
    // Mostrar SweetAlert de carga
    Swal.fire({
      title: 'Enviando correo...',
      text: 'Por favor espera un momento',
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
  
    this.WebApiService.postRequest('/login/close-session', { username }, {}).subscribe(
      (response: any) => {
        Swal.close(); // Cierra el loading
  
        if (response.status === 'success') {
          Swal.fire({
            icon: 'success',
            title: 'Correo enviado',
            text: response.message,
            confirmButtonText: 'Aceptar'
          });
        } else {
          Swal.fire({
            icon: 'warning',
            title: 'Atención',
            text: response.message || 'Hubo un problema al enviar el correo.',
            confirmButtonText: 'Aceptar'
          });
        }
      },
      (error) => {
        Swal.close(); // Cierra el loading
  
        const errorMsg = error?.error?.message || 'Ocurrió un error inesperado. Intenta más tarde.';
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo enviar el correo. ' + errorMsg,
          confirmButtonText: 'Aceptar'
        });
      }
    );
  }
  
  
}
