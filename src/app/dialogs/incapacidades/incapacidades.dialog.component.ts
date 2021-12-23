import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, Inject, Output, EventEmitter, OnInit, ChangeDetectorRef, AfterContentChecked } from '@angular/core';
import { WebApiService } from '../../services/web-api.service';
import { FormGroup, FormControl, Validators, ValidatorFn, ValidationErrors, FormArray } from '@angular/forms';
import { HandlerAppService } from '../../services/handler-app.service';
import { global } from '../../services/global';
// import * as internal from 'stream';
import {Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';

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
    myControl = new FormControl();
    motausenList: any = [];
    origenausenList: any = [];
    descorigenList: any = [];
    descorigenListTemp: any = [];
    optmotausen: string = null;
    optorigenausen: string = null;

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
            fechageneracion: new FormControl("")
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
                    this.motausenList = data.data['motausen'];
                    this.origenausenList = data.data['origenausen']; 
                    this.descorigenList = data.data['descorigen']; 

                    this.loading.emit(false);
                   
                    /*if (this.view == 'update') {
                        this.getDataUpdate();
                    }*/
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

    onSelectionChange(event){

        let existeElementoMayorQueDiez = this.PersonaleInfo.find(element => element.document == event);
        this.formIncapad.get('idPersonale').setValue(existeElementoMayorQueDiez.idPersonale);
        console.log(existeElementoMayorQueDiez);
    }

    onMotivoChange(event){
        this.optmotausen = event; 
    }

    onoPtorigenausen(event){

        this.loading.emit(true);
        this.optorigenausen = event;

        if( this.optmotausen != null && this.optmotausen != "undefined" ){

            if( this.optmotausen == "22/1" && this.optorigenausen == "23/1" ){

                let  motausenList: any = ['24/1', '24/2', '24/3'];
                for(let val in this.descorigenList){

                    if(motausenList.indexOf(this.descorigenList[val]['ls_codvalue']) !== -1) {
                        this.descorigenListTemp.push(this.descorigenList[val]);
                    }           
                }
                console.log("entre");
            }else if( this.optmotausen == "22/2" && this.optorigenausen == "23/2" ){

                
            }

           // this.descorigenList;
            //this.descorigenListTemp;
            //console.log("ant: "+this.optmotausen);
            console.log(event);
        }
        this.loading.emit(false);       
    }

}