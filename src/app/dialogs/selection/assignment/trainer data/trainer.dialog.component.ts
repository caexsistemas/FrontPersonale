
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
} from "@angular/forms";
import { DateAdapter } from "@angular/material/core";
import { HandlerAppService } from "../../../../services/handler-app.service";
import { environment } from "../../../../../environments/environment";
import { global } from "../../../../services/global";
import { MatTableDataSource } from "@angular/material/table";
import { MatSort } from "@angular/material/sort";
import { Observable } from "rxjs";
import { NovedadesnominaServices } from "../../../../services/novedadesnomina.service";
import { DatePipe } from "@angular/common";
import { WebApiService } from "../../../../services/web-api.service";
import * as moment from "moment";
import { calculateDays } from "../../../../services/holiday.service";
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
  selector: "app-trainer",
  templateUrl: "./trainer.dialog.component.html",
  styleUrls: ["./trainer.dialog.component.css"],
})

export class TrainerDataDialog {
  endpoint: string = "/Assignment";
  maskDNI = global.maskDNI;
  title: string = null;
  view: string = null;
  permissions: any = null;
  formSelec: FormGroup;
  formTraining: FormGroup;
  formVac:FormGroup;
  formInsp:FormGroup;
  selection: any = [];
  position: any = [];
  typeRequisition: any = [];
  idSel: number = null;
  rol: number;
  typeMatriz: any = [];
  component = "/selection/assignment";
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
  checked = false;
  disabled = false;
  matriz: boolean = false;
  typeCargo: any = [];
  PersonaleInfo: any = [];
  trainingType: any = [];
  methodology: any = [];
  stateFor: any =[];
  prue:any = [];
  prue2:any = [];
  comp:any = [];
  totaLfecHol:any = [];
  fec_fin:any = [];
  sumTotalMen:any = [];
  totalFin:any = [];
  CheckTrue:boolean = true;
 
  public clickedRows;
  public cuser: any = JSON.parse(localStorage.getItem("currentUser"));
  //OUTPUTS
  @Output() loading = new EventEmitter();
  @Output() reload = new EventEmitter();
  @ViewChildren(MatSort) sort = new QueryList<MatSort>();

  constructor(
    public dialogRef: MatDialogRef<TrainerDataDialog>,
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
      case "update":
        this.rol = this.cuser.role;
        this.idSel = this.data.codigo;
        this.matriz = this.data.tipoMat
        this.initForms();
        this.title = "Asignación de Formador";
      break;
    }
  }
  initForms() {
    this.getDataInit();
    this.formSelec = new FormGroup({
      state: new FormControl(""),
      aprobacion1: new FormControl(""),
      aprobacion2: new FormControl(""),
      aprobacion3: new FormControl(""),
      day_for: new FormControl(""),
      create_User: new FormControl(this.cuser.iduser),

    });this.formVac = new FormGroup({
      create_User: new FormControl(this.cuser.iduser),
      con_fin: new FormControl(""),
    });
    this.formTraining = new FormGroup({
      tip_for: new FormControl(""),
      cod_grup: new FormControl(""),
      grupo: new FormControl(""),
      metodologia: new FormControl(""),
      document: new FormControl([Validators.required]),
      idPersonale: new FormControl(""),
      fec_ini: new FormControl(""),
      fec_fin: new FormControl(""),
      est: new FormControl(""),
      idsel: new FormControl(""),
      day_for: new FormControl(""),
      create_User: new FormControl(this.cuser.iduser),

    });this.formInsp = new FormGroup({
      idsel: new FormControl(this.idSel),
      create_User: new FormControl(this.cuser.iduser),
  });
  }
  getDataInit() {
    this.loading.emit(false);
    this.WebApiService.getRequest(this.endpoint, {
      action: "getParamView",
      token: this.cuser.token,
      idUser: this.cuser.iduser,
      modulo: this.component
    }).subscribe(
      (data) => {
        if (data.success == true) {
          //DataInfo
          this.selection = data.data["getSelectData"];
          this.position        = data.data["getPosition"];
          this.typeRequisition = data.data["getRequisition"];
          this.typeMatriz      = data.data["getMatriz"].slice(0, 3);
          this.PersonaleInfo = data.data['getDataPersonale'];
          this.methodology = data.data['getMethod'];
          this.stateFor = data.data['getFormation'];

          if(this.matriz)
          this.trainingType = data.data['getTraining'];

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
  getDataUpdate() {

    this.loading.emit(true);
    this.WebApiService.getRequest(this.endpoint, {
      action: "getTrainUpdateSet",
      id: this.idSel,
      token: this.cuser.token,
      idUser: this.cuser.iduser,
      modulo: this.component
    }).subscribe(
      (data) => {
        this.formTraining.get("document").setValue(data.data["getSelecUpdat"][0].document);
        this.formTraining.get("idPersonale").setValue(data.data["getSelecUpdat"][0].idPersonale);
        this.formTraining.get("tip_for").setValue(data.data["getSelecUpdat"][0].tip_for);
        this.formTraining.get("cod_grup").setValue(data.data["getSelecUpdat"][0].cod_grup);
        this.formTraining.get("grupo").setValue(data.data["getSelecUpdat"][0].grupo);
        this.formTraining.get("metodologia").setValue(data.data["getSelecUpdat"][0].metodologia);
        this.formTraining.get("fec_ini").setValue(data.data["getSelecUpdat"][0].fec_ini);
        this.formTraining.get("fec_fin").setValue(data.data["getSelecUpdat"][0].fec_fin);
        this.formTraining.get("est").setValue(data.data["getSelecUpdat"][0].est);
        this.formTraining.get("day_for").setValue(data.data["getSelecUpdat"][0].day_for);
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
        formacion: this.formTraining.value, 
        vacant: this.formVac.value,
        seguimiento: this.formInsp.value
    }
    if (this.formTraining.valid) {
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
  onSelectionAttributes(idet){
    if(idet =='16/1'){
      this.matriz = true
    }else{
      this.matriz = false

    }
  }
  onSelectionPerson(event){
    let exitsPersonal = this.PersonaleInfo.find(element => element.document == event);
  
    if( exitsPersonal ){
        this.formTraining.get('idPersonale').setValue(exitsPersonal.idPersonale);       
    }        
  }
}
  
  
  
   

  





