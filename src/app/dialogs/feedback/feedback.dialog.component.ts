import { MatDialog,MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, Inject, Output, EventEmitter, ViewChildren, QueryList } from '@angular/core';
import { WebApiService } from '../../services/web-api.service';
import { FormGroup, FormControl, Validators, ValidatorFn, ValidationErrors } from '@angular/forms';
import { DateAdapter } from '@angular/material/core';
import { HandlerAppService } from '../../services/handler-app.service';
import { environment } from '../../../environments/environment';
import { global } from '../../services/global';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { Observable } from 'rxjs';
import { NovedadesnominaServices } from '../../services/novedadesnomina.service';

export interface PeriodicElement {
  currentm_user: string,
  date_move:string,
  type_move: string
}

@Component({
  selector: 'app-feedback',
  templateUrl: './feedback.dialog.component.html',
  styleUrls: ['./feedback.dialog.component.css']
})


export class FeedbackDialog 
{
  endpoint:      string = "/feedback";
    maskDNI        = global.maskDNI;
    view:          string = null;
    idNomi:        number = null;
    title:         string = null;
    formNomi:      FormGroup;
    permissions: any = null;
    component = "/feedback/feedback";
    dataSource: any=[];
    PersonaleInfo: any = [];
    feed: any= [];
    idfeed: number = null;
    ListArea:      any = [];
    selectedFile:  File = null;
    tipInter: string = "";
    fechInicInc: string = "";

    formFeed: FormGroup;
    archivo = {
        nombre: null,
        nombreArchivo: null,
        base64textString: null
    }
    ListTipoGes:    any = [];
    TipoIntervencion: any = [];
    listipomatriz: any = [];
    dataNovNi: any = []; 
    personalData:     any = [];
    feedInfo: any=[];
    tipMatriz:        string = "";
    //History
    historyMon: any = [];
    displayedColumns:any  = [];
    public clickedRows;
    public cuser: any = JSON.parse(localStorage.getItem('currentUser'));

    //OUTPUTS
    @Output() loading = new EventEmitter();
    @Output() reload = new EventEmitter();
    @ViewChildren(MatSort) sort = new QueryList<MatSort>();

  constructor(
    public dialogRef: MatDialogRef<FeedbackDialog>,
    private WebApiService: WebApiService,
    private handler: HandlerAppService,
    @Inject(MAT_DIALOG_DATA) public data,
    public dialog: MatDialog,
    private uploadFileService: NovedadesnominaServices
  ) { 
    this.view = this.data.window;
    this.idfeed = null;
  
    switch (this.view) {
        case 'create':
            this.tipInter = this.data.tipoMat;
            this.tipMatriz = this.data.tipoMat;

            this.initForms();
            this.title = "Crear Retroalimentacion";
        break;
        case 'update':
          this.tipInter = this.data.tipoMat;
          this.tipMatriz = this.data.tipoMat;
          this.initForms();
          this.title = "Actualizar Retroalimentacion";
          this.idfeed = this.data.codigo;

          break;
          case "view":
            this.idfeed = this.data.codigo;
            this.loading.emit(true);
            this.WebApiService.getRequest(
              this.endpoint + "/" + this.idfeed,
              {}
            ).subscribe(
              (data) => {
                if (data.success == true) {
                 
                  this.feed = data.data['getDataPerson'][0];
                  this.tipInter = this.feed.matrizarp_cod;
                  this.tipMatriz = this.feed.matrizarp_cod;

                  this.generateTable(data.data['getDatHistory']);   
                  this.loading.emit(false);
                } else {
                  this.handler.handlerError(data);
                  this.closeDialog();
                  this.loading.emit(false);
                }
              },
              (error) => {
                this.handler.showError("Se produjo un error");
                this.loading.emit(false);
              }
            );
            break;
        }
      
  
 
  }
closeDialog() {
  this.dialogRef.close();
}
  initForms() {
    this.getDataInit();
    this.formNomi = new FormGroup({
        fecha: new FormControl(""),
        matrizarp: new FormControl(this.cuser.matrizarp),
        document: new FormControl(""),
        idPersonale: new FormControl(""),
        car_trabajo: new FormControl(""),
        supervisor: new FormControl(""),
        car_user: new FormControl(""),
        des_crip: new FormControl(""),
        com_tra: new FormControl(""),
        rec_com: new FormControl(""),
        tipo_intervencion: new FormControl(""),
        create_User: new FormControl(this.cuser.iduser)

        
    });
}
generateTable(data){
  this.displayedColumns = [
    'currentm_user',
    'date_move',
    'type_move'  
  ];
  this.historyMon = data;
  this.clickedRows = new Set<PeriodicElement>();
}
getDataInit(){

  this.loading.emit(false);
  this.WebApiService.getRequest(this.endpoint, {
      action: "getParamView",
      matrizarp: this.cuser.matrizarp


  })
  .subscribe(
     
      data => {
          if (data.success == true) {
              //DataInfo
              this.PersonaleInfo = data.data['getDataPersonale'];
              this.ListArea      = data.data['getDatArea'];
              this.ListTipoGes   = data.data['getDatTipoGes'];
              this.TipoIntervencion = data.data['tipInter'];
              this.listipomatriz = data.data['tipmatriz']; //40
              this.personalData = data.data['getDataPersonal'];  //Data Personal

              

              if (this.view == 'update') {
                  this.getDataUpdate();
              }
              this.loading.emit(false);
          } else {
              this.handler.handlerError(data);
              this.loading.emit(false);
          }
      },
      error => {
          this.handler.showError('Se produjo un error');
          this.loading.emit(false);
      }
  );
}
onSubmit() {
  if (this.formNomi.valid) {
      this.loading.emit(true);
      let body = {
          listas: this.formNomi.value,
      }
      this.WebApiService.postRequest(this.endpoint, body, {})
          .subscribe(
              data => {
                  if (data.success) {
                     this.handler.showSuccess(data.message);
                      this.reload.emit();
                      this.closeDialog();
                  } else {
                      this.handler.handlerError(data);
                      this.loading.emit(false);
                  }
              },
              error => {
                  this.handler.showError();
                  this.loading.emit(false);
              }
          )
  } else {
      this.handler.showError('Complete la informacion necesaria');
      this.loading.emit(false);
  }
}
onSelectionChange(event){
        
       
  let exitsPersonal = this.PersonaleInfo.find(element => element.document == event);
  if( exitsPersonal ){
    
      this.formNomi.get('idPersonale').setValue(exitsPersonal.idPersonale);
      this.formNomi.get('car_trabajo').setValue(exitsPersonal.idArea);
     
  }        
}
onSelectionJFChange(event){
        
       
  let exitsPersonal = this.PersonaleInfo.find(element => element.document == event);
  if( exitsPersonal ){
      this.formNomi.get('supervisor').setValue(exitsPersonal.idPersonale);
  }        
}
getDataUpdate(){

  this.loading.emit(true);
  this.WebApiService.getRequest(this.endpoint, {
      action: 'getParamUpdateSet',
      id: this.idfeed,
      tipMat: this.tipMatriz

  })
  .subscribe(
      data => {

          this.formNomi.get('tipo_intervencion').setValue(data.data['getDataUpda'][0].tipo_intervencion);
          this.formNomi.get('document').setValue(data.data['getDataUpda'][0].document);
          this.formNomi.get('idPersonale').setValue(data.data['getDataUpda'][0].idPersonale);
          this.formNomi.get('car_trabajo').setValue(data.data['getDataUpda'][0].car_trabajo);
          this.formNomi.get('supervisor').setValue(data.data['getDataUpda'][0].supervisor);
          this.formNomi.get('car_user').setValue(data.data['getDataUpda'][0].car_user);
          this.formNomi.get('fecha').setValue(data.data['getDataUpda'][0].fecha);
          this.formNomi.get('des_crip').setValue(data.data['getDataUpda'][0].des_crip);
          this.formNomi.get('com_tra').setValue(data.data['getDataUpda'][0].com_tra);
          this.formNomi.get('rec_com').setValue(data.data['getDataUpda'][0].rec_com);
          this.formNomi.get('matrizarp').setValue(data.data['getDataUpda'][0].matrizarp);
             
      },
      error => {
          this.handler.showError();
          this.loading.emit(false);
      }
  );
}
onSubmitUpdate(){

  let body = {
      listas: this.formNomi.value,  
        salud: this.formNomi.value  ,
       tipMat: this.tipMatriz
      // id: this.idfeed
  }
  if (this.formNomi.valid) {
    this.loading.emit(true);
    this.WebApiService.putRequest(this.endpoint+'/'+this.idfeed,body,{})
    .subscribe(
        data=>{
            if(data.success){
                this.handler.showSuccess(data.message);
                this.reload.emit();
                this.closeDialog();
            }else{
                this.handler.handlerError(data);
                this.loading.emit(false);
            }
        },
        error=>{
            this.handler.showError(error);
            this.loading.emit(false);
        }
    );
  }else {
    this.handler.showError('Complete la informacion necesaria');
    this.loading.emit(false);
  }
}
getWeekNr(event){

  //var currentdate  = new Date(event);
  var now = new Date(event),i=0,f,sem=(new Date(now.getFullYear(), 0,1).getDay()>0)?1:0;
  while( (f=new Date(now.getFullYear(), 0, ++i)) < now ){
    if(!f.getDay()){
      sem++;
    }
  }
  
  // this.formNomi.get('week').setValue("Semana: "+(sem-1));
}


 //Acording
 step = 0;

 setStep(index: number) {
   this.step = index;
 }

 nextStep() {
   this.step++;
 }

 prevStep() {
   this.step--;
 }
 labelMatriz(event){
  this.tipMatriz = event;
}

SendDataonChange(event: any) {
  console.log(event.target.value);
  }

}
