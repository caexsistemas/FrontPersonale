/**
    * @description      : 
    * @author           : Maricel Jimenez
    * @group            : 
    * @created          : 30/07/2021 - 14:41:42
    *    
**/
import { Component, ViewEncapsulation } from '@angular/core';
import { LoginServices } from '../../services/login.service';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { User } from '../../models/users';
import { Tools } from '../../Tools/tools.page'
import { EncryptService } from '../../services/encrypt.service';
import { WebApiService } from '../../services/web-api.service';
import { from } from 'rxjs';
import Swal from 'sweetalert2';
import { FormGroup,FormControl,Validators } from '@angular/forms';


@Component({
  selector: 'app-dashboard',
  templateUrl: 'login.component.html',
  providers: [LoginServices, Tools]
})
export class LoginComponent {
  public loginData: User;
  public status: string;
  public identity: any;
  public token: any;
  public isLogged : boolean;
  public cuser : any;

  public loading : boolean = false;
  validateUser = false;



  viewMessage : boolean = false;
  view : string = 'login';



  loginForm : FormGroup;

  constructor(private _loginService: LoginServices,
    private _router: Router,
    private _route: ActivatedRoute,
    private _tools: Tools,
    private WebApiService : WebApiService,
    private Encrypt: EncryptService
  ) {

    this.loginData = new User(1, "", "", "", "", "", 0)
  }


  ngOnInit(): void {
    this.checkSession();
    this.initForm(this.view);
  }

  checkSession(){
    // ejecutar consulta al servidor para verificar si el token es valido aun...
    this.cuser = JSON.parse(localStorage.getItem('currentUser'));
    if(this.cuser!= null){
      this.WebApiService.token = this.cuser.token;
      if(this.cuser.user != null && this.cuser.token != null && this.cuser.username != null){
        this._router.navigate(['/dashboard']);
        this.isLogged = true;
      }
    }
  }


  initForm(type:string){
    switch(type){
      case 'login':
        this.loginForm = new FormGroup({
          fuser:      new FormControl('', [Validators.required]),
          fpass:      new FormControl('', Validators.required)
        });
      break;
    }
  }




  onSubmit() {
    this.validateUser = true


    this._loginService.login(this.loginData).subscribe(
      response => {
        this.identity = response.resultado.response;
        this.token = response.resultado.token;
        // PERSISTIR USUARIO
        localStorage.setItem('identity', JSON.stringify(this.identity));
        localStorage.setItem('token', JSON.stringify(this.token));

        // redrigir pagina
        this._router.navigate(['./dashboard']);
      },
      error => {
        console.log(error);
        if (error.status == 500) {
          this._tools.showNotify("error", "PERSONALE", "Error interno")
        }
        if (error.status == 404) {
          this._tools.showNotify("error", "PERSONALE", <any>error.error.resultado)
        }
      }
    );
  }

  signin(){

    if(this.loginForm.valid){
      let body = {
        fuser:  this.loginForm.get('fuser').value.toLowerCase(),
        fpass:  this.Encrypt.encrypt(this.loginForm.get('fpass').value)
      }
      this.loading = true;
      this.WebApiService.postRequest('/login',body,{
      })
      .subscribe(
        data=>{
          if(data.success == true){
            // seteo localstorage.
            let objData = {
              token: data.token,
              user: data.user,
              username: data.username,
              action: data.action
            }
            console.log(objData);
            localStorage.setItem('currentUser',JSON.stringify(objData));
            localStorage.setItem('isLogged','true');
            this.WebApiService.token = data.token;
            this._tools.isLogged = true;
            this._router.navigate(['/dashboard']);
          }else{
            this.loading = false;
            this._tools.isLogged = false;
            Swal.fire({
              title: '',
              text: data.message,
              icon:'warning'
            })
          }
        },
        error=>{
          this.loading = false;
          this._tools.isLogged = false;
          console.error(error);
        }
      )
    }else{
      this.viewMessage = true;
    }
  }



}
