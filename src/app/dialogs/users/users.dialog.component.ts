import { MatDialog,MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, Inject, Output, EventEmitter } from '@angular/core';
import { WebApiService } from '../../services/web-api.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
// import { HandlerAppService } from '../../services/handler-app.service';
import { environment } from '../../../environments/environment';
import { HandlerAppService } from '../../services/handler-app.service';
import { CommonModule } from '@angular/common';





@Component({
    selector: 'users-dialog',
    templateUrl: 'users.dialog.html',
})

export class UsersDialog {
    //variables
    view: string    = null;      // me indica la vista a mostrar
    caso: any       = [];       // data del complejo que estoy detallando.
    title: string   = null;
    id: number      = null;     // registro a consultar.
    name: string   = null;
    dni: number    = null;
     // registro a consultar.
    endpoint: string = '/usuarios';
    // maskphone       = config.maskPhone;
    // maskphonehogar  = config.maskPhoneHogar;
    // maskDNI         = config.maskDNI;

    // update
    formCaso: FormGroup;
    formPersona: FormGroup;
    formPaciente: FormGroup;

    persona:number                    = null;
    paciente:number                   = null;
    nTrimestre:string                 =null;
    fecha                             =new Date();
    yeear:any                         =null;
    fechanacido:any;
    newDate:any;
    age:number                        =null;



    dataSource:any                    =[];
    dataSource_r:any                  =[];



    tipoDocumentos:any                =[];
    sexos:any                         =[];
    departamentos:any                 =[];
    ciudades:any                      =[];
   
    status: any = [
        { codigo: '', nombre: 'Seleccione..' },
        { codigo: 1, nombre: 'Activo' },
        { codigo: 0, nombre: 'Inactivo' }
    ];

    myFilter = (d: Date | null): boolean => {
        const day = (d || new Date());
        const CurrentDate = new Date();
        return day <= CurrentDate;
      }

      displayedColumns: string[] = ['personatipodocumento', 'persona_dni', 'persona_nombre1', 'contacto_id'];
      displayedColumns_r: string[] = ['lp_tiporeaccion', 'lp_estadotratamiento','lp_id'];



    // // OUTPUTS
    @Output() loading = new EventEmitter();
    @Output() reload = new EventEmitter();

    constructor(
        public dialogRef: MatDialogRef<UsersDialog>,
        private WebApiService: WebApiService,
        private handler: HandlerAppService,
        @Inject(MAT_DIALOG_DATA) public data,
        public dialog:MatDialog


    ) {
        this.view = this.data.window;
        this.id = null;
        this.name = null;
        this.dni = null;
        console.log('Vista'+this.view);
        switch (this.view) {
           case 'create':
                this.initForms();
                this.title = "Crear caso de lepra ";
                break;
        }
    }

    initForms() {
       this.getDataInit();
        this.formPersona = new FormGroup({
            persona_tipodocumento:              new FormControl(""),
            persona_dni:                        new FormControl("", Validators.maxLength(12)),
            persona_nombre1:                    new FormControl(""),
            persona_nombre2:                    new FormControl(""),
            persona_apellido1:                  new FormControl(""),
            persona_apellido2:                  new FormControl(""),
            persona_sexo:                       new FormControl(""),
            persona_email:                      new FormControl(""),
            persona_telefono:                   new FormControl(""),
            persona_telefono2:                  new FormControl(""),
            persona_fechanacimiento:            new FormControl(""),
            persona_edad:                       new FormControl(""),
        });

        this.formPaciente = new FormGroup({

            paciente_farmacorresistencia:       new FormControl(""),
            paciente_comorbilidad1:             new FormControl(""),
            paciente_comorbilidad2:             new FormControl(""),
            paciente_comorbilidad3:             new FormControl(""),
            paciente_estado:                    new FormControl(""),
            paciente_creadopor:                 new FormControl(""),
            paciente_fcreacion:                 new FormControl(""),
            paciente_actualizadopor:            new FormControl(""),
            paciente_factualizacion:            new FormControl("")

        });
        this.formCaso = new FormGroup({
            lp_trimestre:                       new FormControl(""),
            departamento_codigo:                new FormControl(""),
            ciudad_codigo:                      new FormControl(""),
            administradora_id:                  new FormControl(""), // este remplaza eapb
            paciente_direccion:                 new FormControl(""),
            paciente_etnia:                     new FormControl(""),
            paciente_puebloindigena:            new FormControl(""),
            paciente_grupopoblacion:            new FormControl(""),
            paciente_barrio:                    new FormControl(""),
            paciente_comuna:                    new FormControl(""),
            paciente_regimenafiliacion:         new FormControl(""),
            lp_instituciondiagnostico:          new FormControl(""),
            paciente_programaporteccionsocial:  new FormControl(""),
            institucion_id:                     new FormControl(""),
            paciente_id:                        new FormControl(""),
            lp_finiciosintomas:                 new FormControl(""),
            lp_finiciotratamiento:              new FormControl(""),
            lp_fegreso:                         new FormControl(""),
            lp_observaciones:                   new FormControl(""),
            lp_clasificacion:                   new FormControl(""),
            lp_condicioningreso:                new FormControl(""),
            lp_resultadobaciloscopia:           new FormControl(""),
            lp_biopsiaingreso:                  new FormControl(""),
            lp_resultadobiopsia:                new FormControl(""),
            lp_numerolesiones:                  new FormControl(""),
            lp_gradomaximodiscapaciodad:        new FormControl(""),
            lp_baciloscopiacontrol:             new FormControl(""),
            lp_condicionegreso:                 new FormControl(""),
            lp_blisteres:                       new FormControl(""),
            lp_mesestto:                        new FormControl(""),
            lp_baciloscopiaegreso:              new FormControl(""),
            lp_gradodiscapacidadegreso:         new FormControl(""),
            lp_annodx:                          new FormControl(""),
            lp_diasretrasodx:                   new FormControl(""),
            lp_reportesivigila:                 new FormControl(""),


        });


    }
    dateKeys(event) {
        return false;
    }

    getDataInit() {
        this.loading.emit(false);
        // this.WebApiService.getRequest(this.endpoint, {
        //     action: 'getParamsUpdate'
        // })
        // .subscribe(
        //     data => {
        //         if (data.success == true) {
        //             let datos = data.data[0];
        //             this.tipoDocumentos                       = datos['tipos_dni'] ? JSON.parse(datos['tipos_dni']) : [];
        //             this.sexos                                = datos['sexos'] ? JSON.parse(datos['sexos']) : [];
        //             this.departamentos                        = datos['departamentos'] ? JSON.parse(datos['departamentos']) : [];
                   

        //             this.loading.emit(false);
        //             if (this.view == 'update') {
        //                 //this.getDataUpdate();
        //             }
        //         } else {
        //             this.handler.handlerError(data);
        //             this.loading.emit(false);
        //         }
        //     },
        //     error => {
        //         // console.log(error);
        //         this.handler.showError('Se produjo un error');
        //         this.loading.emit(false);
        //     }
        // );
    }

    closeDialog() {
        // this.dialogRef.close();
    }















}
