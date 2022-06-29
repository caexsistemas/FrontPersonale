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
  templateUrl: './reports-rqcalidad.component.html',
  styleUrls: ['./reports-rqcalidad.component.css']
})
export class ReportsRqcalidadComponent implements OnInit {

  ndpoint: string = "/rqcalidad";
  formDownoadIngreso: FormGroup;
  dataCad: any = [];
  tipMatriz: any = [];
  loading_: boolean = false;
  //History
  historyMon: any = [];
  displayedColumns: any = [];
  ListEstGes: any = [];
  listipomatriz: any = [];
  public clickedRows;
  public cuser: any = JSON.parse(localStorage.getItem('currentUser'));

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
      ident: new FormControl('')
    });
  }

  dataIni() {
    this.loading.emit(true);
    this.WebApiService.getRequest(this.ndpoint, {
      action: 'getParamPrew',
      role: this.cuser.role
    })
      .subscribe(
        data => {
          if (data.success == true) {
           // this.dataCad = data.data['getContData'][0];
           // this.tipMatriz = this.dataCad.matrizarp_cod;
           this.listipomatriz = data.data['tipmatriz']; //40
          
            //  this.ListEstGes = data.data['stadgestion'];
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



