import { Component, Injectable } from '@angular/core';
import { Tools } from '../../Tools/tools.page';
import { navItems } from '../../_nav';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { WebApiService } from '../../services/web-api.service';
import { INavData } from '@coreui/angular';
import { HandlerAppService } from '../../services/handler-app.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  templateUrl: './default-layout.component.html',
  providers: [Tools]
})

export class DefaultLayoutComponent {
  public sidebarMinimized = false;
  // public navItems = navItems;
  public identity;
  public token;
  public isLogged: boolean;
  public cuser: any;
  public role: any;
  public loading: boolean;
  public menu: any;
  public item: any;
  public subitem: any;
  endpoint: string = '/menu';



  // public navItems: INavData[] = [
  //   {
  //     name: 'TH 360',
  //     url: '/dashboard',
  //     icon: 'icon-speedometer'
  //   },
  //   {
  //     title: true, 
  //     name: ''
  //   },
  //   {
  //     name: 'Administrador',
  //     url: '/admin',
  //     icon: 'icon-settings',
  //     children: [
  //       {
  //         name: 'Usuarios',
  //         url: '/admin/users',
  //         icon: ''
  //       }]
  //   },
  //   {
  //     name: 'Administrador',
  //     url: '',
  //     icon: 'icon-settings',
  //     children: [
  //       {
  //         name: 'Usuarios',
  //         url: '/admin/users',
  //         icon: ''
  //       }]
  //   }
  // ]

  public navItems;

  constructor(private _tools: Tools,
    private _router: Router,
    private WebApiService: WebApiService,
    private handler: HandlerAppService) {


    this.identity = _tools.getIdentity();
    this.token = _tools.getToken();
    this.cuser = localStorage.getItem('currentUser');
  }

  ngOnInit(): void {
    this.checkSession();
    this.sendRequest();
  }

  sendRequest() {

    this.WebApiService.postRequest(this.endpoint, this.cuser, {})
      .subscribe(
        response => {
          // this.permissions = this.handler.getPermissions(this.component);
          if (response.success) {
            this.item = response.data[0];
            this.subitem = response.data[1];
            this.navItems = this.checkMenu(this.item, this.subitem)
            this.loading = false;
          } else {
            this.handler.handlerError(response);
          }
        },
        error => {
          this.loading = false;
          // this.permissions = this.handler.getPermissions(this.component);
          // this.handler.showError();
        }
      );
  }

  checkMenu(item, subitem) {
    var option = [];

    var optionItem;
    var optionSubitem;
    var op = {
      name: 'TH 360',
      url: '/dashboard',
      icon: 'icon-speedometer',
    }
    var title = {
      title: true,
      name: ''
    }
    option.push(op);
    option.push(title);

    item.forEach(function (value) {
      var children = [];
      subitem.forEach(function (row) {
        if (value.id == row.item) {
          optionSubitem = {
            name: row.name,
            url: row.url,
            icon: '',
          }
          children.push(optionSubitem);
        }

      });
      optionItem = {
        name: value.item,
        url: '/admin',
        icon: value.icon,
        children: children
      }
      option.push(optionItem);
    });
    return option;

  }

  checkSession() {
    // ejecutar consulta al servidor para verificar si el token es valido aun...
    this.cuser = JSON.parse(localStorage.getItem('currentUser'));
    if (this.cuser != null) {
      this.WebApiService.token = this.cuser.token;
      if (this.cuser.user != null && this.cuser.token != null && this.cuser.username != null) {
        let route = window.location.pathname;
        if (route == "/") {
          this._router.navigate(['dashboard']);
        } else {
          this._router.navigate([route]);
        }
        this.isLogged = true;
      } else {
        this.isLogged = false;
        this._router.navigate(['/login']);
      }
    } else {
      this.isLogged = false;
      let search;
      let filter = {};
      if (window.location.search != "") {
        search = window.location.search.replace('?', '');
        search = search.split('&');
        search.forEach(element => {
          let aux = element.split('=');
          filter[aux[0]] = aux[1];
        });
        this._router.navigate(['/login'], { queryParams: filter });
      } else {
        this._router.navigate(['/login']);
      }
    }
  }

  logout() {
    this.isLogged = false;
    this.cuser = null;
    localStorage.removeItem('isLogged');
    localStorage.removeItem('currentUser');
    this._router.navigate(['/']);
  }

  toggleMinimize(e) {
    this.sidebarMinimized = e;
  }







}
