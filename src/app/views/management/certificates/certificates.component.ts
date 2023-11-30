import { Component, OnInit, Output, ViewChild, QueryList, ViewChildren, EventEmitter } from '@angular/core';
import { Tools } from '../../../Tools/tools.page';
import { WebApiService } from '../../../services/web-api.service';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { HandlerAppService } from '../../../services/handler-app.service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { CertificatesDialog } from '../../../dialogs/certificates/certificates.dialogs.component';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { TemplateComponent } from '../../../template/template.component';

@Component({
  selector: 'app-certificates',
  templateUrl: './certificates.component.html',
  styleUrls: ['./certificates.component.css']
})
export class CertificatesComponent implements OnInit {

  endpoint:string   = '/certificates'; 
  id: number = null;
  permissions:any = null;
  contenTable : any     = [];
  loading:boolean = false;
  displayedColumns:any  = [];
  dataSource:any        = [];
  public detaNovSal = [];
  contaClick:  number = 0;
  contDele:    number = 0;
  stadValue:   number = 0;
  //Control Permiso
  component = "/management/certificates";
  //History
  public cuser: any = JSON.parse(localStorage.getItem('currentUser'));

  @ViewChildren(MatSort) sort = new QueryList<MatSort>();
  @ViewChildren(MatPaginator) paginator = new QueryList<MatPaginator>();
  @ViewChild('infoModal', { static: false }) public infoModal: ModalDirective;


  constructor(    
    private _tools: Tools,
    private WebApiService:WebApiService,
    public handler:HandlerAppService,
    public dialog:MatDialog,
    private matBottomSheet : MatBottomSheet) { }

  ngOnInit(): void {
      this.sendRequest();
      this.permissions = this.handler.permissionsApp;
  }

  sendRequest(){

    this.loading = true;
    this.WebApiService.getRequest(this.endpoint, {
      action: 'getDatanovedad',
      idUser: this.cuser.iduser,
      role: this.cuser.role,
      token: this.cuser.token,
      modulo: this.component
    })
      .subscribe(
     
        data => {
            if (data.success == true) {
                this.permissions = this.handler.getPermissions(this.component);
                this.generateTable(data.data['getContData']);
                this.contenTable = data.data['getContData'];
                this.loading = false;

            } else {
                this.handler.handlerError(data);
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

  //Tabla Contenido
  generateTable(data){

      this.displayedColumns = [
        'view', 
        'fech_ing',
        'name',
        'document',
        'status',
        'tip_certi',
        'token',
        'actions'
      ];
      this.dataSource           = new MatTableDataSource(data);
      this.dataSource.sort      = this.sort.toArray()[0];
      this.dataSource.paginator = this.paginator.toArray()[0];
      let search;

      if(document.contains(document.querySelector('search-input-table'))){
        search = document.querySelector('.search-input-table');
        search.value = "";
      }

  }

  //Filtro Tabla
  applyFilter(search){
    this.dataSource.filter = search.trim().toLowerCase();
  }

  //Modales
  showDetails(item) {
    this.detaNovSal = item;
    this.infoModal.show()
  }

  openc(){
    if(this.contaClick == 0){
      this.sendRequest();
    }    
    this.contaClick = this.contaClick + 1;
  }

  option(action,codigo=null,estado=null){
    
    var dialogRef;
    
    switch(action){
      case 'create':
        this.loading = true;
        dialogRef = this.dialog.open(CertificatesDialog,{
          data: {
            window: 'create',
            codigo
          }
        });
        dialogRef.disableClose = true;
        // LOADING
        dialogRef.componentInstance.loading.subscribe(val=>{
          this.loading = val;
        });
        // RELOAD
        dialogRef.componentInstance.reload.subscribe(val=>{
          this.sendRequest();
        });
      break;
      case 'update':
        this.loading = true;
        dialogRef = this.dialog.open(CertificatesDialog,{
          data: {
            window: 'update',
            codigo
          }
        });
        dialogRef.disableClose = true;
        // LOADING
        dialogRef.componentInstance.loading.subscribe(val=>{
          this.loading = val;
        });
        // RELOAD
        dialogRef.componentInstance.reload.subscribe(val=>{
          this.sendRequest();
        });
      break;
      case 'view':
          this.loading = true;
          dialogRef = this.dialog.open(CertificatesDialog,{
            data: {
              window: 'view',
              codigo
            }
          });
          dialogRef.disableClose = true;
          // LOADING
          dialogRef.componentInstance.loading.subscribe(val=>{
            this.loading = val;
          });
          dialogRef.afterClosed().subscribe(result => {
            //console.log('The dialog was closed');
            //console.log(result);
          });
      break;
    }
  }

  pdf(id) {
    console.log(id);
    //this.loading.emit(true);
    this.WebApiService.getRequest(this.endpoint, {
      action: "pdf",
      id: id,
      token: this.cuser.token,
      idUser: this.cuser.iduser,
      modulo: this.component
    }).subscribe(
      (data) => {
        this.permissions = this.handler.getPermissions(this.component);
        //console.log(data);
        if (data.success == true) {
              
              const link = document.createElement("a");
              link.href = data.data.url;
              link.download = data.data.file;
              link.target = "_blank";
              link.click();
              this.handler.showSuccess(data.data.file);
              this.loading = false;
        } else {
                this.handler.handlerError(data);
                this.loading = false;
        }
      },
      (error) => {
              console.log(error);
              this.handler.showError("Error al generar Pdf");
              this.loading = false;
      }
    );
  }

}
