import { Component, OnInit, ViewChildren, QueryList, ViewChild } from '@angular/core';
import { Tools } from '../../Tools/tools.page';
import { WebApiService } from '../../services/web-api.service';
import { HandlerAppService } from '../../services/handler-app.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { IncapacidadesDialog } from '../../dialogs/incapacidades/incapacidades.dialog.component';
import { ReportIncaapacidadesComponent } from '../../dialogs/reports/incapacidades/reports-incapacidades.component';

@Component({
  selector: 'app-incapacidades',
  templateUrl: './incapacidades.component.html',
  styleUrls: ['./incapacidades.component.css'],
  providers: [Tools]
})
export class IncapacidadesComponent implements OnInit {

  endpoint: string = '/inability';
  personaleData: any = [];
  loading: boolean = false;
  displayedColumns: any = [];
  dataSource: any = [];
  permissions: any = null;
  contaClick:  number = 0;
  
  //Permisos
  component = "/incapacidades/gestion";
  public cuser: any = JSON.parse(localStorage.getItem('currentUser'));

  @ViewChildren(MatSort) sort = new QueryList<MatSort>();
  @ViewChildren(MatPaginator) paginator = new QueryList<MatPaginator>();

  @ViewChild('infoModal', { static: false }) public infoModal: ModalDirective;
  @ViewChild('successModal', { static: false }) public successModal: ModalDirective;

  constructor(
    private _tools: Tools,
    private WebApiService: WebApiService,
    public handler: HandlerAppService,
    public dialog: MatDialog,
    private matBottomSheet : MatBottomSheet) { }

  ngOnInit(): void {

    this.sendRequest();
    this.permissions = this.handler.permissionsApp;
  }

  sendRequest() {
    this.loading = true;
    this.WebApiService.getRequest(this.endpoint, {
      idUser: this.cuser.iduser,
      role: this.cuser.role,
      token: this.cuser.token,
      modulo: this.component
    })
      .subscribe(
        response => {
        
          if (response.success) {
            this.permissions = this.handler.getPermissions(this.component);
            this.generateTable(response.data);
            this.personaleData = response.data
            this.loading = false;
          } else {
            this.personaleData = [];
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

  onTriggerSheetClick(){
    this.matBottomSheet.open(ReportIncaapacidadesComponent)
  }

  generateTable(data) {
    this.displayedColumns = [
      'view',
      'fechageneracion',
      'document',
      'name',
      'fechainicausen',
      'fechafinausen',
      'estado_gs',
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

  option(action, codigo = null) {

    var dialogRef;
    
    switch (action) {
      case 'view':
        this.loading = true;
        dialogRef = this.dialog.open(IncapacidadesDialog, {
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
          //console.log('The dialog was closed');
          //console.log(result);
        });
        break;
        case 'create':
          this.loading = true;
          dialogRef = this.dialog.open(IncapacidadesDialog, {
            data: {
              window: 'create',
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
            dialogRef = this.dialog.open(IncapacidadesDialog, {
              data: {
                window: 'update',
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
    }

  }

  openc(){
    if(this.contaClick == 0){
      this.sendRequest();
    }    
    this.contaClick = this.contaClick + 1;
  }
}
