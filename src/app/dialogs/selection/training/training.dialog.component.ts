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
import { FormGroup, FormControl, Validators, ValidatorFn, ValidationErrors, FormBuilder, FormArray } from '@angular/forms';
import { RqcalidadDialog } from "../../../dialogs/rqcalidad/rqcalidad.dialog.component";
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatPaginator, MatPaginatorDefaultOptions } from "@angular/material/paginator";
import { emit } from "process";
import { EntryDialog } from "../vacant/entry/entry.dialog.component";
import { InspectionDialog } from "./inspection/inspection.dialog.component";

@Component({
  selector: 'app-training',
  templateUrl: './training.dialog.component.html',
  styleUrls: ['./training.dialog.component.css']
})
export class TrainingDialog {
  form:FormGroup;

  endpoint:      string = '/training';
  component      = "/selection/training";
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
  formSelec: FormGroup;
  contaClick:    number = 0;
  fechaInicio:   string = "";
  fechaFin:      string = "";
  tipogesti:     string = "";
  idSel: number = null;
  car_sol: any = [];
  typeDocument: any = [];
  depart: any = [];
  citytBirth: any = [];
  area: any = [];
  position: any = [];
  eps: any = [];
  pension: any = [];
  citieswork: any =[];
  cities: any = [];
  numVac: any =[];
  selection: any = [];
  typeMatriz: any = [];
  typeGender: any = [];
  age;
  showAge;
  cargo: any = [];
  matriz: any = [];
  num:number = null;
  stateReq: any = [];
  formad: any =[];
  auxth: any = [];
  historyMon: any = [];

  // historyMon: any = [];
  // loading: boolean = false;

 // Informacion Usuario
 public clickedRows;
 public cuser: any = JSON.parse(localStorage.getItem('currentUser'));
 //OUTPUTS
 @Output() loading = new EventEmitter();
 @Output() reload = new EventEmitter();
 @ViewChildren(MatSort) sort = new QueryList<MatSort>();
 @ViewChildren(MatPaginator) paginator = new QueryList<MatPaginator>();


 constructor(public dialogRef: MatDialogRef<TrainingDialog>,
    private fb:FormBuilder,
    private WebApiService: WebApiService,
    private handler: HandlerAppService,
    @Inject(MAT_DIALOG_DATA) public data,
    public dialog: MatDialog) { 
      
    //  option(action,codigo=null, id){
      this.view = this.data.window;
      this.idSel = null;

     switch (this.view) {
      
       case 'trainer':
           this.idSel = this.data.codigo;
           this.cargo = this.data.id;
           this.matriz = this.data.matriz;
           this.num = this.data.num;
           this.auxth = this.data.auxTH

            this.loading.emit(true);
            this.WebApiService.getRequest(this.endpoint + "/"+ this.idSel, {
             action: "getFormador",
              token: this.cuser.token,
              idUser: this.cuser.iduser,
              modulo: this.component
            }).subscribe(
              (data) => {
                if (data.success == true) {
                  this.formad = data.data["getSelecFormador"][0];
                  this.sendRequest();
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
 sendRequest() {

     this.loading.emit(true);
    //  this.loading = true;
     this.WebApiService.getRequest(this.endpoint, {
       action: "getVacant",
       idUser: this.cuser.iduser,
       idsel: this.idSel,
       token: this.cuser.token,
       modulo: this.component
     }).subscribe(
       (data) => {

         this.permissions = this.handler.getPermissions(this.component);
         if (data.success == true) {
          
           this.generateTable(data.data["getSelectData"]);
           this.contenTable = data.data["getSelectData"];
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
  // Tabla Contenido
  generateTable(data) {
    this.displayedColumns = [
      "view",
      "fec_sel",
      "tip_doc",
      "document",
      "nom_com",
      "car_sol",
      "matrizarp",
      "con_fin",
      "actions"
      
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
    console.log(event)
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
  closeDialog() {
    this.dialogRef.close();
  }

  option(action,codigo=null,name, id,isnp){
    var dialogRef;
    switch(action){
      case 'update':
        // this.loading = true;
        // this.loading.emit(true);
        dialogRef = this.dialog.open(InspectionDialog,{
          data: {
            window: 'update',
            codigo,
            name,
            id:id,
            num:this.num,
            state:this.stateReq,
            isnp
            
            // tipoMat: tipoMat

          }
        });
        dialogRef.disableClose = true;
        // LOADING
        dialogRef.componentInstance.loading.subscribe(val=>{
          this.loading = val;
        });
        // RELOAD
        dialogRef.componentInstance.reload.subscribe(val=>{
          // this.sendRequest();
        });
        break;

      case 'view':
          this.loading
        // this.loading.emit(true);
        dialogRef = this.dialog.open(InspectionDialog,{
          data: {
            window: 'view',
            codigo,
            name,
            id:id,
            num:this.num
          }
        });
        dialogRef.disableClose = true;
        // LOADING
        dialogRef.componentInstance.loading.subscribe(val=>{
          this.loading = val;
        });
        dialogRef.afterClosed().subscribe(result => {
         
        });
      break;
      }
    }
    
openc(){
  if(this.contaClick == 0){
    // this.sendRequest();
  }    
  this.contaClick = this.contaClick + 1;
}
}




