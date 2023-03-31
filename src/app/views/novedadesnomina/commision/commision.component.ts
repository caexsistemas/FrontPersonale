import { Component, OnInit, Output, ViewChild, QueryList, ViewChildren, EventEmitter } from '@angular/core';
import { Tools } from '../../../Tools/tools.page';
import { WebApiService } from '../../../services/web-api.service';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { HandlerAppService } from '../../../services/handler-app.service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { TemplateComponent } from '../../../template/template.component';
import { ComisionDialog } from '../../../dialogs/comision/comision.dialog.component';
import { ReportsComisionComponent } from '../../../dialogs/reports/comision/reports-comision.component';
import { environment } from '../../../../environments/environment';
import { Console } from 'console';

@Component({
  selector: 'app-commision',
  templateUrl: './commision.component.html',
  styleUrls: ['./commision.component.css']
})
export class CommisionComponent implements OnInit {

  endpoint:string   = '/commisions';
  id:               number = null;
  permissions:      any = null;
  contenTable :     any = [];
  loading:          boolean = false;
  displayedColumns: any = [];
  dataSource:       any = [];
  public detaNovSal = [];
  contaClick:       number = 0;
  //Variables Excel
  endpointup: string = '/commisionsupload';
  urlKaysenBackend = environment.url;
  url = this.urlKaysenBackend + this.endpointup;
  personaleData: any = [];
  datapersonale: any = [];
  dataDelte:     any = [];
  contDele:      number = 0;
  stadValue:     boolean = false;
  tmajust:       boolean = false;
  modal: 'successModal';
  //Control Permiso
  component = "/nomi/commisions";
  //History
  public cuser: any = JSON.parse(localStorage.getItem('currentUser'));
  @ViewChildren(MatSort) sort = new QueryList<MatSort>();
  @ViewChildren(MatPaginator) paginator = new QueryList<MatPaginator>();
  @ViewChild('infoModal', { static: false }) public infoModal: ModalDirective;
  @ViewChild('successModal', { static: false }) public successModal: ModalDirective;
  @ViewChild('myCheckbox') private myCheckbox:  QueryList<any>;
  //Subir Excel
  public afuConfig = {

    multiple: false,
    formatsAllowed: ".xlsx,.xls",
    maxSize: "20",
    uploadAPI: {
      url: this.url,
      method: "POST",
      headers: {
        'Authorization': this._tools.getToken()
      },
    },
    theme: "dragNDrop",
    hideProgressBar: false,
    hideResetBtn: true,
    hideSelectBtn: false,
    replaceTexts: {
      selectFileBtn: 'Seleccione Archivo',
      resetBtn: 'Limpiar',
      uploadBtn: 'Subir Archivo',
      attachPinBtn: 'Sube información usuarios',
      hideProgressBar: false,
      afterUploadMsg_success: '',
      afterUploadMsg_error: 'Fallo al momento de cargar el archivo!',
      sizeLimit: 'Límite de tamaño'
    }
  };

  constructor(
    private _tools: Tools,
    private WebApiService:WebApiService,
    public handler:HandlerAppService,
    public dialog:MatDialog,
    private matBottomSheet : MatBottomSheet
  ) { }

  ngOnInit(): void {
    this.permissions = this.handler.permissionsApp;
    this.sendRequest();
  }

  sendRequest(){
    this.loading = true;
    this.WebApiService.getRequest(this.endpoint, {
      action: 'getDataCommi',
      idUser: this.cuser.iduser,
      role: this.cuser.role,
      matrizarp: this.cuser.matrizarp,
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
        error => {
            console.log(error);
            this.handler.showError('Se produjo un error');
            this.loading = false;
        }
      );
  }

  //Tabla Contenido
  generateTable(data){
    this.displayedColumns = [
      'view', 
      'fecha_ing',
      'name',
      'document',
      'fecha_commi',
      'matrizarp_des',
      'valor_commi',
      'tipo_comi',
      'quincena',
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
    //Cabecera
    openc(){
      if(this.contaClick == 0){
        this.sendRequest();
      }    
      this.contaClick = this.contaClick + 1;
    }

    getAllPersonal() {
      this.WebApiService.getRequest(this.endpoint, {
        action: 'getDatUpload',
        idUser: this.cuser.iduser,
        token: this.cuser.token,
        modulo: this.component
      })
        .subscribe(
          response => {
            this.permissions = this.handler.getPermissions(this.component);
            if (response.success) {
              console.log("repo: "+response);
              this.handler.showSuccess('El archivo se cargo exitosamente');
              this.personaleData = response.data;
              this.loading = false;
              this.successModal.hide();
              this.sendRequest();
            } else {
              this.datapersonale = [];
              this.handler.handlerError(response);
            }
          },
          error => {
            this.loading = false;
            //this.permissions = this.handler.getPermissions(this.component);
            this.handler.showError();
          }
        );
    }

    option(action,codigo=null){
      var dialogRef;
        switch(action){
          case 'create':
            this.loading = true;
            dialogRef = this.dialog.open(ComisionDialog,{
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
            dialogRef = this.dialog.open(ComisionDialog,{
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
            dialogRef = this.dialog.open(ComisionDialog,{
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
              console.log('The dialog was closed');
              console.log(result);
            });
        break;
        }
    }

    onTriggerSheetClick(){
      this.matBottomSheet.open(ReportsComisionComponent)
    }

}
