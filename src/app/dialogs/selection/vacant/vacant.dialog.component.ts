import {MatDialogRef} from '@angular/material/dialog';
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
  // MatDialogRef,
  MAT_DIALOG_DATA,
} from "@angular/material/dialog";
import { MatTableDataSource } from "@angular/material/table";
import { MatSort } from "@angular/material/sort";
// import { MatPaginator } from "@angular/material/paginator";
import { FormGroup, FormControl, Validators, ValidatorFn, ValidationErrors, FormBuilder, FormArray } from '@angular/forms';
import { RqcalidadDialog } from "../../../dialogs/rqcalidad/rqcalidad.dialog.component";
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatPaginator, MatPaginatorDefaultOptions } from "@angular/material/paginator";
import { EntryDialog } from "./entry/entry.dialog.component";
import { emit, exit } from "process";
import { DOCUMENT } from '@angular/common';


@Component({
  selector: 'app-rqcalidadvmrp',
  templateUrl: './vacant.dialog.component.html',
  styleUrls: ['./vacant.dialog.component.css']
})
export class VacantDialog {
  form:FormGroup;
  formIns:FormGroup;

  endpoint:      string = '/vacant';
  component      = "/selection/vacant";
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
  ages: any = [];
  showAge;
  cargo: any = [];
  matriz: any = [];
  group: any = [];
  country: any = [];
  birth: boolean = false;
  extra: boolean = false;
  etario: any = [];
  // historyMon: any = [];
  loading1: boolean = false;

 // Informacion Usuario
 public cuser: any = JSON.parse(localStorage.getItem('currentUser'));
 //OUTPUTS
 mensaje: string;

  @Output() loading = new EventEmitter();
 @Output() reload = new EventEmitter();
 @ViewChildren(MatSort) sort = new QueryList<MatSort>();
 @ViewChildren(MatPaginator) paginator = new QueryList<MatPaginator>();


 constructor(public dialogRef: MatDialogRef<VacantDialog>,
 @Inject(DOCUMENT) private _document: Document,

    private fb:FormBuilder,
    private formInsp:FormBuilder,
    private WebApiService: WebApiService,
   private handler: HandlerAppService,
   @Inject(MAT_DIALOG_DATA) public data,
   public dialog: MatDialog) { 
     
    //  option(action,codigo=null, id){
      this.view = this.data.window;
      this.idSel = null;

     switch (this.view) {   
       case 'repor1vmrq':
           this.idSel = this.data.codigo;
           this.cargo = this.data.id;
           this.matriz = this.data.matriz;
           console.log('idvac=>',this.idSel);
           console.log('car_sol=>',this.data.id);
           console.log('mt=>',this.data.matriz);
            this.initForms();
            this.sendRequest();
            this.title = "Requisición";    
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
        this.WebApiService.getRequest(this.endpoint + "/"+ this.idSel, {
          token: this.cuser.token,
          idUser: this.cuser.iduser,
          modulo: this.component
        }).subscribe(
          (data) => {
            if (data.success == true) {
              this.selection = data.data["getSelectData"][0];
              this.generateTable(data.data["getDatHistory"]);
              this.loading.emit(false);
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
    // this.creatIsnp();
  }

  creatForm(){
    this.form = this.fb.group(
      {    
        contacts: this.fb.array([this.contactFrom()]),  
      }
    );
  }
  creatIsnp(){
    this.formIns = this.formInsp.group({
    });
  }
  
  get contacts(){
    this.ages.push();
    return this.form.get("contacts") as FormArray;
    }

  contactFrom(){
    return this.fb.group({
        fec_sel:  new FormControl(""),
        tip_doc: new FormControl(""),
        document: new FormControl(""),
        nom_com: new FormControl(""),
        birthDate: new FormControl(""),
        pais_nac:new FormControl(""),
        ciu_nac: new FormControl(""),
        dep_nac: new FormControl(""),
        are_tra: new FormControl(""),
        car_sol: new FormControl(this.cargo),
        eps: new FormControl(""),
        pension: new FormControl(""),
        obs_vac: new FormControl(""),
        create_User: new FormControl(this.cuser.iduser),
        idsel: new FormControl(this.idSel),
        matrizarp: new FormControl(this.matriz),
        idGender: new FormControl(""),
        ages: new FormControl(""),
        etario: new FormControl(""),
        pai_ext: new FormControl(""),
        ciu_ext: new FormControl(""),
        idins: new FormControl(""),
    });
  }
  
  addNewContacts(){
    // this.loading.emit(true);

    this.contacts.push(this.contactFrom()); 
  }

  removeContact(i:Required<number>){
    this.contacts.removeAt(i);
    // this.ages.removeAt(i);
  }

  onSubmit() {
    if (this.form.valid) {
      //  this.loading.emit(true)
      // this.loading = true;
      // this.refresh()
      let body = {
        listas: this.form.value['contacts'],
      };
      console.log('body=>',body);
         
      this.WebApiService.postRequest(this.endpoint, body, {
        token: this.cuser.token,
        idUser: this.cuser.iduser,
        modulo: this.component
      }).subscribe(
        (data) => {
          if (data.success) {
            this.handler.showSuccess(data.message);
            this.reload.emit();
            this.closeDialog();
          } else {
            this.handler.handlerError(data);
            this.loading.emit(false);
            // this.loading = false;
          }
        },
        (error) => {
          this.handler.showError();
          this.loading.emit(false);
          // this.loading = false;
        }
      
      );
    } else {
      this.handler.showError("Complete la informacion necesaria");
      // this.loading.emit(false);
      this.loading1 = false;
    // }
  }
  }
  

//------------------------------------------------------------------------------------------------------------
   initForms(){

    this.getDataInit();
    // this.sendRequest();
   }

 sendRequest() {

    //  this.loading.emit(true);
     this.loading1 = true;
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
          console.log('numVac=>',this.numVac);
           this.generateTable(data.data["getSelectData"]);
           this.contenTable = data.data["getSelectData"];
          //  this.loading.emit(false);
           this.loading1 = false;
         } else {
           this.handler.handlerError(data);
          //  this.loading.emit(false);
           this.loading1 = false;
         }
       },
       (error) => {
         console.log(error);
         this.handler.showError("Se produjo un error");
        //  this.loading.emit(false);
         this.loading1 = false;
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

 

  getDataInit(){

    this.loading.emit(false);
    // this.loading = true
    this.WebApiService.getRequest(this.endpoint, {
        action: 'getParamView',
      idUser: this.cuser.iduser,
      token: this.cuser.token,
      modulo: this.component
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
              this.group           = data.data['getGroupAge']
              this.country         = data.data['getCountry']
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
      case 'update':
        this.loading1 = true;
        // this.loading.emit(true);
        dialogRef = this.dialog.open(EntryDialog,{
          data: {
            window: 'update',
            codigo,
            id:id
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
        this.loading1 = true;
        // this.loading
        // this.loading.emit(true);
        dialogRef = this.dialog.open(EntryDialog,{
          data: {
            window: 'view',
            codigo
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
onSelectionCountry(idet){
  console.log('pais=>',idet)
      if(idet == '71/1'){
        this.birth = true;
       }else{
        this.birth = false
       }
    if(idet == '71/2'){
        this.extra = true;
     }else{
     this.extra = false;
     }
}

onSelectBirthDate(e, i:Required<number>){
  console.log('date=>',e,i);
        let convertAge = new Date(e);
        let timeDiff = Math.abs(Date.now() - convertAge.getTime());

        this.ages[i] = Math.floor((timeDiff / (1000 * 3600 * 24))/365);
       
    let rangos = this.ages.filter(number => number <= 29 );
    

}
// onSelectionGroup(e){
//   console.log('grupo=>',e)
//   console.log('grupo',this.contacts.value.ages)

// }
closeDialog() {
  this.dialogRef.close();
}




}



