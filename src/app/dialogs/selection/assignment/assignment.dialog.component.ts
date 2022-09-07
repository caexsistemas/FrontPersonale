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
// import { MatPaginator } from "@angular/material/paginator";
import { FormGroup, FormControl, Validators, ValidatorFn, ValidationErrors, FormBuilder, FormArray } from '@angular/forms';
import { RqcalidadDialog } from "../../../dialogs/rqcalidad/rqcalidad.dialog.component";
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatPaginator, MatPaginatorDefaultOptions } from "@angular/material/paginator";
// import { EntryDialog } from "./entry/entry.dialog.component";
import { emit } from "process";
import { EntryDialog } from "../vacant/entry/entry.dialog.component";


@Component({
  selector: 'app-assignment',
  templateUrl: './assignment.dialog.component.html',
  styleUrls: ['./assignment.dialog.component.css']
})
export class AssignmentDialog {
  form:FormGroup;

  endpoint:      string = '/vacant';
  // component      = "/selection/vacant";
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
     
    //  option(action,codigo=null, id){
      this.view = this.data.window;
      this.idSel = null;

     switch (this.view) {
      
       case 'trainer':
           this.idSel = this.data.codigo;
           this.cargo = this.data.id;
           this.matriz = this.data.matriz;
           
          this.initForms();
          this.title = "Requisicion";
               
       break;
       case "create":
        this.initForms();
        this.title = "Nu";
        console.log('++',this.data)
      break;
       case "update":
        this.idSel = this.data.codigo;
        this.initForms();
        this.title = "Actualizar Datos";
        break;
       case 'view':
        this.idSel = this.data.codigo;
        // this.loading.emit(true);
        // this.loading = true;
        this.WebApiService.getRequest(this.endpoint + "/"+ this.idSel, {}).subscribe(
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
  
   //---------------------------------------------------------------------------------------------
   ngOnInit(): void {
    this.creatForm();
  }

  creatForm(){

    this.form = this.fb.group(
      {
        
        contacts: this.fb.array([this.contactFrom()])
      }
    );

  }
  
  get contacts(){
    return this.form.get("contacts") as FormArray;
    }

  contactFrom(){
    return this.fb.group(
      {
        fec_sel:  new FormControl(""),
        tip_doc: new FormControl(""),
        document: new FormControl(""),
        nom_com: new FormControl(""),
        birthDate: new FormControl(""),
        ciu_nac: new FormControl(""),
        dep_nac: new FormControl(""),
        are_tra: new FormControl(""),
        // car_sol: new FormControl(""),
        car_sol: new FormControl(this.cargo),
        eps: new FormControl(""),
        pension: new FormControl(""),
        obs_vac: new FormControl(""),
        create_User: new FormControl(this.cuser.iduser),
        idsel: new FormControl(this.idSel),
        matrizarp: new FormControl(this.matriz),
        idGender: new FormControl(""),
        ages: new FormControl(""),
    }
    );
  }
  addNewContacts(){
    this.contacts.push(this.contactFrom());
  }

  removeContact(i:Required<number>){
    this.contacts.removeAt(i);
  }

  onSubmit() {
    // this.form.value['contacts'][0].ages = this.showAge ;
console.log('==>',this.form.value['ages'] = this.showAge)
console.log( 'EDAD'+  this.showAge ); 




    
    if (this.form.valid) {
      // this.loading.emit(true);
      // this.loading = true;
      // if( this.view == 'repor1vmrq' && this.form.value['ages'] ){
      //   // this.formSelec.get('aprobacion1').setValue('30/3'); 
      //   this.form.value['ages'] =  this.showAge; 
      // }
      let body = {
        listas: this.form.value['contacts'],
      };
      console.log('body=>',body);
         
      this.WebApiService.postRequest(this.endpoint, body, {}).subscribe(
        (data) => {
          if (data.success) {
            this.handler.showSuccess(data.message);
            this.reload.emit();
            this.closeDialog();
          } else {
            this.handler.handlerError(data);
            // this.loading.emit(false);
            // this.loading = false;
          }
        },
        (error) => {
          this.handler.showError();
          // this.loading.emit(false);
          // this.loading = false;
        }
      
      );
    } else {
      this.handler.showError("Complete la informacion necesaria");
      // this.loading.emit(false);
      // this.loading = false;
    // }
  }
  }
  // closeDialog() {
  //   // this.dialogRef.close();
  // }
  
//------------------------------------------------------------------------------------------------------------
   initForms(){

    this.getDataInit();
    this.sendRequest();
    // this.formProces = new FormGroup({
    //   fecini: new FormControl(""), 
    //   fecfin: new FormControl(""), 
    //   tipmatriz: new FormControl("")
    // });
   }

 sendRequest() {

    //  this.loading.emit(true);
    //  this.loading = true;
     this.WebApiService.getRequest(this.endpoint, {
       action: "getVacant",
       idUser: this.cuser.iduser,
       idsel: this.idSel,
      //  role: this.cuser.role,
      //  fecini: fechini,
      //  fecfin: fechafin,
      //  tipMat: tipMatriz
     }).subscribe(
       (data) => {

         this.permissions = this.handler.getPermissions(this.component);
         if (data.success == true) {
          // this.numVac = data.data["getId"][0];
          console.log('numVac=>',this.numVac);
           this.generateTable(data.data["getSelectData"]);
           this.contenTable = data.data["getSelectData"];
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
      "view",
      "fec_sel",
      "tip_doc",
      "document",
      "nom_com",
      "car_sol",
      "matrizarp",
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
  }

  getDataInit(){

    this.loading.emit(true);
    // this.loading = true
    this.WebApiService.getRequest(this.endpoint, {
        action: 'getInformation',
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

              // this.numVac = data.data["getId"];
              // console.log('numVac=>',this.numVac);

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
    onSelectBirth(idState:any):void{
        
      // this.loading.emit(true);

      setTimeout(()=>{       
          this.citieswork = this.citytBirth.filter(item => item.idState == idState);
          //console.log(this.citieswork);
      },3);   

      // this.loading.emit(false);
  }

  option(action,codigo=null, id){
    var dialogRef;
    switch(action){
      case 'create':
        // this.loading = true;
        dialogRef = this.dialog.open(EntryDialog,{
          data: {
            window: 'create',
            codigo,
            id:id
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
          this.sendRequest();
        });
      break;
      case 'update':
        // this.loading = true;
        // this.loading.emit(true);
        dialogRef = this.dialog.open(EntryDialog,{
          data: {
            window: 'update',
            codigo,
            id:id
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
          this.sendRequest();
        });
        break;

      // case 'view':
      //     this.loading
      //   // this.loading.emit(true);
      //   dialogRef = this.dialog.open(EntryDialog,{
      //     data: {
      //       window: 'view',
      //       codigo
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
// applyFilter(search) {
//   this.dataSource.filter = search.trim().toLowerCase();
// }
// onTriggerSheetClick(){
//   this.matBottomSheet.open(ReportsTechnologyComponent)
// }
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
  
//   if( this.view == 'repor1vmrq' && this.form.value['contacts'] ){
//     // this.formSelec.get('aprobacion1').setValue('30/3'); 
//     this.form.value['age'] =  this.showAge; 
// console.log('==>',this.form.value['age']);
// }
}
// public fecha;
// let date: Date = new Date();
// let dia=date.getDay();
// let mes=getMonth();
// let anio=date.getFullYear();

// console.log(dia+'/'+mes+'/'anio);

}


