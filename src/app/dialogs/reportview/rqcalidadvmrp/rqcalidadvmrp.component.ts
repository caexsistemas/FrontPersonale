import {
  Component,
  OnInit,
  ViewChild,
  QueryList,
  ViewChildren,
  EventEmitter,
  Output,
  Inject
} from "@angular/core";
import { Tools } from "../../../Tools/tools.page";
import { WebApiService } from "../../../services/web-api.service";
import { ModalDirective } from "ngx-bootstrap/modal";
import { HandlerAppService } from "../../../services/handler-app.service";
import { global } from "../../../services/global";
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from "@angular/material/dialog";
import { MatTableDataSource } from "@angular/material/table";
import { MatSort } from "@angular/material/sort";
import { MatPaginator } from "@angular/material/paginator";
import { FormGroup, FormControl, Validators, ValidatorFn, ValidationErrors } from '@angular/forms';
import { RqcalidadDialog } from "../../../dialogs/rqcalidad/rqcalidad.dialog.component";
import { MatBottomSheet } from '@angular/material/bottom-sheet';


@Component({
  selector: 'app-rqcalidadvmrp',
  templateUrl: './rqcalidadvmrp.component.html',
  styleUrls: ['./rqcalidadvmrp.component.css']
})
export class RqcalidadvmrpComponent {

  endpoint:      string = '/rqcalidad';
  component      = "/callcenter/rqcalidad";
  maskDNI        = global.maskDNI;
  view:          string = null;
  title:         string = null;
  permissions:   any = null;
  contenTable:   any = [];
  dateStrinMoni: string = null;
  dataSource:    any = [];
  displayedColumns: any = [];
  listipomatriz:     any = []; 
  formProces:    FormGroup;
  contaClick:    number = 0;
  fechaInicio:   string = "";
  fechaFin:      string = "";
  tipogesti:     string = "";

 // Informacion Usuario
 public cuser: any = JSON.parse(localStorage.getItem('currentUser'));
 //OUTPUTS
 @Output() loading = new EventEmitter();
 @Output() reload = new EventEmitter();
 @ViewChildren(MatSort) sort = new QueryList<MatSort>();
 @ViewChildren(MatPaginator) paginator = new QueryList<MatPaginator>();


 constructor(public dialogRef: MatDialogRef<RqcalidadvmrpComponent>,
   private WebApiService: WebApiService,
   private handler: HandlerAppService,
   @Inject(MAT_DIALOG_DATA) public data,
   public dialog: MatDialog) { 
     
     this.view = this.data.window;

     switch (this.view) {
       case 'repor1vmrq':
           let date = new Date();
           this.dateStrinMoni = date.getFullYear()+'-'+String(date.getMonth() + 1).padStart(2, '0');
           this.initForms();
           this.fechaInicio = this.dateStrinMoni+'-01';
           this.fechaFin = this.dateStrinMoni+'-'+String(date.getDate()).padStart(2, '0');
           this.sendRequest(this.fechaInicio, this.fechaFin);
           this.formProces.get('fecini').setValue(this.fechaInicio);
           this.formProces.get('fecfin').setValue(this.fechaFin);
           this.title = "PONDERADO";           
       break;
     }
   }

   initForms(){

    this.getDataInit();
    this.formProces = new FormGroup({
      fecini: new FormControl(""), 
      fecfin: new FormControl(""), 
      tipmatriz: new FormControl("")
    });
   }

 sendRequest(fechini, fechafin, tipMatriz = "") {

     this.loading.emit(true);
     this.WebApiService.getRequest(this.endpoint, {
       action: "getDateViewInfoGroup",
       idUser: this.cuser.iduser,
       role: this.cuser.role,
       fecini: fechini,
       fecfin: fechafin,
       tipMat: tipMatriz,
       token: this.cuser.token,
       modulo: this.component
     }).subscribe(
       (data) => {
         this.permissions = this.handler.getPermissions(this.component);
         if (data.success == true) {
           this.generateTable(data.data["getContData"]);
           this.contenTable = data.data["getContData"];
           this.loading.emit(false);
         } else {
           this.handler.handlerError(data);
           this.loading.emit(false);
         }
       },
       (error) => {
         console.log(error);
         this.handler.showError("Se produjo un error");
         this.loading.emit(false);
       }
     );
 }

  //Tabla Contenido
  generateTable(data) {
    this.displayedColumns = [
      "login",
      "name",
      "namecordi",
      "name_creador",
      "campana",
      "statusagen",
      "final_note",
      //"afec_cero",
      "ventas",
      "no_ventas",
      "total_gesti",
      //"critico"
    ];
    this.dataSource = new MatTableDataSource(data);
    this.dataSource.sort = this.sort.toArray()[0];
    this.dataSource.paginator = this.paginator.toArray()[0];
    let search;
    if (document.contains(document.querySelector("search-input-table"))) {
      search = document.querySelector(".search-input-table");
      search.value = "";
    }
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  closeDialog() {
    this.dialogRef.close();
  }

  getDataInit(){

    this.loading.emit(true);
    this.WebApiService.getRequest(this.endpoint, {
        action: 'getdataReporVmRp',
        tipMat: this.tipogesti,
        token: this.cuser.token,
        idUser: this.cuser.iduser,
        modulo: this.component 
    })
    .subscribe(
       
        data => {
            if (data.success == true) {
              
              this.listipomatriz = data.data['tipmatriz']; //40
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

    openc() {
      if (this.contaClick == 0) {
        this.sendRequest(this.fechaInicio, this.fechaFin, this.tipogesti);
      }
      this.contaClick = this.contaClick + 1;
    }

    consFechMati(){

      this.loading.emit(true);
      if( this.formProces.value.fecini != "" && this.formProces.value.fecfin != "" 
          && this.formProces.value.fecini < this.formProces.value.fecfin  ){

        this.fechaInicio = this.formProces.value.fecini;
        this.fechaFin    = this.formProces.value.fecfin;
        this.tipogesti   = this.formProces.value.tipmatriz;
        this.sendRequest(this.fechaInicio, this.fechaFin, this.tipogesti);
        this.loading.emit(false);

      }else{
        this.handler.showError('Por favor diligenciar todos los campos o validar el rango de consulta.');
        this.loading.emit(false);
      }

    }

    descExcelView(){

      if (this.formProces.valid) {
  
          if( this.formProces.value.fecini != "" && this.formProces.value.fecfin != "" 
          && this.formProces.value.fecini < this.formProces.value.fecfin ){
  
              let body = {
                  valest: this.formProces.value,      
              }
              this.loading.emit(true);
              this.WebApiService.getRequest(this.endpoint, {
                  action: 'downloadFilesViewPm',
                  report:  ""+JSON.stringify({body}),
                  token: this.cuser.token,
                  idUser: this.cuser.iduser,
                  modulo: this.component
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
