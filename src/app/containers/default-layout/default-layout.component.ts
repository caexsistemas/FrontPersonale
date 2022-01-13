import {Component} from '@angular/core';
import { Tools } from '../../Tools/tools.page';
import { navItems } from '../../_nav';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { WebApiService } from '../../services/web-api.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './default-layout.component.html',
  providers:[Tools]
})
export class DefaultLayoutComponent  {
  public sidebarMinimized = false;
  public navItems = navItems;
  public identity;
  public token;
  public isLogged : boolean;
  public cuser : any;

  constructor(private _tools: Tools,
              private _router: Router,
              private WebApiService : WebApiService,){    

      
      this.identity=_tools.getIdentity();
      this.token=_tools.getToken();
      
      
     if(this.token==null){
        this._tools.goToPage('login')
      }
  }

  ngOnInit(): void {
    this.checkSession();
  }

  checkSession(){
    // ejecutar consulta al servidor para verificar si el token es valido aun...
    this.cuser = JSON.parse(localStorage.getItem('currentUser'));
    if(this.cuser!= null){
      this.WebApiService.token = this.cuser.token;
      if(this.cuser.user != null && this.cuser.token != null && this.cuser.username != null){
        let route = window.location.pathname;
        if(route == "/"){
          this._router.navigate(['dashboard']);
        }else{
          this._router.navigate([route]);
        }
        this.isLogged = true;
      }else{
        this.isLogged = false;
        this._router.navigate(['/login']);
      }
    }else{
      this.isLogged = false;
      let search;
      let filter = {};
      if(window.location.search != ""){
        search = window.location.search.replace('?','');
        search = search.split('&');
        search.forEach(element => {
          let aux = element.split('=');
          filter[aux[0]] = aux[1];
        });
        this._router.navigate(['/login'],{queryParams:filter});
      }else{
        this._router.navigate(['/login']);
      }
    }
  }
  
  logout() {
        this.isLogged = false;
        this.cuser =  null;
        localStorage.removeItem('isLogged');
        localStorage.removeItem('currentUser');
        this._router.navigate(['/']);
  }
  
  toggleMinimize(e) {
    this.sidebarMinimized = e;
  }
  
}
