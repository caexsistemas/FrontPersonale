import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from "@angular/material/dialog";

// import {MatDatepickerModule} from '@angular/material/datepicker';
// import {MatNativeDateModule} from '@angular/material/core';
// import {MatDatepickerModule} from '@angular/material/datepicker';
import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { WebApiService } from '../../../services/web-api.service';
import { HandlerAppService } from '../../../services/handler-app.service';
import { FormGroup, FormControl } from '@angular/forms';

@Component({
  selector: 'app-reports-technology',
  templateUrl: './reports-technology.component.html',
  styleUrls: ['./reports-technology.component.css']
})
export class ReportsTechnologyComponent implements OnInit {

    ndpoint: string = '/technology';
    component = "/inventory/technology";
    
    formDownoadTechnology: FormGroup;
    loading_: boolean = false;
    //History
    historyMon: any = [];
    listipomatriz: any = [];
    displayedColumns:any  = [];
    tipActi:any =  [];
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
      this.formDownoadTechnology = new FormGroup({
      fi: new FormControl(''),
      ff: new FormControl(''),
      listSub: new FormControl(''),
      document: new FormControl(''),
      // role: new FormControl(this.cuser.role),
      // iduser: new FormControl(this.cuser.iduser)
    });
  }
  dataIni() {
      this.loading.emit(true);

      this.WebApiService.getRequest(this.ndpoint, {
        // action: 'getParamView',
        // role: this.cuser.role,
        // idUser: this.cuser.iduser,
        // token: this.cuser.token,
        // modulo: this.component

        action: 'getParamView',
        role: this.cuser.role,
        matrizarp: this.cuser.matrizarp,
        token: this.cuser.token,
        idUser: this.cuser.iduser,
        modulo: this.component
        // matrizarp: this.cuser.matrizarp
      })
        .subscribe(
          data => {
            if (data.success == true) {
              this.dataCad = data.data['getContData'];
            //  console.log( this.dataCad );
             this.tipActi = data.data['getSubActivo'];
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

        if (this.formDownoadTechnology.valid) {

            // if( this.formDownoadTechnology.value['fi'] <= this.formDownoadTechnology.value['ff'] && this.formDownoadTechnology.value['fi'] != '' && this.formDownoadTechnology.value['ff'] != '' ){

                let body = {
                    valest: this.formDownoadTechnology.value,      
                }
                this.loading.emit(true);
                this.WebApiService.getRequest(this.ndpoint, {
                  action: 'downloadFiles',
                  report:  ""+JSON.stringify({body}),
                  token: this.cuser.token,
                  idUser: this.cuser.iduser,
                  modulo: this.component,
                    // report:  ""+JSON.stringify({body})
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
                        this.handler.showError(error);
                        console.log(error);
                        this.loading.emit(false);
                    }
                );
            // }else{
            //     this.handler.showError('Periodo de consulta invalido'); 
            //     this.loading.emit(false);
            // }
        }else {
            this.handler.showError('Complete la informacion necesaria');
            this.loading.emit(false);
        }
    }
    labelMatriz(event){
      // this.tipMatriz = event;
    }

}