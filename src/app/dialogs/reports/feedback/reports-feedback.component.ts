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
    templateUrl: './reports-feedback.component.html',
    styleUrls: ['./reports-feedback.component.css']
  })
  export class ReportsFeddBackComponent implements OnInit {
    ndpoint: string = '/feedback';
    formDownoadIngreso: FormGroup;
    loading_: boolean = false;
    //History
    historyMon: any = [];
    listipomatriz: any = [];
    displayedColumns:any  = [];
    tipMatriz:        string = "";
    matrizarp: string="";
    dataCad : string = "";

    public clickedRows;
    public cuser: any = JSON.parse(localStorage.getItem('currentUser'));
  
    @Output() loading = new EventEmitter();
    @Output() reload = new EventEmitter();
    
  
    constructor(
      private WebApiService: WebApiService,
      private handler: HandlerAppService,
    ) { }
  
    ngOnInit(): void {
        this.dataIni();
        this.formDownoadIngreso = new FormGroup({
        fi: new FormControl(''),
        ff: new FormControl(''),
        matrizarp: new FormControl(this.cuser.matrizarp),
        document: new FormControl(''),
        role: new FormControl(this.cuser.role),
        iduser: new FormControl(this.cuser.iduser)
      });
    }
    dataIni() {
      console.log(this.cuser);
        this.loading.emit(true);
        this.WebApiService.getRequest(this.ndpoint, {
          action: 'getParamView',
          role: this.cuser.role,
          matrizarp: this.cuser.matrizarp
        })
          .subscribe(
            data => {
              if (data.success == true) {
                this.dataCad = data.data['getContData'];
               console.log( this.dataCad );

               this.listipomatriz = data.data['tipmatriz']; //40
               this.tipMatriz = this.listipomatriz.matrizarp_cod;
                console.log('hi')
                console.log(this.cuser.iduser);
              
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
                  this.WebApiService.getRequest(this.ndpoint, {
                      action: 'downloadFiles',
                      report:  ""+JSON.stringify({body})
                  })
                  .subscribe(
                      data => {
                          console.log(data);
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
                          this.handler.showError(error);
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
      labelMatriz(event){
        this.tipMatriz = event;
      }
  
    }
    