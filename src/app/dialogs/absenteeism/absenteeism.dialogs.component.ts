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
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { ProcessaludDialog } from '../../dialogs/processalud/processalud.dialog.component';

export interface PeriodicElement {
    currentm_user: string,
    date_move:string,
    type_move: string
  }

@Component({
  selector: 'app-absenteeism',
  templateUrl: './absenteeism.dialogs.component.html',
  styleUrls: ['./absenteeism.dialogs.component.css']
})
export class AbsenteeismDialog {

  //History
  historyMon: any = [];
  displayedColumns:any  = [];
  public clickedRows;
  public cuser: any = JSON.parse(localStorage.getItem('currentUser'));
  //OUTPUTS
  @Output() loading = new EventEmitter();
  @Output() loadingtwo = new EventEmitter();
  @Output() reload = new EventEmitter();
  @ViewChildren(MatSort) sort = new QueryList<MatSort>();
  //VARIABLES
  endpoint:      string = '/absenteeisms';
  maskDNI        = global.maskDNI;
  view:          string = null;
  idAds:         number = null;
  title:         string = null;
  formProces:    FormGroup;
  Listmatrizarp: any = [];
  Listmotivo:    any = [];
  ListPersonale: any = [];
  dataAbs:     any = []; 

  constructor(        public dialogRef: MatDialogRef<AbsenteeismDialog>,
    private WebApiService: WebApiService,
    private handler: HandlerAppService,
    @Inject(MAT_DIALOG_DATA) public data,
    public dialog: MatDialog) { 

      this.view = this.data.window;
      this.idAds = null;

      switch (this.view) {
          case 'create':
              this.initForms();
              this.title = "Crear Ausentismo";
          break;
          case 'update':
            this.initForms();
            this.title = "Actualizar Ausentismo";
            this.idAds = this.data.codigo;
          break;
          case 'view':
            this.idAds = this.data.codigo;
            this.loading.emit(true);
            this.WebApiService.getRequest(this.endpoint + '/' + this.idAds, {})
                .subscribe(
                    data => {
                        if (data.success == true) {
                            this.dataAbs = data.data['getDatPer'][0];
                            this.generateTable(data.data['getDatHistory']);   
                            this.loading.emit(false);
                        } else {
                            this.handler.handlerError(data);
                            this.closeDialog(); 
                            this.loading.emit(false);
                        }
                    },
                    error => {
                        this.handler.showError('Se produjo un error');
                        this.loading.emit(false);
                    }
                );
        break;
      }
    }

    initForms(){
      this.getDataInit();
      this.formProces = new FormGroup({
          document: new FormControl(""),
          idPersonale: new FormControl(""),
          idPersJefe: new FormControl(""),
          matrizarp: new FormControl(""),
          motivo: new FormControl(""),
          fecha_ausencia: new FormControl(""),
          fecha_finausen: new FormControl(""),
          createUser: new FormControl(this.cuser.iduser)
      });
  }

    getDataInit(){
      this.loading.emit(false);
      this.WebApiService.getRequest(this.endpoint, {
          action: 'getParamView',
      })
      .subscribe(
         
          data => {
              if (data.success == true) {
                  //DataInfo
                  this.Listmatrizarp = data.data['matrizarp'];
                  this.Listmotivo    = data.data['motivo'];
                  this.ListPersonale = data.data['getDataPersonale'];

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

  onSelectionChange(event){
    let personale = this.ListPersonale;        
    let exitsPersonal = personale.find(element => element.document == event);
    if( exitsPersonal ){
        this.formProces.get('idPersonale').setValue(exitsPersonal.idPersonale);
        this.formProces.get('idPersJefe').setValue(exitsPersonal.jef_idPersonale);    
    }        
  }

  closeDialog() {
    this.dialogRef.close();
  }

  //Enviar Informacion
  onSubmi(){

    if( this.formProces.value.fecha_ausencia <= this.formProces.value.fecha_finausen){

        if (this.formProces.valid) {
            this.loading.emit(true);
            let body = {
                absen: this.formProces.value 
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
                        this.handler.showError('Error al realizar el registro');
                        this.loading.emit(false);
                    }
                );  
        } else {
            this.handler.showError('Complete la informacion necesaria');
            this.loading.emit(false);
        }
    }else {
        this.handler.showError('Por favor validar el rango de fechas');
        this.loading.emit(false);
    }
    
  }

  onSubmitUpdate(){

    let body = {
        absen: this.formProces.value,
    }
    if( this.formProces.value.fecha_ausencia <= this.formProces.value.fecha_finausen){
        this.loading.emit(true);
        this.WebApiService.putRequest(this.endpoint+'/'+this.idAds,body,{})
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
                this.handler.showError();
                this.loading.emit(false);
            }
        );
    }else {
        this.handler.showError('Por favor validar el rango de fechas');
        this.loading.emit(false);
    }
 }

 getDataUpdate(){

    this.loading.emit(true);
    this.WebApiService.getRequest(this.endpoint, {
        action: 'getParamUpdateSet',
        id: this.idAds
    })
    .subscribe(
        data => {

            this.formProces.get('document').setValue(data.data['getDataUpda'][0].document);
            this.formProces.get('idPersonale').setValue(data.data['getDataUpda'][0].idPersonale);
            this.formProces.get('idPersJefe').setValue(data.data['getDataUpda'][0].idPersJefe);
            this.formProces.get('matrizarp').setValue(data.data['getDataUpda'][0].matrizarp);
            this.formProces.get('motivo').setValue(data.data['getDataUpda'][0].motivo);
            this.formProces.get('fecha_ausencia').setValue(data.data['getDataUpda'][0].fecha_ausencia);
            this.formProces.get('fecha_finausen').setValue(data.data['getDataUpda'][0].fecha_finausen);
    
        },
        error => {
            this.handler.showError();
            this.loading.emit(false);
        }
    );
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

  optionOtr(action, codigo=null){
    var dialogRef;
    this.loadingtwo.emit(true);
    switch(action){
        case 'createIncapa':
            dialogRef = this.dialog.open(ProcessaludDialog,{
              data: {
                window: 'create',
                codigo
              }
            });
            dialogRef.disableClose = true;
        break;
    }
    this.loadingtwo.emit(false);
  }

  selectProcesald(event){
    if( (event == '60/2' || event == '60/3') ){
        this.optionOtr('createIncapa');
    }     
  }

}
