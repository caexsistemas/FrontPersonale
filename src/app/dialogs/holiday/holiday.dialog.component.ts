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
import { ChangeDetectorRef } from '@angular/core';
import { DateAdapter } from "@angular/material/core";
import { HandlerAppService } from "../../services/handler-app.service";
import { environment } from "../../../environments/environment";
import { global } from "../../services/global";
import { MatTableDataSource } from "@angular/material/table";
import { MatSort } from "@angular/material/sort";
import { concat, Observable, pipe } from "rxjs";
import { NovedadesnominaServices } from "../../services/novedadesnomina.service";
import { DatePipe } from "@angular/common";
import { WebApiService } from "../../services/web-api.service";
import * as moment from "moment";
import { element } from "protractor";
import { exit } from "process";
import { MatPaginator } from "@angular/material/paginator";
import { calculateDays } from "../../services/holiday.service";
import { Console } from "console";
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
  selector: 'app-holiday',
  templateUrl: './holiday.dialog.component.html',
  styleUrls: ['./holiday.dialog.component.css']
})
export class HolidayDialog  {

  endpoint: string = "/holiday";
  maskDNI = global.maskDNI;
  title: string = null;
  view: string = null;
  permissions: any = null;
  formSelec: FormGroup;
  selection: any = [];
  idSel: number = null;
  rol: number;
  component = "/selfManagement/holiday";
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
  totalFin: any= [];
  fechaInicio: any =[];
  prue2: any =[];
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
  comp: any = [];
  checkAvd: boolean;
  checkSol: boolean;
  CheckTrue:boolean = true;
  arrDayHol: any = [];
  arrholiday: any = [];
  daysVac:any = [];
  vald: boolean;
  remainingDays: any = [];
  blockremainingDays: boolean;
  holidayAll:any = [];
  getHoliday: any = [];

  vac_type: string = '';
  num_days: number = 0;
  maximunDays: number = 0;
  // compensedDays : number = 0;
  // enjoyedDays : number = 0;
  // totalDays : number = 0;
  // totalUsedDays : number = 0;
  // remainingDays : number = 0;

  public clickedRows;
  public cuser: any = JSON.parse(localStorage.getItem("currentUser"));
  //OUTPUTS
  @Output() loading = new EventEmitter();
  @Output() reload = new EventEmitter();
  @ViewChildren(MatSort) sort = new QueryList<MatSort>();
  @ViewChildren(MatPaginator) paginator = new QueryList<MatPaginator>();

  constructor(
    public dialogRef: MatDialogRef<HolidayDialog>,
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
        // if(!( this.data.role == 5  )){
          this.vald = true;
          this.rol = this.data.role;
          this.initForms();
          // console.log(this.data);
          
        // }else{
        //   // Cuando el rol es Gestión Humana
        //   this.initFormsCaex();
        //   this.vald = false;
        //   this.rol = this.data.role;

        // }
        this.remainingDays = this.data.remainingDays;
        // console.log('dias restantes => ',this.remainingDays);
        
        this.daysVac = this.data.days;
        this.document = this.cuser.username;
        this.document;
        this.stateVac = this.data.state;
        this.ini = this.data.ini;
        
        this.laterFec = new Date();
        this.laterFec.setDate(this.laterFec.getDate()); 
        this.laterFec = this.laterFec.toISOString().split('T')[0]; 
        
        this.people = this.cuser.idPersonale;
        this.title = "Solicitud de Vacaciones";

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
      document: new FormControl(this.cuser.username),
      idPersonale: new FormControl(this.cuser.idPersonale),
      immediateBoss: new FormControl(""),
      fec_ini: new FormControl("",[Validators.required]),
      fec_fin: new FormControl(""),
      fec_rei: new FormControl(""),
      day_vac: new FormControl(""),
      day_adv: new FormControl(""),
      day_com: new FormControl(""),
      tot_day: new FormControl(""),
      state: new FormControl(""),
      create_User: new FormControl(this.cuser.iduser),
    });
   
  }
  initFormsCaex() {
    this.getDataInit();
    this.formSelec = new FormGroup({
      document: new FormControl(""),
      idPersonale: new FormControl(""),
      immediateBoss: new FormControl(""),
      fec_ini: new FormControl("",[Validators.required]),
      fec_fin: new FormControl(""),
      fec_rei: new FormControl(""),
      day_vac: new FormControl("",[Validators.required]),
      day_adv: new FormControl(""),
      day_com: new FormControl("", [Validators.required]),
      tot_day: new FormControl(""),
      state: new FormControl(""),
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
          this.exitsPersonal = this.PersonaleInfo.find(element => element.idPersonale == this.cuser.idPersonale);
          this.name = this.exitsPersonal.jef_idPersonale;
          this.formSelec.get('day_adv').setValue(0);
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

    if (!this.num_days || this.num_days === 0) {
      this.handler.showError("Error, el número de días no puede estar vacío o ser igual a 0");
      return false;
    }

    if (this.formSelec.valid) {

      this.formSelec.get('immediateBoss').setValue(this.name);

      if(this.vac_type == 'disfrutar'){
        this.formSelec.get('day_vac').setValue(this.num_days)
        this.formSelec.get('day_com').setValue(0)
      } else if(this.vac_type == 'compensar'){
        this.formSelec.get('day_com').setValue(this.num_days)
        this.formSelec.get('day_vac').setValue(0)
      }
      
      this.formSelec.get('tot_day').setValue(this.num_days)

      this.loading.emit(true);
      let body = {
        listas: this.formSelec.value,
      };

      if (!this.formSelec.get('day_vac').value || this.formSelec.get('day_vac').value === 0) {
        const today = new Date().toISOString().split('T')[0];
        this.formSelec.value.fec_ini = today
        // console.log('Se va a compensar:', body.listas);
      }

      // console.log("datos guardados: ",body.listas)

      this.handler.showLoadin("Guardando Registro", "Por favor espere...");
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
  ngOnInit() {
  }
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
    }        
  }
  
  onFecIniChange(event){
    
    this.fechaInicio = event;
    const fec = this.fechaInicio.split('-');
    const authFech = moment(this.fechaInicio);
    const validFecha = this.getHoliday.filter(month => month.month == authFech.month() +1 && month.day_hol == fec[2])

    if(authFech.day() == 0 || validFecha.length > 0){
        this.handler.shoWarning('Atención','Fecha Inicio Vacaciones No Puede Ser DOMINGO O DIA FESTIVO');
        this.CheckTrue = true;
        this.formSelec.get('day_vac').setValue('');
        return;
    }

    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    const tomorrowFormatted = tomorrow.toISOString().split('T')[0]; // Formatear a 'yyyy-MM-dd'
    
    if(this.vac_type){
      if (this.fechaInicio < tomorrowFormatted) {
        this.handler.shoWarning('Atención', 'La fecha de inicio NO puede ser anterior al siguiente día habil.');
        this.formSelec.get('fec_ini').setValue(tomorrowFormatted); 
        return; 
      }
      
      const minDays = 16; // Número mínimo de días calendario
      const minDate = new Date();
      minDate.setDate(today.getDate() + minDays);
      const minDateFormatted = minDate.toISOString().split('T')[0];
  
      if(this.vac_type =='disfrutar' && this.fechaInicio >= tomorrowFormatted && this.fechaInicio < minDateFormatted){
        this.handler.shoWarning('Atención', 'Su solicitud incumple los parámetros de tiempo definidos por la empresa (15 días previos). Direccione su solicitud a su jefe inmediato.');
        this.formSelec.get('fec_ini').setValue(minDateFormatted); 
        return;
      }
    }

    this.CheckTrue = false;
    this.holiday.holiday(this.fechaInicio, this.prue2);
  }

  onNumDaysChange(event){  
    this.prue2 = event;
    this.calculateTotalDays(this.prue2,this.comp);

    if(event){

      if (event > this.maximunDays) {
        const errorMessage = `No puedes solicitar más de ${this.maximunDays} días para ${this.vac_type === 'disfrutar' ? 'disfrutar' : 'compensar'}`;
        this.handler.showError(errorMessage);
        // this.formSelec.get('num_days')?.setValue(this.maximunDays); 
        this.num_days = this.maximunDays;
        this.cdr.detectChanges();
        return;
      }
      
      // this.calculateDays(this.fechaInicio,this.prue2);
      this.holiday.holiday(this.fechaInicio,this.prue2 );
    
        if(this.vac_type == 'disfrutar'){

          this.totaLfecHol = this.holiday.holiday(this.fechaInicio,this.prue2 );  
          this.fec_fin = this.totaLfecHol[0];        
          this.sumTotalMen = this.totaLfecHol[1];        
          this.formSelec.get('fec_fin').setValue(this.fec_fin);
          this.formSelec.get('fec_rei').setValue(this.sumTotalMen);  
          this.loading.emit(false);
        }
            
        // this.formSelec.get('immediateBoss').setValue(this.jefe);
    }  else {
      // Limpia los campos si no hay un valor válido
      this.formSelec.get('fec_fin').setValue(null);
      this.formSelec.get('fec_rei').setValue(null);
    }
  }

  daysCom(event){
    if(event >= 0){
      this.comp = event;
      this.calculateTotalDays(this.prue2,this.comp);
    }
  }

  primerPeri:boolean = false;
  calculateTotalDays(d1,d2){
    // console.log(" dias solocitados =>",d1, "dias compensar =>",d2)
    this.totalFin = (d1+d2);
    
      
    if(this.totalFin > 15  && this.daysVac <= 15  ){
      // this.handler.showError("No puedes solicitar mas de 15 dias!");
      this.reload.emit();
      this.loading.emit(false);
    } else if(this.totalFin > this.remainingDays){
      this.blockremainingDays = true;
      this.primerPeri = true;
      this.handler.showError("No puedes solicitar mas dias !");
      this.reload.emit();
      this.loading.emit(false);
    }else{
      this.blockremainingDays = false;
      this.primerPeri = false;
    }
     // this.totalFii(this.totalFin,this.prue2);
}
getDocumentInvalid(){
  return this.formSelec.get('document').invalid && this.formSelec.get('document').touched;
 }
 getFechInvalid(){
  return this.formSelec.get('fec_ini').invalid && this.formSelec.get('fec_ini').touched;
 }
 getDayInvalid(){
  return this.formSelec.get('day_vac').invalid && this.formSelec.get('day_vac').touched;
 }
 getCompInvalid(){
  return this.formSelec.get('day_com').invalid && this.formSelec.get('day_com').touched;

 }
 
  onVacTypeChange(type: string): void {
    if (type) {
      // Limpia la fecha de inicio y número de días
      this.formSelec.get('fec_fin').setValue(null);
      this.formSelec.get('fec_rei').setValue(null);
      this.formSelec.get('fec_ini')?.setValue(null);
      this.num_days = 0;

      // Ajusta la fecha mínima según el tipo seleccionado
      this.laterFec = new Date();
      if (type === 'disfrutar') {
        this.laterFec.setDate(this.laterFec.getDate() + 16); // Sumar 16 días
        this.maximunDays = this.data.availableEnjoyableDays;
      } else if (type === 'compensar') {
        this.laterFec.setDate(this.laterFec.getDate() + 1); // Sumar 1 día
        this.maximunDays = this.data.availableCompensableDays;
      }

      // Convertir a formato ISO y establecer como límite mínimo
      this.laterFec = this.laterFec.toISOString().split('T')[0];
    }
  } 
  
}
