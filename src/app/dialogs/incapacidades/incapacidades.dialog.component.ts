import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, Inject, Output, EventEmitter, OnInit, ChangeDetectorRef, AfterContentChecked } from '@angular/core';
import { WebApiService } from '../../services/web-api.service';
import { FormGroup, FormControl, Validators, ValidatorFn, ValidationErrors, FormArray } from '@angular/forms';
import { HandlerAppService } from '../../services/handler-app.service';
import { global } from '../../services/global';
import {Observable} from 'rxjs';



export interface personale {
    idPersonale: number,
    name: string,
    document: string
}

@Component({
    selector: 'incapacidades-dialog',
    templateUrl: 'incapacidades.dialog.html',
    styleUrls: ['./incapacidades.dialog.component.css'],
})

export class IncapacidadesDialog implements OnInit {

    view: string = null;
    id: number = null;
    endpoint: string = '/inability';
    dataIncap: any = []; 
    title: string = null;
    filteredOptions: Observable<personale[]>;
    options: personale[];
    PersonaleInfo: any = [];
    PersonaleInfoJF: any = [];
    myControl = new FormControl();
    motausenList: any = [];
    origenausenList: any = [];
    descorigenList: any = [];
    descorigenListTemp: any = [];
    optmotausen: string = null;
    optorigenausen: string = null;
    medRecepInList: any = [];
    siNoList: any = [];
    tipIncaList: any = [];
    fechInicInc: string = "";
    fechaFinInc: string = "";
    estIncAis: any = [];
    codDiagSegList: any = [];
    //OUTPUTS
    @Output() loading = new EventEmitter();
    @Output() reload = new EventEmitter();

     // FORMULARIOS
     formIncapad: FormGroup;

    constructor(
        public dialogRef: MatDialogRef<IncapacidadesDialog>,
        private WebApiService: WebApiService,
        private handler: HandlerAppService,
        @Inject(MAT_DIALOG_DATA) public data,
        public dialog: MatDialog,
        private cdref: ChangeDetectorRef
    ) {
        this.view = this.data.window;
        this.id = null;

        switch (this.view) {
            case 'view':
                this.id = this.data.codigo;
                this.loading.emit(true);
                this.WebApiService.getRequest(this.endpoint + '/' + this.id, {})
                    .subscribe(
                        data => {
                            if (data.success == true) {
                                this.dataIncap = data.data[0];                         
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
                this.title = "Crear Ausentimos por Incapacidad";
            break;
            case 'update':
                this.initForms();
                this.title = "Actualizar Ausentimos por Incapacidad";
                this.id = this.data.codigo;
            break;
        }
    }

    closeDialog() {
        this.dialogRef.close();
    }

    //Formulario
    initForms() {

        this.getDataInit();
        this.formIncapad = new FormGroup({
            numdocument: new FormControl(""),
            idPersonale: new FormControl(""),
            motausen: new FormControl(""),
            origenausen: new FormControl(""),
            descorigen: new FormControl(""),
            medrecepin: new FormControl(""),
            incaporiginal: new FormControl(""),
            nombentreinc: new FormControl(""),
            fechainicausen: new FormControl(""),
            fechafinausen: new FormControl(""),
            tipoincap: new FormControl(""),
            numdiasincap: new FormControl(""),
            codcie: new FormControl(""),
            fechageneracion: new FormControl(""),
            anexhistclin: new FormControl(""),
            fecharepinc: new FormControl(""),
            idententreinc: new FormControl(""),
            segincapamed: new FormControl(""),
            estadincapad: new FormControl(""),
            capitcie: new FormControl(""),
            nomdisgnod: new FormControl("")
        });
    }

    ngAfterViewChecked()
    {
        this.options = [{idPersonale: 1178, name: 'rwer', document: '234234'}];
        this.cdref.detectChanges();
    }

    getDataInit() {
        this.loading.emit(false);
        this.WebApiService.getRequest(this.endpoint, {
            action: 'getParamCreUpd'
        })
        .subscribe(
           
            data => {
                if (data.success == true) {

                    this.PersonaleInfo = data.data['personale'];
                    this.PersonaleInfoJF = data.data['personale'];
                    this.motausenList = data.data['motausen'];
                    this.origenausenList = data.data['origenausen']; 
                    this.descorigenList = data.data['descorigen']; 
                    this.medRecepInList = data.data['medrepinc']; 
                    this.siNoList = data.data['sino']; 
                    this.tipIncaList = data.data['tipincapci']; 
                    this.estIncAis = data.data['etincais']; 
                    this.codDiagSegList = data.data['codiaosct']; 
                 
                    this.loading.emit(false);
                   
                    if (this.view == 'update') {
                        this.getDataUpdate();
                    }
                } else {
                    this.handler.handlerError(data);
                    this.loading.emit(false);
                }
            },
            error => {
                // console.log(error);
                this.handler.showError('Se produjo un error');
                this.loading.emit(false);
            }
        );
    }

    ngOnInit() {

        

    }

    //Interacciones ------------------------------

    getDataUpdate() {
        
        this.loading.emit(true);
        this.WebApiService.getRequest(this.endpoint, {
            action: 'getParamUpdateSet',
            id: this.id
        })
        .subscribe(
            data => {

                this.formIncapad.get('numdocument').setValue(data.data[0].numdocument);
                //this.formIncapad.get('idPersonale').setValue(data.data[0].idPersonale);
                this.formIncapad.get('motausen').setValue(data.data[0].motausen);
                this.formIncapad.get('origenausen').setValue(data.data[0].origenausen);
                this.formIncapad.get('descorigen').setValue(data.data[0].descorigen);
                this.formIncapad.get('medrecepin').setValue(data.data[0].medrecepin);
                this.formIncapad.get('incaporiginal').setValue(data.data[0].incaporiginal);
                this.formIncapad.get('anexhistclin').setValue(data.data[0].anexhistclin);
                this.formIncapad.get('fecharepinc').setValue(data.data[0].fecharepinc);
                this.formIncapad.get('fechainicausen').setValue(data.data[0].fechainicausen);
                this.formIncapad.get('fechafinausen').setValue(data.data[0].fechafinausen);
                this.formIncapad.get('idententreinc').setValue(data.data[0].idententreinc);
                //this.formIncapad.get('nombentreinc').setValue(data.data[0].nombentreinc);
               // console.log(data.data[0].nombentreinc+ "tete");
                this.formIncapad.get('tipoincap').setValue(data.data[0].tipoincap);
                this.formIncapad.get('numdiasincap').setValue(data.data[0].numdiasincap);
                this.formIncapad.get('segincapamed').setValue(data.data[0].segincapamed);
                this.formIncapad.get('estadincapad').setValue(data.data[0].estadincapad);
                this.formIncapad.get('codcie').setValue(data.data[0].codcie.toUpperCase());
                this.formIncapad.get('nomdisgnod').setValue(data.data[0].nomdisgnod);
                this.formIncapad.get('capitcie').setValue(data.data[0].capitcie);

                

                //
            },
            error => {
                this.handler.showError();
                this.loading.emit(false);
            }
        );
    }

    onSubmitUpdate(){

        if (this.formIncapad.valid) {
            this.loading.emit(true);
            let body = {
                incapacidades: this.formIncapad.value        
            }
            this.WebApiService.getRequest(this.endpoint, {
                action: 'setParamUpdateData',
                id: this.id,
                incapacidades: ""+JSON.stringify({body})
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

    onSubmit() {

        if (this.formIncapad.valid) {
            this.loading.emit(true);
            let body = {
                incapacidades: this.formIncapad.value        
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

    onCodcieChange(event){

        let exitsCodDiag = this.codDiagSegList.find(element => element.ls_codvalue.substr(3).toUpperCase() == event.toUpperCase());
        if( exitsCodDiag ){
            this.formIncapad.get('nomdisgnod').setValue(exitsCodDiag.description);
            this.formIncapad.get('capitcie').setValue(exitsCodDiag.complemento);
        }        
    }

    onFechaIniChange(event){

       this.fechInicInc = event;
       this.calFechaNumReq(this.fechInicInc, this.fechaFinInc);
    }
    
    onFechaFinChange(event){

        this.fechaFinInc = event;
        this.calFechaNumReq(this.fechInicInc, this.fechaFinInc);
        this.calFechaInAis();
    }

    calFechaNumReq(f1, f2){

        //Limite de fecha
        var dias = this.restaFechas(f1, f2);
        if( dias > 0 ){

            this.formIncapad.get('numdiasincap').setValue(dias);

            if( dias >= 30 ){
                this.formIncapad.get('segincapamed').setValue('17/1');
            }else{
                this.formIncapad.get('segincapamed').setValue('17/0');
            }
        }else{
            this.formIncapad.get('numdiasincap').setValue(0);
            this.formIncapad.get('segincapamed').setValue('17/0');
        }
    }

    calFechaInAis(){

        let now = new Date();
        let fechaAct = now.getUTCFullYear()+"-"+(now.getUTCMonth()+1)+"-"+now.getDate(); 
        let procesFecha = this.restaFechas(fechaAct, this.fechaFinInc);
        
        if( procesFecha >= 0){
            this.formIncapad.get('estadincapad').setValue('27/1');
        }else{
            this.formIncapad.get('estadincapad').setValue('27/2');
        }
    }

    //Rango De Dias 
    restaFechas(f1, f2)
    {
        var aFecha1 = f1.split('-');
        var aFecha2 = f2.split('-');
        var fFecha1 = Date.UTC(aFecha1[0],aFecha1[1]-1,aFecha1[2]);
        var fFecha2 = Date.UTC(aFecha2[0],aFecha2[1]-1,aFecha2[2]);
        var dif = fFecha2 - fFecha1;
        var dias = Math.floor(dif / (1000 * 60 * 60 * 24));
        return dias;
    }

    onSelectionChange(event){
        
        let exitsPersonal = this.PersonaleInfo.find(element => element.document == event);
        if( exitsPersonal ){
            this.formIncapad.get('idPersonale').setValue(exitsPersonal.idPersonale);
        }        
    }

    onSelectionJFChange(event){
        
        let exitsPersonal = this.PersonaleInfoJF.find(element => element.document == event);
        if( exitsPersonal ){
            this.formIncapad.get('nombentreinc').setValue(exitsPersonal.idPersonale);
            //console.log(exitsPersonal.idPersonale+ "sonso");
        }        
    }

    onMotivoChange(event){
        this.optmotausen = event; 
        this.restEventSelc();
    }

    onoPtorigenausen(event){
        this.optorigenausen = event;
        this.restEventSelc();
    }

    restEventSelc(){

        this.loading.emit(true);
        this.descorigenListTemp = [];

        if( this.optmotausen != null && this.optmotausen != "undefined" ){

            if( this.optmotausen == "22/1" && this.optorigenausen == "23/1" ){

                let  motausenList: any = ['24/6', '24/2', '24/3'];
                for(let val in this.descorigenList){

                    if(motausenList.indexOf(this.descorigenList[val]['ls_codvalue']) !== -1) {
                        this.descorigenListTemp.push(this.descorigenList[val]);
                    }           
                }
            }else if( this.optmotausen == "22/1" && this.optorigenausen == "23/2" ){

                let  motausenList: any = ['24/1', '24/4', '24/5'];
                for(let val in this.descorigenList){

                    if(motausenList.indexOf(this.descorigenList[val]['ls_codvalue']) !== -1) {
                        this.descorigenListTemp.push(this.descorigenList[val]);
                    }           
                }
            }else if( this.optmotausen == "22/2" && this.optorigenausen == "23/1" ){

                let  motausenList: any = ['24/6'];
                for(let val in this.descorigenList){

                    if(motausenList.indexOf(this.descorigenList[val]['ls_codvalue']) !== -1) {
                        this.descorigenListTemp.push(this.descorigenList[val]);
                    }           
                }
            }else if( this.optmotausen == "22/2" && this.optorigenausen == "23/2" ){

                let  motausenList: any = ['24/1'];
                for(let val in this.descorigenList){

                    if(motausenList.indexOf(this.descorigenList[val]['ls_codvalue']) !== -1) {
                        this.descorigenListTemp.push(this.descorigenList[val]);
                    }           
                }
            }
        }
        this.loading.emit(false);       
    }

}