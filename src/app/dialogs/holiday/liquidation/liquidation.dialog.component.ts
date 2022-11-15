
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
import { Observable, pipe } from "rxjs";
import { NovedadesnominaServices } from "../../../services/novedadesnomina.service";
import { DatePipe } from "@angular/common";
import { WebApiService } from "../../../services/web-api.service";
import * as moment from "moment";
import { element } from "protractor";
import { exit } from "process";
import { MatPaginator } from "@angular/material/paginator";
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
  selector: 'app-liquidation.dialog',
  templateUrl: './liquidation.dialog.component.html',
  styleUrls: ['./liquidation.dialog.component.css']
})
export class LiquidationDialog  {

  endpoint: string = "/liquidation";
  maskDNI = global.maskDNI;
  title: string = null;
  view: string = null;
  permissions: any = null;
  formSelec: FormGroup;
  selection: any = [];
  idHol: number = null;
  rol: number;
  component = "/selfManagement/liquidation";
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
  stateLiq:any = [];

  public clickedRows;
  public cuser: any = JSON.parse(localStorage.getItem("currentUser"));
  //OUTPUTS
  @Output() loading = new EventEmitter();
  @Output() reload = new EventEmitter();
  @ViewChildren(MatSort) sort = new QueryList<MatSort>();
  @ViewChildren(MatPaginator) paginator = new QueryList<MatPaginator>();

  constructor(
    public dialogRef: MatDialogRef<LiquidationDialog>,
    private WebApiService: WebApiService,
    private handler: HandlerAppService,
    @Inject(MAT_DIALOG_DATA) public data,
    public dialog: MatDialog,
    private uploadFileService: NovedadesnominaServices
  ) {
    this.view = this.data.window;
    this.idHol = null;

    switch (this.view) {
      case "create":
        this.initForms();
        console.log('==>',this.data)
        this.document = this.data.codigo
        this.people = this.data.id
        console.log('==cc>',this.document)
        console.log('==id>',this.people)
        // this.sendRequest();


        this.title = "Solicitud de Vacaciones";
      break;
      case "update":
        this.idHol = this.data.codigo;
        console.log('idHol=>',this.idHol);
        this.initForms();
        this.title = "Liquidación Vacaciones";
      break;
      case "view":
        this.idHol = this.data.codigo;
        this.loading.emit(true);
        this.WebApiService.getRequest(this.endpoint + "/"+ this.idHol, {
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
  sendRequest() {
     this.loading.emit(true);
    this.WebApiService.getRequest(this.endpoint, {
      action: "getSelection",
      idUser: this.cuser.iduser,
      token: this.cuser.token,
      modulo: this.component,
      role: this.cuser.role,
      // matrizarp: this.cuser.matrizarp,
      idPersonale:this.cuser.idPersonale,

    }).subscribe(
      (data) => {
        this.permissions = this.handler.getPermissions(this.component);
        console.log(this.permissions);
        console.log(data.success);

        if (data.success == true) {

          this.contenTable = data.data["getSelectData"]['vac'];
          
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
  
  initForms() {
    this.getDataInit();
    this.formSelec = new FormGroup({
      document: new FormControl(this.document),
      idPersonale: new FormControl(this.people),
      fec_ini: new FormControl(""),
      fec_fin: new FormControl(""),
      fec_rei: new FormControl(""),
      day_vac: new FormControl(""),
      state:new FormControl(""),
      sta_liq: new FormControl(""),
      create_User: new FormControl(this.cuser.iduser),
    });
   
  }
  getDataInit() {
    this.loading.emit(true);
    this.WebApiService.getRequest(this.endpoint, {
      action: "getParamView",
      idHol: this.data.codigo,
      token: this.cuser.token,
      idUser: this.cuser.iduser,
      modulo: this.component
    }).subscribe(
      (data) => {
        if (data.success == true) {
          //DataInfo
          this.PersonaleInfo = data.data['getDataPersonale'];        
          this.position        = data.data["getPosition"];
          this.stateLiq = data.data["getStateLiq"];

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
      id: this.idHol,
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
        this.formSelec.get("state").setValue(data.data["getSelecUpdat"][0].state);
        this.formSelec.get("sta_liq").setValue(data.data["getSelecUpdat"][0].sta_liq);
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
     
        //  id: this.idHol
    }
    if (this.formSelec.valid) {
      this.loading.emit(true);
      this.WebApiService.putRequest(this.endpoint+'/'+this.idHol,body,{
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
    console.log(exitsPersonal);
  
    if( exitsPersonal ){
      
        this.formSelec.get('idPersonale').setValue(exitsPersonal.idPersonale);
        // this.formSelec.get('car_user').setValue(exitsPersonal.idArea);
       
    }        
  }
  showAge;

  ageCalculator(){
    if(this.fec_in){
      const convertAge = new Date(this.fec_in);
      const timeDiff = Math.abs(Date.now() - convertAge.getTime());
       this.showAge = Math.floor((timeDiff / (1000 * 3600 * 24))/365);
       return this.days = ( this.showAge*15)
      console.log('===',this.showAge)
    }else{
      // return this.showAge = 0
    }
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
  prue: any =[];
  prue2: any =[];
  // from: any = []
  to: any = []
  daysIniMen = 0;
  daysIniMay = 0;
  daysFin = 1;
  totalMen = 0;
  totalMay = 0;
  sumTotalMen: any = [];
  sumTotalMay = 0;
  ini;
  // diff = 0;
  // calculateDaysf($event){
  //   this.prue = $event;
  //   this.calculateDays(this.prue);
  // }
  acum= 0;
  restar = 0;
  // element: any=[]
  calculate1(event){
    this.prue = event;
    this.calculateDays(this.prue,this.prue2);
  }
  calculate(event){
    this.prue2 = event;
    this.calculateDays(this.prue,this.prue2);
  }
 
  calculateDays(f1, f2){
    // console.log($event)
  var festivos = [  [1, 7, 8],[27, 28],[1],[6, 9],[1],[15],[9],[17, 18, 19],[10],[12, 23],[7,14],[0,8] ];
  // var festivos = [ [ [1, 1],[7,1],[8,1] ], [ [27, 2],[28,2] ],[ [1,3] ],[ [6, 4],[9,4] ],[ [1,5] ],[ [15,6] ],[[9,7]],[ [17,8],[18,8],[19,8]],[ [10,9]],[ [12, 10],[23,10] ],[ [7,11],[14,11] ],[[8,12] ]];
  //  var festivos =  [7, 11 ];
  // const festivos = Array.from( [1, 7, 8],[27, 28],[1],[6, 9],[1],[15],[9],[17, 18, 19],[10],[12, 23],[7,14],[8] );

  // console.log('==',this.formSelec.value.fec_in) $('#item2')
    // var ini = moment(this.formSelec.value.fec_ini);
    var ini = moment(f1);
    var ini2 = (f1);
    console.log('****',ini)
    // console.log('==',ini.toObject().date) // obetener el dia del mes
    
    // var fin = moment(this.formSelec.value.fec_fin);
    var fin = moment(f2);
    var fin2 = (this.formSelec.value.fec_fin);
    // console.log('****',fin)

    // var diff = fin.diff(ini,'days');
    var diff = f2;
    console.log('****',diff);

    var arrFecha = ini2.split('-');
    console.log('****',arrFecha[1]);
    var mes = ini.month() ;
    var fecha = new Date(arrFecha[0], arrFecha[1] - 1, arrFecha[2]);
    console.log(fecha)

    for (var i = 0; i < diff; i++) {
      // var from = (Array.from( festivos ))
      // console.log('=>',festivos[mes]);

      var diaInvalido = false;
      fecha.setDate(fecha.getDate() + 1); // Sumamos de dia en dia
      // for (var j = 0; j < festivos.length; j++) { // Verificamos si el dia + 1 es festivo ejemplo
        for (var j = 0; j < festivos[mes].length; j++) { // Verificamos si el dia + 1 es festivo
          var mesDia =mes
          // var mesDia =festivos[mes][j];// festivos2
          var ite= festivos[mesDia][j]                                                  //ejemplo
          // var mesDia = from[mes][j];
          // console.log('=>', ite);
          // console.log('=>', fecha.getMonth());
          // console.log('=>', festivos[mes].length);
          // if(fecha.getDate() == festivos[mes][j]){
          //   console.log(true)
          // }
          if (fecha.getMonth()   == mesDia && fecha.getDate() == ite) {
            console.log(true);
              console.log(fecha.getDate() + ' es dia festivo (Sumamos un dia)');
              diaInvalido = true;
              break;
          }else if( fecha.getDay() == 0) { // Verificamos si es domingo
                console.log(fecha.getDate() + ' es  domingo (Sumamos un dia)');
                diaInvalido = true;

            }
      (diaInvalido)? diff++ : '';

      };

    
      // if ( fecha.getDay() == 0) { // Verificamos si es domingo
      //     console.log(fecha.getDate() + ' es  domingo (Sumamos un dia)');
      //     diaInvalido = true;
      // }
      // if (diaInvalido)
      // diff++; // Si es fin de semana o festivo le sumamos un dia
  }
    this.sumTotalMen = fecha.getFullYear() + '-' + (fecha.getMonth() + 1).toString().padStart(2, '0') + '-' + fecha.getDate().toString().padStart(2,'0' );
  console.log(fecha.getFullYear() + '-' + (fecha.getMonth() + 1).toString().padStart(2, '0') + '-' + fecha.getDate().toString().padStart(2,'0' ))
  console.log(this.sumTotalMen)
    
    
  
  }
    
}

  



