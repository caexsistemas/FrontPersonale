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

import { from } from 'rxjs';


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
  validateUser = false;



  constructor(private _loginService: LoginServices,
    private _router: Router,
    private _route: ActivatedRoute,
    private _tools: Tools,
  ) {

    this.loginData = new User(1, "", "", "", "", "", 0)
  }
  onSubmit() {
    this.validateUser = true


    this._loginService.login(this.loginData).subscribe(
      response => {
        console.log(response)
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
  logout() {
    this._route.params.subscribe(params => {
      let logout = +params['sure'];
      if (logout == 1) {
        localStorage.removeItem('identity');
        localStorage.removeItem('token');

        this.identity = null;
        this.token = null
        // redrigir pagina
        this._router.navigate(['./login']);
      }
    })
  }

}
