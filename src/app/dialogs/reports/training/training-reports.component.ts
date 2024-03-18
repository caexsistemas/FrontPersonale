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
import { Observable } from "rxjs";
import { map, startWith } from "rxjs/operators";

@Component({
  selector: 'app-training-reports',
  templateUrl: './training-reports.component.html',
  styleUrls: ['./training-reports.component.css']
})
export class TrainingReportsComponent implements OnInit {

  ndpoint: string = '/training';
  component = "/selection/training";
    
    formReq: FormGroup;
    userCtrl = new FormControl(); 

    loading_: boolean = false;
    //History
    historyMon: any = [];
    listipomatriz: any = [];
    displayedColumns:any  = [];
    tipActi:any =  [];
    matrizarp: string="";
    getIdReq : any = [];
    filteredOptions: Observable<number[]>;

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
      this.formReq = new FormGroup({
      idReq: new FormControl(''),
      // listSub: new FormControl(''),
      // document: new FormControl(''),
      // role: new FormControl(this.cuser.role),
      // iduser: new FormControl(this.cuser.iduser)
    });

    
  }
  dataIni() {
      this.loading.emit(true);
      // this.handler.showLoadin("Generando Reporte", "Por favor espere...");

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
              this.getIdReq = data.data['getIdReq'];
              
              this.filteredOptions = this.formReq.valueChanges.pipe(
                startWith([]),
                
                map(value => this._filter(value)
                  
                )
                
              );
             console.log( this.filteredOptions );
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
    // private _filter(value: any): any[] {
    //   console.log('==>',value);
      
    //   // if (!value) {
    //   //   return this.getIdReq.filter(option => option > value); // Retorna todos los elementos si no hay valor de entrada
    //   // }
    //   const numValue = parseInt(value, 10);
    //   return this.getIdReq.filter(option => option > numValue);
    // }
    private _filter(value: number): number[] {
      console.log('==>',value);
      if(value){
        return this.getIdReq.filter(option => option > value);
      }else{
        const valor = this.getIdReq.filter(option => option.idReq == value);
        console.log('***', valor);
        
        return valor;
      }
     
    }

    descargarArchivos(){

        if (this.formReq.valid) {

            // if( this.formDownoadTechnology.value['fi'] <= this.formDownoadTechnology.value['ff'] && this.formDownoadTechnology.value['fi'] != '' && this.formDownoadTechnology.value['ff'] != '' ){

                let body = {
                    valest: this.formReq.value,      
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
