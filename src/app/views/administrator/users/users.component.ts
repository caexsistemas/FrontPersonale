import { Component, OnInit, ViewChild, QueryList, ViewChildren } from '@angular/core';
import { Tools } from '../../../Tools/tools.page';
import { UserServices } from '../../../services/user.service';
import { WebApiService } from '../../../services/web-api.service';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { UsersDialog } from '../../../dialogs/users/users.dialog.component';
import { HandlerAppService } from '../../../services/handler-app.service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css'],
  providers: [Tools, UserServices]
})

export class UsersComponent implements OnInit {

  public data;
  public detailUser = [];
  datauser: any = [];
  contenTable: any = [];
  dataSource: any = [];
  displayedColumns: any = [];
  loading: boolean = false;
  contaClick:  number = 0;
  component = "/admin/users";
  permissions: any = null;
  permiLogout: boolean = false;
  contSesion: number = 0;

  endpoint: string = '/usuario';
  // log: any = [];
  // sta: any =[];
  public cuser: any = JSON.parse(localStorage.getItem("currentUser"));

  @ViewChildren(MatSort) sort = new QueryList<MatSort>();
  @ViewChildren(MatPaginator) paginator = new QueryList<MatPaginator>();

  constructor(
    private _UserService: UserServices,
    private _tools: Tools,
    private WebApiService: WebApiService,
    public handler: HandlerAppService,
    public dialog: MatDialog) { }

  @ViewChild('infoModal', { static: false }) public infoModal: ModalDirective;

  ngOnInit(): void {
    this.sendRequest();
    this.permissions = this.handler.permissionsApp;    
   
  }

  sendRequest() {
    this.loading = true;
    this.WebApiService.getRequest(this.endpoint, {
      role: this.cuser.role,
      token: this.cuser.token,
      idUser: this.cuser.iduser,
      modulo: this.component
    })
      .subscribe(
        response => {
          
          if (response.success) {
            this.permissions = this.handler.getPermissions(this.component);
            this.generateTable(response.data['getDataUser']);
            this.datauser = response.data['getDataUser'];
            // this.log = response.data['getDataUser'][0];
            // console.log('==>',this.log.login)
            // if(this.log == '1'){
            //       this.sta = 'ON'
            //   }else if(this.log == '0' || this.log == null){
            //             this.sta = 'OFF'
            //       }

            //Boton de Sesion
            if( this.cuser.role == 1 || this.cuser.role == 28 || this.cuser.role == 34){
              this.permiLogout = true;
            }

            this.loading = false;
          } else {
            this.datauser = [];
            this.handler.handlerError(response);
            this.loading = false;
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

  generateTable(data) {
    this.displayedColumns = [
      'view',
      'idUser',
      'document',
      'idPersonale',  
      'role',
      'status',
      'actions'
    ];
    this.dataSource = new MatTableDataSource(data);
    this.dataSource.sort = this.sort.toArray()[0];
    this.dataSource.paginator = this.paginator.toArray()[0];
    let search;
    if (document.contains(document.querySelector('search-input-table'))) {
      search = document.querySelector('.search-input-table');
      search.value = "";
    }
  }

  applyFilter(search) {
    this.dataSource.filter = search.trim().toLowerCase();
  }

  option(action, codigo = null,sesion) {
    var dialogRef;
    switch (action) {
      case 'view':
        this.loading = true;
        dialogRef = this.dialog.open(UsersDialog, {
          data: {
            window: 'view',
            codigo
          }
        });
        dialogRef.disableClose = true;
        // LOADING
        dialogRef.componentInstance.loading.subscribe(val => {
          this.loading = val;
        });
        dialogRef.afterClosed().subscribe(result => {
          // console.log('The dialog was closed');
          // console.log(result);
        });
        break;
      case 'create':
        this.loading = true;
        dialogRef = this.dialog.open(UsersDialog, {
          data: {
            window: 'create',
            role: this.cuser.role,
            codigo
          }
        });
        dialogRef.disableClose = true;
        // LOADING
        dialogRef.componentInstance.loading.subscribe(val => {
          this.loading = val;
        });
        // RELOAD
        dialogRef.componentInstance.reload.subscribe(val => {
          this.sendRequest();
        });
        break;
      case 'update':
        this.loading = true;
        dialogRef = this.dialog.open(UsersDialog, {
          data: {
            window: 'update',
            codigo,
            sesion
          }
        });
        dialogRef.disableClose = true;
        // LOADING
        dialogRef.componentInstance.loading.subscribe(val => {
          this.loading = val;
        });
        // RELOAD
        dialogRef.componentInstance.reload.subscribe(val => {
          this.sendRequest();
        });
        break;
      case 'logout':
        this.sysConteSesion();
        break;
      // case 'active':
      //   this.updateStatus('active');
      // break;
      // case 'inactive':
      //   this.updateStatus('inactive');
      // break;
    }

  }

  showDetails(item) {
    this.detailUser = item;
    this.infoModal.show()
  }

  
  openc(){
    if(this.contaClick == 0){
      this.sendRequest();
    }    
    this.contaClick = this.contaClick + 1;
  }

  sysConteSesion(){
    if( this.contSesion == 1){
      this.logoutSesionSys();
    }else{
      this.contSesion = 1;
      this.handler.showInfo('Para confirmar por favor de Click nuevamente en el botón de Cerrar Sesiones', '¿Esta Seguro?', '#/admin/users');
    }
  }

  logoutSesionSys() {

    this.loading = false;
    this.WebApiService.getRequest(this.endpoint,{
        action: "logoutSesionSyst",
        role: this.cuser.role,
        token: this.cuser.token,
        idUser: this.cuser.iduser,
        modulo: this.component
    })
    .subscribe(
        data => {
            if (data.success) {
              this.contSesion = 0;
                this.handler.showSuccess('¡Las Sesiones se cerraron con Éxito!');
            } else {
                this.handler.handlerError(data);
                this.loading = false;
            }
        },
        (mistake) => {
          let msjErr = "Error al cerrar la sesión.";
          //let msjErr = mistake.error.message;
          this.handler.showError(msjErr);
          this.loading = false;
        }
    );
  }

}