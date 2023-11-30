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
    templateUrl: './reports-customer.component.html',
    styleUrls: ['./reports-customer.component.css']
  })

  export class ReportsCustomerComponent implements OnInit {

    ndpoint: string = "/customer";
    formDownoadIngreso: FormGroup;
    dataCad: any = [];
    tipMatriz: any = [];
    loading_: boolean = false;
    //History
    historyMon: any = [];
    displayedColumns: any = [];
    ListEstGes: any = [];
    listipomatriz: any = [];
    listiVersionRepr: any = [];
    public clickedRows;
    public cuser: any = JSON.parse(localStorage.getItem('currentUser'));
    component = "/callcenter/customer";
  
    @Output() loading = new EventEmitter();
    @Output() reload = new EventEmitter();
  
    constructor(
      private WebApiService: WebApiService,
      private handler: HandlerAppService
    ) { }

    ngOnInit() {
        this.dataIni();
        this.formDownoadIngreso = new FormGroup({
          monitoring_date: new FormControl(''),
          matrizarp: new FormControl(''),
          fi: new FormControl(''),
          ff: new FormControl(''),
          role: new FormControl(this.cuser.role),
          iduser: new FormControl(this.cuser.iduser),
          tipogesti: new FormControl(''),
          ident: new FormControl(''),
          vienue: new FormControl('')
        });
    }

    dataIni() {
        this.loading.emit(true);
        this.WebApiService.getRequest(this.ndpoint, {
          action: 'getParamView',
          role: this.cuser.role,
          token: this.cuser.token,
          idUser: this.cuser.iduser,
          modulo: this.component
        })
          .subscribe(
            data => {
              if (data.success == true) {

                this.listipomatriz = data.data['tipomatr']; //40
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

        if (this.formDownoadIngreso.valid) {
    
            if( this.formDownoadIngreso.value['fi'] <= this.formDownoadIngreso.value['ff'] && this.formDownoadIngreso.value['fi'] != '' && this.formDownoadIngreso.value['ff'] != '' ){
    
                let body = {
                    valest: this.formDownoadIngreso.value,      
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