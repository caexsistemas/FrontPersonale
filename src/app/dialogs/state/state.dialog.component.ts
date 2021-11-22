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


export interface PeriodicElement {
    idCity: number;
    name: string, 
    idState: number,
    action: string
}

@Component({
    selector: 'state-dialog',
    templateUrl: 'state.dialog.html',
})

export class StateDialog{

    endpoint: string = '/state';
    maskDNI         = global.maskDNI;
    formState: FormGroup;
    view: string = null;
    idState: number = null;
    idCity: number = null;
    state: any = []; 
    city: any = []; 
    valoresCitys: any = []; 
    displayedColumns:any  = [];
    public clickedRows;
    title: string = null;
    formValState : FormGroup;

    //OUTPUTS
    @Output() loading = new EventEmitter();
    @Output() reload = new EventEmitter();
    @ViewChildren(MatSort) sort = new QueryList<MatSort>();

    constructor(

        public dialogRef: MatDialogRef<StateDialog>,
        private WebApiService: WebApiService,
        private handler: HandlerAppService,
        @Inject(MAT_DIALOG_DATA) public data,
        public dialog: MatDialog
    ) {

        this.view = this.data.window;
        this.idState = null;
        console.log(this.view);

        switch (this.view) {
            case 'view':   
                this.loading.emit(true);
                this.idState = this.data.codigo;

                this.WebApiService.getRequest(this.endpoint, {
                    action: 'getParamView',
                    idState: this.idState
                })
                    .subscribe(
                        data => {
                            if (data.success == true) {
                                console.log(data.data);
                                this.state = data.data['states'][0];
                                this.generateTable(data.data['citys']);
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
                this.title = "Crear Departamento";
            break;

            case 'update':
                this.initForms();
                this.idState = this.data.codigo;
                this.title = "Editar Departamento";
            break;
            case 'updatesub':
                this.initFormsub();          
                this.idCity = this.data.codigo;
                this.title = "Editar";
            break;
            case 'createsub':
                this.initFormsub();          
                this.idCity = this.data.codigo;
                this.title = this.data.titlelist;
            break;

        }

    }

    closeDialog() {
        this.dialogRef.close();
    }

    generateTable(data) {

        this.displayedColumns = [
            'idCity',
            'name',
            'actions'    
          ];
          this.valoresCitys = data;
          this.clickedRows = new Set<PeriodicElement>();
    }

    initForms() {
        this.getDataInit();
        this.formState = new FormGroup({
            name: new FormControl("")
        });
    }

    initFormsub() {
        this.getDataInitsub();
        this.formValState = new FormGroup({
            name: new FormControl("")
        });
    }

    getDataInitsub() {

        this.loading.emit(false);
        this.idState = this.data.codigo;

        this.WebApiService.getRequest(this.endpoint, {
            action: 'getParamsUpdateCity',
            idState: this.idState,
            process: this.view
        })
        .subscribe(
           
            data => {
                if (data.success == true) {
                
                    if (this.view == 'updatesub') {
                        this.city = data.data[0];
                        this.formValState.get('name').setValue(this.city.name);
                        this.idCity = this.city.idCity;
                    }
                    this.loading.emit(false);
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

    getDataInit() {

        this.loading.emit(false);
        this.idState = this.data.codigo;

        this.WebApiService.getRequest(this.endpoint, {
            action: 'getParamsUpdate',
            idState: this.idState,
            process: this.view
        })
        .subscribe(
           
            data => {
                if (data.success == true) {
                
                    if (this.view == 'update') {
                        this.state = data.data[0];
                        this.formState.get('name').setValue(this.state.name);
                        this.idState = this.state.idState;
                    }
                    this.loading.emit(false);
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

    onSubmit(){

        if( (this.formState.valid )){

            let body = {
                valstate:   this.formState.value,
            }

            this.loading.emit(true);

            this.WebApiService.getRequest(this.endpoint, {
                action: 'getInsertValResult',
                forma: ""+JSON.stringify({body})
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

        }else{

            this.handler.showError('Complete la información necesaria');
            this.loading.emit(false);
        }

    }

    onSubmitUpdate(){

        if( (this.formState.valid )){

            let body = {
                valstate:   this.formState.value,
            }

            this.loading.emit(true);

            this.WebApiService.getRequest(this.endpoint, {
                action: 'getUpdateValResult',
                idState: this.idState,
                forma: ""+JSON.stringify({body})

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

        }else{

            this.handler.showError('Complete la información necesaria');
            this.loading.emit(false);
        }
    }

    optionSubVal(action, codigo=null, titlelist=null){

        var dialogRef;
        switch(action){

            case 'view':
                this.loading.emit(true);
                dialogRef = this.dialog.open(StateDialog,{
                data: {
                    window: 'view',
                    codigo,
                    titlelist
                }
                });
                this.loading.emit(false); 

            break;

            case 'createsub':
                this.loading.emit(true);
                dialogRef = this.dialog.open(StateDialog,{
                data: {
                    window: 'createsub',
                    codigo,
                    titlelist
                }
                });
                this.loading.emit(false);
                this.closeDialog();
            break;

            case 'updatesub':
                this.loading.emit(true);
                dialogRef = this.dialog.open(StateDialog,{
                data: {
                    window: 'updatesub',
                    codigo
                }
                });
                this.loading.emit(false);
                this.closeDialog();
               
            break;

        }
    }

    
}