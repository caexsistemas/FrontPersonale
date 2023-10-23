import { MatDialog,MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, Inject, Output, EventEmitter, ViewChildren, QueryList } from '@angular/core';
import { WebApiService } from '../../services/web-api.service';
import { FormGroup, FormControl, Validators, ValidatorFn, ValidationErrors } from '@angular/forms';
import { DateAdapter } from '@angular/material/core';
import { HandlerAppService } from '../../services/handler-app.service';
import { environment } from '../../../environments/environment';
import { global } from '../../services/global';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { Observable } from 'rxjs';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';

export interface PeriodicElement {
    currentm_user: string,
    date_move:string,
    type_move: string
  }

@Component({
  selector: 'app-comision',
  templateUrl: './comision.dialog.component.html',
  styleUrls: ['./comision.dialog.component.css']
})
export class ComisionDialog {

   //History
   historyMon: any = [];
   displayedColumns:any  = [];
   public clickedRows;
   public cuser: any = JSON.parse(localStorage.getItem('currentUser'));
   component = "/nomi/commisions";
   //OUTPUTS
   @Output() loading = new EventEmitter();
   @Output() loadingtwo = new EventEmitter();
   @Output() reload = new EventEmitter();
   @ViewChildren(MatSort) sort = new QueryList<MatSort>();
   //VARIABLES
   endpoint:      string = '/commisions';
   maskDNI        = global.maskDNI;
   view:          string = null;
   idAds:         number = null;
   title:         string = null;
   formProces:    FormGroup;
   ListPersonale: any = [];
   ListTipocomi:  any = [];
   ListQuincea:   any = [];
   //Control Campos Update
   conStyle:      String = "";
   conReadOnly:   boolean = false;
   dataAbs:     any = []; 

  constructor(
    public dialogRef: MatDialogRef<ComisionDialog>,
    private WebApiService: WebApiService,
    private handler: HandlerAppService,
    @Inject(MAT_DIALOG_DATA) public data,
    public dialog: MatDialog
  ) {
      this.view = this.data.window;
      this.idAds = null;

      switch (this.view) {
          case 'create':
              this.initForms();
              this.title = "Crear Comisión/Bono";
          break;
          case 'update':
            this.initForms();
            this.title = "Actualizar Comisión/Bono";
            this.idAds = this.data.codigo;
          break;
          case 'view':
            this.idAds = this.data.codigo;
            this.loading.emit(true);
            this.WebApiService.getRequest(this.endpoint + '/' + this.idAds, {
                token: this.cuser.token,
                idUser: this.cuser.iduser,
                modulo: this.component
            })
                .subscribe(
                    data => {
                        if (data.success == true) {
                            this.dataAbs = data.data['getDatPer'][0];
                            this.generateTable(data.data['getDatHistory']);   
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
        break;
      }
   }

  initForms(){
    this.getDataInit();
    this.formProces = new FormGroup({
      document: new FormControl(""),
      idPersonale: new FormControl(""),
      fecha_commi: new FormControl(""),
      valor_commi: new FormControl(""),
      tipo_comi: new FormControl(""),
      quincena: new FormControl(""),        
      createUser: new FormControl(this.cuser.iduser)
    });
  }

  getDataInit(){
    this.loading.emit(true);
    this.WebApiService.getRequest(this.endpoint, {
        action: 'getParamView',
        token: this.cuser.token,
        idUser: this.cuser.iduser,
        modulo: this.component
    })
    .subscribe(
       
        data => {
            if (data.success == true) {
                //DataInfo
                this.ListTipocomi  = data.data['tipcomi'];
                this.ListQuincea   = data.data['quincea'];
                this.ListPersonale = data.data['getDataPersonale'];

                if (this.view == 'update') {
                    this.getDataUpdate();
                    this.conStyle     = "readonly-wrapper";
                    this.conReadOnly  = true;
                }
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

  onSelectionChange(event){
    let personale = this.ListPersonale;        
    let exitsPersonal = personale.find(element => element.document == event);
    if( exitsPersonal ){
        this.formProces.get('idPersonale').setValue(exitsPersonal.idPersonale);
        
    }        
  }

  closeDialog() {
    this.dialogRef.close();
  }

  onSubmi(){

    if (this.formProces.valid) {
        this.loading.emit(true);
        let body = {
            absen: this.formProces.value 
        }
        this.WebApiService.postRequest(this.endpoint, body, {
            token: this.cuser.token,
            idUser: this.cuser.iduser,
            modulo: this.component
        })
            .subscribe(
                data => {
                    if (data.success) {
                    this.handler.showSuccess(data.message);
                        this.reload.emit();
                        this.closeDialog();
                    } else {
                        this.handler.handlerError(data);
                        this.loading.emit(false);
                    }
                },
                error => {
                    this.handler.showError('Error al realizar el registro');
                    this.loading.emit(false);
                }
            );  
    } else {
        this.handler.showError('Complete la informacion necesaria');
        this.loading.emit(false);
    }   
  }

  getDataUpdate(){

    this.loading.emit(true);
    this.WebApiService.getRequest(this.endpoint, {
        action: 'getParamUpdateSet',
        id: this.idAds,
        token: this.cuser.token,
        idUser: this.cuser.iduser,
        modulo: this.component
    })
    .subscribe(
        data => {

            this.formProces.get('document').setValue(data.data['getDataUpda'][0].document);
            this.formProces.get('idPersonale').setValue(data.data['getDataUpda'][0].idPersonale);
            this.formProces.get('fecha_commi').setValue(data.data['getDataUpda'][0].fecha_commi);
            this.formProces.get('valor_commi').setValue(data.data['getDataUpda'][0].valor_commi);
            this.formProces.get('tipo_comi').setValue(data.data['getDataUpda'][0].tipo_comi);
            this.formProces.get('quincena').setValue(data.data['getDataUpda'][0].quincena);         
    
        },
        error => {
            this.handler.showError();
            this.loading.emit(false);
        }
    );
  }

  onSubmitUpdate(){

    let body = {
        absen: this.formProces.value,
    }
        this.loading.emit(true);
        //Validados incapcidad

        this.WebApiService.putRequest(this.endpoint+'/'+this.idAds,body,{
            token: this.cuser.token,
            idUser: this.cuser.iduser,
            modulo: this.component
        })
        .subscribe(
            data=>{
                if(data.success){
                    this.handler.showSuccess(data.message);
                    this.reload.emit();
                    this.closeDialog();
                }else{
                    this.handler.handlerError(data);
                    this.loading.emit(false);
                }
            },
            error=>{
                this.handler.showError();
                this.loading.emit(false);
            }
        );

   }

   generateTable(data){
        this.displayedColumns = [
        'currentm_user',
        'date_move',
        'type_move'  
        ];
        this.historyMon = data;
        this.clickedRows = new Set<PeriodicElement>();
    }


}