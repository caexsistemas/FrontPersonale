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
    selector: 'processalud-dialog',
    templateUrl: 'processalud.dialog.html',
    styleUrls: ['./processalud.dialog.component.css'],
})

export class ProcessaludDialog{

    endpoint:      string = '/procesald';
    maskDNI        = global.maskDNI;
    view:          string = null;
    idNomi:        number = null;
    title:         string = null;
    formProces:    FormGroup;
    PersonaleInfo: any = [];
    ListArea:      any = [];
    selectedFile:  File = null;
    requidSopo:    boolean = false;
    archivo = {
        nombre: null,
        nombreArchivo: null,
        base64textString: null
    }
    ListTipoGes:   any = [];
    dataNovNi:     any = []; 
    ListSiNo:      any = [];
    ListEps:       any = [];
    ListPension:   any = [];
    fechInicInc: string = "";
    fechaFinInc: string = "";
    //History
    historyMon: any = [];
    displayedColumns:any  = [];
    public clickedRows;
    public cuser: any = JSON.parse(localStorage.getItem('currentUser'));

    //OUTPUTS
    @Output() loading = new EventEmitter();
    @Output() reload = new EventEmitter();
    @ViewChildren(MatSort) sort = new QueryList<MatSort>();

    constructor(

        public dialogRef: MatDialogRef<ProcessaludDialog>,
        private WebApiService: WebApiService,
        private handler: HandlerAppService,
        @Inject(MAT_DIALOG_DATA) public data,
        public dialog: MatDialog
    ) {
        this.view = this.data.window;
        this.idNomi = null;

        switch (this.view) {
            case 'create':
                this.initForms();
                this.title = "Crear Novedad Medica";
            break;
            case 'update':
                this.initForms();
                this.title = "Actualizar Novedad Medica";
                this.idNomi = this.data.codigo;
            break;
            case 'view':
                this.idNomi = this.data.codigo;
                this.loading.emit(true);
                this.WebApiService.getRequest(this.endpoint + '/' + this.idNomi, {})
                    .subscribe(
                        data => {
                            if (data.success == true) {
                                this.dataNovNi = data.data['getDatPer'][0];
                                //this.generateTable(data.data['getDatHistory']);   
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

    generateTable(data){
        this.displayedColumns = [
          'currentm_user',
          'date_move',
          'type_move'  
        ];
        this.historyMon = data;
        this.clickedRows = new Set<PeriodicElement>();
    }

    initForms(){
        this.getDataInit();
        this.formProces = new FormGroup({
            document_tr: new FormControl(""),
            idPersonale: new FormControl(""),
            tipo_gestion: new FormControl(""),
            area: new FormControl(""),
            ciudad: new FormControl(""),
            salario: new FormControl(""),
            document_jf: new FormControl(""),
            nombentreinc: new FormControl(""),
            fechainicausen: new FormControl(""),
            fechafinausen: new FormControl(""),
            //file_sp: new FormControl(""),
            soporte_nove: new FormControl(""),
            edad_tb: new FormControl(""),
            numdiasincap: new FormControl(""),
            observacion_tb: new FormControl(""),
            idEps: new FormControl(""),
            idPension: new FormControl(""),
            coverageArl: new FormControl(""),
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
                    this.PersonaleInfo = data.data['getDataPersonale'];
                    this.ListArea      = data.data['getDatArea'];
                    this.ListTipoGes   = data.data['getDatTipoGes'];
                    this.ListSiNo      = data.data['getDatSiNo'];
                    this.ListEps       = data.data['getEps'];
                    this.ListPension   = data.data['getPension'];

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

    onSelectionChange(event){
             
        let exitsPersonal = this.PersonaleInfo.find(element => element.document == event);
        if( exitsPersonal ){
            this.formProces.get('idPersonale').setValue(exitsPersonal.idPersonale);
            this.formProces.get('area').setValue(exitsPersonal.idArea);
            this.formProces.get('document_jf').setValue(exitsPersonal.document_jf);    
            this.formProces.get('ciudad').setValue(exitsPersonal.city); 
            this.formProces.get('edad_tb').setValue(exitsPersonal.edad); 
            this.formProces.get('idEps').setValue(exitsPersonal.idEps);
            this.formProces.get('idPension').setValue(exitsPersonal.idPension);
            this.formProces.get('coverageArl').setValue(exitsPersonal.coverageArl);
            this.formProces.get('salario').setValue(exitsPersonal.salary);

        }        
    }

    onSelectionJFChange(event){
        
        let exitsPersonal = this.PersonaleInfo.find(element => element.document == event);
        if( exitsPersonal ){
            this.formProces.get('nombentreinc').setValue(exitsPersonal.idPersonale);
        }        
    }

    onSoporteNovChange(event){

        if(event == "17/0"){
            this.requidSopo = true;
        }else{
            this.requidSopo = false;
        }
    }

    
    getDataUpdate(){

        this.loading.emit(true);
        this.WebApiService.getRequest(this.endpoint, {
            action: 'getParamUpdateSet',
            id: this.idNomi
        })
        .subscribe(
            data => {

                this.formProces.get('document_tr').setValue(data.data['getDataUpda'][0].document_tr);
                this.formProces.get('tipo_gestion').setValue(data.data['getDataUpda'][0].tipo_gestion);
                this.formProces.get('area').setValue(data.data['getDataUpda'][0].area);
                this.formProces.get('ciudad').setValue(data.data['getDataUpda'][0].ciudad);
                this.formProces.get('salario').setValue(data.data['getDataUpda'][0].salario);
                this.formProces.get('document_jf').setValue(data.data['getDataUpda'][0].document_jf);
                this.formProces.get('fechainicausen').setValue(data.data['getDataUpda'][0].fechainicausen);
                this.formProces.get('fechafinausen').setValue(data.data['getDataUpda'][0].fechafinausen);
                this.formProces.get('soporte_nove').setValue(data.data['getDataUpda'][0].soporte_nove);
                this.formProces.get('edad_tb').setValue(data.data['getDataUpda'][0].edad_tb);
                this.archivo.nombre = data.data['getDataUpda'][0].file_sp;
                this.formProces.get('observacion_tb').setValue(data.data['getDataUpda'][0].observacion_tb);
                this.formProces.get('idEps').setValue(data.data['getDataUpda'][0].idEps);
                this.formProces.get('idPension').setValue(data.data['getDataUpda'][0].idPension);
                this.formProces.get('coverageArl').setValue(data.data['getDataUpda'][0].coverageArl);
                this.formProces.get('idPersonale').setValue(data.data['getDataUpda'][0].idPersonale);
                         
            },
            error => {
                this.handler.showError();
                this.loading.emit(false);
            }
        );
    }

     //Enviar Informacion
     onSubmi(){
        
        if (this.formProces.valid) {
            if( this.formProces.value.fechainicausen <= this.formProces.value.fechafinausen){
                this.loading.emit(true);
                let body = {
                    salud: this.formProces.value, 
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
                    );
            }else {
                this.handler.showError('Por favor validar el rango de fechas');
                this.loading.emit(false);
            }
        } else {
            this.handler.showError('Complete la informacion necesaria');
            this.loading.emit(false);
        }
    }

    
    onSubmitUpdate(){

        let body = {
            salud: this.formProces.value,
            archivoRes: this.archivo    
        }
        if( this.formProces.value.fechainicausen <= this.formProces.value.fechafinausen){
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
        }else {
            this.handler.showError('Por favor validar el rango de fechas');
            this.loading.emit(false);
        }
    }

    onFechaIniChange(event){

        this.fechInicInc = event;
        this.calFechaNumReq(this.fechInicInc, this.fechaFinInc);
     }
     
     onFechaFinChange(event){
         
         this.fechaFinInc = event;
         this.calFechaNumReq(this.fechInicInc, this.fechaFinInc);
     }

    //Rango De Dias 
     calFechaNumReq(f1, f2){

        //Limite de fecha
        var aFecha1 = f1.split('-');
        var aFecha2 = f2.split('-');
        var fFecha1 = Date.UTC(aFecha1[0],aFecha1[1]-1,aFecha1[2]);
        var fFecha2 = Date.UTC(aFecha2[0],aFecha2[1]-1,aFecha2[2]);
        var dif = fFecha2 - fFecha1;
        var dias = Math.floor(dif / (1000 * 60 * 60 * 24));
        dias = dias + 1;
        if( dias > 0 ){
            this.formProces.get('numdiasincap').setValue(dias);
        }else{
            this.formProces.get('numdiasincap').setValue(0);
        }
        
    }


}