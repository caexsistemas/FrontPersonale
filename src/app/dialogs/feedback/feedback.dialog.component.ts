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
import { NovedadesnominaServices } from '../../services/novedadesnomina.service';

export interface PeriodicElement {
  currentm_user: string,
  date_move:string,
  type_move: string
}

@Component({
  selector: 'app-feedback',
  templateUrl: './feedback.dialog.component.html',
  styleUrls: ['./feedback.dialog.component.css']
})


export class FeedbackDialog 
{
  endpoint:      string = "/feedback";
    maskDNI        = global.maskDNI;
    view:          string = null;
    idNomi:        number = null;
    title:         string = null;
    formNomi:      FormGroup;
    permissions: any = null;
    component = "/feedback/feedback";
    dataSource: any=[];
    PersonaleInfo: any = [];
    feed: any= [];
    idfeed:any=[];
    ListArea:      any = [];
    selectedFile:  File = null;
    formFeed: FormGroup;
    archivo = {
        nombre: null,
        nombreArchivo: null,
        base64textString: null
    }
    ListTipoGes:    any = [];
    dataNovNi: any = []; 
    feedInfo: any=[];
    //History
    historyMon: any = [];
    displayedColumns:any  = [];
    public clickedRows;
    public cuser: any = JSON.parse(localStorage.getItem('currentUser'));

    //OUTPUTS
    @Output() loading = new EventEmitter();
    @Output() reload = new EventEmitter();
    @ViewChildren(MatSort) sort = new QueryList<MatSort>();

  constructor(
    public dialogRef: MatDialogRef<FeedbackDialog>,
    private WebApiService: WebApiService,
    private handler: HandlerAppService,
    @Inject(MAT_DIALOG_DATA) public data,
    public dialog: MatDialog,
    private uploadFileService: NovedadesnominaServices
  ) { 
    this.view = this.data.window;
    this.idNomi = null;

    switch (this.view) {
        case 'create':
            this.initForms();
            this.title = "Crear Retroalimentacion";
        break;
        case 'update':
          this.initForms();
          this.title = "Actualizar";
          break;
          case "view":
            this.idfeed = this.data.codigo;
            this.loading.emit(true);
            this.WebApiService.getRequest(
              this.endpoint + "/" + this.idfeed,
              {}
            ).subscribe(
              (data) => {
                if (data.success == true) {
                  console.log('+++++');
                  console.log(data);
                  this.feed = data.data[0];
                  //  console.log('111111  ');
                  //console.log(this.role);
                  this.loading.emit(false);
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
        }
      
  
 
  }
closeDialog() {
  this.dialogRef.close();
}
  initForms() {
    this.getDataInit();
    this.formNomi = new FormGroup({
        fecha: new FormControl(""),
        idPersonale: new FormControl(""),
        document: new FormControl(""),
        name: new FormControl(""),
        car_trabajo: new FormControl(""),
        supervisor: new FormControl(""),
        directboss_nc: new FormControl(""),
        directboss_nc_jf: new FormControl(""),
        car_user: new FormControl(""),
        create_User: new FormControl(this.cuser.iduser)

        
    });
}
getDataInit(){

  this.loading.emit(false);
  this.WebApiService.getRequest(this.endpoint, {
      action: "getParamView",
  })
  .subscribe(
     
      data => {
          if (data.success == true) {
            console.log(data);
              //DataInfo
              this.PersonaleInfo = data.data['getDataPersonale'];
               this.ListArea      = data.data['getDatArea'];
              // this.ListTipoGes   = data.data['getDatTipoGes'];

              if (this.view == 'update') {
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
  if (this.formNomi.valid) {
      this.loading.emit(true);
      let body = {
          listas: this.formNomi.value,
      }
      this.WebApiService.postRequest(this.endpoint, body, {})
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
          )
  } else {
      this.handler.showError('Complete la informacion necesaria');
      this.loading.emit(false);
  }
}
onSelectionChange(event){
        
       
  let exitsPersonal = this.PersonaleInfo.find(element => element.document == event);
  if( exitsPersonal ){
      //this.formNomi.get('document').setValue(exitsPersonal.document);
     // this.formNomi.get('idPersonale').setValue(exitsPersonal.idPersonale);
      //this.formNomi.get('idPersonale').setValue(exitsPersonal.document);
      this.formNomi.get('name').setValue(exitsPersonal.name);
      this.formNomi.get('car_trabajo').setValue(exitsPersonal.idArea);
     // this.formNomi.get('directboss_nc').setValue(exitsPersonal.document_jf);   

     // this.formNomi.get('directboss_nc_jf').setValue(exitsPersonal.document_jf);     
      this.formNomi.get('supervisor').setValue(exitsPersonal.name);     
      //this.formNomi.get('directboss_nc_jf').setValue(exitsPersonal.idPersonale);     
      //this.formNomi.get('supervisor').setValue(exitsPersonal.document_jf);     
     
  }        
}
onSelectionJFChange(event){
        
       
  let exitsPersonal = this.PersonaleInfo.find(element => element.document == event);
  if( exitsPersonal ){
      this.formNomi.get('directboss_nc').setValue(exitsPersonal.idPersonale);
  }        
}
// getDataInit() {
//   this.loading.emit(false);
//   this.WebApiService.getRequest(this.endpoint, {
//     action: "getParamsUpdateSub",
//   }).subscribe(
//           (data) => {
//             if (data.success == true) {
//               //DataInfo
//               this.feedInfo = data.data["getDataRole"];
//               //console.log(this.RolInfo);

//               if (this.view == 'update') {
//                   this.getDataUpdate();
//               }
//               this.loading.emit(false);
//             } else {
//               this.handler.handlerError(data);
//               this.loading.emit(false);
//             }
//           },
//           error => {
//             this.handler.showError("Se produjo un error");
//             this.loading.emit(false);
//           }
//         );
// }
// onSubmi(){

//   if (this.formNomi.valid) {
//       this.loading.emit(true);
//       let body = {
//           novedades: this.formNomi.value, 
//           archivoRes: this.archivo       
//       }
//       this.WebApiService.postRequest(this.endpoint, body, {})
//           .subscribe(
//               data => {
//                   if (data.success) {
//                      this.handler.showSuccess(data.message);
//                       this.reload.emit();
//                       this.closeDialog();
//                   } else {
//                       this.handler.handlerError(data);
//                       this.loading.emit(false);
//                   }
//               },
//               error => {
//                   this.handler.showError();
//                   this.loading.emit(false);
//               }
//           )
//   } else {
//       this.handler.showError('Complete la informacion necesaria');
//       this.loading.emit(false);
//   }
// }
getDataUpdate(){}




  // ngOnInit() {
  // }

}
