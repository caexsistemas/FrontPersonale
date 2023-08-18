import { MatDialog,MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, Inject, Output, EventEmitter, ViewChildren, QueryList } from '@angular/core';
import { WebApiService } from '../../services/web-api.service';
import { FormGroup, FormControl, Validators, ValidatorFn, ValidationErrors } from '@angular/forms';
import { HandlerAppService } from '../../services/handler-app.service';
import { global } from '../../services/global';
import { MatSort } from '@angular/material/sort';
import { NovedadesnominaServices } from '../../services/novedadesnomina.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { element } from 'protractor';

export interface PeriodicElement {
  month: string,
  day_hol:string,
  actions: string
}

@Component({
  selector: 'app-module.dialog',
  templateUrl: './module.dialog.component.html',
  styleUrls: ['./module.dialog.component.css']
})
export class ModuleDialog  {

  endpoint:      string = "/module";
  maskDNI        = global.maskDNI;
  view:          string = null;
  idNomi:        number = null;
  title:         string = null;
  formModule:      FormGroup;
  formCreate: FormGroup;
  permissions: any = null;
  component = "/admin/module";
  dataSource: any=[];
  feed: any= [];
  module: any = [];
  idMod: number = null;
  public today: number = Date.now();//+
  formFeed: FormGroup;
  archivo = {
      nombre: null,
      nombreArchivo: null,
      base64textString: null
  }
  tipMatriz:        string = "";
  rol: number;
  tipRole : string = "";
  //History
  historyMon: any = [];
  displayedColumns:any  = [];
  checked = false;
  idCal: number;
  idCalSec: number;
  and: any = [];
  fes: any = [];
  roles: any = [];
  authorization: any = [];
  mod: any = [];
  perm: any = [];
  viewModu: any = [];
  status: any = [];
  item:any = [];
  idUpdate: any = [];
  valuesItesub: any = [];
  public clickedRows;
  public cuser: any = JSON.parse(localStorage.getItem('currentUser'));

  //OUTPUTS
  @Output() loading = new EventEmitter();
  @Output() reload = new EventEmitter();
  @ViewChildren(MatSort) sort = new QueryList<MatSort>();
  @ViewChildren(MatPaginator) paginator = new QueryList<MatPaginator>();

constructor(
  public dialogRef: MatDialogRef<ModuleDialog>,
  private WebApiService: WebApiService,
  private handler: HandlerAppService,
  @Inject(MAT_DIALOG_DATA) public data,
  public dialog: MatDialog,
  private uploadFileService: NovedadesnominaServices,
  private _snackBar: MatSnackBar
) { 
  this.view = this.data.window;
  this.idMod = null;
  this.rol = this.cuser.role;

  switch (this.view) {
      case 'create':
        this.initFormsModu();
        this.title = "Crear Modulo";
      break;
      case 'update':
        this.initFormsModu();
        this.title = "Actualizar Modulo";
        this.idUpdate = this.data.codigo;        
        break;
      case 'createCal':
        this.tipMatriz = this.data.tipoMat;
          this.initForms();
          this.title = "Ingresar Rol";
          this.idMod = this.data.codigo;
        break;
        case "view":
          this.idMod = this.data.codigo;
          this.title = "Módulo";
          this.loading.emit(true);
          this.WebApiService.getRequest(
            this.endpoint + "/" + this.idMod,
            {
              token: this.cuser.token,
              idUser: this.cuser.iduser,
              modulo: this.component
            }
          ).subscribe(
            (data) => {
              if (data.success == true) {
                this.module = data.data['getDataView'][0];

                  if(data.data['getSelectData'][0] != null) {
                      this.generateTable(data.data['getSelectData']);
                      this.loading.emit(false);        
                  } else{
                    this.handler.showError("No tiene rol asignado");
                    this.loading.emit(false);        

                  }
              } else {
                  this.handler.handlerError(data);
                  this.closeDialog();
                  this.loading.emit(false);
              }
            },
            (error) => {
              this.handler.showError("Se produjo un error");
              this.loading.emit(false);
            }
          );
          break;
          case 'updateCal':
          this.initForms();
          this.title = "Actualizar Permisos";
          this.idMod = this.data.codigo;
          break;
      }
}
optionCal(action, codigo=null, id){

  var dialogRef;
  switch(action){

      case 'updateCal':
          this.loading.emit(true);
          dialogRef = this.dialog.open(ModuleDialog,{
          data: {
              window: 'updateCal',
              codigo,
              id:id
          }
          });
          // dialogRef.disableClose = true;
            // LOADING
            dialogRef.componentInstance.loading.subscribe(val=>{
          this.loading.emit(false);
          // this.loading = val;
            });
            // RELOAD
            dialogRef.componentInstance.reload.subscribe(val=>{
              this.reload.emit(true);
            });
              this.closeDialog();
         
      break;

      case 'view':
          this.loading.emit(true);
          dialogRef = this.dialog.open(ModuleDialog,{
          data: {
              window: 'view',
              codigo,
              id
          }
          });
          dialogRef.disableClose = true;
            // LOADING
            dialogRef.componentInstance.loading.subscribe(val=>{
          this.loading.emit(false);
              // this.loading = val;
            });
            // RELOAD
            dialogRef.componentInstance.reload.subscribe(val=>{
              this.reload.emit(true); 
            });

      break;

      case 'createCal':
          this.loading.emit(true);
          dialogRef = this.dialog.open(ModuleDialog,{
          data: {
              window: 'createCal',
              codigo,
          }
          });
          dialogRef.disableClose = true;
            // LOADING
            dialogRef.componentInstance.loading.subscribe(val=>{
              this.loading = val;
            });
            // RELOAD
            dialogRef.componentInstance.reload.subscribe(val=>{
              this.reload.emit(true);
            });
          this.closeDialog();
      break;
  }
}
closeDialog() {
this.dialogRef.close();
this.reload.emit(true);

}
initForms() {
  this.getDataInit();
  this.formModule = new FormGroup({
    idrol:  new FormControl(""),
    iditem: new FormControl(""),
    perm:   new FormControl("")       
  });
 
}
initFormsModu(){
this.getdataModul();
this.formCreate = new FormGroup({
  name:   new FormControl(""),
  url:    new FormControl(""),
  status: new FormControl(""),
  iditem: new FormControl(""),
  // icon:   new FormControl("")
});
}

generateTable(data){
this.displayedColumns = [
  'id',
  'role',
  'perm',
  'actions'  
];
this.dataSource = new MatTableDataSource(data);
    this.dataSource.sort = this.sort.toArray()[0];
    this.dataSource.paginator = this.paginator.toArray()[0];
}
getDataInit(){

this.loading.emit(false);
this.WebApiService.getRequest(this.endpoint, {
    action: "getParamView",
    matrizarp: this.cuser.matrizarp,
    tipRole: this.cuser.role,
    token: this.cuser.token,
    idUser: this.cuser.iduser,
    modulo: this.component
})
.subscribe(
   
    data => {
        if (data.success == true) {
            //DataInfo
            this.roles = data.data["getRole"];
            this.authorization = data.data["getPermission"];
            this.mod = data.data["getModulo"];

            const tiModulo = this.mod.filter(modu => modu.id === this.idMod)
            tiModulo.forEach(element => {
              this.formModule.get('iditem').setValue(element.name);
            });
            this.loading.emit(false);
                if (this.view == 'updateCal') {
                    this.getDataUpdate();
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
onSubmit() {
  
if (this.formModule.valid) {
    this.loading.emit(true);
     this.formModule.value['iditem'] = this.idMod;
     this.getPermissionRole(this.formModule.value['perm']);
      
        let body = {
            listas: this.formModule.value,
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
                    this.optionCal('view',this.data.codigo,this.idMod);

                } else {
                    this.handler.handlerError(data);
                    this.loading.emit(false);
                }
            },
            error => {
                this.handler.showError();
                this.loading.emit(false);
            }
        )
} else {
    this.handler.showError('Complete la informacion necesaria');
    this.loading.emit(false);
}
      
}
getDataUpdate(){
this.loading.emit(true);
this.WebApiService.getRequest(this.endpoint, {
    action: 'getParamUpdateSet',
    id: this.data.codigo,
    tipMat: this.tipMatriz,
    tipRole:this.tipRole,
    token: this.cuser.token,
    idUser: this.cuser.iduser,
    modulo: this.component

})
.subscribe(
    data => {
          
      this.formModule.get('idrol').setValue(data.data['getSelectData'][0].idRole);
      this.formModule.get('iditem').setValue(data.data['getSelectData'][0].item);
      this.perm = data.data['getSelectData'][0].perm.split('|');
      this.viewModu = data.data['getSelectData'][0].id;
      this.formModule.get('perm').setValue(this.perm);
    },
    error => {
        this.handler.showError();
        this.loading.emit(false);
    }
);
}
getdataModul(){

this.loading.emit(false);
this.idUpdate;
this.WebApiService.getRequest(this.endpoint, {
    action: "getParamViewModule",
    id: this.data.codigo,
    matrizarp: this.cuser.matrizarp,
    tipRole: this.cuser.role,
    token: this.cuser.token,
    idUser: this.cuser.iduser,
    modulo: this.component
})
.subscribe(
   
    data => {
        if (data.success == true) {
            //DataInfo
            this.status   = data.data["status"].slice(0,2);
            this.item     = data.data["item"];
            this.loading.emit(false);
                if (this.view == 'update') {
                    this.getDataUpdatesub(data);
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
  getDataUpdatesub(datos) {  
    this.loading.emit(true);
    this.WebApiService.getRequest(this.endpoint, {
      action: 'getParamUpdateModule',
      id: this.data.codigo,
      token: this.cuser.token,
      idUser: this.cuser.iduser,
      modulo: this.component
    // try {
    }) .subscribe(
      data => {
          if (data.success) {
            console.log('==>', data);
            
        this.valuesItesub = data.data.updateItesub[0];        
        this.formCreate.get('name').setValue(this.valuesItesub.name);
        this.formCreate.get('url').setValue(this.valuesItesub.url);
        this.formCreate.get('status').setValue(this.valuesItesub.status);
        this.formCreate.get('iditem').setValue(this.valuesItesub.iditem);
        this.loading.emit(false);
      } else {
        this.handler.handlerError(data);
        this.loading.emit(false);
        this.closeDialog();
    }
},
error => {
    this.handler.showError();
    this.loading.emit(false);
}
);
}
  getUpdate(){
    if( (this.formCreate.valid )){

      let body = {
          listas:   this.formCreate.value,
      }

      this.loading.emit(true);

      this.WebApiService.getRequest(this.endpoint, {
          action: 'getUpdateValResult',
          idModu: this.idUpdate,
          listas: ""+JSON.stringify({body}),
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
  }else{
      this.handler.showError('Complete la información necesaria');
  }
  }
onSelectionPerson(event){
 
}
onSubmitUpdate(){

this.getPermissionRole(this.formModule.value['perm'])
let body = {
    listas: this.formModule.value
}
if (this.formModule.valid) {
  this.loading.emit(true);
  
  this.WebApiService.putRequest(this.endpoint+'/'+this.idMod,body,{
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
              this.optionCal('view',this.viewModu,this.idMod);
          }else{
              this.handler.handlerError(data);
              this.loading.emit(false);
          }
      },
      error=>{
        console.log(error);
          this.handler.showError(error);
          this.loading.emit(false);
      }
  );
}else {
  this.handler.showError('Complete la informacion necesaria');
  this.loading.emit(false);
}
}
onSubmiMod() {
  
  if (this.formCreate.valid) {
      this.loading.emit(true);
      
          let body = {
              listas: this.formCreate.value,
          }
          
        this.WebApiService.getRequest(this.endpoint, {
          action: 'getInsertValResult',
          lista:""+JSON.stringify({body}),
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
                      // this.optionCal('view',this.data.codigo,this.idMod);
  
                  } else {
                      this.handler.handlerError(data);
                      this.loading.emit(false);
                  }
              },
              error => {
                  this.handler.showError();
                  this.loading.emit(false);
              }
          )
  } else {
      this.handler.showError('Complete la informacion necesaria');
      this.loading.emit(false);
  }
        
  }
  onSubmitUpdateMod() {

    if( (this.formCreate.valid )){

        let body = {
            listas:   this.formCreate.value,
        }

        this.loading.emit(true);

        this.WebApiService.getRequest(this.endpoint, {
            action: 'getUpdateValResult',
            id: this.data.codigo,
            lista: ""+JSON.stringify({body}),
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
    }else{
        this.handler.showError('Complete la información necesaria');
    }
}
//Acording
step = 0;

setStep(index: number) {
 this.step = index;   
}

nextStep() {
 this.step++;
}

prevStep() {
 this.step--;
}
labelMatriz(event){
this.tipMatriz = event;
}

SendDataonChange(event: any) {
console.log(event.target.value);
} 

openSnackBar(e){
  this.formModule.value.sign = e; 

  console.log(this.formModule.value.sign)
}

 getPermissionRole(perm){

  if(perm.length != 0 ){
          
    const cant = this.formModule.value['perm'];
    const perm = cant.join('|');
    this.formModule.value['perm'] = perm;
  }else{
      const form = this.formModule.value['perm']
      const permission = form.join('');
      this.formModule.value['perm'] = permission;
     }
 }
 applyFilter(search) {
  this.dataSource.filter = search.trim().toLowerCase();
}
}
