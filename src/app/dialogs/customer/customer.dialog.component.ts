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

export interface PeriodicElement {
  currentm_user: string,
  date_move:string,
  type_move: string
}

@Component({
    selector: 'app-customer',
    templateUrl: './customer.dialog.component.html',
    styleUrls: ['./customer.dialog.component.css']
  })

  export class CustomerDialog  {

   //History
   historyMon: any = [];
   displayedColumns:any  = [];
   public clickedRows;
   public cuser: any = JSON.parse(localStorage.getItem('currentUser'));
   component = "/callcenter/customer";
    //OUTPUTS
    @Output() loading = new EventEmitter();
    @Output() loadingtwo = new EventEmitter();
    @Output() reload = new EventEmitter();
    @ViewChildren(MatSort) sort = new QueryList<MatSort>();
    //VARIABLES
    endpoint:      string = '/customer';
    maskDNI        = global.maskDNI;
    view:          string = null;
    idAds:         number = null;
    title:         string = null;
    formProces:    FormGroup;
    //Variables
    LisTipomatr:      any = [];
    LisTipogest:      any = [];
    ListVarisino:     any = [];
    personalData:     any = [];
    Listipocampana:   any = [];
    Listcampafilter:  any = [];
    ListCumnocum:     any = [];
    ListgessClar:     any = [];
    camp_acer:        any = [
                              'acer_presta',
                              'acer_empati',
                              'acer_entona',
                              'acer_perfil'
                            ];
    camp_nego:        any = [
                              'nego_descri',
                              'nego_destac',
                              'nego_identi',
                              'nego_utiliz',
                              'nego_ofrece',
                              'nego_persis'
                            ];
    camp_cie:         any = [
                              'cie_reacie',
                              'cie_proven',
                              'cie_reares'
                            ];  
    tipMatriz:        string = "";
    upd_document:     number = 0; 
    dataCad:          any = [];

    constructor(
        public dialogRef: MatDialogRef<CustomerDialog>,
        private WebApiService: WebApiService,
        private handler: HandlerAppService,
        @Inject(MAT_DIALOG_DATA) public data,
        public dialog: MatDialog
      ) {
            this.view = this.data.window;
            this.idAds = null;

              switch (this.view) {
                  case 'create':
                  this.initForms();
                  this.title = "CREAR MEDICION CUSTOMER";
              break;
              case 'update':
                  this.tipMatriz = this.data.tipoMat;
                  this.initForms();
                  this.title = "EDITAR MEDICION CUSTOMER";
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
                                this.dataCad = data.data['getDatPer'][0];
                                this.generateTable(data.data['getDatHistory']);   
                                this.loading.emit(false);
                            } else {
                                this.handler.handlerError(data);
                                this.closeDialog(); 
                                this.loading.emit(false);
                            }
                        },
                        error => {
                            this.handler.showError('Se produjo un error '+error);
                            this.loading.emit(false);
                        }
                    );
            break;
            }
        }

    //Tabla de Historicos
    generateTable(data){
      this.displayedColumns = [
        'currentm_user',
        'date_move',
        'type_move'  
      ];
      this.historyMon = data;
      this.clickedRows = new Set<PeriodicElement>();
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

    closeDialog() {
      this.dialogRef.close();
    }

    initForms(){
        this.getDataInit();
        this.formProces = new FormGroup({
          idPersonale: new FormControl(""),
          createUser: new FormControl(this.cuser.iduser),
          matrizarp: new FormControl(""),
          tipo_gestion: new FormControl(""),
          retro: new FormControl(""),     
          document: new FormControl(""),   
          tip_solitud: new FormControl(""),
          obs_custo: new FormControl(""),

          acer_presta: new FormControl(""),
          acer_empati: new FormControl(""),
          acer_entona: new FormControl(""),
          acer_perfil: new FormControl(""),

          nego_descri: new FormControl(""),
          nego_destac: new FormControl(""),
          nego_ofrece: new FormControl(""),
          nego_identi: new FormControl(""),
          nego_utiliz: new FormControl(""),
          nego_persis: new FormControl(""),

          cie_reacie: new FormControl(""),
          cie_proven: new FormControl(""),
          cie_reares: new FormControl(""),

          date_call: new FormControl(""),
          phone_call: new FormControl(""),
          oferta: new FormControl(""),
          campana: new FormControl(""),
          login_agent: new FormControl(""),
          final_note: new FormControl("")
        });
    }

    getDataInit(){
      this.loading.emit(true);
      this.WebApiService.getRequest(this.endpoint, {
          action: 'getParamView',
          token: this.cuser.token,
          idUser: this.cuser.iduser,
          modulo: this.component
      })
      .subscribe(
         
          data => {
              if (data.success == true) {
                  //DataInfo
                  this.LisTipomatr    = data.data['tipomatr'];
                  this.LisTipogest    = data.data['tipogest'];
                  this.ListVarisino   = data.data['varisino'];
                  this.Listipocampana = data.data['tipocamp'];
                  this.ListCumnocum   = data.data['cumnocum'];
                  this.personalData   = data.data['getDataPersonal'];  //Data Personal
                  this.ListgessClar   = data.data['gessClar'];
  
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
             
      let exitsPersonal = this.personalData.find(element => element.document == event);
      if( exitsPersonal ){
          this.formProces.get('idPersonale').setValue(exitsPersonal.idPersonale); 
          this.formProces.get('matrizarp').setValue(exitsPersonal.matrizarp);   
          this.tipMatriz = exitsPersonal.matrizarp;
      }        
    }

    campaHogarDedi(event){
      this.Listcampafilter = this.Listipocampana.filter(element => element.complemento == event);
    }

    onSubmi(){
      if (this.formProces.valid) {
        this.loading.emit(true);
        let body = {
            pqcalidad: this.formProces.value             
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
                    this.handler.showError();
                    this.loading.emit(false);
                }
            );
      }else {
          this.handler.showError('Complete la informacion necesaria' + this.formProces.valid);
          this.loading.emit(false);
      }
    }

    validcheked(){

      let acer_val = 4;
      let nego_val = 6;
      let cie_val =  3;
      //Sumatorias
      let cum_acer = 0;
      let cum_nego = 0;
      let cum_cie  = 0;
      let noa_acer = 0;
      let noa_nego = 0;
      let noa_cie  = 0;
      //Total
      let total_acer = 0;
      let total_nego = 0;
      let total_cie  = 0;
      let total      = 0;

      for (const field in this.formProces.controls) { 

          //ACERCAMIENTO
          if( this.camp_acer.indexOf(field) !== -1 ){
            if( this.formProces.controls[field].value == '34/1' ){cum_acer++;} else 
            if( this.formProces.controls[field].value == '34/3' ){noa_acer++;}    
          }
          //NEGOCIACION
          if( this.camp_nego.indexOf(field) !== -1 ){
            if( this.formProces.controls[field].value == '34/1' ){cum_nego++;} else 
            if( this.formProces.controls[field].value == '34/3' ){noa_nego++;}    
          }
          //CIERRE
          if( this.camp_cie.indexOf(field) !== -1 ){
            if( this.formProces.controls[field].value == '34/1' ){cum_cie++;} else 
            if( this.formProces.controls[field].value == '34/3' ){noa_cie++;}    
          }

      }

      //PROCESO TOTALES
      total_acer   = 20/(acer_val-noa_acer)*cum_acer;
      if( isNaN(total_acer) ){
        total_acer = 0;
      }
      total_nego   = 50/(nego_val-noa_nego)*cum_nego;
      if( isNaN(total_nego) ){
        total_nego = 0;
      }
      total_cie   = 30/(cie_val-noa_cie)*cum_cie;
      if( isNaN(total_cie) ){
        total_cie = 0;
      }
      //TOTAL DE LOS DATOS
      total = total_acer+total_nego+total_cie;
      this.formProces.get('final_note').setValue(Math.round(total));
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
            //Datos Personales
            this.formProces.get('tipo_gestion').setValue(data.data['getDataUpda'][0].tipo_gestion);
            this.formProces.get('retro').setValue(data.data['getDataUpda'][0].retro);
            this.formProces.get('date_call').setValue(data.data['getDataUpda'][0].date_call);
            this.formProces.get('phone_call').setValue(data.data['getDataUpda'][0].phone_call);
            this.formProces.get('oferta').setValue(data.data['getDataUpda'][0].oferta);
            this.formProces.get('login_agent').setValue(data.data['getDataUpda'][0].login_agent);
            this.formProces.get('matrizarp').setValue(data.data['getDataUpda'][0].matrizarp);
            this.formProces.get('campana').setValue(data.data['getDataUpda'][0].campana);
            this.formProces.get('idPersonale').setValue(data.data['getDataUpda'][0].idPersonale);
            this.formProces.get('tip_solitud').setValue(data.data['getDataUpda'][0].tip_solitud);   
            this.formProces.get('obs_custo').setValue(data.data['getDataUpda'][0].obs_custo);            
            this.upd_document = data.data['getDataUpda'][0].document;
            //ACERCAMIENTO
            this.formProces.get('acer_presta').setValue(data.data['getDataUpda'][0].acer_presta);
            this.formProces.get('acer_empati').setValue(data.data['getDataUpda'][0].acer_empati);
            this.formProces.get('acer_entona').setValue(data.data['getDataUpda'][0].acer_entona);
            this.formProces.get('acer_perfil').setValue(data.data['getDataUpda'][0].acer_perfil);
            //NEGOCIACION
            this.formProces.get('nego_descri').setValue(data.data['getDataUpda'][0].nego_descri);
            this.formProces.get('nego_destac').setValue(data.data['getDataUpda'][0].nego_destac);
            this.formProces.get('nego_ofrece').setValue(data.data['getDataUpda'][0].nego_ofrece);
            this.formProces.get('nego_identi').setValue(data.data['getDataUpda'][0].nego_identi);
            this.formProces.get('nego_utiliz').setValue(data.data['getDataUpda'][0].nego_utiliz);
            this.formProces.get('nego_persis').setValue(data.data['getDataUpda'][0].nego_persis);
            //CIERRE
            this.formProces.get('cie_reacie').setValue(data.data['getDataUpda'][0].cie_reacie);
            this.formProces.get('cie_proven').setValue(data.data['getDataUpda'][0].cie_proven);
            this.formProces.get('cie_reares').setValue(data.data['getDataUpda'][0].cie_reares);
          },
          error => {
              this.handler.showError();
              this.loading.emit(false);
          }
      );
  
    }

    onSubmitUpdate(){

      let body = {
          salud: this.formProces.value  
      }
      if (this.formProces.valid) {
        this.loading.emit(true);
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
                this.handler.showError(error);
                this.loading.emit(false);
            }
        );
      }else {
        this.handler.showError('Complete la informacion necesaria');
        this.loading.emit(false);
      }
    }

  }