
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
  selector: 'app-acceptance.dialog',
  templateUrl: './acceptance.dialog.component.html',
  styleUrls: ['./acceptance.dialog.component.css']
})
export class AcceptanceDialog  {

  endpoint: string = "/acceptance";
  maskDNI = global.maskDNI;
  title: string = null;
  view: string = null;
  permissions: any = null;
  formSelec: FormGroup;
  selection: any = [];
  idHol: number = null;
  rol: number;
  component = "/selfManagement/acceptance";
  dataSource: any = [];
  archivo = {
    nombre: null,
    nombreArchivo: null,
    base64textString: null,
  };
  //History
  historyMon: any = [];
  check: boolean;
  checkS: boolean;
  displayedColumns: any = [];
  PersonaleInfo: any = [];
  document: any = [];
  people: any = [];
  position: any = [];
  contenTable:   any = [];
  fec_in: any = [];
  days: any = [];
  stateVac:any = [];
  stateAnt:any = [];
  advance: any = [];
  vacation: any = [];
  totalSol: any = [];
  checkAvd: boolean;
  checkSol: boolean;
  public clickedRows;
  public cuser: any = JSON.parse(localStorage.getItem("currentUser"));
  //OUTPUTS
  @Output() loading = new EventEmitter();
  @Output() reload = new EventEmitter();
  @ViewChildren(MatSort) sort = new QueryList<MatSort>();
  @ViewChildren(MatPaginator) paginator = new QueryList<MatPaginator>();

  constructor(
    public dialogRef: MatDialogRef<AcceptanceDialog>,
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
        this.document = this.data.codigo
        this.people = this.data.id
       
        // this.sendRequest();


        this.title = "Solicitud de Vacaciones";
      break;
      case "update":
        this.idHol = this.data.codigo;
        this.initForms();
        this.title = "Aprobar Solicitud";
      break;
      case "view":
        this.idHol = this.data.codigo;
        this.title = "Información General"
        this.loading.emit(true);
        this.WebApiService.getRequest(this.endpoint + "/"+ this.idHol, {
          token: this.cuser.token,
          idUser: this.cuser.iduser,
          modulo: this.component
        }).subscribe(
          (data) => {
            if (data.success == true) {
              this.selection = data.data["getSelecUpdat"][0];
              (this.selection.day_adv)? this.checkAvd = true: this.checkAvd = false;
              (this.selection.tot_day)? this.checkSol = true: this.checkSol = false;
              // console.log('==>',this.selection.car_sol);
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
      tot_day: new FormControl(""),
      day_adv: new FormControl(""),
      state:new FormControl("", [Validators.required]),
      total_adv:new FormControl(""),
      sta_liq:new FormControl(""),
      obc_apr:new FormControl("", [Validators.required]),
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
          this.stateVac = data.data["getStateVac"].slice(0,3);
          this.stateAnt = data.data["getStateVac"].slice(2,4);

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
        this.formSelec.get("day_adv").setValue(data.data["getSelecUpdat"][0].day_adv);
        this.formSelec.get("tot_day").setValue(data.data["getSelecUpdat"][0].tot_day);
        this.formSelec.get("total_adv").setValue(data.data["getSelecUpdat"][0].total_adv);
        // this.formSelec.get("state").setValue(data.data["getSelecUpdat"][0].state);
        this.totalSol =(data.data["getSelecUpdat"][0].tot_day);
        this.advance = (data.data["getSelecUpdat"][0].day_adv);
        this.vacation = (data.data["getSelecUpdat"][0].day_vac);
        // console.log("advance ", this.advance);
        // console.log("totalSol ", this.totalSol);
        this.checkS = !!this.totalSol; // Verifica si totalSol tiene un valor válido
        this.check = !!this.advance || !!this.vacation; // Es true si advance o vacation son válidos
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
  
    if( exitsPersonal ){
      
        this.formSelec.get('idPersonale').setValue(exitsPersonal.idPersonale);
        // this.formSelec.get('car_user').setValue(exitsPersonal.idArea);
       
    }        
  }
  getStateInvalid(){
    return this.formSelec.get('state').invalid && this.formSelec.get('state').touched;
  }
  getObcerInvalid(){
    return this.formSelec.get('obc_apr').invalid && this.formSelec.get('obc_apr').touched;
   }
}

  



