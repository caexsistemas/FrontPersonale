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
import { HandlerAppService } from "../../../services/handler-app.service";
import { environment } from "../../../../environments/environment";
import { global } from "../../../services/global";
import { MatTableDataSource } from "@angular/material/table";
import { MatSort } from "@angular/material/sort";
import { Observable } from "rxjs";
import { NovedadesnominaServices } from "../../../services/novedadesnomina.service";
import { DatePipe } from "@angular/common";
import { WebApiService } from "../../../services/web-api.service";
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
  selector: "app-training",
  templateUrl: "./training.dialog.component.html",
  styleUrls: ["./training.dialog.component.css"],
})

export class TrainingDialog {
  
 


  endpoint: string = "/vacant";
  maskDNI = global.maskDNI;
  title: string = null;
  view: string = null;
  permissions: any = null;
  formSelec: FormGroup;
  selection: any = [];
  position: any = [];
  typeRequisition: any = [];
  idSel: number = null;
  rol: number;
  typeDocument: any = [];
  typeMatriz: any = [];
  depart: any = [];
  citytBirth: any = [];
  area: any = [];
  // position: any = [];
  eps: any = [];
  pension: any = [];
  citieswork: any =[];
  cities: any = [];
  component = "/selection/requisition";
  dataSource: any = [];
  stateFormation: any = [];
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
  public clickedRows;
  public cuser: any = JSON.parse(localStorage.getItem("currentUser"));
  //OUTPUTS
  @Output() loading = new EventEmitter();
  @Output() reload = new EventEmitter();
  @ViewChildren(MatSort) sort = new QueryList<MatSort>();

  constructor(
    public dialogRef: MatDialogRef<TrainingDialog>,
    private WebApiService: WebApiService,
    private handler: HandlerAppService,
    @Inject(MAT_DIALOG_DATA) public data,
    public dialog: MatDialog,
    private uploadFileService: NovedadesnominaServices
  ) {
    this.view = this.data.window;
    this.idSel = null;
    // this.rol = this.cuser.role;

    switch (this.view) {
      case "create":
        this.initForms();
        this.title = "Nueva Requisicion";
      break;
      case "update":
        // this.rol = this.cuser.role;
        this.idSel = this.data.codigo;
        console.log('idsel=>',this.idSel);
        this.initForms();
        this.title = "Actualizar Activos";
      break;
      case "view":
        this.idSel = this.data.codigo;
        this.loading.emit(true);
        this.WebApiService.getRequest(this.endpoint + "/"+ this.idSel, {}).subscribe(
          (data) => {
            if (data.success == true) {
              this.selection = data.data["getSelectData"][0];
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
      fec_sel: new FormControl(""),
      tip_doc: new FormControl(""),
      document: new FormControl(""),
      nom_com: new FormControl(""),
      birthDate: new FormControl(""),
      dep_nac: new FormControl(""),
      ciu_nac: new FormControl(""),
      are_tra: new FormControl(""),
      car_sol: new FormControl(""),
      eps: new FormControl(""),
      obs_vac: new FormControl(""),
      pension: new FormControl(""),
      formation: new FormControl(""),
      create_User: new FormControl(this.cuser.iduser),

    });
  }
  getDataInit() {
    this.loading.emit(false);
    this.WebApiService.getRequest(this.endpoint, {
      action: "getInformation",
      idSel: this.data.codigo
    }).subscribe(
      (data) => {
        if (data.success == true) {
          //DataInfo
          // this.selection = data.data["getSelectData"];
          this.position        = data.data["getPosition"];
          this.typeRequisition = data.data["getRequisition"];
          this.typeDocument    = data.data["getDocument"];
          this.depart          = data.data["getDepart"];
          this.citytBirth      = data.data["getCity"];
          this.position        = data.data["getPosition"];
          this.eps             = data.data["getEps"];
          this.pension         = data.data["getPension"];
          this.area            = data.data["getArea"];
          this.stateFormation  = data.data["getFormation"];
          this.typeMatriz      = data.data["getMatriz"];

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
      this.WebApiService.postRequest(this.endpoint, body, {}).subscribe(
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
      id: this.idSel
      // tipRole:this.tipRole
    }).subscribe(
      (data) => {
        this.formSelec.get("fec_sel").setValue(data.data["getSelecUpdat"][0].fec_sel);
        this.formSelec.get("tip_doc").setValue(data.data["getSelecUpdat"][0].tip_doc);
        this.formSelec.get("document").setValue(data.data["getSelecUpdat"][0].document);
        this.formSelec.get("nom_com").setValue(data.data["getSelecUpdat"][0].nom_com);
        this.formSelec.get("birthDate").setValue(data.data["getSelecUpdat"][0].birthDate);
        this.formSelec.get("dep_nac").setValue(data.data["getSelecUpdat"][0].dep_nac);
        this.formSelec.get("ciu_nac").setValue(data.data["getSelecUpdat"][0].ciu_nac);
        this.formSelec.get("are_tra").setValue(data.data["getSelecUpdat"][0].are_tra);
        this.formSelec.get("car_sol").setValue(data.data["getSelecUpdat"][0].car_sol);
        this.formSelec.get("eps").setValue(data.data["getSelecUpdat"][0].eps);
        this.formSelec.get("pension").setValue(data.data["getSelecUpdat"][0].pension);
        this.formSelec.get("obs_vac").setValue(data.data["getSelecUpdat"][0].obs_vac);
        this.formSelec.get("formation").setValue(data.data["getSelecUpdat"][0].formation);
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
      this.WebApiService.putRequest(this.endpoint+'/'+this.idSel,body,{})
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
}
