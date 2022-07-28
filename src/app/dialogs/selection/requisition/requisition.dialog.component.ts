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
  selector: "app-requisition",
  templateUrl: "./requisition.dialog.component.html",
  styleUrls: ["./requisition.dialog.component.css"],
})

export class RequisitionDialog {
  endpoint: string = "/requisition";
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

  component = "/selection/requisition";
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
  public clickedRows;
  public cuser: any = JSON.parse(localStorage.getItem("currentUser"));
  //OUTPUTS
  @Output() loading = new EventEmitter();
  @Output() reload = new EventEmitter();
  @ViewChildren(MatSort) sort = new QueryList<MatSort>();

  constructor(
    public dialogRef: MatDialogRef<RequisitionDialog>,
    private WebApiService: WebApiService,
    private handler: HandlerAppService,
    @Inject(MAT_DIALOG_DATA) public data,
    public dialog: MatDialog,
    private uploadFileService: NovedadesnominaServices
  ) {
    this.view = this.data.window;
    this.idSel = null;
    this.rol = this.cuser.role;

    switch (this.view) {
      case "create":
        this.initForms();
        this.title = "Nueva Requisicion";
        break;
      case "update":
        this.rol = this.cuser.role;
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
              // this.selection = data.data["getDataTechno"][0];
              // this.acti = data.data['getSubActivo'];
              // this.list = data.data['getSubActivo'];
              // this.sub = this.techno.listSub;
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
      car_sol: new FormControl(""),
      num_vac: new FormControl(""),
      salary: new FormControl(""),
      tip_req: new FormControl(""),
      justification: new FormControl(""),
      observations: new FormControl(""),
      aprobacion1: new FormControl(""),
      aprobacion2: new FormControl(""),
      aprobacion3: new FormControl(""),
      create_User: new FormControl(this.cuser.iduser),

    });
  }
  getDataInit() {
    this.loading.emit(false);
    this.WebApiService.getRequest(this.endpoint, {
      action: "getParamView",
      // tipRole: this.cuser.role,
      idSel: this.data.codigo
    }).subscribe(
      (data) => {
        if (data.success == true) {
          //DataInfo
          this.selection = data.data["getDataTechno"];
          this.position = data.data["getPosition"];
          this.typeRequisition = data.data["getRequisition"];

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
        this.formSelec.get("car_sol").setValue(data.data["getSelecUpdat"][0].car_sol);
        this.formSelec.get("num_vac").setValue(data.data["getSelecUpdat"][0].num_vac);
        this.formSelec.get("salary").setValue(data.data["getSelecUpdat"][0].salary);
        this.formSelec.get("tip_req").setValue(data.data["getSelecUpdat"][0].tip_req);
        this.formSelec.get("justification").setValue(data.data["getSelecUpdat"][0].justification);
        this.formSelec.get("observations").setValue(data.data["getSelecUpdat"][0].observations);
        this.formSelec.get("aprobacion1").setValue(data.data["getSelecUpdat"][0].aprobacion1);
        this.formSelec.get("aprobacion2").setValue(data.data["getSelecUpdat"][0].aprobacion2);
        this.formSelec.get("aprobacion3").setValue(data.data["getSelecUpdat"][0].aprobacion3);
      },
      (error) => {
        this.handler.showError();
        this.loading.emit(false);
      }
    );
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
