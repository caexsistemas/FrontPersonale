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
import { InspectionDialog } from "../training/inspection/inspection.dialog.component";
import { PreselectedDialog } from "./preselected/preselected.dialog.component";


@Component({
  selector: 'app-hiringDialog',
  templateUrl: './hiring.dialog.component.html',
  styleUrls: ['./hiring.dialog.component.css']
})
export class HiringDialog {
  form:FormGroup;

  endpoint:      string = '/hiring';
  component      = "/selection/hiring";
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
  // historyMon: any = [];
  loading: boolean = false;

 // Informacion Usuario
 public cuser: any = JSON.parse(localStorage.getItem('currentUser'));
 //OUTPUTS
//  @Output() loading = new EventEmitter();
 @Output() reload = new EventEmitter();
 @Output() open: EventEmitter<any> = new EventEmitter();
 @Output() close: EventEmitter<any> = new EventEmitter();
 @ViewChildren(MatSort) sort = new QueryList<MatSort>();
 @ViewChildren(MatPaginator) paginator = new QueryList<MatPaginator>();


 constructor(public dialogRef: MatDialogRef<HiringDialog>,
    private fb:FormBuilder,
    private WebApiService: WebApiService,
   private handler: HandlerAppService,
   @Inject(MAT_DIALOG_DATA) public data,
   public dialog: MatDialog) { 
     
      this.view = this.data.window;
      this.idSel = null;

     switch (this.view) {
      
       case 'trainer':
           this.idSel = this.data.codigo;
           console.log('++++',this.idSel)
           this.cargo = this.data.id;
           this.matriz = this.data.matriz;
           this.num = this.data.num
           this.sendRequest();

          this.title = "Requisicion"; 
          this.stateReq = this.data.state
       break;
       
      
     }
   }
  
   //---------------------------------------------------------------------------------------------
  
  
//------------------------------------------------------------------------------------------------------------
  
 sendRequest() {
     this.loading = true
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
           this.loading = false;
         } else {
           this.handler.handlerError(data);
           this.loading = false;
         }
       },
       (error) => {
         console.log(error);
         this.handler.showError("Se produjo un error");
         this.loading = false;
       }
     );
 }
  //Tabla Contenido
  generateTable(data) {
    this.displayedColumns = [
      "view",
      "fec_sel",
      "tip_doc",
      "document",
      "nom_com",
      "car_sol",
      "matrizarp",
      "sta_cont",
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
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  closeDialog() {
    this.dialogRef.close();
    this.reload.emit(true);
  }
  option(action,codigo=null,name, id){
    var dialogRef;
    switch(action){
      case 'update':
        this.open.emit(true);
        dialogRef = this.dialog.open(PreselectedDialog,{
          data: {
            window: 'update',
            codigo,
            name,
            id:id,
            num:this.num,
            state:this.stateReq
          }
        });
        dialogRef.disableClose = true;
        // LOADING
        dialogRef.componentInstance.loading.subscribe(val=>{
          this.loading = val;
        });
        // RELOAD
        dialogRef.componentInstance.reload.subscribe(val=>{
          this.sendRequest();
        });
        break;

      case 'view':
          this.loading = true;
        dialogRef = this.dialog.open(PreselectedDialog,{
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
    this.sendRequest();
  }    
  this.contaClick = this.contaClick + 1;
}
}


