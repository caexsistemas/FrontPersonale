import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, Inject, Output, EventEmitter, OnInit } from '@angular/core';
import { WebApiService } from '../../services/web-api.service';
import { FormGroup, FormControl, Validators, ValidatorFn, ValidationErrors } from '@angular/forms';
// import { HandlerAppService } from '../../services/handler-app.service';
import { environment } from '../../../environments/environment';
import { HandlerAppService } from '../../services/handler-app.service';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';





@Component({
    selector: 'users-dialog',
    templateUrl: 'users.dialog.html',
})

export class UsersDialog {
    // VARIABLES
    view: string = null;
    usuario: any = []; 
    title: string = null;
    id: number = null;

    rol : any = [];
   
    // registro a consultar.
    endpoint: string = '/usuario';
    // maskphone       = config.maskPhone;
    // maskphonehogar  = config.maskPhoneHogar;
    // maskDNI         = config.maskDNI;

    // FORMULARIOS
    formUsuario: FormGroup;



    status: any = [
        { codigo: '', nombre: 'Seleccione..' },
        { codigo: 1, nombre: 'Activo' },
        { codigo: 0, nombre: 'Inactivo' }
    ];





    // // OUTPUTS
    @Output() loading = new EventEmitter();
    @Output() reload = new EventEmitter();

    constructor(
        public dialogRef: MatDialogRef<UsersDialog>,
        private WebApiService: WebApiService,
        private handler: HandlerAppService,
        @Inject(MAT_DIALOG_DATA) public data,
        public dialog: MatDialog


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
                                this.usuario = data.data[0];
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
                this.title = "Crear usuario ";
                break;
            case 'update':
                this.initForms();
                this.id = this.data.codigo;
                this.title = "Editar usuario" + this.id;
                break;
        }
    }

    initForms() {
        // this.getDataInit();
        this.formUsuario = new FormGroup({
            name: new FormControl(""),
            surname: new FormControl(""),
            username: new FormControl(""),
            email: new FormControl(""),
            phone: new FormControl(""),
            password: new FormControl("")
        });
    }


    dateKeys(event) {
        return false;
    }

    getDataInit() {
        this.loading.emit(false);
        this.WebApiService.getRequest(this.endpoint, {
            action: 'getParamsUpdate'
        })
        .subscribe(
            data => {
                if (data.success == true) {
                    let datos = data.data[0];
                    this.rol                       = datos['tipos_dni'] ? JSON.parse(datos['tipos_dni']) : [];
                   


                    this.loading.emit(false);
                    if (this.view == 'update') {
                        //this.getDataUpdate();
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















}
