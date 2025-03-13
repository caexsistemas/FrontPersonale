import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from "@angular/material/dialog";
import {
  Component,
  Inject,
  Output,
  EventEmitter,
  ViewChildren,
  QueryList,
} from "@angular/core";
// import { WebApiService } from "../../services/web-api.service";
import {
  FormGroup,
  FormControl,
  Validators,
  ValidatorFn,
  ValidationErrors,
  RequiredValidator,
} from "@angular/forms";
import { DateAdapter } from "@angular/material/core";
import { HandlerAppService } from "../../../services/handler-app.service";
import { environment } from "../../../../environments/environment";
import { global } from "../../../services/global";
import { MatTableDataSource } from "@angular/material/table";
import { MatSort } from "@angular/material/sort";
import { empty, Observable, pipe } from "rxjs";
import { NovedadesnominaServices } from "../../../services/novedadesnomina.service";
import { DatePipe } from "@angular/common";
import { WebApiService } from "../../../services/web-api.service";
import * as moment from "moment";
import { element } from "protractor";
import { exit } from "process";
import { MatPaginator } from "@angular/material/paginator";
import { calculateDays } from "../../../services/holiday.service";
import { exists } from "fs";
import { ChangeDetectorRef } from '@angular/core';
import { Action } from "rxjs/internal/scheduler/Action";

// import { element } from "protractor";
interface Food {
  value: string;
  viewValue: string;
}

export interface PeriodicElement {
  currentm_user: string;
  date_move: string;
  type_move: string;
}

@Component({
  selector: 'app-advance',
  templateUrl: './advance.dialog.component.html',
  styleUrls: ['./advance.dialog.component.css']
})
export class AdvanceDialog  {

  endpoint: string = "/advance";
  maskDNI = global.maskDNI;
  title: string = null;
  view: string = null;
  permissions: any = null;
  formSelec: FormGroup;
  selection: any = [];
  idSel: number = null;
  rol: number;
  component = "/selfManagement/advance";
  dataSource: any = [];
  archivo = {
    nombre: null,
    nombreArchivo: null,
    base64textString: null,
  };
  //History
  historyMon: any = [];
  check: 0;
  displayedColumns: any = [];
  PersonaleInfo: any = [];
  document: any = [];
  people: any = [];
  position: any = [];
  contenTable:   any = [];
  fec_in: any = [];
  days: any = [];
  showAge: any = [];
  vac_type: string = '';
  num_days: number = 0;
  totalFin: any= [];
  fechaInicio: any =[];
  numVacationDays: any =[];
  laterFec:any = [];
  fe: any = [];
  totaLfecHol: any = [];
  sumTotalMen: any = [];
  fec_fin: any = [];
  jefe: any = [];
  exitsPersonal: any = [];
  name: any = [];
  stateVac: any = [];
  ini: any = [];
  checkAvd: boolean;
  checkSol: boolean;
  CheckTrue:boolean = true;
  arrDayHol: any = [];
  arrholiday: any = [];
  getHoliday:any = [];

  notWorkedDays: any = [];
  workedDays: any = [];
  proportionalVacationDays: any = [];

  // CALCULADORA DE DIAS 
  admissionDate: any = [];
  suspendedDays : number = 0;
  compensedDays : number = 0;
  takenDays : number = 0;
  enjoynedDays : number = 0;
  advancedDays : number = 0;
  availableCompensableDays : number = 0;
  availableEnjoyableDays : number = 0;
  availableAnticipateDays : number = 0;
  maximunDays: number = 0;

  employeeName: string = "";

  // document = new FormControl('', [Validators.required]);
  public clickedRows;
  public cuser: any = JSON.parse(localStorage.getItem("currentUser"));
  //OUTPUTS
  @Output() loading = new EventEmitter();
  @Output() reload = new EventEmitter();
  @ViewChildren(MatSort) sort = new QueryList<MatSort>();
  @ViewChildren(MatPaginator) paginator = new QueryList<MatPaginator>();

  constructor(
    public dialogRef: MatDialogRef<AdvanceDialog>,
    private WebApiService: WebApiService,
    private handler: HandlerAppService,
    private holiday: calculateDays,
    @Inject(MAT_DIALOG_DATA) public data,
    public dialog: MatDialog,
    private uploadFileService: NovedadesnominaServices,
    private cdr: ChangeDetectorRef
  ) {
    this.view = this.data.window;
    this.idSel = null;

    switch (this.view) {
      case "create":
        this.initForms();
        this.document = this.cuser.username;
        this.document;
        this.stateVac = this.data.state;
        this.ini = this.data.ini;
        (this.stateVac != '79/3')?this.laterFec = this.data.later: this.laterFec = this.ini;
        this.people = this.cuser.idPersonale;
        this.title = "Asignación de Vacaciones";

        this.loading.emit(true);
        this.WebApiService.getRequest(this.endpoint + "/" , {
          action: "getHoliday",
          idUser: this.cuser.iduser,
          token: this.cuser.token,
          modulo: this.component,
          role: this.cuser.role,
          idPersonale: this.cuser.idPersonale,
        }).subscribe(
          (data) => {
            this.permissions = this.handler.getPermissions(this.component);
            // console.log(this.permissions);
            // console.log(data.success);
          
              if (data.success == true) {
              this.loading.emit(false);
            } else {
              this.handler.handlerError(data);
              this.loading.emit(false);
            }
          },
          (error) => {
            this.handler.showError("Se produjo un error");
              this.loading.emit(false);
          }
        ); 
      break;
      case "update":
        this.idSel = this.data.codigo;
        this.initForms();
        this.title = "Actualizar Requisición";
      break;
      case "view":
        this.idSel = this.data.codigo;
        this.title = "Información General"
        this.loading.emit(true);
        this.WebApiService.getRequest(this.endpoint + "/"+ this.idSel, {
          token: this.cuser.token,
          idUser: this.cuser.iduser,
          modulo: this.component
        }).subscribe(
          (data) => {
            if (data.success == true) {
              this.selection = data.data["getSelectData"][0];
              (this.selection.day_adv)? this.checkAvd = true: this.checkAvd = false;
              (this.selection.tot_day)? this.checkSol = true: this.checkSol = false;
              this.generateTable(data.data["getDatHistory"]);
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
  
  initForms() {
    this.getDataInit();
    this.formSelec = new FormGroup({
      document: new FormControl("",[Validators.required]),
      idPersonale: new FormControl(""),
      immediateBoss: new FormControl(""),
      fec_ini: new FormControl("",[Validators.required]),
      fec_fin: new FormControl(""),
      fec_rei: new FormControl(""),
      day_com: new FormControl(""),
      tot_day: new FormControl(""),
      day_vac: new FormControl(""),
      day_adv: new FormControl(""),
      state: new FormControl(""),
      type_sol:new FormControl(""),
      total:new FormControl(""),
      obc_apr: new FormControl("", [Validators.required]),
      // obc_apr:new FormControl(""),
      create_User: new FormControl(this.cuser.iduser),
    });
  }
  getDataInit() {
    this.loading.emit(true);
    this.WebApiService.getRequest(this.endpoint, {
      action: "getParamView",
      idSel: this.data.codigo,
      token: this.cuser.token,
      idUser: this.cuser.iduser,
      modulo: this.component
    }).subscribe(
      (data) => {
        if (data.success == true) {
          //DataInfo
          this.PersonaleInfo = data.data['getDataPersonale'];        
          this.position        = data.data["getPosition"];
          this.getHoliday = data.data["getHoliday"];

          if (this.view == "update") {
            this.getDataUpdate();
          }

          this.loading.emit(false);
        } else {
          this.handler.handlerError(data);
          this.loading.emit(false);
        }
      },
      (error) => {
        this.handler.showError("Se produjo un error");
        this.loading.emit(false);
      }
    );
  }

  onSubmit() {
    if (this.formSelec.valid) {

      if (!this.num_days || this.num_days === 0) {
        this.handler.showError("Error, el número de días no puede estar vacío o ser igual a 0");
        return false;
      }
      
      if(this.vac_type !== 'anticipo' && this.num_days > this.maximunDays){
        this.handler.showError("Error, no pueden ser más de " + this.maximunDays + " días a disfrutar");
        return false;
      }

      switch (this.vac_type) {
        case 'anticipo':
          this.formSelec.value.type_sol = '79/4';
          this.formSelec.value.day_adv = this.num_days;
          break;
          
          case 'asignacion':
          this.formSelec.value.day_vac = this.num_days;
          break;
          
          case 'compensacion':
          this.formSelec.value.day_com = this.num_days;
          break;
        default:
          console.log("Tipo de solicitud no existe: ", this.vac_type)  
      }

      this.formSelec.value.total = this.num_days;
      this.formSelec.value.tot_day = this.num_days;
      
      this.loading.emit(true);
      let body = {
        listas: this.formSelec.value,
      };

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
          }
        },
        (error) => {
          this.handler.showError();
          this.loading.emit(false);
        }
      );
    } else {
      this.handler.showError("Complete la informacion necesaria");
      this.loading.emit(false);
    }
  }

  getDataUpdate() {
    
    this.loading.emit(true);
    this.WebApiService.getRequest(this.endpoint, {
      action: "getParamUpdateSet",
      id: this.idSel,
      token: this.cuser.token,
      idUser: this.cuser.iduser,
      modulo: this.component
    }).subscribe(
      (data) => {
        this.formSelec.get("document").setValue(data.data["getSelecUpdat"][0].document);
        this.formSelec.get("idPersonale").setValue(data.data["getSelecUpdat"][0].idPersonale);
        this.formSelec.get("fec_ini").setValue(data.data["getSelecUpdat"][0].fec_ini);
        this.formSelec.get("fec_fin").setValue(data.data["getSelecUpdat"][0].fec_fin);
        this.formSelec.get("fec_rei").setValue(data.data["getSelecUpdat"][0].fec_rei);
        this.formSelec.get("day_vac").setValue(data.data["getSelecUpdat"][0].day_vac);
        this.formSelec.get("day_com").setValue(data.data["getSelecUpdat"][0].day_com);
        this.formSelec.get("type_sol").setValue(data.data["getSelecUpdat"][0].type_sol);
        this.formSelec.get("immediateBoss").setValue(data.data["getSelecUpdat"][0].immediateBoss);
      },
      (error) => {
        this.handler.showError();
        this.loading.emit(false);
      }
    );
  }
  onSubmitUpdate(){

    let body = {
      listas: this.formSelec.value,
     
        //  id: this.idSel
    }
    if (this.formSelec.valid) {
      this.loading.emit(true);
      this.WebApiService.putRequest(this.endpoint+'/'+this.idSel,body,{
        token: this.cuser.token,
        idUser: this.cuser.iduser,
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

  generateTable(data) {
    this.displayedColumns = ["currentm_user", "date_move", "type_move"];
    this.historyMon = data;
    this.clickedRows = new Set<PeriodicElement>();
  }
  closeDialog() {
    this.dialogRef.close();
  }
  ngOnInit() {}
  step = 0;

  setStep(index: number) {
    this.step = index;
  }
  nextStep() {
    this.step++;
  }
  prevStep() {
    this.step--;
  }

  onSelectionChange(event){

    let exitsPersonal = this.PersonaleInfo.find(element => element.document == event);
  
    if( exitsPersonal ){ 
        this.formSelec.get('idPersonale').setValue(exitsPersonal.idPersonale);
        this.formSelec.get('immediateBoss').setValue(exitsPersonal.jef_idPersonale);
        // this.jefe =this.formSelec.get('immediateBoss').setValue(exitsPersonal.jef_idPersonale);
        this.employeeName = exitsPersonal.name;
        // this.laterFec = exitsPersonal.fec_rei;

        this.laterFec = new Date();
        this.laterFec.setDate(this.laterFec.getDate() + 1); // Sumar un día
        this.laterFec = this.laterFec.toISOString().split('T')[0]; // Formatear a 'yyyy-MM-dd'

        this.formSelec.get('day_vac').setValue(0);
        this.formSelec.get('day_com').setValue(0);

        this.calculateDaysWorked(exitsPersonal.admissionDate, exitsPersonal.suspendedDays)
        this.calculateProportionalDays(this.workedDays, this.notWorkedDays)

        // Calcular todos los dias (restantes, compensados, a disfrutar) 
        this.admissionDate = exitsPersonal.admissionDate; 
        this.suspendedDays = parseInt(exitsPersonal.suspendedDays || "0", 10);
        this.compensedDays = parseInt(exitsPersonal.compensedDays || "0", 10); 
        this.takenDays = parseInt(exitsPersonal.takenDays || "0", 10);
        this.enjoynedDays = parseInt(exitsPersonal.enjoynedDays || "0", 10);
        this.advancedDays = parseInt(exitsPersonal.advancedDays || "0", 10); 
        
        // console.log(
        //   'admissionDate', this.admissionDate,
        //   'suspendedDays', this.suspendedDays,
        //   'compensedDays', this.compensedDays,
        //   'enjoynedDays', this.enjoynedDays,
        //   'takenDays', this.takenDays,
        // )

        this.calculateHolidayData(this.admissionDate, this.suspendedDays, this.compensedDays, this.enjoynedDays, this.takenDays)
        

        // this.formSelec.get('car_user').setValue(exitsPersonal.idArea);  
    }else{
        this.formSelec.get('idPersonale').setValue('');
        this.formSelec.get('immediateBoss').setValue('');  
        this.admissionDate = 0; 
        this.suspendedDays = 0;
        this.compensedDays = 0; 
        this.takenDays = 0;
        this.enjoynedDays = 0;
        this.advancedDays = 0; 
        (this.stateVac != '79/3')?this.laterFec = this.data.later: this.laterFec = this.ini;
    }
  }
  
  onFecIniChange(event){
    if (!event) {
      return;
    }
    this.fechaInicio = event;
    const fec = this.fechaInicio.split('-');
    const authFech = moment(this.fechaInicio);
    const validFecha = this.getHoliday.filter(month => month.month == authFech.month() +1 && month.day_hol == fec[2])

    if(authFech.day() == 0 || validFecha.length > 0){
      this.handler.shoWarning('Atención','Fecha Inicio Vacaciones NO Puede Ser DOMINGO O DIA FESTIVO');
      this.CheckTrue = true;
      this.formSelec.get('day_adv').setValue('');
    }else{
      this.CheckTrue = false;
      this.holiday.holiday(this.fechaInicio, this.numVacationDays );
    }

    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    const tomorrowFormatted = tomorrow.toISOString().split('T')[0]; 
    
    if (this.fechaInicio < tomorrowFormatted) {
      this.handler.shoWarning('Atención', 'La fecha de inicio NO puede ser anterior al siguiente día habil.');
      this.formSelec.get('fec_ini').setValue(tomorrowFormatted); 
      return; 
    }
}

  onNumDaysChange(event){  
    if(event){

      if(this.vac_type === ""){
        this.handler.showError("Error, Debes escoger un tipo de Vacaciones")
        return;
      }

      if(this.vac_type === "anticipo" && event > this.maximunDays){
        this.handler.showInfo("Hey!, " + this.employeeName + " tan solo tiene " + this.maximunDays + " días disponibles", "¡Advertencia!", " " );
        return;
      }

      if(this.vac_type !== "anticipo" && event>this.maximunDays){
        this.handler.showError("Error, No pueden ser más de " + this.maximunDays + " días para " + this.vac_type)
        return;
      }

      this.numVacationDays = event;
      this.holiday.holiday(this.fechaInicio,this.numVacationDays);
  
      this.totaLfecHol = this.holiday.holiday(this.fechaInicio,this.numVacationDays);
      this.fec_fin = this.totaLfecHol[0];
      this.sumTotalMen = this.totaLfecHol[1];
      this.formSelec.get('fec_fin').setValue(this.fec_fin);
      this.formSelec.get('fec_rei').setValue(this.sumTotalMen);      
    }  
  }

  getDocumentInvalid(){
    return this.formSelec.get('document').invalid && this.formSelec.get('document').touched;
  }
  getFechInvalid(){
    return this.formSelec.get('fec_ini').invalid && this.formSelec.get('fec_ini').touched;
  }
  getDayInvalid(){
    return this.formSelec.get('day_adv').invalid && this.formSelec.get('day_adv').touched;
  }
  getObcerInvalid(){
    return this.formSelec.get('obc_apr').invalid && this.formSelec.get('obc_apr').touched;

  }

  calculateDaysWorked(admissionDate, suspendedDays) {

    let fechaIngresoMoment: moment.Moment;

    if (admissionDate.includes('-')) {
      fechaIngresoMoment = moment(admissionDate, 'YYYY-MM-DD').startOf('day');
    } else {
      fechaIngresoMoment = moment(admissionDate, 'DD-MM-YYYY').startOf('day');
    }
  
    let fechaActualMoment = moment().startOf('day');
  
    if (!fechaIngresoMoment.isValid()) {
      console.error('Fecha de ingreso inválida:', admissionDate);
      this.workedDays = 0;
      this.notWorkedDays = 0;
      return;
    }
  
    // Calcular días laborados usando el esquema de 360 días/año
    let diasLaborados: number = 0;
    diasLaborados += (fechaActualMoment.year() - fechaIngresoMoment.year()) * 360; // Diferencia en años
    diasLaborados += (fechaActualMoment.month() - fechaIngresoMoment.month()) * 30; // Diferencia en meses
    diasLaborados += fechaActualMoment.date() - fechaIngresoMoment.date(); // Diferencia en días
  
    // Ajustar por día adicional
    this.workedDays = diasLaborados + 1;
  
    // Calcular días descontando domingos u otros valores
    this.notWorkedDays = suspendedDays ? this.workedDays - suspendedDays : 0;
  }  
  
  calculateProportionalDays(totalWorkedDays: number, suspendedDays: number): void {
    if (suspendedDays >= 1) {
      this.proportionalVacationDays = (totalWorkedDays - suspendedDays) / 360 * 15;
    } else {
      this.proportionalVacationDays = (totalWorkedDays / 360) * 15;
    }
  
  }
  


  onVacTypeChange(type: string): void {
    if (type) {
      this.formSelec.get('fec_fin').setValue(null);
      this.formSelec.get('fec_rei').setValue(null);
      this.formSelec.get('fec_ini')?.setValue(null);
      this.num_days = 0; 

      if(type === "asignacion"){
        this.maximunDays = this.availableEnjoyableDays;
      } else if(type === "compensacion"){
        this.maximunDays = this.availableCompensableDays;
      } else if(type === "anticipo"){
        this.maximunDays = Math.floor(this.availableAnticipateDays);
      }

      if (this.maximunDays === 0) {
        this.handler.showError("No tiene días disponibles para " + type);
      }
    }
  }

  calculateHolidayData(admissionDate, suspendedDays, compensedDays, enjoyedDays, takenDays) {
    const yearsInCompany = moment().diff(moment(admissionDate).add(suspendedDays, 'days'), 'years');

    // Días totales generados
    const totalDays = yearsInCompany * 15;

    // Días restantes después de los ya tomados
    const remainingDays = totalDays - takenDays;

    // Periodos completamente liquidados
    const settledPeriods = Math.floor(takenDays / 15);
    const currentPeriodDaysTaken = takenDays % 15;

    // Máximo de días compensables por año
    const maxCompensablePerYear = 9;
    const totalMaxCompensable = yearsInCompany * maxCompensablePerYear;

    // Calcular cuántos días ya han sido compensados en periodos pasados
    const maxCompensableSoFar = Math.min(settledPeriods * maxCompensablePerYear, compensedDays);

    // Calcular cuántos días quedan para compensar en el periodo actual
    let availableCompensableDays = 0;
    let canCompense = true;

    if (compensedDays >= totalMaxCompensable) {
        // Si ya compensó el máximo permitido, no puede compensar más
        availableCompensableDays = 0;
        canCompense = false;
    } else {
        // Calcular los días compensables en el periodo actual
        let alreadyCompensatedInCurrentPeriod = compensedDays - maxCompensableSoFar;
        let remainingCompensableInCurrentPeriod = maxCompensablePerYear - alreadyCompensatedInCurrentPeriod;

        // Asegurar que no se puedan compensar más de lo permitido en el periodo actual
        availableCompensableDays = Math.max(0, remainingCompensableInCurrentPeriod);
        availableCompensableDays = Math.min(availableCompensableDays, remainingDays);

        // Si ya compensó los 9 días del periodo actual, bloquear compensación
        if (alreadyCompensatedInCurrentPeriod >= maxCompensablePerYear) {
            availableCompensableDays = 0;
            canCompense = false;
        }
    }

    // Días disfrutables
    const availableEnjoyableDays = Math.max(0, remainingDays);
    const canEnjoy = availableEnjoyableDays > 0;

    this.availableCompensableDays = availableCompensableDays;
    this.availableEnjoyableDays = availableEnjoyableDays;

    // console.log({
    //     yearsInCompany,
    //     takenDays,
    //     totalDays,
    //     remainingDays,
    //     totalMaxCompensable,
    //     availableCompensableDays,
    //     availableEnjoyableDays,
    //     canCompense,
    //     canEnjoy,
    // });
  }

}



  



