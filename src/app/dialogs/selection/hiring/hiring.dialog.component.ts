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
import { NullTemplateVisitor } from "@angular/compiler";
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
  selector: "app-hiring",
  templateUrl: "./hiring.dialog.component.html",
  styleUrls: ["./hiring.dialog.component.css"],
})

export class HiringDialog {
  
  endpoint: string = "/hiring";
  maskDNI = global.maskDNI;
  title: string = null;
  view: string = null;
  permissions: any = null;
  formVac: FormGroup;
  formSelec: FormGroup;
  selection: any = [];
  position:  any = [];
  idSel:     number = null;
  idvac: number = null;
  rol:       number;
  typeDocument: any = [];
  typeMatriz: any = [];
  area: any = [];
  component = "/selection/hiring";
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
  disabled = false;
  period:       boolean;
  tipoMat:      any = [];
  typeContract: any = [];
  stateCont:    any = [];
  contra:       any = [];
  public clickedRows;
  public cuser: any = JSON.parse(localStorage.getItem("currentUser"));
  //OUTPUTS
  @Output() loading = new EventEmitter();
  @Output() reload = new EventEmitter();
  @ViewChildren(MatSort) sort = new QueryList<MatSort>();

  constructor(
    public dialogRef: MatDialogRef<HiringDialog>,
    private WebApiService: WebApiService,
    private handler: HandlerAppService,
    @Inject(MAT_DIALOG_DATA) public data,
    public dialog: MatDialog,
    private uploadFileService: NovedadesnominaServices
  ) {
    this.view = this.data.window;
    this.idvac = null;
    // this.rol = this.cuser.role;

    switch (this.view) {
      case "create":
        this.initForms();
        this.title = "Nueva Requisicion";
      break;
      case "update":
        // this.rol = this.cuser.role;
        console.log('>',this.data.idsel)
        this.idSel = this.data.idsel
        this.idvac = this.data.codigo;
        console.log('=>',this.idvac)
        this.tipoMat = this.data.tipoMat;
        this.initForms();
        this.title = "Contratación";
      break;
      case "view":
        this.idvac = this.data.codigo;
        this.loading.emit(true);
        this.WebApiService.getRequest(this.endpoint + "/"+ this.idvac, {}).subscribe(
          (data) => {
            if (data.success == true) {
              this.selection = data.data["getSelectData"][0];
              this.contra = this.selection.vac_cont;
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
      tip_doc: new FormControl(""),
      document: new FormControl(""),
      nom_com: new FormControl(""),
      are_tra: new FormControl(""),
      car_sol: new FormControl(""),
      vac_cont: new FormControl(""),
      vac_sal: new FormControl(""),
      vac_aux: new FormControl(""),
      vac_per: new FormControl(""),
      sta_cont: new FormControl(""),
      matrizarp: new FormControl(this.tipoMat),
      idsel: new FormControl(this.idSel),
      create_User: new FormControl(this.cuser.iduser),

    });
    this.formVac = new FormGroup({
      create_User: new FormControl(this.cuser.iduser),
      state: new FormControl(""),
    });

  }
  getDataInit() {
    this.loading.emit(false);
    this.WebApiService.getRequest(this.endpoint, {
      action: "getInformation",
      idvac: this.data.codigo
    }).subscribe(
      (data) => {
        if (data.success == true) {
          //DataInfo
          this.position        = data.data["getPosition"];
          this.typeDocument    = data.data["getDocument"];
          this.area            = data.data["getArea"];
          this.typeMatriz      = data.data["getMatriz"];
          this.typeContract    = data.data["getContract"];
          this.stateCont       = data.data["getStateCont"];
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
  // onSubmit() {
  //   if (this.formSelec.valid) {
  //     this.loading.emit(true);
  //     let body = {
  //       listas: this.formSelec.value,
  //     };
  //     this.WebApiService.postRequest(this.endpoint, body, {}).subscribe(
  //       (data) => {
  //         if (data.success) {
  //           this.handler.showSuccess(data.message);
  //           this.reload.emit();
  //           this.closeDialog();
  //         } else {
  //           this.handler.handlerError(data);
  //           this.loading.emit(false);
  //         }
  //       },
  //       (error) => {
  //         this.handler.showError();
  //         this.loading.emit(false);
  //       }
  //     );
  //   } else {
  //     this.handler.showError("Complete la informacion necesaria");
  //     this.loading.emit(false);
  //   }
  // }
  getDataUpdate() {

    this.loading.emit(true);
    this.WebApiService.getRequest(this.endpoint, {
      action: "getParamUpdateSet",
      id: this.idvac
      // tipRole:this.tipRole
    }).subscribe(
      (data) => {
        this.formSelec.get("tip_doc").setValue(data.data["getSelecUpdat"][0].tip_doc);
        this.formSelec.get("document").setValue(data.data["getSelecUpdat"][0].document);
        this.formSelec.get("nom_com").setValue(data.data["getSelecUpdat"][0].nom_com);
        this.formSelec.get("are_tra").setValue(data.data["getSelecUpdat"][0].are_tra);
        this.formSelec.get("car_sol").setValue(data.data["getSelecUpdat"][0].car_sol);
        this.formSelec.get("matrizarp").setValue(data.data["getSelecUpdat"][0].matrizarp);
        this.formSelec.get("vac_cont").setValue(data.data["getSelecUpdat"][0].vac_cont);
        this.formSelec.get("vac_sal").setValue(data.data["getSelecUpdat"][0].vac_sal);
        this.formSelec.get("vac_aux").setValue(data.data["getSelecUpdat"][0].vac_aux);
        this.formSelec.get("vac_per").setValue(data.data["getSelecUpdat"][0].vac_per);
        this.formSelec.get("sta_cont").setValue(data.data["getSelecUpdat"][0].sta_cont);
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
        contr: this.formVac.value,  
        //  id: this.idvac
    }
    if (this.formSelec.valid) {
      this.loading.emit(true);
      this.WebApiService.putRequest(this.endpoint+'/'+this.idvac,body,{})
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
  onSelectContract(e){
    console.log('contr',e)
    if(!(e == '5/1')){
      this.period = true
    }else{
      this.period = false
    }

  }
}
