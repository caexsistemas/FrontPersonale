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
    archivo = {
        nombre: null,
        nombreArchivo: null,
        base64textString: null
    }
    ListTipoGes:    any = [];
    dataNovNi: any = []; 

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
                this.title = "Crear Novedad Ingreso";
            break;
            case 'update':
                this.initForms();
                this.title = "Actualizar Novedad";
                this.idNomi = this.data.codigo;
            break;
            case 'view':
                this.idNomi = this.data.codigo;
                this.loading.emit(true);
                this.WebApiService.getRequest(this.endpoint + '/' + this.idNomi, {})
                    .subscribe(
                        data => {
                            if (data.success == true) {
                                this.dataNovNi = data.data[0];                         
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
            id_novedad_nc: new FormControl(""),
            document_nc: new FormControl(""),
            idPersonale: new FormControl(""),
            area_nc: new FormControl(""),
            directboss_nc: new FormControl(""),
            directboss_nc_jf: new FormControl(""),
            city_nc: new FormControl(""),
            edad_nc: new FormControl(""),
            salary_nc: new FormControl(""),
            daying_nc: new FormControl(""),
            files_nc: new FormControl(""),
            tipoges_nc: new FormControl("")
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
                    this.PersonaleInfo = data.data['getDataPersonale'];
                    this.ListArea      = data.data['getDatArea'];
                    this.ListTipoGes   = data.data['getDatTipoGes'];

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
            id: this.idNomi
        })
        .subscribe(
            data => {

                this.formNomi.get('area_nc').setValue(data.data['getDataUpda'][0].area_nc);
                this.formNomi.get('city_nc').setValue(data.data['getDataUpda'][0].city_nc);
                this.formNomi.get('daying_nc').setValue(data.data['getDataUpda'][0].daying_nc);
                this.formNomi.get('directboss_nc').setValue(data.data['getDataUpda'][0].directboss_nc);
                this.formNomi.get('directboss_nc_jf').setValue(data.data['getDataUpda'][0].directboss_nc_jf);
                this.formNomi.get('document_nc').setValue(data.data['getDataUpda'][0].document_nc);
                this.formNomi.get('edad_nc').setValue(data.data['getDataUpda'][0].edad_nc);
                this.formNomi.get('idPersonale').setValue(data.data['getDataUpda'][0].idPersonale);
                this.formNomi.get('salary_nc').setValue(data.data['getDataUpda'][0].salary_nc);
                this.formNomi.get('tipoges_nc').setValue(data.data['getDataUpda'][0].tipoges_nc);
                this.archivo.nombre = data.data['getDataUpda'][0].files_nc;
                
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

    onSubmitUpdate(){

            let body = {
                novedades: this.formNomi.value, 
                archivoRes: this.archivo    
            }
            this.loading.emit(true);
            this.WebApiService.putRequest(this.endpoint+'/'+this.idNomi,body,{})
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