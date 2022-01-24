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


@Component({
    selector: 'ingreso-dialog',
    templateUrl: 'ingreso.dialog.html',
    styleUrls: ['./ingreso.dialog.component.css'],
})

export class IngresoDialog{

    endpoint: string = '/novnomi';
    maskDNI         = global.maskDNI;
    view: string = null;
    idNomi: number = null;
    title: string = null;
    formNomi: FormGroup;
    PersonaleInfo: any = [];

    //OUTPUTS
    @Output() loading = new EventEmitter();
    @Output() reload = new EventEmitter();
    @ViewChildren(MatSort) sort = new QueryList<MatSort>();

    constructor(

        public dialogRef: MatDialogRef<IngresoDialog>,
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
                this.title = "Crear Departamento";
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
            city_nc: new FormControl(""),
            edad_nc: new FormControl(""),
            salary_nc: new FormControl(""),
            daying_nc: new FormControl(""),
            files_nc: new FormControl("")
        });
    }

    getDataInit(){
        this.loading.emit(false);
        this.idNomi = this.data.codigo;

        this.WebApiService.getRequest(this.endpoint, {
            action: 'getParamView',
            idNomi: this.idNomi,
        })
        .subscribe(
           
            data => {
                if (data.success == true) {

                    //DataInfo
                    this.PersonaleInfo = data.data['getDataView'];
                
                    /*if (this.view == 'update') {

                        this.formNomi.get('name_nc').setValue(data.data[0].name_nc);
                        this.idNomi = data.data[0].id_novedad_nc;
                    }*/
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

}