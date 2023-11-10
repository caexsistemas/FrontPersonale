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
    ListSubCamp: any = [];
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
     dataCad:       any = []; 
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
            case 'update':
                this.initForms();
                this.title = "Actualizar Descripcion Base";
                this.idNomi = this.data.codigo;
            break;
        }
      }

      initForms(){
        this.getDataInit();
        this.formProces = new FormGroup({
            dba_desc: new FormControl("")
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
                                    
                    this.listCampana  = data.data['getCampana'];
                    this.ListSubCamp  = data.data['getSubCampana'];
                    
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


    onSubmitUpdate(){

        let body = {
            carBas: this.formProces.value, 
        }

        this.loading.emit(true);
        this.WebApiService.putRequest(this.endpoint+'/'+this.idNomi,body,{
            idUser: this.cuser.iduser,
            role: this.cuser.role,
            token: this.cuser.token,
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
            id: this.idNomi,
            idUser: this.cuser.iduser,
            role: this.cuser.role,
            token: this.cuser.token,
            modulo: this.component
        })
        .subscribe(
            data => {
                this.dataCad = data.data['getDataUpdate'][0];
                this.formProces.get('dba_desc').setValue(data.data['getDataUpdate'][0].dba_desc);
            },
            error => {
                this.handler.showError();
                this.loading.emit(false);
            }
        );
    } 

}