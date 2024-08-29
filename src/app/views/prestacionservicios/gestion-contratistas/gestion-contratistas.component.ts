import { Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import { PrestacionServiciosDialog } from '../../../dialogs/prestacionServicios/prestacionServicios.dialog.component';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { WebApiService } from '../../../services/web-api.service';
import { HandlerAppService } from '../../../services/handler-app.service';
import { MatDialog } from '@angular/material/dialog';
import { GestionContratistasDialog } from '../../../dialogs/gestion-contratistas/gestion-contratistas.dialog.component';

@Component({
  selector: 'app-gestion-contratistas',
  templateUrl: './gestion-contratistas.component.html',
  styleUrls: ['./gestion-contratistas.component.css']
})
export class GestionContratistasComponent implements OnInit {

  @ViewChildren(MatSort) sort = new QueryList<MatSort>();
  @ViewChildren(MatPaginator) paginator = new QueryList<MatPaginator>();

  constructor(
    private WebApiService: WebApiService,
    public handler: HandlerAppService,
    public dialog: MatDialog,
  ) { }

  contaClick:  number = 0;
  permissions: any = null;
  userRole;
  dataContratistas: any[] = [];
  displayedColumns: any[] = [];
  dataSource: any = [];
  loading: boolean = false;
  endpoint: string = '/prestacion-servicios';
  component = "/prestacion-servicios/gestion";


  public cuser: any = JSON.parse(localStorage.getItem("currentUser"));


  ngOnInit(): void {
    this.permissions = this.handler.permissionsApp;
    this.userRole = this.cuser.role;
    this.sendRequest();
  }

  sendRequest() {
    this.loading = true;
    this.WebApiService.getRequest(this.endpoint, {
      role: this.cuser.role,
      token: this.cuser.token,
      idUser: this.cuser.iduser,
      modulo: this.component,
      action: "getAll",
      view: 'gestion'
    })
      .subscribe(
        response => {


          if (response.success) {
            this.permissions = this.handler.getPermissions(this.component);
            this.dataContratistas = response.data['prestacionServicios'];

            
            this.generateTable(response.data['prestacionServicios']);

            this.loading = false;
          } else {
            this.dataContratistas = [];
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

  generateTable(data: any[]) {
    // Iniciar las columnas básicas
    this.displayedColumns = [
      'view',
      'id',
      'full_name',
      'doc_ident',
      'fec_ingreso',
      'fec_retiro',
      'estado',
      'upload'
    ];
  
    // Condicionalmente añadir la columna 'uploadSocial' según permisos y rol
    if (this.permissions.create) {
      if (this.userRole !== 39 && this.userRole !== 43) {
        this.displayedColumns.push('uploadSocial');
      }
      if (this.userRole !== 7) {
        this.displayedColumns.push('uploadCobro');
      }
    }
  
    // Inicializar el dataSource con los datos proporcionados
    this.dataSource = new MatTableDataSource(data);
    this.dataSource.sort = this.sort.toArray()[0];
    this.dataSource.paginator = this.paginator.toArray()[0];
  
    // Limpiar el campo de búsqueda si existe
    let search;
    if (document.contains(document.querySelector('search-input-table'))) {
      search = document.querySelector('.search-input-table');
      search.value = "";
    }
  }

  applyFilter(search) {
    this.dataSource.filter = search.trim().toLowerCase();
  }

  option(action, codigo = null, check) {
    let dialogRef;
  
    switch (action) {
      case "update":
        this.loading = true;
        dialogRef = this.dialog.open(GestionContratistasDialog, {
          data: {
            window: "update",
            codigo,
          },
        });
        dialogRef.disableClose = true;
  
        dialogRef.componentInstance.loading.subscribe(val => {
          this.loading = val;
        });
  
        dialogRef.componentInstance.reload.subscribe(() => {
          this.sendRequest();
        });
  
        dialogRef.afterClosed().subscribe(() => {
          this.loading = false; 
          this.sendRequest();
        });
        break;
      case "updateSocial":
        this.loading = true;
        dialogRef = this.dialog.open(GestionContratistasDialog, {
          data: {
            window: "updateSocial",
            codigo,
          },
        });
        dialogRef.disableClose = true;
  
        dialogRef.componentInstance.loading.subscribe(val => {
          this.loading = val;
        });
  
        dialogRef.componentInstance.reload.subscribe(() => {
          this.sendRequest();
        });
  
        dialogRef.afterClosed().subscribe(() => {
          this.loading = false; 
          this.sendRequest();
        });
        break;
      case "updateCobro":
        this.loading = true;
        dialogRef = this.dialog.open(GestionContratistasDialog, {
          data: {
            window: "updateCobro",
            codigo,
          },
        });
        dialogRef.disableClose = true;
  
        dialogRef.componentInstance.loading.subscribe(val => {
          this.loading = val;
        });
  
        dialogRef.componentInstance.reload.subscribe(() => {
          this.sendRequest();
        });
  
        dialogRef.afterClosed().subscribe(() => {
          this.loading = false; 
          this.sendRequest();
        });
        break;
      case "view":
        this.loading = true;
        console.log("view")
        dialogRef = this.dialog.open(GestionContratistasDialog, {
          data: {
            window: "view",
            codigo,
          },
        });
        dialogRef.disableClose = true;

        dialogRef.componentInstance.loading.subscribe(val => {
          this.loading = val;
        });

        dialogRef.componentInstance.reload.subscribe(() => {
          this.sendRequest();
        });

        dialogRef.afterClosed().subscribe(() => {
          this.loading = false; 
          this.sendRequest();
        });
        break;
        
    }
  }
  
  openc(){
    if(this.contaClick == 0){
      this.sendRequest();
    }    
    this.contaClick = this.contaClick + 1;
  }
}
