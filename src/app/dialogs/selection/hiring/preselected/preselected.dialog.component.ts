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
  templateUrl: "./preselected.dialog.component.html",
  styleUrls: ["./preselected.dialog.component.css"],
})

export class PreselectedDialog {
  
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
  state: any = [];
  public clickedRows;
  public cuser: any = JSON.parse(localStorage.getItem("currentUser"));
  //OUTPUTS
  @Output() loading = new EventEmitter();
  @Output() reload = new EventEmitter();
  @ViewChildren(MatSort) sort = new QueryList<MatSort>();

  constructor(
    public dialogRef: MatDialogRef<PreselectedDialog>,
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
      case "update":
        this.idSel = this.data.id;
        this.idvac = this.data.codigo;
        this.tipoMat = this.data.tipoMat;
        this.initForms();
        this.title = "Contratación";
      break;
      case "cancel":
          this.idSel = this.data.codigo;
          console.log('canc', this.idSel)
          this.title = "Cancelar Requisición";
          this.initForms();
          // this.initFormsCancel();
        break;
      case "view":
        this.idvac = this.data.codigo;
        this.loading.emit(true);
        this.WebApiService.getRequest(this.endpoint + "/"+ this.idvac, {
          idUser: this.cuser.iduser,
          token: this.cuser.token,
          modulo: this.component
        }).subscribe(
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
      car_sol: new FormControl(""),
    //   num_vac: new FormControl(""),
    //   salary: new FormControl(""),
    //   tip_req: new FormControl(""),
    //   matrizarp: new FormControl(""),
    //   justification: new FormControl(""),
    //   observations: new FormControl(""),
    //   aprobacion1: new FormControl(""),
    //   aprobacion2: new FormControl(""),
    //   aprobacion3: new FormControl(""),
    //   day_for: new FormControl(""),
      state: new FormControl(""),
      can_req: new FormControl(""),
      create_User: new FormControl(this.cuser.iduser),
    });

  }
  getDataInit() {
    this.loading.emit(false);
    this.WebApiService.getRequest(this.endpoint, {
      action: "getInformation",
      id: this.data.codigo,
      idUser: this.cuser.iduser,
      token: this.cuser.token,
      modulo: this.component
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
          this.state         = data.data['getCancel'].slice(5);

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
      action: "getParamUpdateSet",
      idUser: this.cuser.iduser,
      token: this.cuser.token,
      modulo: this.component,
      id: this.idvac,
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

        // this.formVac.get("car_sol").setValue(data.data["getSelecUpdat"][0].car_sol);
        // this.formVac.get("num_vac").setValue(data.data["getSelecUpdat"][0].num_vac);
        // this.formVac.get("salary").setValue(data.data["getSelecUpdat"][0].salary);
        // this.formVac.get("tip_req").setValue(data.data["getSelecUpdat"][0].tip_req);
        // this.formVac.get("matrizarp").setValue(data.data["getSelecUpdat"][0].matrizarp);
        // this.formVac.get("justification").setValue(data.data["getSelecUpdat"][0].justification);
        // this.formVac.get("observations").setValue(data.data["getSelecUpdat"][0].observations);
        // this.formVac.get("aprobacion1").setValue(data.data["getSelecUpdat"][0].aprobacion1);
        // this.formVac.get("aprobacion2").setValue(data.data["getSelecUpdat"][0].aprobacion2);
        // this.formVac.get("aprobacion3").setValue(data.data["getSelecUpdat"][0].aprobacion3);
        // this.formVac.get("state").setValue(data.data["getSelecUpdat"][0].state);
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
      this.WebApiService.putRequest(this.endpoint+'/'+this.idvac,body,{
        idUser: this.cuser.iduser,
        token: this.cuser.token,
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
  onSelectContract(e){
    console.log('contr',e)
    if(!(e == '5/1')){
      this.period = true
    }else{
      this.period = false
    }

  }
}
