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
import { empty, Observable } from 'rxjs';
import { NovedadesnominaServices } from '../../services/novedadesnomina.service';
import { DatePipe } from '@angular/common'
import { exists } from 'fs';
import {MatSnackBar} from '@angular/material/snack-bar';


export interface PeriodicElement {
  currentm_user: string,
  date_move:string,
  type_move: string
}

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.dialog.component.html',
  styleUrls: ['./calendar.dialog.component.css']
})


export class CalendarDialog 
{
  endpoint:      string = "/calendar";
    maskDNI        = global.maskDNI;
    view:          string = null;
    idNomi:        number = null;
    title:         string = null;
    formCalen:      FormGroup;
    permissions: any = null;
    component = "/admin/calendar";
    dataSource: any=[];
    feed: any= [];
    calend: any = [];
    idfeed: number = null;
    public today: number = Date.now();//+
    formFeed: FormGroup;
    archivo = {
        nombre: null,
        nombreArchivo: null,
        base64textString: null
    }
    tipMatriz:        string = "";
    rol: number;
    tipRole : string = "";
    //History
    historyMon: any = [];
    displayedColumns:any  = [];
    checked = false;
    idCal: number;
    idCalSec: number;
    and: any = [];
    public clickedRows;
    public cuser: any = JSON.parse(localStorage.getItem('currentUser'));

    //OUTPUTS
    @Output() loading = new EventEmitter();
    @Output() reload = new EventEmitter();
    @ViewChildren(MatSort) sort = new QueryList<MatSort>();

  constructor(
    public dialogRef: MatDialogRef<CalendarDialog>,
    private WebApiService: WebApiService,
    private handler: HandlerAppService,
    @Inject(MAT_DIALOG_DATA) public data,
    public dialog: MatDialog,
    private uploadFileService: NovedadesnominaServices,
    private _snackBar: MatSnackBar
  ) { 
    this.view = this.data.window;
    this.idfeed = null;
    this.rol = this.cuser.role;
  
    switch (this.view) {
       
        case 'update':
          this.tipMatriz = this.data.tipoMat;
            this.initForms();
            this.title = "Actualizar Festivos";
            this.idfeed = this.data.codigo;
          break;
          case "view":
            this.idfeed = this.data.id;
            this.title = "Información General";
            this.loading.emit(true);
            this.WebApiService.getRequest(
              this.endpoint + "/" + this.idfeed,
              {
                token: this.cuser.token,
                idUser: this.cuser.iduser,
                modulo: this.component
              }
            ).subscribe(
              (data) => {
                if (data.success == true) {
                 
                  console.log(this.feed)
                  if(data.data['getSelectData'].length == 2){
                      this.and = "y";
                      this.feed = data.data['getSelectData'][0];
                      this.calend = data.data['getSelectData'][1];
                  }else{
                      this.feed = data.data['getSelectData'][0];
                  }
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
    this.formCalen = new FormGroup({
      month: new FormControl(""),
      day_hol: new FormControl(""),       
    });
    this.formFeed = new FormGroup({
      month: new FormControl(""),
      day_hol: new FormControl(""),  
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
      matrizarp: this.cuser.matrizarp,
      tipRole: this.cuser.role,
      token: this.cuser.token,
      idUser: this.cuser.iduser,
      modulo: this.component
  })
  .subscribe(
     
      data => {
          if (data.success == true) {
              //DataInfo
              this.tipRole = data.data['tipRole'];

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
  if (this.formCalen.valid) {
      this.loading.emit(true);
      let body = {
          listas: this.formCalen.value,
      }
      this.WebApiService.postRequest(this.endpoint, body, {
        token: this.cuser.token,
        idUser: this.cuser.iduser,
        modulo: this.component
      })
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
getDataUpdate(){
  this.loading.emit(true);
  this.WebApiService.getRequest(this.endpoint, {
      action: 'getParamUpdateSet',
      id: this.data.id,
      tipMat: this.tipMatriz,
      tipRole:this.tipRole,
      token: this.cuser.token,
      idUser: this.cuser.iduser,
      modulo: this.component

  })
  .subscribe(
      data => {
            if(data.data['getDataUpda'].length == 2){
                  this.checked = true;
                  this.idCal = data.data['getDataUpda'][0].cal_id;
                  this.formCalen.get('month').setValue(data.data['getDataUpda'][0].na);
                  this.formCalen.get('day_hol').setValue(data.data['getDataUpda'][0].day_hol);

                  this.formFeed.get('month').setValue(data.data['getDataUpda'][1].na);
                  this.formFeed.get('day_hol').setValue(data.data['getDataUpda'][1].day_hol);
                  this.idCalSec = data.data['getDataUpda'][1].cal_id;
            }else{
                  this.checked = false;
                  this.idCal = data.data['getDataUpda'][0].cal_id;
                  this.formCalen.get('month').setValue(data.data['getDataUpda'][0].na);
                  this.formCalen.get('day_hol').setValue(data.data['getDataUpda'][0].day_hol);
            }    
      },
      error => {
          this.handler.showError();
          this.loading.emit(false);
      }
  );
}
onSubmitUpdate(){

  let body = {
      listas: this.formCalen.value,
      calen: this.formFeed.value,  
       tipMat: this.tipMatriz,
      //  id: this.idfeed,
       id2: this.idCalSec,
  }
  if (this.formCalen.valid) {
    this.loading.emit(true);
    this.WebApiService.putRequest(this.endpoint+'/'+this.idCal,body,{
      token: this.cuser.token,
      idUser: this.cuser.iduser,
      modulo: this.component
    })
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
          console.log(error);
            this.handler.showError(error);
            this.loading.emit(false);
        }
    );
  }else {
    this.handler.showError('Complete la informacion necesaria');
    this.loading.emit(false);
  }
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
  
  openSnackBar(e){
    this.formCalen.value.sign = e; 

    console.log(this.formCalen.value.sign)
  }
  getInterInvalid(){
    return this.formCalen.get('tipo_intervencion').invalid && this.formCalen.get('tipo_intervencion').touched;
}
  getMatrizInvalid(){
  return this.formCalen.get('matrizarp').invalid && this.formCalen.get('matrizarp').touched;
  }
  getDocuInvalid(){
  return this.formCalen.get('document').invalid && this.formCalen.get('document').touched;
  }
  getVisibleInvalid(){
    return this.formCalen.get('visible').invalid && this.formCalen.get('visible').touched;
  }
  getDescripInvalid(){
    return this.formCalen.get('des_crip').invalid && this.formCalen.get('des_crip').touched;
  }
  getRecomInvalid(){
    return this.formCalen.get('rec_com').invalid && this.formCalen.get('rec_com').touched;
  }
}
