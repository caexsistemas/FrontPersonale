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
    description: string;
    ls_codvalue: string,
    statusdes: string,
    actions: string, 
    values_id: number
  }

@Component({
    selector: 'lists-dialog',
    templateUrl: 'lists.dialog.html',
})


export class ListasDialog{

    view: string = null;
    lista: any = []; 
    valuesub: any = [];
    valoresList: any = []; 
    title: string = null;
    id: number = null;
    displayedColumns:any  = [];
    public clickedRows;
    idList: number;

    endpoint: string = '/listas';
    maskDNI         = global.maskDNI;
    formLista: FormGroup;
    formValList : FormGroup;

    status: any = [
        { codigo: '', nombre: 'Seleccione..' },
        { codigo: 1, nombre: 'Activo' },
        { codigo: 0, nombre: 'Inactivo' }
    ];

    // // OUTPUTS
    @Output() loading = new EventEmitter();
    @Output() reload = new EventEmitter();
    @ViewChildren(MatSort) sort = new QueryList<MatSort>();

    constructor(

        public dialogRef: MatDialogRef<ListasDialog>,
        private WebApiService: WebApiService,
        private handler: HandlerAppService,
        @Inject(MAT_DIALOG_DATA) public data,
        public dialog: MatDialog
    ) {

        this.view = this.data.window;
        this.id = null;
        switch (this.view) {
            case 'view':
                //alert('trues');
                this.id = this.data.codigo;
                this.loading.emit(true);
                this.WebApiService.getRequest(this.endpoint + '/' + this.id, {})
                    .subscribe(
                        data => {
                            if (data.success == true) {
                                this.lista = data.data['listado'][0];
                                this.generateTable(data.data['valoresList']);
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
                this.title = "Crear Lista ";
                break;
            case 'update':
                this.initForms();
                this.id = this.data.codigo;
                this.title = "Editar usuario" + this.id;
                break;
            case 'updatesub':
                this.initFormsub();          
                this.id = this.data.codigo;
                this.title = "Editar";
            break;
            case 'createsub':
                this.initFormsub();          
                this.idList = this.data.codigo;
                this.title = this.data.titlelist;
            break;
        }
    }


    optionSubVal(action, codigo=null, titlelist=null){

        var dialogRef;
        switch(action){

            case 'updatesub':
                this.loading.emit(true);
                dialogRef = this.dialog.open(ListasDialog,{
                data: {
                    window: 'updatesub',
                    codigo
                }
                });
                this.loading.emit(false);
                this.closeDialog();
               
            break;

            case 'view':
                this.loading.emit(true);
                dialogRef = this.dialog.open(ListasDialog,{
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
                dialogRef = this.dialog.open(ListasDialog,{
                data: {
                    window: 'createsub',
                    codigo,
                    titlelist
                }
                });
                this.loading.emit(false);
                this.closeDialog();

        }
    }

    generateTable(data){
        this.displayedColumns = [
          'description',
          'ls_codvalue',
          'statusdes',
          'actions'    
        ];
        this.valoresList = data;
        this.clickedRows = new Set<PeriodicElement>();
    }

    initForms() {
        this.getDataInit();
        this.formLista = new FormGroup({
            name_ing: new FormControl(""),
            name_esp: new FormControl("")
        });
    }

    initFormsub() {
        this.getDataInitsub();
        this.formValList = new FormGroup({
            description: new FormControl(""),
            status: new FormControl("")
        });
    }

    getDataInitsub() {
        this.loading.emit(false);
        this.id = this.data.codigo;
        this.WebApiService.getRequest(this.endpoint, {
            action: 'getParamsUpdateSub',
            idvalist: this.id
        })
        .subscribe(
           
            data => {
                if (data.success == true) {
                    let datos = data.data;
                    // this.rol                       = datos['values_id'] ? JSON.parse(datos['values_id']) : [];
                    this.loading.emit(false);

                    if (this.view == 'updatesub') {

                      this.getDataUpdatesub(datos);
                    }
                } else {
                    this.handler.handlerError(data);
                    this.loading.emit(false);
                }
            },
            error => {
                console.log(error);
                this.handler.showError('Se produjo un error');
                this.loading.emit(false);
            }
        );
    }

    getDataUpdatesub(datos) {

        this.loading.emit(true);
        try {

            this.valuesub = datos[0];
            this.formValList.get('description').setValue(this.valuesub.description);
            this.formValList.get('status').setValue(this.valuesub.status);
            this.idList = this.valuesub.list_id;
            this.loading.emit(false);

        } catch (error) {

            this.handler.handlerError(datos);
            this.loading.emit(false);
            this.closeDialog();
            this.handler.showError('Se produjo un error');
            this.loading.emit(false);
        }
    }

    onSubmitUpdateSub() {

        if( (this.formValList.valid )){

            let body = {
                valists:   this.formValList.value,
            }

            this.loading.emit(true);

            this.WebApiService.getRequest(this.endpoint, {
                action: 'getUpdateValResult',
                idvalist: this.id,
                forma: ""+JSON.stringify({body})
            })
            .subscribe(

                data=>{
                    if(data.success){
                        this.handler.showSuccess(data.message);
                        this.reload.emit();
                        this.closeDialog();
                        //console.log(this.idList+"AA");
                        this.optionSubVal('view', this.idList);
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
        }
    }

    onSubmiSub() {

        if( (this.formValList.valid )){

            if( this.formValList.value['description'] != '' ){

                //console.log(this.formValList.value['description']);
                let body = {
                    valists:   this.formValList.value,
                }
    
                this.loading.emit(true);
    
                this.WebApiService.getRequest(this.endpoint, {
                    action: 'getInsertValResult',
                    idvalist: this.idList,
                    forma: ""+JSON.stringify({body})
                })
                .subscribe(
    
                    data=>{
                        if(data.success){
                            this.handler.showSuccess(data.message);
                            this.reload.emit();
                            this.closeDialog();
                            
                            this.optionSubVal('view', this.idList);
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


        }else{
            this.handler.showError('Complete la información necesaria');
            this.loading.emit(false);
        }
    }

    getDataInit() {
        this.loading.emit(false);
        this.WebApiService.getRequest(this.endpoint, {
            action: 'getParamsUpdate'
        })
        .subscribe(
           
            data => {
                if (data.success == true) {
                    let datos = data.data;
                    // this.rol                       = datos['values_id'] ? JSON.parse(datos['values_id']) : [];
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

    closeDialog() {
        this.dialogRef.close();
    }

    getDataUpdate() {
        this.loading.emit(true);
        this.WebApiService.getRequest(this.endpoint + '/' + this.id, {})
        .subscribe(
            data => {
                if (data.success) {
                    this.lista = data.data['listado'][0];
                    
                    this.formLista.get('name_ing').setValue(this.lista.name_ing);
                    this.formLista.get('name_esp').setValue(this.lista.name_esp);
                    this.loading.emit(false);
                } else {
                    this.handler.handlerError(data);
                    this.loading.emit(false);
                    this.closeDialog();
                }
            },
            error => {
                this.handler.showError();
                this.loading.emit(false);
            }
        );
    }

    onSubmitUpdate() {
        if( (this.formLista.valid )){
            let body = {
                listas:   this.formLista.value,
            }
            this.loading.emit(true);
            this.WebApiService.putRequest(this.endpoint+'/'+this.id,body,{})
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
        }
    }

    onSubmit() {
        if (this.formLista.valid) {
            this.loading.emit(true);
            let body = {
                listas: this.formLista.value,
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

}