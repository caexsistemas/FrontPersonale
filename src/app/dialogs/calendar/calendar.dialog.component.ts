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
  month: string,
  day_hol:string,
  actions: string
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
    fes: any = [];
    status: any = [];
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
       
        case 'createCal':
          this.tipMatriz = this.data.tipoMat;
            this.initForms();
            this.title = "Ingresar Festivo";
            this.idfeed = this.data.codigo;
          break;
          case "view":
            this.idfeed = this.data.id;
            // this.idfeed = this.data.codigo;
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
                 
                      this.calend = data.data['getDataView'][0];
                      this.generateTable(data.data['getSelectData']);
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
            case 'updateCal':
            this.initForms();
            this.title = "Actualizar Festivos";
            this.idfeed = this.data.codigo;
            break;
        }
  }

  optionCal(action, codigo=null, id){

    var dialogRef;
    switch(action){

        case 'updateCal':
            this.loading.emit(true);
            dialogRef = this.dialog.open(CalendarDialog,{
            data: {
                window: 'updateCal',
                codigo,
                id:id
            }
            });
            // dialogRef.disableClose = true;
              // LOADING
              dialogRef.componentInstance.loading.subscribe(val=>{
            this.loading.emit(false);
            // this.loading = val;
              });
              // RELOAD
              dialogRef.componentInstance.reload.subscribe(val=>{
                this.reload.emit(true);
              });
                this.closeDialog();
           
        break;

        case 'view':
            this.loading.emit(true);
            dialogRef = this.dialog.open(CalendarDialog,{
            data: {
                window: 'view',
                codigo,
                id
            }
            });
            dialogRef.disableClose = true;
              // LOADING
              dialogRef.componentInstance.loading.subscribe(val=>{
            this.loading.emit(false);
                // this.loading = val;
              });
              // RELOAD
              dialogRef.componentInstance.reload.subscribe(val=>{
                this.reload.emit(true); 
              });

        break;

        case 'createCal':
            this.loading.emit(true);
            dialogRef = this.dialog.open(CalendarDialog,{
            data: {
                window: 'createCal',
                codigo,
            }
            });
            dialogRef.disableClose = true;
              // LOADING
              dialogRef.componentInstance.loading.subscribe(val=>{
                this.loading = val;
              });
              // RELOAD
              dialogRef.componentInstance.reload.subscribe(val=>{
                this.reload.emit(true);
              });
            this.closeDialog();
        break;
    }
}
closeDialog() {
  this.dialogRef.close();
  this.reload.emit(true);

}
  initForms() {
    this.getDataInit();
    this.formCalen = new FormGroup({
      month: new FormControl(""),
      day_hol: new FormControl("", [ Validators.required]),
      status: new FormControl("", [Validators.required])       
    });
   
}
// generateTable(data){
//   this.displayedColumns = [
//     'currentm_user',
//     'date_move',
//     'type_move'  
//   ];
//   this.historyMon = data;
//   this.clickedRows = new Set<PeriodicElement>();
// }
generateTable(data){
  this.displayedColumns = [
    'month',
    'day_hol',
    'status',
    'actions'  
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
              this.status = data.data['getStatus'].slice(0,2);
              this.loading.emit(false);
                  if (this.view == 'updateCal') {
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
      this.formCalen.value.month = this.idfeed
      let body = {
          listas: this.formCalen.value,
          // month: this.idfeed
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
                      this.optionCal('view',this.data.codigo,this.idfeed);

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
      id: this.data.codigo,
      tipMat: this.tipMatriz,
      tipRole:this.tipRole,
      token: this.cuser.token,
      idUser: this.cuser.iduser,
      modulo: this.component

  })
  .subscribe(
      data => {
            
        this.formCalen.get('month').setValue(data.data['getDataUpda'][0].na);
        this.formCalen.get('day_hol').setValue(data.data['getDataUpda'][0].day_hol);
        this.formCalen.get('status').setValue(data.data['getDataUpda'][0].status);
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
       id: this.data.codigo,
  }
  if (this.formCalen.valid) {
    this.loading.emit(true);
    this.WebApiService.putRequest(this.endpoint+'/'+this.idfeed,body,{
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
                this.optionCal('view',this.data.codigo,this.data.id);

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
  getStatus(){
    return this.formCalen.get('status').invalid && this.formCalen.get('status').touched;
}
  getDay(){
    return this.formCalen.get('day_hol').invalid && this.formCalen.get('day_hol').touched;
  }
 
}
