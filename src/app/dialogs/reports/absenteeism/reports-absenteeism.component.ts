import {
    MatDialog,
    MatDialogRef,
    MAT_DIALOG_DATA,
  } from "@angular/material/dialog";
  
  
  import { Component, OnInit, Output, EventEmitter } from '@angular/core';
  import { WebApiService } from '../../../services/web-api.service';
  import { HandlerAppService } from '../../../services/handler-app.service';
  import { FormGroup, FormControl } from '@angular/forms';
  
  
  @Component({
    selector: 'app-report',
    templateUrl: './reports-absenteeism.component.html',
    styleUrls: ['./reports-absenteeism.component.css']
  })

  export class ReportsAbsenteeismComponent implements OnInit {

    ndpoint: string = '/absenteeisms';
    formDowAsentis: FormGroup;
    loading_: boolean = false;
    //History
    listAsentis: any = [];
    listipomatriz: any = [];
    displayedColumns:any  = [];
    tipMatriz:        string = "";
    matrizarp: string="";
    dataCad : string = "";

    public clickedRows;
    public cuser: any = JSON.parse(localStorage.getItem('currentUser'));
    component = "/procesalud/absenteeisms";
  
    @Output() loading = new EventEmitter();
    @Output() reload = new EventEmitter();

    constructor(
        private WebApiService: WebApiService,
        private handler: HandlerAppService,
      ) { }

      ngOnInit(): void {

        this.dataIni();
        this.formDowAsentis = new FormGroup({
        fi: new FormControl(''),
        ff: new FormControl(''),
        tipausent: new FormControl(''),
        matrizarp: new FormControl(''),
        document: new FormControl(''),
        ident: new FormControl(''),
        role: new FormControl(this.cuser.role),
        iduser: new FormControl(this.cuser.iduser)
      });
    }

    dataIni() {

        this.loading.emit(true);
        this.WebApiService.getRequest(this.ndpoint, {
        action: 'getParamExcelAsen',
        role: this.cuser.role,
        matrizarp: this.cuser.matrizarp,
        token: this.cuser.token,
        idUser: this.cuser.iduser,
        modulo: this.component
        })
        .subscribe(
            data => {
            if (data.success == true) {
                console.log(data);
                this.listipomatriz = data.data['tipmatriz']; //40
                this.listAsentis   = data.data['tipasentism']; //60  
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

    descargarArchivos(){

        if (this.formDowAsentis.valid) {
    
            if( this.formDowAsentis.value['fi'] <= this.formDowAsentis.value['ff'] 
                && this.formDowAsentis.value['fi'] != '' && this.formDowAsentis.value['ff'] != '' ){
    
                let body = {
                    valest: this.formDowAsentis.value,      
                }
                this.loading.emit(true);
                this.handler.showLoadin("Generando Reporte", "Por favor espere...");
                this.WebApiService.getRequest(this.ndpoint, {
                    action: 'downloadFiles',
                    report:  ""+JSON.stringify({body}),
                    token: this.cuser.token,
                    idUser: this.cuser.iduser,
                    modulo: this.component
                })
                .subscribe(
                    data => {                   
                        if(data.success){
                            const link = document.createElement("a");
                            link.href = data.data.url;
                            link.download = data.data.file;
                            link.click();
                            this.handler.showSuccess(data.data.file);
                            this.loading.emit(false);
                        }else{
                            this.handler.handlerError(data);
                            this.loading.emit(false);
                        }          
                    },
                    error => {
                        this.handler.showError('El documento no contiene información.');
                        console.log(error);
                        this.loading.emit(false);
                    }
                );
            }else{
                this.handler.showError('Periodo de consulta invalido'); 
                this.loading.emit(false);
            }
        }else {
            this.handler.showError('Complete la informacion necesaria');
            this.loading.emit(false);
        }
     }



  }