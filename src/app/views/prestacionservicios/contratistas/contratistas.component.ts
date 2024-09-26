import { Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import { WebApiService } from '../../../services/web-api.service';
import { HandlerAppService } from '../../../services/handler-app.service';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { PrestacionServiciosDialog } from '../../../dialogs/prestacionServicios/prestacionServicios.dialog.component';

@Component({
  selector: 'app-contratistas',
  templateUrl: './contratistas.component.html',
  styleUrls: ['./contratistas.component.css']
})
export class ContratistasComponent implements OnInit {

  @ViewChildren(MatSort) sort = new QueryList<MatSort>();
  @ViewChildren(MatPaginator) paginator = new QueryList<MatPaginator>();

  constructor(
    private WebApiService: WebApiService,
    public handler: HandlerAppService,
    private matBottomSheet: MatBottomSheet,
    public dialog: MatDialog
  ) { }

  contaClick:  number = 0;
  permissions: any = null;
  dataContratistas: any[] = [];
  displayedColumns: any[] = [];
  dataSource: any = [];
  loading: boolean = false;
  endpoint: string = '/prestacion-servicios';
  component = "/prestacion-servicios/contratistas";


  public cuser: any = JSON.parse(localStorage.getItem("currentUser"));


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
      action: "getAll"
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
      'ciudad_trabajo',
      'fec_ingreso',
      'fec_retiro',
      'estado',
    ];

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
      case "create":
        this.loading = false;
  
        dialogRef = this.dialog.open(PrestacionServiciosDialog, {
          data: {
            window: "create",
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
        break;
      case "download":
        this.loading = true;
        this.WebApiService.getRequest(this.endpoint + "/export-excel", {
          role: this.cuser.role,
          token: this.cuser.token,
          idUser: this.cuser.iduser,
          modulo: this.component,
        })
          .subscribe(
            response => {
              this.loading = false;

              const link = document.createElement("a");
              link.href = response.data.url;
              link.download = response.data.file;
              link.click();
              this.handler.showSuccess('El archivo ha sido descargado con éxito. <br>' + response.data.file);

            },
            (mistake) => {
              let msjErr = "Tu sesión se ha cerrado o el Módulo presenta alguna Novedad";
              this.handler.showError(msjErr);
              this.loading = false;
            }
          );
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
