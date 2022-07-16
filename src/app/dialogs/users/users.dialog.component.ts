import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Component, Inject, Output, EventEmitter, OnInit } from '@angular/core';
import { WebApiService } from '../../services/web-api.service';
import { FormGroup, FormControl, Validators, ValidatorFn, ValidationErrors, FormControlName } from '@angular/forms';
import { environment } from '../../../environments/environment';
import { HandlerAppService } from '../../services/handler-app.service';
import { global } from '../../services/global';







@Component({
    selector: 'users-dialog',
    templateUrl: 'users.dialog.component.html',
    styleUrls: ["./user.dialog.component.css"],
})

export class UsersDialog {
    // VARIABLES
    view: string = null;
    usuario: any = []; 
    title: string = null;
    id: number = null;
    permissions: any = null;
    typeStatus: any = [];
    typeMatriz: any = [];
    typeCampaign: any = [];
    typeRol: any = [];
    rol : any = [];
    // name: any =[];
    touched: any = [];
    email = new FormControl('', [Validators.required, Validators.email]);
    name = new FormControl('', [Validators.required]);
    surname = new FormControl('', [Validators.required]);
    username = new FormControl('', [Validators.required]);
    status = new FormControl('', [Validators.required]);
    role = new FormControl('', [Validators.required]);
    matrizarp = new FormControl('', [Validators.required]);
    campana = new FormControl('', [Validators.required]);
    
   
    // registro a consultar.
    endpoint: string = '/usuario';

    // maskphone       = global.maskPhone;
    // maskphonehogar  = global.maskPhoneHogar;
    maskDNI         = global.maskDNI;


    // FORMULARIOS
    formUsuario: FormGroup;
    value = '';
    value2 = '';
    value3 = '';



    // status: any = [
    //     { codigo: '', nombre: 'Seleccione..' },
    //     { codigo: 1, nombre: 'Activo' },
    //     { codigo: 0, nombre: 'Inactivo' }
    // ];

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
                console.log('idUser=>',this.id);
                this.loading.emit(true);
                this.WebApiService.getRequest(this.endpoint + '/' + this.id, {})
                    .subscribe(
                        data => {
                            if (data.success == true) {
                                this.usuario = data.data[0];
                                console.log(this.usuario);
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
                this.title = "Crear Usuario ";
                break;
            case 'update':
                // this.title = "Editar Usuario ";
                this.initForms();
                this.id = this.data.codigo;
                this.title = "Editar Usuario" + " " + this.id;
                break;
        }
    }

    initForms() {
        this.getDataInit();
        this.formUsuario = new FormGroup({
           
    // name = new FormControl('', [Validators.required]);
            name: new FormControl('', [Validators.required]),
            surname: new FormControl("", [Validators.required]),
            username: new FormControl("", [Validators.required]),
            email: new FormControl("", [Validators.required]),
            phone: new FormControl(""),
            password: new FormControl(""),
            status: new FormControl("", [Validators.required]),
            lastLogin: new FormControl(""),
            role: new FormControl("",[Validators.required]),
            matrizarp: new FormControl("", [Validators.required]),
            id_caex: new FormControl(""),
            campana: new FormControl("", [Validators.required]),
            canal: new FormControl(""),
            usu_wolk: new FormControl(""),
            idPersonale: new FormControl("")

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
                    this.typeStatus = data.data['status'];
                    this.typeMatriz = data.data['matriz'];
                    this.typeCampaign = data.data['campaign'];
                    this.typeRol = data.data['typeRol'];
                    let datos = data.data;
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
                this.handler.showError('Se produjo un error');
                this.loading.emit(false);
            }
        );
    }

    onSubmit() {
        if (this.formUsuario.valid) {
            this.loading.emit(true);
            let body = {
                usuarios: this.formUsuario.value,
            }
            console.log('user*');
            console.log(body);
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

    getDataUpdate() {
        this.loading.emit(true);
        this.WebApiService.getRequest(this.endpoint,{
            action: "getParamUpdateSet",
            id: this.data.codigo
                // id: this.idTec,
            // this.id 
        })
        .subscribe(
            data => {
                if (data.success) {
                    // this.usuario = data.data[0];
                    // console.log(this.usuario);
                    // console.log(this.usuario.role);
                    // this.formUsuario.get("listActivo").setValue(data.data["getDataUpda"][0].listActivo);
                    // this.formUsuario.get('name').setValue(this.usuario.name);
                    this.formUsuario.get('name').setValue(data.data["getDataUpda"][0].name);
                    this.formUsuario.get('surname').setValue(data.data["getDataUpda"][0].surname);
                    this.formUsuario.get('username').setValue(data.data["getDataUpda"][0].username);
                    this.formUsuario.get('email').setValue(data.data["getDataUpda"][0].email);
                    this.formUsuario.get('phone').setValue(data.data["getDataUpda"][0].phone);
                    this.formUsuario.get('role').setValue(data.data["getDataUpda"][0].role);
                    this.formUsuario.get('status').setValue(data.data["getDataUpda"][0].status);
                    this.formUsuario.get('lastLogin').setValue(data.data["getDataUpda"][0].lastLogin);
                    this.formUsuario.get('matrizarp').setValue(data.data["getDataUpda"][0].matrizarp);
                    this.formUsuario.get('id_caex').setValue(data.data["getDataUpda"][0].id_caex);
                    this.formUsuario.get('campana').setValue(data.data["getDataUpda"][0].campana);
                    this.formUsuario.get('canal').setValue(data.data["getDataUpda"][0].canal);
                    this.formUsuario.get('usu_wolk').setValue(data.data["getDataUpda"][0].usu_wolk);
                    this.formUsuario.get('idPersonale').setValue(data.data["getDataUpda"][0].idPersonale);
                    // this.formUsuario.get('name').setValue(data.data["getDataUpda"][0].name);
                    // this.formUsuario.get('surname').setValue(this.usuario.surname);
                    // this.formUsuario.get('username').setValue(this.usuario.username);
                    // this.formUsuario.get('email').setValue(this.usuario.email);
                    // this.formUsuario.get('phone').setValue(this.usuario.phone);
                    // this.formUsuario.get('role').setValue(this.usuario.role);
                    // this.formUsuario.get('password').setValue(this.usuario.password);
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
        if( (this.formUsuario.valid )){
            let body = {
                usuario:   this.formUsuario.value,
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

    closeDialog() {
        this.dialogRef.close();
    }

    // getErrorMessage() {
    //     if (this.email.hasError('required')) {
    //       return 'Debes ingresar un valor';
    //     }
    //     return this.email.hasError('email') ? 'Not a valid email' : '';
    //   }
    //   get errorState(): boolean {
    //     return this.name.invalid && this.touched;
    //   }














}
