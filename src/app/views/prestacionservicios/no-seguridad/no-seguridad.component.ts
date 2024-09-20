import { Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { HandlerAppService } from '../../../services/handler-app.service';
import { WebApiService } from '../../../services/web-api.service';
import { MatTableDataSource } from '@angular/material/table';
import { GestionContratistasDialog } from '../../../dialogs/gestion-contratistas/gestion-contratistas.dialog.component';
import { PrestacionServiciosDialog } from '../../../dialogs/prestacionServicios/prestacionServicios.dialog.component';

@Component({
  selector: 'app-no-seguridad',
  templateUrl: './no-seguridad.component.html',
  styleUrls: ['./no-seguridad.component.css']
})
export class NoSeguridadComponent implements OnInit {

  
  @ViewChildren(MatSort) sort = new QueryList<MatSort>();
  @ViewChildren(MatPaginator) paginator = new QueryList<MatPaginator>();

  // Obtener los datos del usuario de sesión
  public cuser: any = JSON.parse(localStorage.getItem("currentUser"));

  // Recursos
  loading: boolean = false;
  contaClick:  number = 0;
  userRole;
  permissions: any = null;
  dataSource: any = [];
  dataContratistas: any[] = [];
  displayedColumns: any[] = [];

  // Endpoint y Component
  endpoint: string = '/prestacion-servicios';
  component = "/prestacion-servicios/sin-seguridad";

  constructor(
    private WebApiService: WebApiService,
    public handler: HandlerAppService,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.userRole = this.cuser.role;
    this.permissions = this.handler.permissionsApp;    
    this.sendRequest();
  }

  sendRequest(){
    this.loading = true;
    this.WebApiService.getRequest(this.endpoint, {
      role: this.cuser.role,
      token: this.cuser.token,
      idUser: this.cuser.iduser,
      modulo: this.component,
      action: "getAll",
      view: 'sinSeguridad'
    }).subscribe(
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

  generateTable(data) {
    this.displayedColumns = [
      'view',
      'id',
      'full_name',
      'doc_ident',
      'ciudad_trabajo',
      'fec_ingreso',
      'estado',
    ];

    if (this.userRole !== 7) {
      this.displayedColumns.push('uploadCobro');
    }

    if (this.permissions.update) {
      this.displayedColumns.push('actions');
    }

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

  option(action, codigo = null, check) {
    let dialogRef;

    switch (action) {
      case "view":
        this.loading = true;
        dialogRef = this.dialog.open(PrestacionServiciosDialog, {
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
  
        dialogRef.afterClosed().subscribe(result => {
          if (result === 'success') {
            this.sendRequest();
          }
          this.loading = false; 
        });
        break;
      case "update":
        this.loading = true;
        dialogRef = this.dialog.open(PrestacionServiciosDialog, {
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
  
        dialogRef.afterClosed().subscribe(result => {
          if (result === 'success') {
            this.sendRequest();
          }
          this.loading = false; 
        });
        break;
    }
  }
}
