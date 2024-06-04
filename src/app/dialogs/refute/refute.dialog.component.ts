import {WebApiService} from '../../services/web-api.service';
import { Component, EventEmitter, Inject, OnInit, Output, QueryList, ViewChildren } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSort } from '@angular/material/sort';
import { HandlerAppService } from '../../services/handler-app.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-refute.dialog',
  templateUrl: './refute.dialog.component.html',
  styleUrls: ['./refute.dialog.component.css']
})
export class RefuteDialog {

  view:any = [];
  id_rq: number;
  formRefute: FormGroup;
  gana: any = [];
  checkGana: boolean = false;
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
      this.getDataInit();
      this.loading.emit(false);
      this.formRefute = new FormGroup({
        refute: new FormControl(""),
        createUser: new FormControl(this.cuser.iduser),
        pqid: new FormControl(''),
        item: new FormControl([]),
        reason: new FormControl(''),
        answer: new FormControl('')
      });
    }
  closeDialog() {
    this.dialogRef.close();
  }
checkUpdate: boolean = false;
refute:any = [];
refu:any = [];
descriptions: string[];
  getDataInit() {
    this.loading.emit(false);
    this.WebApiService.getRequest(this.endpoint, {
      action: "getModelGana",
      token: this.cuser.token,
      idUser: this.cuser.iduser,
      modulo: this.component,
      id_call:this.data.codigo
    }).subscribe(
      (data) => {
        if (data.success == true) {
          //DataInfo
          this.gana = data.data["gana"];
          // console.log('=>',data.data["getDataUpda"][0].answer.length);
          
          if(data.data["getDataUpda"].length > 0){
            
            this.checkUpdate = true;
            this.formRefute.get('refute').clearValidators();
            this.formRefute.get('item').clearValidators();
            this.formRefute.get('reason').clearValidators();

            this.refute =data.data["getDataUpda"][0];
            (this.refute.refute == '1') ? this.refute.refute = 'SI': this.refute.refute = 'NO';

            this.refu = this.gana.filter(
              (gn) => gn.ls_codvalue === this.refute.item
            );
                           
            this.view = 'view'

            const selectedItems = this.refute.item.split(',');
            this.descriptions = this.gana
              .filter(item => selectedItems.includes(item.ls_codvalue))
              .map(item => item.description);

              if(data.data["getDataUpda"][0].answer != null){
                this.checkGana = false;
              }else{
                this.checkGana = true;
              }
            
          }else{
                this.formRefute.get('refute').setValidators([Validators.required]);
                this.formRefute.get('item').setValidators([Validators.required]);
                this.formRefute.get('reason').setValidators([Validators.required]);
          }
          
          // (this.cuser.iduser == 262 || this.cuser.role == 1) ? this.checkGana = true : this.checkGana = false;
           this.formRefute.get('refute').updateValueAndValidity();
           this.formRefute.get('item').updateValueAndValidity();
           this.formRefute.get('reason').updateValueAndValidity();


          // if (this.view == "update") {
          //   this.getDataUpdate();
          // }
          this.loading.emit(false);
        } else {
          this.handler.handlerError(data);
          this.loading.emit(false);
        }
      },
      (error) => {
        this.handler.showError("Se produjo un error");
        this.loading.emit(false);
      }
    );
  }

  onSubmit(){

   
    if( this.formRefute.valid){
      this.formRefute.value['item'] = this.item;

        let body = {
          refute: this.formRefute.value,
          // salud:''
      }
        this.loading.emit(true);
        this.handler.showLoadin("Guardando Registro", "Por favor espere...");
        this.WebApiService.getRequest(this.endpoint, {
          action: 'getInsertValResult',
          idvalist: this.data.codigo,
          forma: ""+JSON.stringify({body}),
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
    }else {
        this.handler.showError('Complete la información!!');
        this.loading.emit(false);
    }
}

  onSubmi(){
        
    
    if( this.formRefute.valid){
      this.formRefute.value['item'] = this.item;

        let body = {
          refute: this.formRefute.value,
          salud:''
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
item: any = [];
  onSelectItem(event){
     this.item = event.join(',');
    this.formRefute.value['item'] = this.item;
    
  } 

  onSubmitUpdateSub() {

    if( (this.formRefute.valid )){

        let body = {
            valists:   this.formRefute.value,
        }

        this.loading.emit(true);

        this.WebApiService.getRequest(this.endpoint, {
            action: 'getUpdateValResult',
            idvalist: this.id_rq,
            forma: ""+JSON.stringify({body}),
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
                    //console.log(this.idList+"AA");
                    // this.optionSubVal('view', this.idList);
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
    }else{
        this.handler.showError('Complete la información necesaria');
    }
}
}
