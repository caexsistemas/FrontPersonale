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
  totalFin: any= [];
  prue: any =[];
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
  checkAvd: boolean;
  checkSol: boolean;
  CheckTrue:boolean = true;
  arrDayHol: any = [];
  arrholiday: any = [];
  getHoliday:any = [];
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
    private uploadFileService: NovedadesnominaServices
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
        // (this.stateVac != '79/3')?this.laterFec = this.data.later: this.laterFec = this.ini;
        this.people = this.cuser.idPersonale;
        this.title = "Anticipo de Vacaciones";

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
      day_adv: new FormControl("",[Validators.required]),
      state: new FormControl(""),
      type_sol:new FormControl(""),
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
      this.formSelec.value.type_sol = '	79/4';
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
        this.laterFec = exitsPersonal.fec_rei;
        this.formSelec.get('day_vac').setValue(0);
        this.formSelec.get('day_com').setValue(0);
        // this.formSelec.get('car_user').setValue(exitsPersonal.idArea);  
    }        
  }
  
  calculate1(event){
    
    this.prue = event;
    const fec = this.prue.split('-');
    const authFech = moment(this.prue);
    const validFecha = this.getHoliday.filter(month => month.month == authFech.month() +1 && month.day_hol == fec[2])

    if(authFech.day() == 0 || validFecha.length > 0){
        this.handler.shoWarning('Atención','Fecha Inicio Vacaciones No Puede Ser DOMINGO O DIA FESTIVO');
        this.CheckTrue = true;
        this.formSelec.get('day_adv').setValue('');

    }else{
      this.CheckTrue = false;
      this.holiday.holiday(this.prue,this.prue2 );

    }
}
   
  calculate(event){  
    if(event){
        this.prue2 = event;
        // this.calculateDays(this.prue,this.prue2);
        this.holiday.holiday(this.prue,this.prue2);
    
        this.totaLfecHol = this.holiday.holiday(this.prue,this.prue2);
        this.fec_fin = this.totaLfecHol[0];
        this.sumTotalMen = this.totaLfecHol[1];
        this.formSelec.get('fec_fin').setValue(this.fec_fin);
        this.formSelec.get('fec_rei').setValue(this.sumTotalMen);      
        // this.formSelec.get('immediateBoss').setValue(this.jefe);
    }  
  }
  
  totalDays(event){
    this.totalFin = event;
     // this.totalFii(this.totalFin,this.prue2);
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
}

  



