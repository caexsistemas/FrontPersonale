import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Component, Inject, Output, EventEmitter, OnInit, ChangeDetectorRef, AfterContentChecked, ViewChildren, QueryList } from '@angular/core';
import { WebApiService } from '../../services/web-api.service';
import { FormGroup, FormControl, Validators, ValidatorFn, ValidationErrors, FormArray } from '@angular/forms';
import { environment } from '../../../environments/environment';
import { HandlerAppService } from '../../services/handler-app.service';
import { global } from '../../services/global';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';

import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import {DefaultLayoutComponent} from '../../containers';

export interface PeriodicElement {
    description: string;
    ls_codvalue: string,
    statusdes: string,
    actions: string, 
    values_id: number
  }

@Component({
    selector: 'app-notification',
    templateUrl: './notification.dialog.component.html',
    styleUrls: ['./notification.dialog.component.css'],
})

export class NotificationDialog {

    endpoint: string = '/personal';
    maskDNI         = global.maskDNI;
    public cuser: any = JSON.parse(localStorage.getItem('currentUser'));
    component = "/management/gestion";

    dataSource: any = [];
    displayedColumns: any = [];
    view: string = null;
    personale: any = []; 
    title: string = null;
    id: number = null;
    rol : any = [];
    personaleData: any = [];
    contaClick: number = 0;

    // Creación de notificaciones manuales
    notificationForm: FormGroup;

    notificationTypes: any[] = [];
    modules: any[] = [];
    rolesList: any[] = [];
    minStartDate: string;
    maxEndDate: string;
    startDateValue: string = '';

    disableRoles: boolean = false;
    disableModule: boolean = false;

    // // OUTPUTS
    @Output() loading = new EventEmitter();
    @Output() reload = new EventEmitter();

    @ViewChildren(MatSort) sort = new QueryList<MatSort>();
    @ViewChildren(MatPaginator) paginator = new QueryList<MatPaginator>();

    constructor(
        public dialogRef: MatDialogRef<NotificationDialog>,
        private WebApiService: WebApiService,
        private handler: HandlerAppService,
        @Inject(MAT_DIALOG_DATA) public data,
        public dialog: MatDialog,
        private cdref: ChangeDetectorRef,
        private matBottomSheet : MatBottomSheet
    ) {
        this.view = this.data.window;
        this.id = this.data.codigo;
        if(this.view === 'view'){
            this.sendRequest();
        } else if(this.view === 'create'){
            this.initNotificationForm();
        }
    }

    applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSource.filter = filterValue.trim().toLowerCase();
    }

    generateTable(data) {
        this.displayedColumns = [
            'view',
            'date_create',
            'tipo_notifi',
            'tipe_noti',
            'date_peri'
        ];
        this.dataSource = new MatTableDataSource(data);
        this.dataSource.sort = this.sort.toArray()[0];
        this.dataSource.paginator = this.paginator.toArray()[0];
        let search;
        if (document.contains(document.querySelector('search-input-table'))) {
            search = document.querySelector('.search-input-table');
            search.value = "";
        }
    }

    closeDialog() {
        this.dialogRef.close();
    }

    sendRequest(){
        this.loading.emit(true);
        //Variables 
        let body = {
            iduser: this.cuser.iduser,
            token: this.cuser.token,
            role:  this.cuser.role
        }
    
            this.WebApiService.postRequest('/consultnotification', body, {})
                .subscribe(
                    data => {
                        if (data.success == true) {
    
                            this.personaleData = data.data['cont'];
                            this.generateTable(this.personaleData);
                            
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
    }

    openc() {
        if (this.contaClick == 0) {
            this.sendRequest();       
        }
        this.contaClick = this.contaClick + 1;
    }

    option(id){

        this.loading.emit(true);
        let body;

        body = {
            iduser: this.cuser.iduser,
            token: this.cuser.token,
            role:  this.cuser.role,
            id_noti: id 
        }
        
        //Validar Sesion 
        if( this.cuser.iduser != 0 && this.cuser.iduser != 'NULL' ){
            this.WebApiService.postRequest('/gestionotification', body, {})
            .subscribe(
                data => {
                    if (data.success == true) {

                        let detalleNoti = data.data['rest'][0];
                        this.handler.showInfo(detalleNoti.desc_noti, detalleNoti.tipe_noti, detalleNoti.module_noti);
                        this.sendRequest();                 
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
        }else{
            this.handler.showError('Por favor Iniciar Sesion');
            this.loading.emit(false);
        }
    }

    colorMap = {
        "109/0": "#E57300",
        "109/1": "#15CDC7",
        "109/2": "#CD15A3",
        "109/3": "#15CD69",
        "109/4": "#CD1515",
        "109/5": "#1555CD",
        "109/7": "#f75349"
    };
    
    colorState(state) {
        //Color Critico 
        return this.colorMap[state] || ""; // Devuelve el color correspondiente o cadena vacía si no coincide
    }

    initNotificationForm(): void {
        this.notificationForm = new FormGroup({
            notificationType: new FormControl('', Validators.required),
            startDate: new FormControl('', Validators.required),
            endDate: new FormControl('', Validators.required),
            roles: new FormControl(''),
            selectAllRoles: new FormControl(false),
            module: new FormControl(''),
            detail: new FormControl('', Validators.required),
            message: new FormControl('', [Validators.required, Validators.minLength(5)])
        });
    
        // Cargar datos dinámicos desde API
        this.loadNotificationForm();
    }

    loadNotificationForm(): void {
        let params = {
            iduser: this.cuser.iduser,
            token: this.cuser.token,
            role:  this.cuser.role
        }
        this.WebApiService.getRequest('/get-info-notification', params).subscribe(
            (response: any) => {
                if (response.success) {
                    this.notificationTypes = response.data.notificationTypes;
                    this.modules = response.data.modules;
                    this.rolesList = response.data.roles;

                    this.setMinStartDate();

                } else {
                    this.handler.showError('Error al cargar los datos');
                }
            },
            (error) => {
                console.error('Error en la API:', error);
                this.handler.showError('Error en la carga de datos');
            }
        );
    }
    
    setMinStartDate(): void {
        const today = new Date();
        this.minStartDate = today.toISOString().split('T')[0]; 
    }
    
    updateEndDateLimit(): void {
        const startDateControl = this.notificationForm.get('startDate');
        if (!startDateControl) return;

        const startDateValue = startDateControl.value;
        if (startDateValue) {
            const startDate = new Date(startDateValue);
            this.startDateValue = startDate.toISOString().split('T')[0]; // Se usa en `[min]` de endDate

            const maxDate = new Date(startDate);
            maxDate.setDate(maxDate.getDate() + 7);
            this.maxEndDate = maxDate.toISOString().split('T')[0];

            // Resetea endDate si ya no es válida
            const endDateControl = this.notificationForm.get('endDate');
            if (endDateControl?.value && (endDateControl.value < this.startDateValue || endDateControl.value > this.maxEndDate)) {
                endDateControl.setValue('');
            }
        }
    }

    validateEndDate(): void {
        const endDateControl = this.notificationForm.get('endDate');
        const startDateControl = this.notificationForm.get('startDate');
    
        if (!endDateControl || !startDateControl) return;
    
        const startDateValue = startDateControl.value;
        const endDateValue = endDateControl.value;
    
        if (!startDateValue || !endDateValue) return;
    
        if (endDateValue < startDateValue || endDateValue > this.maxEndDate) {
            endDateControl.setErrors({ invalidEndDate: true });
        } else {
            endDateControl.setErrors(null);
        }
    }

    toggleAllRoles(isChecked: boolean): void {
        if (isChecked) {
            const allRoleIds = this.rolesList.map(role => role.idRole); 
            this.notificationForm.get('roles')?.setValue(allRoleIds);
        } else {
            this.notificationForm.get('roles')?.setValue([]); 
        }
    }
    
    
    preventManualEdit(event: KeyboardEvent): void {
        event.preventDefault();
    }
    
    submitNotification(): void {
        if (this.notificationForm.invalid) {
            this.handler.showError('Por favor, completa todos los campos requeridos.');
            return;
        }
    
        this.notificationForm.value.module = this.notificationForm.value.module.toString();

        const notificationData = this.notificationForm.value;

        let params = {
            iduser: this.cuser.iduser,
            token: this.cuser.token,
            role:  this.cuser.role
        }

        this.WebApiService.postRequest('/create-notification', notificationData, params).subscribe(
            (response: any) => {
                if (response.success) {
                    this.handler.showSuccess('Notificación creada exitosamente.');
                    this.closeDialog(); // Cierra el modal
                } else {
                    this.handler.showError('Error al crear la notificación.');
                }
            },
            (error) => {
                console.error('Error en la API:', error);
                this.handler.showError('Hubo un problema al enviar la notificación.');
            }
        );
    }

    setRolesByModule(moduleId: number): void {
        if (!moduleId) {
            this.disableRoles = false;
            this.notificationForm.get('roles')?.setValue([]);
            return;
        }

        this.disableRoles = true;
        this.notificationForm.get('roles')?.setValue([]); 

        let params = {
            iduser: this.cuser.iduser,
            token: this.cuser.token,
            role: this.cuser.role,
            moduleId: moduleId
        };
    
        this.WebApiService.getRequest('/get-roles-module', params).subscribe(
            (response: any) => {
                if (response.success) {
                    const roles = response.data.rolesByModule.map((role: any) => role.idRole);
                    this.notificationForm.get('roles')?.setValue(roles);
                } else {
                    this.handler.showError('Error al cargar los datos');
                }
            },
            (error) => {
                console.error('Error en la API:', error);
                this.handler.showError('Error en la carga de datos');
            }
        );
    }
    
    onSelectRoles(): void {
        const selectedRoles = this.notificationForm.get('roles')?.value || [];
    
        if (selectedRoles.length > 0) {
            this.disableModule = true;
            this.notificationForm.get('module')?.setValue(null); 
        } else {
            this.disableModule = false;
        }
    }
}
