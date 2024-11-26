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
    selector: 'app-certificates',
    templateUrl: './certificates.dialogs.component.html',
    styleUrls: ['./certificates.dialogs.component.css']
  })

  export class CertificatesDialog {

    //History
    historyMon: any = [];
    displayedColumns:any  = [];
    public clickedRows;
    public cuser: any = JSON.parse(localStorage.getItem('currentUser'));
    component = "/management/certificates";
    //OUTPUTS
    @Output() loading = new EventEmitter();
    @Output() loadingtwo = new EventEmitter();
    @Output() reload = new EventEmitter();
    @ViewChildren(MatSort) sort = new QueryList<MatSort>();
    //VARIABLES
    endpoint:      string = '/certificates';
    maskDNI        = global.maskDNI;
    view:          string = null;
    idAds:         number = null;
    title:         string = null;
    formProces:    FormGroup;
    ListPersonale: any = [];
    ListStatus:    any = [];
    ListTipCer:    any = [];
    dataAbs:       any = []; 
    ListConSin:    any = [];
    ListTipoComis: any = [];
    tup_sala:      boolean = false;
    requi_sal:     boolean = false;
    viscamp_cb:    boolean = false;

    constructor(        
        public dialogRef: MatDialogRef<CertificatesDialog>,
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
                this.title = "Gestionar Certificados";
              break;
              case 'update':
                this.initForms();
                this.title = "Actualizar Certificados";
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
          idPersonale: new FormControl(""),
          status: new FormControl(""),
          tip_certi: new FormControl(""),
          token: new FormControl(""),
          document: new FormControl(""),
          desplesal: new FormControl(""),
          createUser: new FormControl(this.cuser.iduser),
          fi_inicio: new FormControl(""),
          tipo_comi: new FormControl(""),
          men_num: new FormControl(""),
          ff_fin: new FormControl("")
      });
    }

    getDataInit(){
      this.loading.emit(false);
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
                  this.ListStatus    = data.data['getDatStatus'];
                  this.ListTipCer    = data.data['getDatTipoCer'];
                  this.ListPersonale = data.data['getDataPersonale'];
                  this.ListConSin    = data.data['getDatconsin'];
                  this.ListTipoComis = data.data['getDatcomibono'];

                  this.formProces.get('token').setValue(data.data['getDatToken']);
                  this.formProces.get('status').setValue('82/1');

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

    closeDialog() {
      this.dialogRef.close();
    }

    onSelectionChange(event){
        let personale = this.ListPersonale;        
        let exitsPersonal = personale.find(element => element.document == event);
        if( exitsPersonal ){
            this.formProces.get('idPersonale').setValue(exitsPersonal.idPersonale);
            if( exitsPersonal.tipsalarywork == '81/2'){
                this.tup_sala = true;
            }
        } else{
            this.formProces.get('idPersonale').setValue('');
        }     
    }

    onSelectioncomibonos(event){
        if( event != '' ){
            this.viscamp_cb = true;
        }      
    }

    onSelecTipoCerti(event){

        if( event == '84/2'){
            this.tup_sala = false;
            this.viscamp_cb = false;
            this.formProces.get('tipo_comi').setValue("");
            this.formProces.get('fi_inicio').setValue("");
            this.formProces.get('ff_fin').setValue("");
            this.formProces.get('men_num').setValue("");
            
        }else{
            this.tup_sala = true;
        }
        
    }

    //Enviar Informacion
    onSubmi(){

        if( this.viscamp_cb == true
            && this.tup_sala == true
            && this.formProces.value.tipo_comi.length > 0
            && ( this.formProces.value.men_num < 0
                 || this.formProces.value.men_num == '' 
                 || this.formProces.value.men_num == null
               )
            ){
            this.handler.showError('Por favor ingresar el numero de meses');
            this.loading.emit(false);
            return;
        }

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
    
  }

  onSubmitUpdate(){

    if( this.formProces.value.fi_inicio >= this.formProces.value.ff_fin 
        && this.requi_sal == true
        ){
        this.handler.showError('Por favor validar el rango de fechas');
        this.loading.emit(false);
        return;
    }

    let body = {
        absen: this.formProces.value,
    }
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
            //this.formProces.get('idPersonale').setValue(data.data['getDataUpda'][0].idPersonale);
            this.formProces.get('token').setValue(data.data['getDataUpda'][0].token);
            this.formProces.get('status').setValue(data.data['getDataUpda'][0].status);
            this.formProces.get('tip_certi').setValue(data.data['getDataUpda'][0].tip_certi);  
            this.formProces.get('desplesal').setValue(data.data['getDataUpda'][0].desplesal);
            this.formProces.get('fi_inicio').setValue(data.data['getDataUpda'][0].fi_inicio);
            this.formProces.get('ff_fin').setValue(data.data['getDataUpda'][0].ff_fin);
            this.formProces.get('tipo_comi').setValue(data.data['getDataUpda'][0].tipo_comi); 
            this.formProces.get('men_num').setValue(data.data['getDataUpda'][0].men_num);   

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

  }