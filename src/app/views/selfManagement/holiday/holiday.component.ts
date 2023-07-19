import {
  Component,
  OnInit,
  Input ,
  ViewChild,
  QueryList,
  ViewChildren,
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
import {
  MatPaginator,
  MatPaginatorDefaultOptions,
} from "@angular/material/paginator";
import { MatBottomSheet } from "@angular/material/bottom-sheet";
import { ReportsTechnologyComponent } from "../../../dialogs/reports/technology/reports-technology.component";
import { RequisitionDialog } from "../../../dialogs/selection/requisition/requisition.dialog.component";
import { HolidayDialog } from "../../../dialogs/holiday/holiday.dialog.component";
import { empty } from "rxjs";

import { DatePipe } from '@angular/common';
import * as moment from "moment";
import { exit } from "process";
import { ReportsVacationComponent } from "../../../dialogs/reports/vacation/reports-vacation.component";

@Component({
  selector: "app-holiday",
  templateUrl: "./holiday.component.html",
  styleUrls: ["./holiday.component.css"],
})
export class HolidayComponent implements OnInit {
  // getTotalCost() {
  //   return this.transactions.map(t => t.cost).reduce((acc, value) => acc + value, 0);
  // }
  // @Input() color!: string;
  // @Input() mensaje!: string;
  contenTable: any = [];
  contenTableVacation: any = [];
  loading: boolean = false;
  endpoint: string = "/holiday";
  permissions: any = null;
  displayedColumns: any = [];
  displayedColumnsVacation: any = [];
  displayedColumnsPrueba: any = [];
  dataSource: any = [];
  dataSourceVacation: any = [];
  contaClick: number = 0;
  name: any = [];
  username: any = [];
  // days: number = 0;
  daysExt: any = [];
  days: any = [];
  totalDays: any = [];
  fec_in: any = [];
  daysTo: any = [];
  daysRe: any = [];
  daysFor: any = [];
  total: number = 0;
  totalSol: number = 0;
  line: any = [];
  // showAge: number = 0;
  showAge: any = [];
  prue: any = [];
  laterFec: any = [];
  content: any = [];
  pipe = new DatePipe('en-US');
  role: any = [];
  stateVac: any = [];
  ini: any = [];
  daysPro: any = [];
  daysPropor:any = [];
  daysDom: any = [];
  totAll:any = [];
  public cuser: any = JSON.parse(localStorage.getItem("currentUser"));
  @ViewChildren(MatSort) sort = new QueryList<MatSort>();
  @ViewChildren(MatPaginator) paginator = new QueryList<MatPaginator>();
  @ViewChild("infoModal", { static: false }) public infoModal: ModalDirective;
  

  component = "/selfManagement/holiday";

  constructor(
    private _tools: Tools,
    private WebApiService: WebApiService,
    public handler: HandlerAppService,
    public dialog: MatDialog,
    private matBottomSheet: MatBottomSheet
  ) {}
  

  ngOnInit(): void {
    this.sendRequest();
    this.sendRequestVacation();

    this.permissions = this.handler.permissionsApp;
    
  }

  sendRequest() {
    this.loading = true;
    this.WebApiService.getRequest(this.endpoint, {
      action: "getSelection",
      idUser: this.cuser.iduser,
      token: this.cuser.token,
      modulo: this.component,
      role: this.cuser.role,
      // matrizarp: this.cuser.matrizarp,
      idPersonale: this.cuser.idPersonale,
    }).subscribe(
      (data) => {
        this.permissions = this.handler.getPermissions(this.component);
        // console.log(this.permissions);
        

          if (data.success == true) {
              this.contenTable = data.data["getSelectData"]["vac"];
              this.fec_in = data.data["getSelectData"]["vac"];
              this.role = this.cuser.role;
           
              this.generateTable(data.data["getSelectData"]["vac"]);
          
          
       
          this.content = data.data["getSelectData"]["vac"];
          if(this.content){
              this.content.forEach(element => {

                (element.Dias_suspension) ? element.Dias_suspension : element.Dias_suspension = 0;

                  // this.line = element.state;
                  // this.laterFec = element.fec_rei;
                  // this.stateVac = element.state;
                  // this.ini = element.fec_ini;
                  // if(element.state == '79/2'){
                  //   // this.totalSol= element.tot_day;
                  //   this.totalSol= this.content.map(item => item.tot_day).reduce((prev, curr) => prev + curr, 0);
                  // }
                  

              });
          }


          this.daysFor = data.data["getSelectData"][0];
          // for()
          // this.daysTo = data.data["getSelectData"][0][0].day_vac;

          for (let i = 0; i < this.daysFor.length; i++) {

            // this.total = this.total + this.daysFor[i].day_vac;
            if(this.daysFor){
              this.total = this.total + this.daysFor[i].state;

            }
          }
          this.name = this.cuser.idPersonale;
          this.username = this.cuser.username;
          this.loading = false;
        } else {
          this.handler.handlerError(data);
          this.loading = false;
        }
      },
      (error) => {
        this.handler.showError("Se produjo un error");
        this.loading = false;
      }
      
    );
  }
  generateTable(data) {

    this.displayedColumns = [
      // "view",
      "document",
      "idPersonale",
      "idPosition",
      "admissionDate",
      // "daysGained",
      "daysPeople",
      "day_sus",
      "total_adv",
      "total",
      "remainingDays",
      // "num_vac",s
      // "actions",
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
  // calculateDaysExa(fecha) {
   
  //   let date11 = new Date(fecha);
    
  //   let date22 = new Date();
  //   let diff = moment(date22).diff(moment(date11));
  //   let duration = moment.duration(diff);

  //   let months = duration.asMonths();
  //    this.daysPro = (months * 30).toFixed(2); 
  //   this.daysPropor = (this.days/360*15);
  //   this.days =  (this.daysPro/30);

   
  // }
  calculateDaysAll(fecha){
    
      var convertAge = new Date(fecha);
      
      var timeDiff = Math.abs(Date.now() - convertAge.getTime());
          // this.showAge = Math.floor(timeDiff / (1000 * 3600 * 24) / 365); // años de vacaciones (1000 * 60 * 60 * 24)
          this.showAge = Math.floor(timeDiff / (1000 * 3600 * 24) / 365); // años de vacaciones (1000 * 60 * 60 * 24)
      this.days = (this.showAge * 15); // dias de vacaciones
  }
//   calculateDays(fecha){
//      var convertAge = new Date(fecha);
//      var timeDiff = Math.abs(Date.now() - convertAge.getTime());
//     //  console.log(timeDiff)
//       // this.showAge = Math.floor(timeDiff / (1000 * 3600 * 24) / 365); // años de vacaciones (1000 * 60 * 60 * 24)
//       this.showAge = Math.floor(timeDiff / (1000 * 3600 * 24)); //* todos los dias laborados hasta la fecha
//   // console.log(this.showAge)
//   // console.log((this.showAge*15)/360)
//   this.days = ((this.showAge*15)/360); // dias proporcionales de vacaciones
// }
calculateDaysExa(fecha,dom) {
   
  let date11 = new Date(fecha);

  date11.setHours(0, 0, 0, 0);
  let dia11 = date11.getDate().toString().padStart(2, '0');
  let mes11 = (date11.getMonth() + 1).toString().padStart(2, '0');
  let anio11 = date11.getFullYear();
  let horas11 = date11.getHours().toString().padStart(2, '0');
  let minutos11 = date11.getMinutes().toString().padStart(2, '0');
  let segundos11 = date11.getSeconds().toString().padStart(2, '0');
  let fechaYHoraActualEnFormatoTexto11 = `${anio11}-${mes11}-${dia11} ${horas11}:${minutos11}:${segundos11}`;
  
  let date22 = new Date();
  // let fechaActual = new Date();
 
  // let fechaActual = new Date();
date22.setHours(24, 0, 0, 0);
let dia = date22.getDate().toString().padStart(2, '0');
let mes = (date22.getMonth() + 1).toString().padStart(2, '0');
let anio = date22.getFullYear();
let horas = date22.getHours().toString().padStart(2, '0');
let minutos = date22.getMinutes().toString().padStart(2, '0');
let segundos = date22.getSeconds().toString().padStart(2, '0');
let fechaYHoraActualEnFormatoTexto = `${anio}-${mes}-${dia} ${horas}:${minutos}:${segundos}`;

  
  let diff = moment(fechaYHoraActualEnFormatoTexto).diff(moment(fechaYHoraActualEnFormatoTexto11));
  let duration = moment.duration(diff);

  let months = duration.asMonths();
   this.daysPro = (months * 30 + 1.1 ).toFixed(2);   
   this.daysExt = ((this.daysPro)/30);
  //  (this.days % 15 == 0) ? this.days: this.days;
    // (this.days >= 15 ) ? this.days: this.days = 0;
   
  //  (dom) ? this.daysDom = (this.daysPro - dom) : (this.daysDom = 0);  
  if(dom){
    this.daysDom = (this.daysPro - dom);
    this.daysExt = ((this.daysDom)/30)
    
    
    // this.days2 = (this.daysDom/360*15);
  }else{
    this.daysDom = 0
  }
}
// dias restantes
totalAll(tt1,tt2){
// console.log('tt1=>',tt1,'tt2=>',tt2,'tt3=>',tt3);
this.totAll =(tt1-tt2);


}
// correo concurso
email() {

  this.WebApiService.getRequest(this.endpoint, {
    action: "email",
    token: this.cuser.token,
    idUser: this.cuser.iduser,
    modulo: this.component
  }).subscribe(
    (data) => {
      this.permissions = this.handler.getPermissions(this.component);
      if (data.success == true) {
        console.log(data);
        
            
            // const link = document.createElement("a");
            // link.href = data.data.url;
            // link.download = data.data.file;
            // link.target = "_blank";
            // link.click();
            // this.handler.showSuccess(data.data.file);
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
  // calculateDaysRest(totDays,adv,sus){
  //   // console.log('adv=>>',adv);
  //   // console.log('sus=>>',sus);
    
  //   if(totDays || sus){
  //     // console.log("=>", adv);
  //     this.totalDays = ( this.days - totDays - sus);
  //     // this.totalDays = ( this.days - adv);
  //   // }else if(state =='79/2'){
  //   //   this.totalDays = ( this.days - adv);

  //   }else{
  //     this.totalDays = 0 ; // Dias restanstes
  //   }
  //   // ( state == '79/2')? this.totalDays = ( this.days - totDays):  this.totalDays = 0 ;
  // }
  
  option(action, codigo = null, id, create_User) {
    var dialogRef;
    switch (action) {
      case "create":
        // this.laterFec = new Date().toISOString().split("T")[0];
        // if(this.days < 1 || this.totAll < 15){
        //  this.handler.showError("No tienes días disponibles");
        //  this.loading = false;
        // break;
        // }
          // if(this.line == '79/1'){
          //   this.handler.showError("Tienes una solicitud pendiente");
          //   this.loading = false;
          // break;
          // }

        this.loading = true;
        dialogRef = this.dialog.open(HolidayDialog, {
          data: {
            window: "create",
            codigo: this.username,
            id: this.name,
            later:this.laterFec,
            state: this.stateVac,
            ini:this.ini,
            days:this.days,
            role:this.role,
            daysRest:this.totAll
            // tipoMat: tipoMat
          },
        });
        dialogRef.disableClose = true;
        // LOADING
        dialogRef.componentInstance.loading.subscribe((val) => {
          this.loading = val;
        });
        // RELOAD
        dialogRef.componentInstance.reload.subscribe((val) => {
          this.sendRequest();
          this.sendRequestVacation();

        });
        break;
      case "update":
        this.loading = true;
        dialogRef = this.dialog.open(RequisitionDialog, {
          data: {
            window: "update",
            codigo,
            id: id,

            // tipoMat: tipoMat
          },
        });
        dialogRef.disableClose = true;
        // LOADING
        dialogRef.componentInstance.loading.subscribe((val) => {
          this.loading = val;
        });
        // RELOAD
        dialogRef.componentInstance.reload.subscribe((val) => {
          this.sendRequest();
          this.sendRequestVacation();

        });
        break;
    }
  }
  sendRequestVacation() {
    this.loading = true;
    this.WebApiService.getRequest(this.endpoint, {
      action: "getSelection",
      idUser: this.cuser.iduser,
      token: this.cuser.token,
      modulo: this.component,
      role: this.cuser.role,
      // matrizarp: this.cuser.matrizarp,
      idPersonale: this.cuser.idPersonale,
    }).subscribe(
      (data) => {
        this.permissions = this.handler.getPermissions(this.component);
        console.log(this.permissions);

        if (data.success == true) {
          this.generateTableVacation(data.data["getSelectData"][0]);
          this.contenTableVacation = data.data["getSelectData"][0];
          this.contenTableVacation.forEach(element => {

            if(element.fec_rei == null){
              element.fec_rei = 'No Aplica';
            }else{
              const newDate = moment(element.fec_rei);     
              element.fec_rei = newDate.format("MMM D, YYYY"); 
            }            
          });
          
          
          // (this.days === 0) ? alert("No tienes dias disponibles"): '';
          // if(this.days <= '0'){
          //   this.handler.showError("No tienes dias disponibles");
          // }
          // this.name = this.contenTableVacation;
          // this.username = this.cuser.username;
          this.loading = false;
        } else {
          this.handler.handlerError(data);
          this.loading = false;
        }
      },
      (error) => {
        this.handler.showError("Se produjo un error");
        this.loading = false;
      }
    );
  }
  generateTableVacation(data) {
    this.displayedColumnsVacation = [
      "view",
      "fec_rad",
      "document",
      "idPersonale",
      // "immediateBoss",
      "fec_ini",
      "day_vac",
      "day_com",
      "day_adv",
      "fec_rei",
      // "fec_rei2",
      "state",
      // "num_vac",
      // "actions",
    ];
    this.dataSourceVacation = new MatTableDataSource(data);
    this.dataSourceVacation.sort = this.sort.toArray()[1];
    this.dataSourceVacation.paginator = this.paginator.toArray()[1];
    let search;
    if (document.contains(document.querySelector("search-input-table"))) {
      search = document.querySelector(".search-input-table");
      search.value = "";
    }
  }

  openc() {
    if (this.contaClick == 0) {
      // this.sendRequest();
      this.sendRequestVacation();
    }
    this.contaClick = this.contaClick + 1;
  }
  applyFilter(search) {
    this.dataSource.filter = search.trim().toLowerCase();
    this.dataSourceVacation.filter = search.trim().toLowerCase();
  }
  optionVac(action, codigo = null, id, create_User) {
    var dialogRef;
    switch (action) {
      case "create":

        this.loading = true;

        dialogRef = this.dialog.open(HolidayDialog, {
          data: {
            window: "create",
            codigo: this.username,
            id: this.name,
            // tipoMat: tipoMat
          },
        });
        dialogRef.disableClose = true;
        // LOADING
        dialogRef.componentInstance.loading.subscribe((val) => {
          this.loading = val;
        });
        // RELOAD
        dialogRef.componentInstance.reload.subscribe((val) => {
          this.sendRequest();
          this.sendRequestVacation();

        });
        break;
      case "update":
        this.loading = true;
        dialogRef = this.dialog.open(RequisitionDialog, {
          data: {
            window: "update",
            codigo,
            id: id,

            // tipoMat: tipoMat
          },
        });
        dialogRef.disableClose = true;
        // LOADING
        dialogRef.componentInstance.loading.subscribe((val) => {
          this.loading = val;
        });
        // RELOAD
        dialogRef.componentInstance.reload.subscribe((val) => {
          this.sendRequest();
          this.sendRequestVacation();

        });
        break;

      case "view":
        this.loading = true;
        dialogRef = this.dialog.open(HolidayDialog, {
          data: {
            window: "view",
            codigo,
          },
        });
        dialogRef.disableClose = true;
        // LOADING
        dialogRef.componentInstance.loading.subscribe((val) => {
          this.loading = val;
        });
        dialogRef.afterClosed().subscribe((result) => {});
        break;
    }
  }
  onTriggerSheetClick() {
    // console.log(event.target['id']);    
    this.matBottomSheet.open(ReportsVacationComponent);
  }
}
