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


@Component({
    selector: 'app-cargueBase',
    templateUrl: './cargueBase.dialog.component.html',
    styleUrls: ['./cargueBase.dialog.component.css']
  })
  export class cargueBaseDialog  {

    listCampana: any = [];
    ListSegmento: any = [];
    historyMon: any = [];
    displayedColumns:any  = [];
    dataCarBase: any = [];
    public clickedRows;
    public cuser: any = JSON.parse(localStorage.getItem('currentUser'));
    component = "/callcenter/cargue-contact";

     //OUTPUTS
     @Output() loading = new EventEmitter();
     @Output() reload = new EventEmitter();
     @ViewChildren(MatSort) sort = new QueryList<MatSort>();
     //VARIABLES
     endpoint:      string = '/carguecontac';
     maskDNI        = global.maskDNI;
     view:          string = null;
     idAds:         number = null;
     title:         string = null;
     idNomi:        number = null;
     formProces:    FormGroup;
     archivoCSV: any;
     archivo = {
        nombre: null,
        nombreArchivo: null,
        base64textString: null
    }
    
     constructor(
        public dialogRef: MatDialogRef<cargueBaseDialog>,
        private WebApiService: WebApiService,
        private handler: HandlerAppService,
        @Inject(MAT_DIALOG_DATA) public data,
        public dialog: MatDialog
      ) {
        this.view = this.data.window;
        this.idNomi = null;

        switch (this.view) {
            case 'view':
                this.idNomi = this.data.codigo;
                this.loading.emit(true);
                this.WebApiService.getRequest(this.endpoint + '/' + this.idNomi, {
                    idUser: this.cuser.iduser,
                    role: this.cuser.role,
                    token: this.cuser.token,
                    modulo: this.component
                })
                    .subscribe(
                        data => {
                            if (data.success == true) {
                                this.dataCarBase = data.data['getDataCarBas'][0];
                                // this.generateTable(data.data['getDatHistory']);   
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

            case 'create':
                this.initForms();
                this.title = "Cargar Nueva Base";
            break;

            case 'update':
                this.initForms();
                this.title = "Actualizar Novedad De La Base";
                this.idNomi = this.data.codigo;
            break;
        }
      }

      initForms(){
        this.getDataInit();
        this.formProces = new FormGroup({
            campana: new FormControl(""),
            fch_hra_reg: new FormControl(""),
            idUser: new FormControl(this.cuser.iduser),
            nomb_arch: new FormControl(""),
            segme_carg: new FormControl(""),
            fech_form: new FormControl(""),
        });
    }

    getDataInit(){
        this.loading.emit(false);
        this.WebApiService.getRequest(this.endpoint, {
            action: 'getParamView',
            idUser: this.cuser.iduser,
            role: this.cuser.role,
            token: this.cuser.token,
            modulo: this.component
        })
        .subscribe(
           
            data => {
                if (data.success == true) {
                    //DataInfo
                                    
                    this.listCampana   = data.data['getCampana'];
                    this.ListSegmento  = data.data['getSegmento'];
                    
                    console.log(this.listCampana);
                    // console.log(ListSegmento);

                    if (this.view == 'update') {
                    
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

      onSubmi(){
        if (this.formProces.valid) {
                this.loading.emit(true);
                let body = {
                    cargaB: this.formProces.value ,
                    archivoRes: this.archivo     
                }
                console.log(body);
                this.WebApiService.postRequest(this.endpoint, body, {
                    idUser: this.cuser.iduser,
                    role: this.cuser.role,
                    token: this.cuser.token,
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
            } else {
                this.handler.showError('Complete la informacion necesaria');
                this.loading.emit(false);
            }
        }

        onSubmitUpdate(){

            let body = {
                salud: this.formProces.value,
                // archivoRes: this.archivo    
            }
    
                this.loading.emit(true);
                this.WebApiService.putRequest(this.endpoint+'/'+this.idNomi,body,{
                    idUser: this.cuser.iduser,
                    role: this.cuser.role,
                    token: this.cuser.token,
                    // modulo: this.component
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
                    id: this.idNomi,
                    idUser: this.cuser.iduser,
                    role: this.cuser.role,
                    token: this.cuser.token,
                    modulo: this.component
                })
                .subscribe(
                    data => {
                        this.formProces.get('campana').setValue(data.data['getDataUpda'][0].campana);
                        this.formProces.get('fch_hra_reg').setValue(data.data['getDataUpda'][0].fch_hra_reg);
                        this.formProces.get('idUser').setValue(data.data['getDataUpda'][0].idUser);
                        this.formProces.get('nomb_arch').setValue(data.data['getDataUpda'][0].nomb_arch);
                        this.formProces.get('segme_carg').setValue(data.data['getDataUpda'][0].segme_carg);
                        this.formProces.get('fech_form').setValue(data.data['getDataUpda'][0].fech_form);
                        this.archivo.nombre = data.data['getDataUpda'][0].file_sp;
                    },
                    error => {
                        this.handler.showError();
                        this.loading.emit(false);
                    }
                );
             } 
//Nombre Archivo 
             seleccionarArchivo(event){
                var files = event.target.files;
                var file  = files[0];
                this.archivo.nombreArchivo = file.name;
                console.log(this.archivo);
                this.formProces.get('nomb_arch').setValue(this.archivo.nombreArchivo);
                if(files && file){
                    var reader = new FileReader();
                    reader.onload = this._handleReaderLoaded.bind(this);
                    reader.readAsBinaryString(file);
                } 
            }

            _handleReaderLoaded(readerEvent){
                var binaryString = readerEvent.target.result;
                this.archivo.base64textString = btoa(binaryString);
            }

        }