import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Component, Inject, Output, EventEmitter, OnInit } from '@angular/core';
import { WebApiService } from '../../services/web-api.service';
import { FormGroup, FormControl, Validators, ValidatorFn, ValidationErrors } from '@angular/forms';
import { environment } from '../../../environments/environment';
import { HandlerAppService } from '../../services/handler-app.service';
import { global } from '../../services/global';
import { Console } from 'console';







@Component({
    selector: 'management-dialog',
    templateUrl: 'management.dialog.html',
})

export class ManagementDialog {
    // VARIABLES
    view: string = null;
    usuario: any = []; 
    title: string = null;
    id: number = null;
    typeidentifi: any = []; 
    typerol: any = [];
    typegender: any = []; 
    selSiNo: any = [];
    typeEtn: any = []; 
    selSnCer: any = []; 
    steCilv: any = []; 
    rol : any = [];
    stuPer: any = [];

    email = new FormControl('', [Validators.required, Validators.email]);
    
    
   
    // registro a consultar.
    endpoint: string = '/usuario';
    // maskphone       = global.maskPhone;
    // maskphonehogar  = global.maskPhoneHogar;
    maskDNI         = global.maskDNI;

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
        public dialogRef: MatDialogRef<ManagementDialog>,
        private WebApiService: WebApiService,
        private handler: HandlerAppService,
        @Inject(MAT_DIALOG_DATA) public data,
        public dialog: MatDialog


    ) {
        this.view = this.data.window;
        this.id = null;
        switch (this.view) {
            case 'view':
                alert('yu');
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
                alert('Create');
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
        this.getDataInit();
        this.formUsuario = new FormGroup({
            name: new FormControl(""),
            surname: new FormControl(""),
            username: new FormControl(""),
            email: new FormControl(""),
            phone: new FormControl(""),
            password: new FormControl(""),
            role: new FormControl(""),
            idDocumentType: new FormControl(""),
            expeditionDate: new FormControl(""),
            idGender: new FormControl(""),
            birthDate:new FormControl(""),
            isColombian:new FormControl(""),
            idEthnicGroup:new FormControl(""),
            certificate:new FormControl(""),
            idMarital:new FormControl(""),
            nameContact:new FormControl(""),
            businessEmail:new FormControl(""),
            zone:new FormControl(""),
            houseType:new FormControl(""),
            stratum:new FormControl(""),
            address:new FormControl(""),
            neighborhood:new FormControl("")
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
                    let datos = data.data['values_list'];
                    this.optionSelect(datos);
                    this.loading.emit(false);
                    console.log(this.typeidentifi);

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

    optionSelect(datos){

        for(let val in datos){
            //Tipo de Identificacion
            if( datos[val]['list_id'] == 6 ){

                this.typeidentifi.push(datos[val]);
            }
            //Tipo de Roll
            if( datos[val]['list_id'] == 19 ){
                this.typerol.push(datos[val]);
            }
            //Genero
            if( datos[val]['list_id'] == 9 ){
                this.typegender.push(datos[val]);
            }
            //Colombiano
            if(datos[val]['list_id'] == 17 ){
                this.selSiNo.push(datos[val]);
            }
            //Grupo Etnico
            if( datos[val]['list_id'] == 7 ){
                this.typeEtn.push(datos[val]);
            }
            //Sino Certificado
            if( datos[val]['list_id'] == 18 ){
                this.selSnCer.push(datos[val]);
            }
            //EStado Civil
            if( datos[val]['list_id'] == 10 ){
                this.steCilv.push(datos[val]);
            }
            //Estado
            if( datos[val]['list_id'] == 13 ){
                this.stuPer.push(datos[val]);
            }
        }

    }

    onSubmit() {
        if (this.formUsuario.valid) {
            this.loading.emit(true);
            let body = {
                usuarios: this.formUsuario.value,
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

    getDataUpdate() {
        this.loading.emit(true);
        this.WebApiService.getRequest(this.endpoint + '/' + this.id, {})
        .subscribe(
            data => {
                if (data.success) {
                    this.usuario = data.data[0];
                    
                    this.formUsuario.get('name').setValue(this.usuario.name);
                    this.formUsuario.get('surname').setValue(this.usuario.surname);
                    this.formUsuario.get('username').setValue(this.usuario.username);
                    this.formUsuario.get('email').setValue(this.usuario.email);
                    this.formUsuario.get('phone').setValue(this.usuario.phone);
                    this.formUsuario.get('role').setValue(this.usuario.role);
                    this.formUsuario.get('idDocumentType').setValue(this.usuario.idDocumentType);
                    this.formUsuario.get('expeditionDate').setValue(this.usuario.expeditionDate); 
                    this.formUsuario.get('idGender').setValue(this.usuario.idGender);
                    this.formUsuario.get('birthDate').setValue(this.usuario.birthDate);
                    this.formUsuario.get('isColombian').setValue(this.usuario.isColombian);
                    this.formUsuario.get('idEthnicGroup').setValue(this.usuario.idEthnicGroup);
                    this.formUsuario.get('certificate').setValue(this.usuario.certificate);
                    this.formUsuario.get('idMarital').setValue(this.usuario.idMarital);
                    this.formUsuario.get('nameContact').setValue(this.usuario.nameContact);
                    this.formUsuario.get('phoneEmergency').setValue(this.usuario.phoneEmergency);
                    this.formUsuario.get('businessEmail').setValue(this.usuario.businessEmail);
                    this.formUsuario.get('houseType').setValue(this.usuario.houseType);
                    this.formUsuario.get('stratum').setValue(this.usuario.stratum);
                    this.formUsuario.get('address').setValue(this.usuario.address);
                    this.formUsuario.get('neighborhood').setValue(this.usuario.neighborhood);

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

    getErrorMessage() {
        if (this.email.hasError('required')) {
          return 'Debes ingresar un valor';
        }
        return this.email.hasError('email') ? 'Not a valid email' : '';
      }















}
