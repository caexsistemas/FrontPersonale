import {
  Component,
  ComponentFactoryResolver,
  Injectable,
  OnInit,
  ViewEncapsulation,
} from "@angular/core";
import { Tools } from "../../Tools/tools.page";
import { navItems } from "../../_nav";
import { Router, ActivatedRoute, Params } from "@angular/router";
import { WebApiService } from "../../services/web-api.service";
import { INavData } from "@coreui/angular";
import { HandlerAppService } from "../../services/handler-app.service";
import { Observable } from "rxjs";
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from "@angular/material/dialog";
import { NotificationDialog } from "../../dialogs/notification/notification.dialog.component";

@Component({
  selector: "app-dashboard",
  templateUrl: "./default-layout.component.html",
  styleUrls: ["./default-layout.component.css"],
  encapsulation: ViewEncapsulation.None,
  providers: [Tools],
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
  endpoint: string = "/menu";
  public permissions: any[] = Array();
  public userLogin: any;
  public checktoken: boolean;
  public conteNotifi: number;
  public absNotification: any;
  public mailNotification: any;
  public icoNoti: string = "cui-bell";
  component = "/procesalud/absenteeisms";
  endpointAbs: string = "/validationAbs";
  endpoinMail: string = "/notifimail";
  endaware: string = "/aware";

  hidden = true;

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

  constructor(
    private _tools: Tools,
    private _router: Router,
    private WebApiService: WebApiService,
    public dialog: MatDialog,
    private handler: HandlerAppService
  ) {
    this.identity = _tools.getIdentity();
    this.token = _tools.getToken();
    this.cuser = localStorage.getItem("currentUser");
    this.userLogin = JSON.parse(localStorage.getItem("currentUser"));
  }

  ngOnInit(): void {
    this.checkToken();
    this.checkSession();
    this.sendRequest();
    this.RecarNotification();
  }

  sendRequest() {
    this.WebApiService.postRequest(this.endpoint, this.cuser, {}).subscribe(
      (response) => {
        // this.permissions = this.handler.getPermissions(this.component);
        if (response.success) {
          this.item = response.data[0];
          this.subitem = response.data[1];
          this.navItems = this.checkMenu(this.item, this.subitem);
          this.handler.permissions = this.getpermissionsSaved(this.subitem);
          this.loading = false;
        } else {
          this.handler.handlerError(response);
        }
      },
      (mistake) => {
        let msjErr = "Tu sesión se ha cerrado o el Módulo presenta alguna Novedad";
        //let msjErr = mistake.error.message;
        this.handler.showError(msjErr);
        this.loading = false;
      }
    );
  }

  getpermissionsSaved(subitem) {
    var permision: any[] = Array();
    subitem.forEach(function (row) {
      let perm = row.perm;
      perm = perm.split("|");
      permision[row.url] = perm;
    });

    return permision;
  }

  checkMenu(item, subitem) {
    var option = [];

    var optionItem;
    var optionSubitem;
    var op = {
      name: "TH 360 / " + this.userLogin.userProfile + "",
      url: "/dashboard",
    };

    var title = {
      title: true,
      name: this.userLogin.user,
    };
    option.push(op);
    option.push(title);

    item.forEach(function (value) {
      var children = [];
      subitem.forEach(function (row) {
        if (value.id == row.item) {
          optionSubitem = {
            name: row.name,
            url: row.url,
            icon: "",
          };
          children.push(optionSubitem);
        }
      });
      optionItem = {
        name: value.item,
        url: "/admin",
        icon: value.icon,
        children: children,
      };
      option.push(optionItem);
    });

    return option;
  }

  checkSession() {
    // ejecutar consulta al servidor para verificar si el token es valido aun...
    this.cuser = JSON.parse(localStorage.getItem("currentUser"));
    //Variables
    let body = {
      iduser: this.cuser.iduser,
      token: this.cuser.token,
      role: this.cuser.rol,
    };

    //Validar Informacion del token
    if (this.cuser != null) {
      this.WebApiService.postRequest("/checktoken", body, {}).subscribe(
        (response) => {
          if (
            this.cuser.user != null &&
            this.cuser.token != null &&
            this.cuser.username != null &&
            response.success
          ) {
            let route = window.location.pathname;
            if (route == "/") {
              this._router.navigate(["dashboard"]);
            } else {
              this._router.navigate([route]);
            }
            this.isLogged = true;
          } else {
            this.isLogged = false;
            this.cuser = null;
            localStorage.removeItem("isLogged");
            localStorage.removeItem("currentUser");
            this._router.navigate(["/"]);
            this.handler.handlerError(response.message);
          }
        },
        (error) => {
          this.isLogged = false;
          this.cuser = null;
          localStorage.removeItem("isLogged");
          localStorage.removeItem("currentUser");
          this._router.navigate(["/"]);
          this.handler.handlerError("(E): " + error.message);
        }
      );
    } else {
      this.isLogged = false;
      let search;
      let filter = {};
      if (window.location.search != "") {
        search = window.location.search.replace("?", "");
        search = search.split("&");
        search.forEach((element) => {
          let aux = element.split("=");
          filter[aux[0]] = aux[1];
        });
        this._router.navigate(["/login"], { queryParams: filter });
      } else {
        this._router.navigate(["/login"]);
      }
    }
  }

  logout() {
    let body = {
      idPersonale: this.cuser.idPersonale,
      iduser: this.cuser.iduser,
      role: this.cuser.role,
      token: this.cuser.token,
      username: this.cuser.username,
    };
    //Limpieza
    this.isLogged = false;
    this.cuser = null;

    this.WebApiService.postRequest("/logout", body, {}).subscribe(
      (response) => {
        if (response.success) {
          this.handler.showSuccess(
            "Sesión culminada con éxito, gracias hasta pronto."
          );
        } else {
          this.handler.handlerError("Error: " + response);
        }
      },
      (error) => {
        this.loading = false;
        this.handler.showError(error.message);
      }
    );

    localStorage.removeItem("isLogged");
    localStorage.removeItem("currentUser");
    this._router.navigate(["/"]);
  }

  checkToken() {}

  toggleMinimize(e) {
    this.sidebarMinimized = e;
  }

  RecarNotification() {
    // this.aware(this.WebApiService);
    this.checkNotification(this.WebApiService);
    this.validationAbs(this.WebApiService);
    this.notifimail(this.WebApiService);
    setTimeout(() => {
      // Recargar Notificaciones - 5 Seg cui-account-logout / icoNoti / cui-bell
      this.icoNoti = "fa fa-spinner fa-spin";
      setTimeout(() => {
        this.RecarNotification();
      }, 1000);
    }, 300000);
    // }, 20000);
  }

  toggleBadgeVisibility() {
    this.hidden = true;

    this.cuser = JSON.parse(localStorage.getItem("currentUser"));
    var dialogRef;

    this.loading = true;
    dialogRef = this.dialog.open(NotificationDialog, {
      data: {
        window: "view",
        iduser: this.cuser.iduser,
      },
    });
    dialogRef.disableClose = true;
    // LOADING
    dialogRef.componentInstance.loading.subscribe((val) => {
      this.loading = val;
    });
    // RELOAD
    dialogRef.componentInstance.reload.subscribe((val) => {
      this.sendRequest();
    });
  }

  checkNotification(WebApiService: WebApiService) {
    // ejecutar consulta al servidor para verificar si el token es valido aun...
    this.icoNoti = "cui-bell";
    this.cuser = JSON.parse(localStorage.getItem("currentUser"));
    //Variables
    let body = {
      iduser: this.cuser.iduser,
      token: this.cuser.token,
      role: this.cuser.role,
    };

    WebApiService.postRequest("/checknotification", body, {}).subscribe(
      (response) => {
        if (response.success) {
          this.conteNotifi = response.data["cont"][0]["conteo"];
          if (this.conteNotifi > 0) {
            this.hidden = false;
          } else {
            this.hidden = true;
          }
        } else {
          this.isLogged = false;
          this.handler.handlerError(response.message);
        }
      },
      (error) => {
        this.isLogged = false;
        this.handler.handlerError("(E): " + error.message);
      }
    );
  }
  validationAbs(WebApiService: WebApiService) {
    // ejecutar consulta al servidor para verificar si el token es valido aun...
    this.icoNoti = "cui-bell";
    this.cuser = JSON.parse(localStorage.getItem("currentUser"));

    WebApiService.getRequest(this.endpointAbs, {
      action: "disciplinary",
      iduser: this.cuser.iduser,
      token: this.cuser.token,
      role: this.cuser.role,
      modulo: this.component,
    }).subscribe(
      (response) => {
        if (response) {
          // this.conteNotifi = response.data["cont"][0]["conteo"];
          this.absNotification = response.data;

          // if (this.conteNotifi > 0) {
          //   this.hidden = false;
          // } else {
          //   this.hidden = true;
          // }
        } else {
          this.isLogged = false;
          // this.handler.handlerError(response.message);
        }
      },
      (error) => {
        this.isLogged = false;
        // this.handler.handlerError("(E): " + error.message);
      }
    );
  }
  aware(WebApiService: WebApiService) {
    // ejecutar consulta al servidor para verificar si el token es valido aun...
    this.icoNoti = "cui-bell";
    this.cuser = JSON.parse(localStorage.getItem("currentUser"));

    WebApiService.getRequest(this.endaware, {
      // action: "disciplinary",
      iduser: this.cuser.iduser,
      token: this.cuser.token,
      role: this.cuser.role,
      // modulo: this.component,
    }).subscribe(
      (response) => {
        if (response) {
          // this.conteNotifi = response.data["cont"][0]["conteo"];
          this.absNotification = response.data;

          // if (this.conteNotifi > 0) {
          //   this.hidden = false;
          // } else {
          //   this.hidden = true;
          // }
        } else {
          this.isLogged = false;
          // this.handler.handlerError(response.message);
        }
      },
      (error) => {
        this.isLogged = false;
        // this.handler.handlerError("(E): " + error.message);
      }
    );
  }

notifimail(WebApiService: WebApiService)
 {
  this.icoNoti = "cui-bell";
  this.cuser = JSON.parse(localStorage.getItem("currentUser"));

  WebApiService.getRequest(this.endpoinMail, {
    // action: "disciplinary",
    iduser: this.cuser.iduser,
    token: this.cuser.token,
    role: this.cuser.role,
    // modulo: this.component,
  }).subscribe(
    (response) => {
      if (response) {
        // this.conteNotifi = response.data["cont"][0]["conteo"];
        this.absNotification = response.data;

        // if (this.conteNotifi > 0) {
        //   this.hidden = false;
        // } else {
        //   this.hidden = true;
        // }
      } else {
        this.isLogged = false;
        // this.handler.handlerError(response.message);
      }
    },
    (error) => {
      this.isLogged = false;
      // this.handler.handlerError("(E): " + error.message);
    }
  );
 }

}



