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
  admissionDate: any = [];
  daysTo: any = [];
  daysRe: any = [];
  daysFor: any = [];
  total: number = 0;
  totalSol: number = 0;
  line: any = [];
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

  suspendedDays : number = 0;
  compensedDays : number = 0;
  takenDays : number = 0;
  enjoynedDays : number = 0;
  advancedDays : number = 0;
  availableCompensableDays : number = 0;
  availableEnjoyableDays : number = 0;

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
      idPersonale: this.cuser.idPersonale,
      // idPersonale: 2034,
    }).subscribe(
      (data) => {
          this.permissions = this.handler.getPermissions(this.component);        

          if (data.success == true) {

              this.contenTable = data.data["getSelectData"]["vac"];
              
              const summary = data.data["getSelectData"]["summary"]?.[0] || {};

              this.admissionDate = data.data["getSelectData"]["vac"][0]["admissionDate"];
              this.suspendedDays = parseInt(summary["suspendedDays"] || "0", 10);
              this.compensedDays = parseInt(summary["compensedDays"] || "0", 10);
              this.takenDays = parseInt(summary["takenDays"] || "0", 10);
              this.enjoynedDays = parseInt(summary["enjoynedDays"] || "0", 10);
              this.advancedDays = parseInt(summary["advancedDays"] || "0", 10);
              
              
              // console.log({
              //   __admissionDate: this.admissionDate,
              //   __suspendedDays:this.suspendedDays,
              //   __compensedDays:this.compensedDays,
              //   __enjoynedDays:this.enjoynedDays,
              //   __advancedDays:this.advancedDays,
              // })

              this.role = this.cuser.role;
              this.generateTable(this.contenTable);
              this.content = this.contenTable;
              if(this.content){
                  this.content.forEach(element => {
                    element.Dias_suspension = element.Dias_suspension || 0;
                  });
              }

              this.daysFor = data.data["getSelectData"]["history"];

          for (let i = 0; i < this.daysFor.length; i++) {

            if(this.daysFor){
              this.total = this.total + this.daysFor[i].state;

            }
          }

          this.calculateHolidayData(this.admissionDate, this.suspendedDays, this.compensedDays, this.enjoynedDays, this.takenDays)

          this.name = this.cuser.idPersonale;
          this.username = this.cuser.username;
          this.loading = false;
        } else {
          this.handler.handlerError(data);
          this.loading = false;
        }
      },
    (mistake) => {
        let msjErr = "Tu sesión se ha cerrado o el Módulo presenta alguna Novedad";
        //let msjErr = mistake.error.message;
        this.handler.showError(msjErr);
        this.loading = false;
    });
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
  
  daysComp:number;
  calculateDaysAll(fecha){
    
      var convertAge = new Date(fecha);
      
      var timeDiff = Math.abs(Date.now() - convertAge.getTime());
          // this.showAge = Math.floor(timeDiff / (1000 * 3600 * 24) / 365); // años de vacaciones (1000 * 60 * 60 * 24)
          this.showAge = Math.floor(timeDiff / (1000 * 3600 * 24) / 365); // años de vacaciones (1000 * 60 * 60 * 24)
      this.days = (this.showAge * 15); // dias de vacaciones
      // console.log('dias vaca =>',this.showAge);
  }

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
        // console.log(data);
        
            
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
            this.handler.showError("Se produjo un error al enviar correo");
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
        this.loading = true;
        dialogRef = this.dialog.open(HolidayDialog, {
          data: {
            window: "create",
            codigo: this.username,
            id: this.name,
            later:this.laterFec,
            state: this.stateVac,
            ini:this.ini,
            days:this.days, //Dias totales que he tenido derecho
            role:this.role,
            // daysRest:this.totAll, // Dias disponibles, se resta los dias totales con con los dias usados
            
            compensedDays :  this.compensedDays,
            enjoynedDays :  this.enjoynedDays,
            totalDays :  this.totalDays,
            takenDays :  this.takenDays,
            remainingDays :  this.totAll,
            availableCompensableDays: this.availableCompensableDays,
            availableEnjoyableDays: this.availableEnjoyableDays
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
        dialogRef = this.dialog.open(HolidayDialog, {
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
        // console.log(this.permissions);

        if (data.success == true) {
          this.generateTableVacation(data.data["getSelectData"]["history"]);
          this.contenTableVacation = data.data["getSelectData"]["history"];
          this.contenTableVacation.forEach(element => {

            if(element.fec_rei == null){
              element.fec_rei = 'No Aplica';
            }else{
              const newDate = moment(element.fec_rei);     
              element.fec_rei = newDate.format("MMM D, YYYY"); 
            }            
          });
          
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
      this.sendRequest();
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

  calculateHolidayData(admissionDate, suspendedDays, compensedDays, enjoyedDays, takenDays) {
    // Calcular años trabajados en la empresa, ajustando por días suspendidos
    const yearsInCompany = moment().diff(moment(admissionDate).add(suspendedDays, 'days'), 'years');
  
    // Calcular días totales acumulados (15 días por cada año trabajado)
    const totalDays = yearsInCompany * 15;
  
    // Calcular días restantes después de los ya tomados
    const remainingDays = totalDays - takenDays;
  
    // Calcular los periodos liquidados
    const settledPeriods = Math.floor(takenDays / 15); // Cantidad de periodos completamente disfrutados
    const currentPeriodDaysTaken = takenDays % 15; // Días tomados en el periodo actual
  
    // Días compensables por cada periodo
    const maxCompensablePerYear = 9;
    const totalMaxCompensable = yearsInCompany * maxCompensablePerYear;
  
    // Calcular días disponibles para compensar (solo de los periodos no liquidados)
    let availableCompensableDays = 0;
  
    // Iterar por cada periodo para calcular días compensables disponibles
    for (let i = 1; i <= yearsInCompany; i++) {
      if (i <= settledPeriods) {
        // Periodos completamente liquidados: No hay días compensables disponibles
        continue;
      } else if (i === settledPeriods + 1) {
        // Periodo actual: Considerar los días tomados en este periodo
        const remainingInCurrentPeriod = 15 - currentPeriodDaysTaken;
        availableCompensableDays += Math.min(maxCompensablePerYear, remainingInCurrentPeriod);
      } else {
        // Periodos futuros: Todos los días están disponibles para compensar
        availableCompensableDays += maxCompensablePerYear;
      }
    }
  
    // Días disfrutables: Son los días restantes (no afectados por compensaciones)
    const availableEnjoyableDays = Math.max(0, remainingDays);
  
    // Verificación de límites
    const canCompense = availableCompensableDays > 0 && availableCompensableDays <= remainingDays;
    const canEnjoy = availableEnjoyableDays > 0;
    
    this.availableCompensableDays = availableCompensableDays;
    this.availableEnjoyableDays = availableEnjoyableDays;
  
    // Imprimir resultados en consola
    // console.log({
    //   yearsInCompany,
    //   totalDays,
    //   remainingDays,
    //   totalMaxCompensable,
    //   availableCompensableDays,
    //   availableEnjoyableDays,
    //   canCompense,
    //   canEnjoy,
    // });
  }
  
}
