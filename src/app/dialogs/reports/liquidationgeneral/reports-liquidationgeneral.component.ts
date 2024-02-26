import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from "@angular/material/dialog";


import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { WebApiService } from '../../../services/web-api.service';
import { HandlerAppService } from '../../../services/handler-app.service';
import { FormGroup, FormControl } from '@angular/forms';
import { DatePipe } from "@angular/common";
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from "@angular/material/core";

@Component({
  selector: 'app-reports-liquidationgeneral',
  templateUrl: './reports-liquidationgeneral.component.html',
  styleUrls: ['./reports-liquidationgeneral.component.css']
})
export class ReportsLiquidationgeneralComponent implements OnInit {

  ndpoint: string = '/liquidation';
  formDownoadIngreso: FormGroup;
  loading_: boolean = false;
  //History
  historyMon: any = [];
  listipomatriz: any = [];
  displayedColumns:any  = [];
  tipMatriz:        string = "";
  matrizarp: string="";
  dataCad : string = "";
  today: Date = new Date();
  pipe = new DatePipe('en-US');
  public clickedRows;
  public cuser: any = JSON.parse(localStorage.getItem('currentUser'));
  component = "/selfManagement/liquidation";

  @Output() loading = new EventEmitter();
  @Output() reload = new EventEmitter();
  

  constructor(
    private WebApiService: WebApiService,
    private handler: HandlerAppService,
  ) { }

  ngOnInit(): void {
    let fi = null;
    fi = this.pipe.transform(Date.now(), 'dd/MM/yyyy');

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
      this.loading.emit(true);
      this.WebApiService.getRequest(this.ndpoint, {
        action: 'getParamView',
        role: this.cuser.role,
        matrizarp: this.cuser.matrizarp,
        token: this.cuser.token,
        idUser: this.cuser.iduser,
        modulo: this.component
      })
        .subscribe(
          data => {
            if (data.success == true) {
              this.dataCad = data.data['getContData'];

             this.listipomatriz = data.data['tipmatriz']; //40
            //  this.tipMatriz = this.listipomatriz.matrizarp_cod; 
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
      // console.log('body=>',this.formDownoadIngreso.value );

      //    this.formDownoadIngreso.value['fi'];
      //    let fecha1 = this.pipe.transform(this.formDownoadIngreso.value['fi'], 'dd/MM/yyyy');
      //   console.log('FI=>', fecha1);
      //    this.formDownoadIngreso.value['ff'];
      //   let fecha2 = this.pipe.transform( this.formDownoadIngreso.value['ff'], 'dd/MM/yyyy');
      //   console.log('Ff=>', fecha2);

        if (this.formDownoadIngreso.valid) {

            // if( fecha1 <= fecha2 && fecha1 != '' && fecha2 != '' ){
              // if( this.formDownoadIngreso.value['fi'] <= this.formDownoadIngreso.value['ff'] && this.formDownoadIngreso.value['fi'] != '' && this.formDownoadIngreso.value['ff'] != '' ){
                // if( this.pipe.transform(this.formDownoadIngreso.value['fi'], 'dd/MM/yyyy') <= this.pipe.transform( this.formDownoadIngreso.value['ff'], 'dd/MM/yyyy') && this.pipe.transform(this.formDownoadIngreso.value['fi'], 'dd/MM/yyyy') != '' && this.pipe.transform(this.formDownoadIngreso.value['ff'], 'dd/MM/yyyy') != '' ){
                  
                  
                let body =  {
                  valest:this.formDownoadIngreso.value
                       
                }
                 
                  
                
                this.loading.emit(true);
                this.handler.showLoadin("Generando Reporte", "Por favor espere...");
                this.WebApiService.getRequest(this.ndpoint, {
                    action: 'downloadFilesGene',
                    report:  ""+JSON.stringify({body}),
                    token: this.cuser.token,
                    idUser: this.cuser.iduser,
                    modulo: this.component
                })
                .subscribe(
                    data => {
                        // console.log(data);
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
            // }
            // else{
            //     this.handler.showError('Periodo de consulta invalido'); 
            //     this.loading.emit(false);
            // }
        }else {
            this.handler.showError('Complete la informacion necesaria');
            this.loading.emit(false);
         }
        
    }
              
           
    labelMatriz(event){
      this.tipMatriz = event;
    }

}
