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
import { element } from 'protractor';

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
  component = "/procesalud/absenteeisms";
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
  showTipoMatriz: boolean = false;

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
            this.WebApiService.getRequest(this.endpoint + '/' + this.idAds, {
                token: this.cuser.token,
                idUser: this.cuser.iduser,
                modulo: this.component
            })
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
          observacion: new FormControl(""),
          fecha_ausencia: new FormControl(""),
          fecha_finausen: new FormControl(""),
          createUser: new FormControl(this.cuser.iduser)
      });
  }

    getDataInit(){
      this.loading.emit(false);
      this.WebApiService.getRequest(this.endpoint, {
          action: 'getParamView',
          token: this.cuser.token,
          idUser: this.cuser.iduser,
          modulo: this.component,
          role: this.cuser.role,
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
        this.showTipoMatriz = exitsPersonal.isCampaign === 'si';
    } else{
        this.formProces.get('idPersonale').setValue('');
        this.formProces.get('idPersJefe').setValue('');    
        this.showTipoMatriz = false;
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
            this.handler.showLoadin("Guardando Registro", "Por favor espere...");
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
    if (!this.formProces.valid) {
        this.handler.showError('Por favor llenar todos los campos');
        return
    }
    
    if( this.formProces.value.fecha_ausencia <= this.formProces.value.fecha_finausen){
        this.loading.emit(true);
        //Validados incapcidad

        this.WebApiService.putRequest(this.endpoint+'/'+this.idAds,body,{
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
        id: this.idAds,
        token: this.cuser.token,
        idUser: this.cuser.iduser,
        modulo: this.component
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
            this.formProces.get('observacion').setValue(data.data['getDataUpda'][0].observacion);
    
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
        if( (event == '60/2' || event == '60/3') && this.view == 'create' ){
            this.optionOtr('createIncapa');
        }     

        const observacionControl = this.formProces.get('observacion');

        if (event === '60/6') {
            observacionControl?.setValidators([Validators.required]);
        } else {
            observacionControl?.clearValidators();
            observacionControl?.setValue(null); 
        }

        observacionControl?.updateValueAndValidity();
    }

  //Validacion creacion de incapacidad
  valIncapaAusen(){
    this.loading.emit(true);
    this.WebApiService.getRequest(this.endpoint, {
        action: 'getValicapacty',
        id: this.idAds,
        token: this.cuser.token,
        idUser: this.cuser.iduser,
        modulo: this.component,
        idPersonale: this.formProces.value.idPersonale,
        fecha_ausencia: this.formProces.value.fecha_ausencia,
        fecha_finausen: this.formProces.value.fecha_finausen,
    })
    .subscribe(
        data => {

            if(data.success){
              
                if( data.data['resincapa'].resp == 'NO' && (this.formProces.value.motivo == '60/2' || this.formProces.value.motivo == '60/3') ){
                    this.loading.emit(false);
                    this.handler.showError('Por favor diligenciar la incapacidad');
                    this.optionOtr('createIncapa');
                }else{
                    this.loading.emit(false);
                    this.onSubmitUpdate();
                }                            
            }else{
                this.handler.showError('Error al consultar incapacidades');
                this.loading.emit(false);
            }   
        },
        error => {
            this.handler.showError(error);
            this.loading.emit(false);
        }
    );
  }

}
