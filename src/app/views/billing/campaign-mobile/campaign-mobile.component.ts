import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from "@angular/material/dialog";


import { Component, OnInit, Output, EventEmitter, ViewChild } from '@angular/core';
import { WebApiService } from '../../../services/web-api.service';
import { HandlerAppService } from '../../../services/handler-app.service';
import { FormGroup, FormControl } from '@angular/forms';
import { DatePipe } from "@angular/common";
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from "@angular/material/core";
import { environment } from "../../../../environments/environment";
import { Tools } from "../../../Tools/tools.page";
import { ModalDirective } from "ngx-bootstrap/modal";
import { Router } from "@angular/router";

@Component({
  selector: 'app-campaign-mobile',
  templateUrl: './campaign-mobile.component.html',
  styleUrls: ['./campaign-mobile.component.css']
})
export class CampaignMobileComponent implements OnInit {

  ndpoint: string = '/campaign-mobile';
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
    component = "/billing/campaign-mobile";
    loading: boolean = false;
    permissions: any = null;
    modal: "successModal";
    endpointup: string = "/billingupload";
    urlKaysenBackend = environment.url;
    url = this.urlKaysenBackend + this.endpointup;
    // endpoint: string = "/updApp";
    personaleData: any = [];
    datapersonale: any = [];



    public afuConfig = {
      multiple: false,
      formatsAllowed: ".xlsx,.xls",
      maxSize: "20",
      uploadAPI: {
        url: this.url,
        method: "POST",
        headers: {
          Authorization: this._tools.getToken(),
        },
      },
      theme: "dragNDrop",
      hideProgressBar: false,
      hideResetBtn: true,
      hideSelectBtn: false,
      replaceTexts: {
        selectFileBtn: "Seleccione Archivo",
        resetBtn: "Limpiar",
        uploadBtn: "Subir Archivo",
        attachPinBtn: "Sube información usuarios",
        hideProgressBar: false,
        afterUploadMsg_success: "",
        afterUploadMsg_error: "Fallo al momento de cargar el archivo!",
        sizeLimit: "Límite de tamaño",
      },
    };

  
    // @Output() loading = new EventEmitter();
    // @Output() reload = new EventEmitter();
    
   
    
    constructor(
      private WebApiService: WebApiService,
      private handler: HandlerAppService,
      private _tools: Tools,
      private router: Router

    ) { }
    @ViewChild("infoModal", { static: false }) public infoModal: ModalDirective;
    @ViewChild("successModal", { static: false })
    public successModal: ModalDirective;

  
    ngOnInit(): void {
      // let fi = null;
      // fi = this.pipe.transform(Date.now(), 'dd/MM/yyyy');
      this.permissions = this.handler.permissionsApp;
      console.log('==>',this.permissions);
      

        this.formDownoadIngreso = new FormGroup({
        fi: new FormControl(''),
        ff: new FormControl(''),
        
      });
      this.loading =false;

    }
    
  
      descargarArchivos(){
        
          if (this.formDownoadIngreso.valid) {
  
                if( this.formDownoadIngreso.value['fi'] <= this.formDownoadIngreso.value['ff'] && this.formDownoadIngreso.value['fi'] != '' && this.formDownoadIngreso.value['ff'] != '' ){
                                        
                  let body =  {
                    valest:this.formDownoadIngreso.value     
                  }
                   
                  // this.loading.emit(true);
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
                          // console.log(data);
                          if(data.success){
                              const link = document.createElement("a");
                              link.href = data.data.url;
                              link.download = data.data.file;
                              link.click();
                              this.handler.showSuccess(data.data.file);
                              // this.loading.emit(false);
                          }else{
                              this.handler.handlerError(data);
                              // this.loading.emit(false);
                          }          
                      },
                      error => {
                          this.handler.showError(error);
                          console.log(error);
                          // this.loading.emit(false);
                      }
                  );
              }else{
                  this.handler.showError('Periodo de consulta invalido'); 
                  // this.loading.emit(false);
              }
          }else {
              this.handler.showError('Complete la informacion necesaria');
              // this.loading.emit(false);
           }
          
      }
                
             
      labelMatriz(event){
        this.tipMatriz = event;
      }

      
  getAllPersonal() {
    this.WebApiService.getRequest(this.ndpoint, {
      action: "getAplication",
      idUser: this.cuser.iduser,
      token: this.cuser.token,
      modulo: this.component,
    }).subscribe(
      (response) => {
        this.permissions = this.handler.getPermissions(this.component);

        if (response.success) {
          this.handler.showSuccess("El archivo se cargo exitosamente");
          this.personaleData = response.data;
          this.loading = false;
          this.successModal.hide();
          // this.sendRequest();
        } else {
          this.datapersonale = [];
          this.handler.handlerError(response);
        }
      },
      (mistake) => {
        let msjErr = "Se presento problema al descargar el archivo";
        //let msjErr = mistake.error.message;
        this.handler.showError(msjErr);
        this.loading = false;
      }
    );
  }
  getProjection(){

    // if (this.formDownoadIngreso.valid) {
  
      // if( this.formDownoadIngreso.value['fi'] <= this.formDownoadIngreso.value['ff'] && this.formDownoadIngreso.value['fi'] != '' && this.formDownoadIngreso.value['ff'] != '' ){
                              
        let body =  {
          valest:this.formDownoadIngreso.value     
        }
         
        // this.loading.emit(true);
        this.handler.showLoadin("Generando Reporte", "Por favor espere...");
        this.WebApiService.getRequest(this.ndpoint, {
            action: 'projection',
            // report:  ""+JSON.stringify({body}),
            token: this.cuser.token,
            idUser: this.cuser.iduser,
            modulo: this.component
        })
        .subscribe(
            data => {
                console.log(data);
                if(data.success){
                    // const link = document.createElement("a");
                    // link.href = data.data.url;
                    // link.download = data.data.file;
                    // link.click();
                    // this.handler.showSuccess(data.data.file);
                    this.handler.showSuccess(data.message);

                    // this.loading.emit(false);
                    
                    this.loading = false;
                    this.router.navigate([this.router.url]); // Navega a la misma URL para "recargar" la página
 

                }else{
                    this.handler.handlerError(data);
                    // this.loading.emit(false);
                    this.loading = false;

                }          
            },
            error => {
                this.handler.showError(error);
                console.log(error);
                // this.loading.emit(false);
                this.loading = false;

            }
        );
    // }else{
    //     this.handler.showError('Periodo de consulta invalido'); 
    //     // this.loading.emit(false);
    // }
// }else {
//     this.handler.showError('Complete la informacion necesaria');
//     // this.loading.emit(false);
//  }

  }
}
