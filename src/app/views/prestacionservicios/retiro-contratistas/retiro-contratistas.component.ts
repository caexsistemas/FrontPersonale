import { Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { DomSanitizer } from '@angular/platform-browser';
import { HandlerAppService } from '../../../services/handler-app.service';
import { WebApiService } from '../../../services/web-api.service';
import { MatTableDataSource } from '@angular/material/table';
import { GestionContratistasDialog } from '../../../dialogs/gestion-contratistas/gestion-contratistas.dialog.component';

@Component({
  selector: 'app-retiro-contratistas',
  templateUrl: './retiro-contratistas.component.html',
  styleUrls: ['./retiro-contratistas.component.css']
})
export class RetiroContratistasComponent implements OnInit {

  @ViewChildren(MatSort) sort = new QueryList<MatSort>();
  @ViewChildren(MatPaginator) paginator = new QueryList<MatPaginator>();

  public cuser: any = JSON.parse(localStorage.getItem("currentUser"));

  contaClick:  number = 0;
  permissions: any = null;
  dataContratistas: any[] = [];
  displayedColumns: any[] = [];
  dataSource: any = [];
  loading: boolean = false;
  endpoint: string = '/prestacion-servicios';
  component = "/prestacion-servicios/gestion";







  constructor(
    private WebApiService: WebApiService,
    public handler: HandlerAppService,
    // private matBottomSheet: MatBottomSheet,
    public dialog: MatDialog,
  ) { }

  
  
  ngOnInit(): void {
    this.permissions = this.handler.permissionsApp;    
    this.sendRequest();
  }

  sendRequest() {
    this.loading = true;
    this.WebApiService.getRequest(this.endpoint, {
      role: this.cuser.role,
      token: this.cuser.token,
      idUser: this.cuser.iduser,
      modulo: this.component,
      action: "getAllRetiros"
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

  generateTable(data) {
    this.displayedColumns = [
      'view',
      'id',
      'full_name',
      'doc_ident',
      'fec_ingreso',
      'fec_retiro',
      // 'file_eps',
      // 'file_arl',
      // 'file_contrato',
      'estado',
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

  openc(){
    if(this.contaClick == 0){
      this.sendRequest();
    }    
    this.contaClick = this.contaClick + 1;
  }

  option(action, codigo = null, check) {
    let dialogRef;
  
    switch (action) {
      case "retirar":
        this.loading = true;
        dialogRef = this.dialog.open(GestionContratistasDialog, {
          data: {
            window: "retirar",
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
}

