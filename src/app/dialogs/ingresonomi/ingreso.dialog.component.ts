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
    selector: 'ingreso-dialog',
    templateUrl: 'ingreso.dialog.html',
    styleUrls: ['./ingreso.dialog.component.css'],
})

export class IngresoDialog{

    endpoint:      string = '/novnomi';
    maskDNI        = global.maskDNI;
    view:          string = null;
    idNomi:        number = null;
    title:         string = null;
    formNomi:      FormGroup;
    PersonaleInfo: any = [];
    ListArea:      any = [];
    selectedFile:  File = null;
    ciyiWork: any = [];
    archivo = {
        nombre: null,
        nombreArchivo: null,
        base64textString: null
    }
    ListTipoGes:    any = [];
    dataNovNi: any = []; 
    //History
    historyMon: any = [];
    displayedColumns:any  = [];
    condition: any = [];
    state: any = [];
    public clickedRows;
    public cuser: any = JSON.parse(localStorage.getItem('currentUser'));
    component = "/nomi/ingreso";

    //OUTPUTS
    @Output() loading = new EventEmitter();
    @Output() reload = new EventEmitter();
    @ViewChildren(MatSort) sort = new QueryList<MatSort>();

    constructor(

        public dialogRef: MatDialogRef<IngresoDialog>,
        private WebApiService: WebApiService,
        private handler: HandlerAppService,
        @Inject(MAT_DIALOG_DATA) public data,
        public dialog: MatDialog,
        private uploadFileService: NovedadesnominaServices
    ) {

        this.view = this.data.window;
        this.idNomi = null;

        switch (this.view) {
            case 'create':
                this.initForms();
                this.title = "Crear Novedad Ingreso/Retiro";
            break;
            case 'update':
                this.initForms();
                this.title = "Actualizar Novedad";
                this.idNomi = this.data.codigo;
            break;
            case 'view':
                this.idNomi = this.data.codigo;
                this.loading.emit(true);
                this.WebApiService.getRequest(this.endpoint + '/' + this.idNomi, {
                    token: this.cuser.token,
                    idUser: this.cuser.iduser,
                    modulo: this.component
                })
                    .subscribe(
                        data => {
                            if (data.success == true) {
                               
                                this.dataNovNi = data.data['getDataNom'][0];       
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

    initForms() {
        this.getDataInit();
        this.formNomi = new FormGroup({
            document: new FormControl(""),
            idPersonale: new FormControl(""),
            area: new FormControl(""),
            date_nov: new FormControl(""),
            state: new FormControl(""),
            createUser: new FormControl(this.cuser.iduser)
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
            action: 'getParamView',
            token: this.cuser.token,
            idUser: this.cuser.iduser,
            modulo: this.component
        })
        .subscribe(
           
            data => {
                if (data.success == true) {
                    //DataInfo
                    this.PersonaleInfo = data.data['getDataPersonale'];
                    this.ListArea      = data.data['getDatArea'];
                    this.ListTipoGes   = data.data['getDatTipoGes'];
                    this.ciyiWork      = data.data['citys'];
                    this.condition     = data.data['condition'];
                    this.state     = data.data['state'];

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
        
       
        let exitsPersonal = this.PersonaleInfo.find(element => element.document == event);
        if( exitsPersonal ){
            this.formNomi.get('idPersonale').setValue(exitsPersonal.idPersonale);
            this.formNomi.get('area').setValue(exitsPersonal.idArea);
        }        
    }

    onSelectionJFChange(event){
        
       
        let exitsPersonal = this.PersonaleInfo.find(element => element.document == event);
        if( exitsPersonal ){
            this.formNomi.get('directboss_nc').setValue(exitsPersonal.idPersonale);
        }        
    }

    closeDialog() {
        this.dialogRef.close();
    }

    seleccionarArchivo(event){
        var files = event.target.files;
        var file  = files[0];
        this.archivo.nombreArchivo = file.name;

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

    getDataUpdate(){

        this.loading.emit(true);
        this.WebApiService.getRequest(this.endpoint, {
            action: 'getParamUpdateSet',
            id: this.idNomi,
            token: this.cuser.token,
            idUser: this.cuser.iduser,
            modulo: this.component
        })
        .subscribe(
            data => {

                this.formNomi.get('area').setValue(data.data['getDataUpda'][0].area);
                this.formNomi.get('date_nov').setValue(data.data['getDataUpda'][0].date_nov);
                this.formNomi.get('document').setValue(data.data['getDataUpda'][0].document);
                this.formNomi.get('idPersonale').setValue(data.data['getDataUpda'][0].idPersonale);
                this.formNomi.get('state').setValue(data.data['getDataUpda'][0].state);
              
            },
            error => {
                this.handler.showError();
                this.loading.emit(false);
            }
        );
    }

    //Enviar Informacion
    onSubmi(){

        if (this.formNomi.valid) {
            this.loading.emit(true);
            let body = {
                novedades: this.formNomi.value, 
                archivoRes: this.archivo       
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
                )
        } else {
            this.handler.showError('Complete la informacion necesaria');
            this.loading.emit(false);
        }
    }

    onSubmitUpdate(){

            let body = {
                novedades: this.formNomi.value, 
                archivoRes: this.archivo    
            }
            this.loading.emit(true);
            this.WebApiService.putRequest(this.endpoint+'/'+this.idNomi,body,{
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

}