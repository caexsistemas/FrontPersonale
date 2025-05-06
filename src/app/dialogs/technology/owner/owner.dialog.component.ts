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


@Component({
  selector: 'app-owner',
  templateUrl: './owner.dialog.component.html',
  styleUrls: ['./owner.dialog.component.css']
})
export class OwnerDialog {
  form:FormGroup;

  endpoint:      string = '/technology';
  component = "/inventory/technology";
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
  idTec: number = null;
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
  // historyMon: any = [];
  // loading: boolean = false;

 // Informacion Usuario
 public cuser: any = JSON.parse(localStorage.getItem('currentUser'));
 //OUTPUTS
 @Output() loading = new EventEmitter();
 @Output() reload = new EventEmitter();
 @ViewChildren(MatSort) sort = new QueryList<MatSort>();
 @ViewChildren(MatPaginator) paginator = new QueryList<MatPaginator>();


 constructor(public dialogRef: MatDialogRef<OwnerDialog>,
    private fb:FormBuilder,
    private WebApiService: WebApiService,
   private handler: HandlerAppService,
   @Inject(MAT_DIALOG_DATA) public data,
   public dialog: MatDialog) { 
     
      this.view = this.data.window;
      this.idTec = null;

     switch (this.view) {
      
       case 'user':        
        this.idTec = this.data.codigo;
          this.initForms();
          this.title = `Equipos Asignados ${this.data.id}`; 
       break;
       case "create":
        this.initForms();
        this.title = "Nu";
      break;
       case "update":
        this.idTec = this.data.codigo;
        this.initForms();
        this.title = "Actualizar Formación";
        break;
       case 'view':
        this.idTec = this.data.codigo;
        this.WebApiService.getRequest(this.endpoint + "/"+ this.idTec, {
          token: this.cuser.token,
          idUser: this.cuser.iduser,
          modulo: this.component
        }).subscribe(
          (data) => {
            if (data.success == true) {
              this.selection = data.data["getDataUpda"];
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
  
   ngOnInit(): void {
    this.getDataInit();
    
  }
   initForms(){
    
    this.sendRequest();
   }
   onSubmitUpdate(){

    let body = {
      listas: this.formSelec.value,
      // segui: this.formInsp.value,
      // seguimiento: this.formInsp.value
        //  id: this.idTec
    }
    if (this.formSelec.valid) {
      this.loading.emit(true);
      this.WebApiService.putRequest(this.endpoint+'/'+this.idTec,body,{
        token: this.cuser.token,
        idTec: this.cuser.iduser,
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

 sendRequest() {

    //  this.loading.emit(true);
    //  this.loading = true;
     this.WebApiService.getRequest(this.endpoint, {
      action: "getParamUpdateUser",
      // idTec: this.data.codigo,
      idUser: this.cuser.iduser,
      token: this.cuser.token,
      modulo: this.component,
      id: this.idTec,
      cc:this.data.codigo
    
     }).subscribe(
       (data) => {

         this.permissions = this.handler.getPermissions(this.component);
         if (data.success == true) {
          
           this.generateTable(data.data["getDataUpda"]);
           this.contenTable = data.data["getDataUpda"];
          //  this.loading.emit(false);
          //  this.loading = false;
         } else {
           this.handler.handlerError(data);
           this.loading.emit(false);
          //  this.loading = false;
         }
       },
       (error) => {
         console.log(error);
         this.handler.showError("Se produjo un error");
         this.loading.emit(false);
        //  this.loading = false;
       }
     );
 }

  //Tabla Contenido
  generateTable(data) {
    this.displayedColumns = [
      "fec_ent",
      "listSub",
      "sub_pla_act_fij",
      "sub_serial",
      
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
    // this.loading = true
    this.WebApiService.getRequest(this.endpoint, {
        action: 'getParamView',
        idTec: this.data.codigo,
        idUser: this.cuser.iduser,
        token: this.cuser.token,
        modulo: this.component
        // tipMat: this.tipogesti 
    })
    .subscribe(
       
        data => {
            if (data.success == true) {
              
              this.typeDocument    = data.data["getDocument"];
              this.depart          = data.data["getDepart"];
              this.citytBirth      = data.data["getCity"];
              this.position        = data.data["getPosition"];
              this.eps             = data.data["getEps"];
              this.pension         = data.data["getPension"];
              this.area            = data.data["getArea"];
              this.typeMatriz      = data.data["getMatriz"];
              this.typeGender      = data.data["getGender"];
              this.loading.emit(false);
              // this.loading = false
            } else {
                this.handler.handlerError(data);
                this.loading.emit(false);
                // this.loading = false;
              }
          },
          error => {
              this.handler.showError('Se produjo un error');
              // this.loading = false;
              this.loading.emit(false);
          }
      );
    }

    // openc() {
    //   if (this.contaClick == 0) {
    //     this.sendRequest();
    //   }
    //   this.contaClick = this.contaClick + 1;
    // }
   

  option(action,codigo=null,name, id){
    var dialogRef;
    switch(action){
      // case 'state':
      //   // this.loading = true;
      //   dialogRef = this.dialog.open("",{
      //     data: {
      //       window: 'state',
      //       codigo,
      //       id:id
      //       // tipoMat: tipoMat
      //     }
      //   });
      //   dialogRef.disableClose = true;
      //   // LOADING
      //   dialogRef.componentInstance.loading.subscribe(val=>{
      //     this.loading = val;
      //   });
      //   // RELOAD
      //   dialogRef.componentInstance.reload.subscribe(val=>{
      //     this.sendRequest();
      //   });
      // break;
      // case 'update':
      //   // this.loading = true;
      //   // this.loading.emit(true);
      //   dialogRef = this.dialog.open(InspectionDialog,{
      //     data: {
      //       window: 'update',
      //       codigo,
      //       name,
      //       id:id,
      //       num:this.num,
            
      //       // tipoMat: tipoMat

      //     }
      //   });
      //   dialogRef.disableClose = true;
      //   // LOADING
      //   dialogRef.componentInstance.loading.subscribe(val=>{
      //     this.loading = val;
      //   });
      //   // RELOAD
      //   dialogRef.componentInstance.reload.subscribe(val=>{
      //     this.sendRequest();
      //   });
      //   break;

      // case 'view':
      //     this.loading
      //   // this.loading.emit(true);
      //   dialogRef = this.dialog.open(InspectionDialog,{
      //     data: {
      //       window: 'view',
      //       codigo,
      //       name,
      //       id:id,
      //       num:this.num
      //     }
      //   });
      //   dialogRef.disableClose = true;
      //   // LOADING
      //   dialogRef.componentInstance.loading.subscribe(val=>{
      //     this.loading = val;
      //   });
      //   dialogRef.afterClosed().subscribe(result => {
         
      //   });
      // break;
      }
    }
    
openc(){
  if(this.contaClick == 0){
    this.sendRequest();
  }    
  this.contaClick = this.contaClick + 1;
}

// generateTable(data) {
//   this.displayedColumns = ["currentm_user", "date_move", "type_move"];
//   this.historyMon = data;
//   this.clickedRows = new Set<PeriodicElement>();
// }

ageCalculator(){
  
  if(this.age){
    const convertAge = new Date(this.age);
    const timeDiff = Math.abs(Date.now() - convertAge.getTime());
    this.showAge = Math.floor((timeDiff / (1000 * 3600 * 24))/365);
   
  }
  

}


}


