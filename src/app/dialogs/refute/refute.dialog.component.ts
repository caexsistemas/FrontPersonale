import {WebApiService} from '../../services/web-api.service';
import { Component, EventEmitter, Inject, OnInit, Output, QueryList, ViewChildren } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSort } from '@angular/material/sort';
import { HandlerAppService } from '../../services/handler-app.service';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-refute.dialog',
  templateUrl: './refute.dialog.component.html',
  styleUrls: ['./refute.dialog.component.css']
})
export class RefuteDialog {

  view:any = [];
  id_rq: number;
  formRefute: FormGroup;
  endpoint:      string = '/rqcalidad';
  component = "/callcenter/rqcalidad";
  public cuser: any = JSON.parse(localStorage.getItem('currentUser'));



  @Output() loading = new EventEmitter();
  @Output() reload = new EventEmitter();
  @Output() loadingtwo = new EventEmitter();
  @ViewChildren(MatSort) sort = new QueryList<MatSort>();


  constructor(public dialogRef: MatDialogRef<RefuteDialog>,
        private WebApiService: WebApiService,
        private handler: HandlerAppService,
        @Inject(MAT_DIALOG_DATA) public data,
        public dialog: MatDialog) {  

          this.view  = this.data.window;
          this.id_rq = null;
          // this.diag  = this.data.dialogo;
  
          switch (this.view) {
            case 'refute':              
            this.loading.emit(false);
              this.initFormsRefute();              
              this.id_rq = this.data.codigo
              break;
          }
        }

 
    initFormsRefute(){
      this.loading.emit(false);
      this.formRefute = new FormGroup({
        refute: new FormControl(""),
        createUser: new FormControl(this.cuser.iduser),
        retro_call: new FormControl(''),
        cri_fal_exp_mal_pra: new FormControl(''),
        cri_val_cor_cob: new FormControl('')
      });
    }
  closeDialog() {
    this.dialogRef.close();
  }

  onSubmitUpdate(){

   
    if( this.formRefute.valid){

        let body = {
          salud: this.formRefute.value,
      }
        this.loading.emit(true);
        this.handler.showLoadin("Guardando Registro", "Por favor espere...");

        this.WebApiService.putRequest(this.endpoint+'/'+this.id_rq,body,{
            idUser: this.cuser.iduser,
            role: this.cuser.role,
            token: this.cuser.token,
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
    }else {
        this.handler.showError('Complete la información!!');
        this.loading.emit(false);
    }
}

  onSubmi(){
        
    if (this.formRefute.valid) {
            this.loading.emit(true);
            let body = {
                salud: this.formRefute.value, 
            }
            this.handler.showLoadin("Guardando Registro", "Por favor espere...");
            this.WebApiService.postRequest(this.endpoint, body, {
                idUser: this.cuser.iduser,
                role: this.cuser.role,
                token: this.cuser.token,
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
                        this.handler.showError();
                        this.loading.emit(false);
                    }
                );
       
    } else {
        this.handler.showError('Complete la informacion necesaria');
        this.loading.emit(false);
    }
}
}
