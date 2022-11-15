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
import { AbsenteeismDialog } from '../../../dialogs/absenteeism/absenteeism.dialogs.component';
import { ReportsAbsenteeismComponent } from '../../../dialogs/reports/absenteeism/reports-absenteeism.component';
import { environment } from '../../../../environments/environment';
import { Console } from 'console';



@Component({
  selector: 'app-absenteeism',
  templateUrl: './absenteeism.component.html',
  styleUrls: ['./absenteeism.component.css']
})
export class AbsenteeismComponent implements OnInit {

  endpoint:string   = '/absenteeisms';
  id: number = null;
  permissions:any = null;
  contenTable : any     = [];
  loading:boolean = false;
  displayedColumns:any  = [];
  dataSource:any        = [];
  public detaNovSal = [];
  contaClick:  number = 0;
  //Variables Excel
  endpointup: string = '/absenteeismsupload';
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
  component = "/procesalud/absenteeisms";
  //History
  public cuser: any = JSON.parse(localStorage.getItem('currentUser'));

  @ViewChildren(MatSort) sort = new QueryList<MatSort>();
  @ViewChildren(MatPaginator) paginator = new QueryList<MatPaginator>();
  @ViewChild('infoModal', { static: false }) public infoModal: ModalDirective;
  @ViewChild('successModal', { static: false }) public successModal: ModalDirective;
  @ViewChild('myCheckbox') private myCheckbox:  QueryList<any>;

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

  constructor(    private _tools: Tools,
    private WebApiService:WebApiService,
    public handler:HandlerAppService,
    public dialog:MatDialog,
    private matBottomSheet : MatBottomSheet) { }

    onTriggerSheetClick(){
      this.matBottomSheet.open(ReportsAbsenteeismComponent)
    }
    
    ngOnInit(): void {
        this.sendRequest();
        this.permissions = this.handler.permissionsApp;
    }

    sendRequest(){
      this.loading = true;
      this.WebApiService.getRequest(this.endpoint, {
        action: 'getDatanovedadAll',
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
      'check',
      'view', 
      'document',
      'fecha_ingreso',
      'name',
      'namejefe',
      'matrizarp',
      'motivo',
      'fecha_ausencia',
      'fecha_finausen',
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

  option(action,codigo=null){
    var dialogRef;
      switch(action){
          case 'create':
            this.loading = true;
            dialogRef = this.dialog.open(AbsenteeismDialog,{
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
            dialogRef = this.dialog.open(AbsenteeismDialog,{
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
            dialogRef = this.dialog.open(AbsenteeismDialog,{
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

  validAsPect(id, checkbox){

   if(checkbox.checked){
    this.dataDelte.push(id);
   }else{
    var i = this.dataDelte.indexOf( id );
    this.dataDelte.splice( i, 1 );
   }

    console.log(this.dataDelte);
  }

  deleInfo(){

    if(this.dataDelte.length > 0){
      if( this.contDele == 0 ){
        this.handler.showError('Si está seguro de borrar los registros, por favor de Click de nuevo en eliminar. Total a eliminar: '+this.dataDelte.length);
        this.contDele++;
        this.stadValue = true;
      }else{
        this.loading = true;
        this.WebApiService.getRequest(this.endpoint, {
            action: 'getDelinfo',
            idDel:  ""+JSON.stringify(this.dataDelte),
            idUser: this.cuser.iduser,
            token: this.cuser.token,
            modulo: this.component
        })
        .subscribe(
           
            data => {
                if (data.success == true) {
                    //DataInfo
                    this.handler.showSuccess('Registros eliminados exitosamente.');
                    this.loading = false;
                    this.stadValue = false;
                    this.sendRequest();
                } else {
                    this.handler.handlerError(data);
                    this.loading = false;
                    this.stadValue = false;
                }
            },
            error => {
                this.handler.showError('Se produjo un error');
                this.loading = false;
                this.stadValue = false;
            }
        );
        this.contDele = 0;
      }
    }else{
      this.handler.showError('Por favor seleccionar algún registro.');
    }


  }

  validatAjust(fechaing){
    
    var fecha = fechaing;
    var horas = 48;
    //Fecha De Radicacion
	  fecha = new Date(fecha);
		fecha.setHours(fecha.getHours()+horas);
		fecha =  fecha.toISOString();
    var fecha_date = fecha.split('T');
    var fecha_time = fecha_date[1].split('.');
		fecha_date = fecha_date[0];
    var fechaFin = fecha_date+' '+fecha_time[0];
    //Se Compara Fecha Actual 
    var hoy = new Date();
    var fechAct = hoy.getFullYear() +'-'+ ( hoy.getMonth() + 1 ) +'-'+ hoy.getDate();
    var horAtc = hoy.getHours() + ':' + hoy.getMinutes() + ':' + hoy.getSeconds();
    var timeActu = fechAct+' '+horAtc;
    //Validacion
    if( timeActu >= fechaing && timeActu <= fechaFin ){
      this.tmajust = true;
    }else{
      this.tmajust = false;
    }
    //Proceso  
      /*console.log('------------');
      console.log(fechaing);
      console.log(fechaFin);
      console.log(timeActu);
      console.log(this.tmajust);
      console.log('------------');*/
  }

}
