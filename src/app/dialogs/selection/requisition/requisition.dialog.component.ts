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
  formTraining: FormGroup;
  formInsp: FormGroup;
  formVac:FormGroup;
  selection: any = [];
  position: any = [];
  typeRequisition: any = [];
  idSel: number = null;
  rol: number;
  typeMatriz: any = [];
  component = "/selection/requisition";
  dataSource: any = [];
  archivo = {
    nombre: null,
    nombreArchivo: null,
    base64textString: null,
  };
  //History
  historyMon: any = [];
  check: boolean;
  displayedColumns: any = [];
  checked = false;
  typeReq: any = [];
  disabled = false;
  matriz: boolean;
  requ: boolean;
  // matriz: any = [];
  typeCargo: any = [];
  PersonaleInfo: any = [];
  createUs: any =[];
  state: any = [];
  cancel: any = [];
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

    switch (this.view) {
      case "create":
        this.initForms();
        this.title = "Nueva Requisición";
      break;
      case "update":
        this.idSel = this.data.codigo;
        this.createUs = this.data.id;
        // console.log('idsel=>',this.createUs);
        this.initForms();
        this.title = "Actualizar Requisición";
      break;
      case "cancel":
        this.idSel = this.data.codigo;
        this.title = "Cancelar Requisición";
        this.initForms();
        // this.initFormsCancel();
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
              this.typeReq = this.selection.tip_req;
              ( !(this.typeReq == '62/1' || this.typeReq == '62/2' ) ? this.checked = true : this.checked );
              ( this.typeReq == '62/4' ) ? this.check = false : this.check = true;

              this.cancel= this.selection.state;
              ( this.cancel == '65/6') ? this.title = ' Requisición Cancelada': '';
              this.typeCargo = this.selection.car_sol;

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
      car_sol: new FormControl("",[Validators.required]),
      num_vac: new FormControl("", [Validators.required]),
      salary: new FormControl("", [Validators.required]),
      tip_req: new FormControl("", [Validators.required]),
      matrizarp: new FormControl(""),
      justification: new FormControl("", [Validators.required]),
      observations: new FormControl(""),
      aprobacion1: new FormControl(""),
      aprobacion2: new FormControl(""),
      aprobacion3: new FormControl(""),
      day_for: new FormControl(""),
      state: new FormControl(""),
      can_req: new FormControl(""),
      create_User: new FormControl(this.cuser.iduser),
    });
    this.formTraining = new FormGroup({
      tip_for: new FormControl(""),
      cod_grup: new FormControl(""),
      grupo: new FormControl(""),
      metodologia: new FormControl(""),
      document: new FormControl(""),
      idPersonale: new FormControl(""),
      fec_ini: new FormControl(""),
      fec_fin: new FormControl(""),
      est: new FormControl(""),
      idsel: new FormControl(""),
      create_User: new FormControl(this.cuser.iduser),
    });
    // this.formInsp = new FormGroup({
    //   create_User: new FormControl(this.cuser.iduser),
    // });
    this.formVac = new FormGroup({
      create_User: new FormControl(this.cuser.iduser),
      con_fin: new FormControl(""),
    });
  }
  initFormsCancel(){
    this.getDataInit();
    this.formSelec = new FormGroup({
      state: new FormControl("")
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
          this.position        = data.data["getPosition"];
          this.typeRequisition = data.data["getRequisition"];
          this.typeMatriz      = data.data["getMatriz"].slice(0, 3);
          this.PersonaleInfo = data.data['getDataPersonale']; 
          this.state         = data.data['getCancel'].slice(5);

          if (this.view == "update" || this.view == 'cancel' ) {
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
        formacion: this.formTraining.value,
        // segui: this.formInsp.value,
        vacant: this.formVac.value,
        // seguimiento: this.formInsp.value
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
      // tipRole:this.tipRole
    }).subscribe(
      (data) => {
        this.formSelec.get("car_sol").setValue(data.data["getSelecUpdat"][0].car_sol);
        this.formSelec.get("num_vac").setValue(data.data["getSelecUpdat"][0].num_vac);
        this.formSelec.get("salary").setValue(data.data["getSelecUpdat"][0].salary);
        this.formSelec.get("tip_req").setValue(data.data["getSelecUpdat"][0].tip_req);
        this.formSelec.get("matrizarp").setValue(data.data["getSelecUpdat"][0].matrizarp);
        this.formSelec.get("justification").setValue(data.data["getSelecUpdat"][0].justification);
        this.formSelec.get("observations").setValue(data.data["getSelecUpdat"][0].observations);
        this.formSelec.get("aprobacion1").setValue(data.data["getSelecUpdat"][0].aprobacion1);
        this.formSelec.get("aprobacion2").setValue(data.data["getSelecUpdat"][0].aprobacion2);
        this.formSelec.get("aprobacion3").setValue(data.data["getSelecUpdat"][0].aprobacion3);
        this.formSelec.get("state").setValue(data.data["getSelecUpdat"][0].state);
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
      // segui: this.formInsp.value,
      vacant: this.formVac.value,
      // seguimiento: this.formInsp.value
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
  onSelectionAttributes(e){
   
      if(e != '16/1'){
      this.matriz = false

      }else if(e == '16/1'){
      this.matriz = true
      this.mat

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
  getCargInvalid(){
       return this.formSelec.get('car_sol').invalid && this.formSelec.get('car_sol').touched;
  }
  getTypeInvalid(){
    return this.formSelec.get('tip_req').invalid && this.formSelec.get('tip_req').touched;
}
  getSalaryInvalid(){
    return this.formSelec.get('salary').invalid && this.formSelec.get('salary').touched;
  }
  getNumInvalid(){
    return this.formSelec.get('num_vac').invalid && this.formSelec.get('num_vac').touched;
}
  getJustInvalid(){
    return this.formSelec.get('justification').invalid && this.formSelec.get('justification').touched;
  }

}
