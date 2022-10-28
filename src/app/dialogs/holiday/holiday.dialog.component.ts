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
import { HandlerAppService } from "../../services/handler-app.service";
import { environment } from "../../../environments/environment";
import { global } from "../../services/global";
import { MatTableDataSource } from "@angular/material/table";
import { MatSort } from "@angular/material/sort";
import { Observable } from "rxjs";
import { NovedadesnominaServices } from "../../services/novedadesnomina.service";
import { DatePipe } from "@angular/common";
import { WebApiService } from "../../services/web-api.service";
import * as moment from "moment";
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
  selector: 'app-holiday.dialog',
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

  public clickedRows;
  public cuser: any = JSON.parse(localStorage.getItem("currentUser"));
  //OUTPUTS
  @Output() loading = new EventEmitter();
  @Output() reload = new EventEmitter();
  @ViewChildren(MatSort) sort = new QueryList<MatSort>();

  constructor(
    public dialogRef: MatDialogRef<HolidayDialog>,
    private WebApiService: WebApiService,
    private handler: HandlerAppService,
    @Inject(MAT_DIALOG_DATA) public data,
    public dialog: MatDialog,
    private uploadFileService: NovedadesnominaServices
  ) {
    this.view = this.data.window;
    this.idSel = null;

    switch (this.view) {
      case "create":
        this.initForms();
        console.log('==>',this.data)
        this.document = this.data.codigo
        this.people = this.data.id
        console.log('==cc>',this.document)
        console.log('==id>',this.people)

        this.title = "Solicitud de Vacaciones";
      break;
      case "update":
        this.idSel = this.data.codigo;
        // console.log('idsel=>',this.createUs);
        this.initForms();
        this.title = "Actualizar Requisición";
      break;
      case "view":
        this.idSel = this.data.codigo;
        this.loading.emit(true);
        this.WebApiService.getRequest(this.endpoint + "/"+ this.idSel, {
          token: this.cuser.token,
          idUser: this.cuser.iduser,
          modulo: this.component
        }).subscribe(
          (data) => {
            if (data.success == true) {
              this.selection = data.data["getSelectData"][0];
              console.log('==>',this.selection.car_sol);
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
      document: new FormControl(this.document),
      idPersonale: new FormControl(this.people),
      fec_ini: new FormControl(""),
      fec_fin: new FormControl(""),
      fec_rei: new FormControl(""),
      day_vac: new FormControl(""),
      create_User: new FormControl(this.cuser.iduser),
    });
   
  }
  getDataInit() {
    this.loading.emit(false);
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
      this.loading.emit(true);
      let body = {
        listas: this.formSelec.value,
        
      };
      console.log('req=>',body);
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
      // tipRole:this.tipRole
    }).subscribe(
      (data) => {
        this.formSelec.get("document").setValue(data.data["getSelecUpdat"][0].document);
        this.formSelec.get("idPersonale").setValue(data.data["getSelecUpdat"][0].idPersonale);
        this.formSelec.get("fec_ini").setValue(data.data["getSelecUpdat"][0].fec_ini);
        this.formSelec.get("fec_fin").setValue(data.data["getSelecUpdat"][0].fec_fin);
        this.formSelec.get("fec_rei").setValue(data.data["getSelecUpdat"][0].fec_rei);
        this.formSelec.get("day_vac").setValue(data.data["getSelecUpdat"][0].day_vac);
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
  // mat:boolean= false;
  mat =RequiredValidator;
  // onSelectMat(e){
  //   console.log('mat=>',e)
  //   this.mat = e

  // }
  // onSelectionPerson(event){
  //   let exitsPersonal = this.PersonaleInfo.find(element => element.document == event);
  
  //   if( exitsPersonal ){
  //       this.formTraining.get('idPersonale').setValue(exitsPersonal.idPersonale);       
  //   }        
  // }
  from: any = []
  to: any = []
  days;
  ini;
  calculateDays(e){
  const festivos = [ [1, 7, 8],[27, 28],[1],[6, 9],[1],[15],[9],[17, 18, 19],[10],[12, 23],[7,14],[8] ];
  // const festivos = Array.from( [1, 7, 8],[27, 28],[1],[6, 9],[1],[15],[9],[17, 18, 19],[10],[12, 23],[7,14],[8] );

    var ini = moment(this.formSelec.value.fec_ini);
    var fin = moment(this.formSelec.value.fec_fin);
    // let diff = fin.diff(ini,'days');
    const mes = ini.month();
    const dia = ini.isoWeekday();
    console.log("=>",mes)
    console.log("=>dia",dia)
    // if(mes){
      // festivos.forEach(element => console.log( element) );

      console.log(Array.from( festivos ));
      this.from = (Array.from( festivos ))
        console.log("=***>", this.from )

      // if( mes == Array.from(festivos).length ) {
              // console.log(Array.from( festivos ))
              festivos.forEach(element => {
                console.log("mes>",element)
                if(mes == this.from ){
                console.log("nuev>",element)

                }
              });
              // festivos.forEach(element);

      // }
    // }
    // if(ini.isAfter(fin)){

    //   console.log("=>",ini.month())

    // }
    // // console.log('=>',ini);
    //  this.days = 0;
    // if(ini.isoWeekday() != 6 && fin.isoWeekday() != 7){
    //   this.days++;
    // }
    // let diff = fin.diff(ini,'days');
      // console.log('=>', this.days);
     

// Devolvemos el resultado

        
      
    // var fechas = [
      
    //     ini , fin

      
    // ];
    // ini.isoWeekday()
    // if(ini.isAfter(fin)){
    //     if(fechas.weekdays("Sunday"))
    // }
    // // let diff = fin.isAfter(ini);
    // // let days = diff
    // // if(diff){

    // }
      // console.log('=>',diff);

      // function workingDays(dateFrom, dateTo) {
        //  this.from = moment(this.formSelec.value.fec_ini)
        //     this.to = moment(this.formSelec.value.fec_fin)
        //     this.days = 0;
          
        // // if (this.from.isAfter(this.to)) {
        //   // Si no es sabado ni domingo
        //   if (this.from.isoWeekday() !== 6 && this.from.isoWeekday() !== 7) {
        //     this.days++;
        //   }
        //   this.from.add(1, 'days');
        // // }
        // console.log('=>>',this.days);

        // return this.days;
      // }
      
      
      // var days = workingDays('05/03/2018', '13/03/2018');
      // console.log(days);
  }

  }
  


