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
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatPaginator, MatPaginatorDefaultOptions } from "@angular/material/paginator";
import { emit } from "process";


@Component({
  selector: 'app-assignment',
  templateUrl: './assignment.dialog.component.html',
  styleUrls: ['./assignment.dialog.component.css']
})
export class AssignmentDialog {
  form:FormGroup;

  endpoint:      string = '/Assignment';
  component      = "/selection/assignment";
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
  formad: any = [];
  typeMatriz: any = [];
  typeGender: any = [];
  age;
  showAge;
  cargo: any = [];
  matriz: any = [];
  // historyMon: any = [];
  // loading: boolean = false;

 // Informacion Usuario
 public cuser: any = JSON.parse(localStorage.getItem('currentUser'));
 //OUTPUTS
 @Output() loading = new EventEmitter();
 @Output() reload = new EventEmitter();
 @ViewChildren(MatSort) sort = new QueryList<MatSort>();
 @ViewChildren(MatPaginator) paginator = new QueryList<MatPaginator>();


 constructor(public dialogRef: MatDialogRef<AssignmentDialog>,
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
           this.cargo = this.data.id;
           this.matriz = this.data.matriz;
           this.title = "Requisición"
           this.sendRequest();       
       break;
       case 'view':
        this.idSel = this.data.codigo;
        // this.loading.emit(true);
        // this.loading = true;
        this.WebApiService.getRequest(this.endpoint + "/"+ this.idSel, {
          token: this.cuser.token,
          idUser: this.cuser.iduser,
          modulo: this.component
        }).subscribe(
          (data) => {
            if (data.success == true) {
              this.selection = data.data["getSelectData"][0];
              this.generateTable(data.data["getDatHistory"]);
              // this.loading.emit(false);
              // this.loading = false;
            } else {
              this.handler.handlerError(data);
              this.closeDialog();
              this.loading.emit(false);
              // this.loading = false;
            }
          },
          (error) => {
            this.handler.showError("Se produjo un error");
            this.loading.emit(false);
            // this.loading = false;
          }
        );
        break;
     }
   }
 sendRequest() {
     this.loading.emit(true);
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
      // "actions"
      
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
openc(){
  if(this.contaClick == 0){
    this.sendRequest();
  }    
  this.contaClick = this.contaClick + 1;
}

}


