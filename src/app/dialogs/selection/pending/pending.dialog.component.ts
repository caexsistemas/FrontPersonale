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
import { ApprovalDialog } from "../approval/approval.dialog.component";
import {MatRadioModule, MAT_RADIO_DEFAULT_OPTIONS} from '@angular/material/radio';
import { DeclineDialog } from "../approval/decline.dialog.component";
import { Pending } from "../approval/pending";
providers: [{
  provide: MAT_RADIO_DEFAULT_OPTIONS,
  useValue: { color: 'accent' },
}]
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
  selector: "app-pending",
  templateUrl: "./pending.dialog.component.html",
  styleUrls: ["./pending.dialog.component.css"],
})
export class PendingDialog  {

  endpoint: string = "/pending";
  maskDNI = global.maskDNI;
  title: string = null;
  view: string = null;
  permissions: any = null;
  formSelec: FormGroup;
  formTraining: FormGroup;
  formInsp:FormGroup;
  formVac:FormGroup;
  selection: any = [];
  position: any = [];
  pos: any = [];
  typeRequisition: any = [];
  typeManage: any = [];
  typeStateRq: any = [];
  idSel: number = null;
  rol: number;
  retro: boolean = true;
  retro2: boolean = true;
  retro3: boolean = true;
  retro4: boolean = true;
  idUser: number = null;
  component = "/selection/pending";
  dataSource: any = [];
  requ: any = [];
  pop: any = [];
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
  typeMatriz: any = [];
  matriz: boolean = false;
  typeCargo: any = [];
  create_user: any = [];
  typeReq: any = [];

  public test: any = { limite_semana: 1 };
  public test2: any = { limite_semana: 0 };
  public clickedRows;
  public cuser: any = JSON.parse(localStorage.getItem("currentUser"));
  //OUTPUTS
  @Output() loading = new EventEmitter();
  @Output() reload = new EventEmitter();
  @ViewChildren(MatSort) sort = new QueryList<MatSort>();

  constructor(
    public dialogRef: MatDialogRef<PendingDialog>,
    private WebApiService: WebApiService,
    private handler: HandlerAppService,
    @Inject(MAT_DIALOG_DATA) public data,
    public dialog: MatDialog,
    private uploadFileService: NovedadesnominaServices
  ) {
    this.view = this.data.window;
    this.idSel = null;
    this.rol = this.cuser.role;
    this.idUser= this.cuser.iduser

    switch (this.view) {
      case "create":
        this.initForms();
        this.title = "Nueva Requisicion";
        break;
      case "update":
        this.rol = this.cuser.role;
        this.idSel = this.data.codigo;
        this.create_user = this.data.id;
        console.log(this.data.id)
       
        if( this.idUser == 263 ){
          this.retro = false;
        }else if(this.idUser == 256){
            this.retro2 = false;

        } else if(this.idUser == 44 ){
          this.retro3 = false;
        }
          else if( this.idUser === this.create_user){
            this.retro4 = false;
          }
        this.initForms();
        this.title = "Aprobaciones";
        break;
      case "view":
        this.idSel = this.data.codigo;
        this.loading.emit(true);
        this.WebApiService.getRequest(this.endpoint + "/"+ this.idSel, {
          idUser: this.cuser.iduser,
          token: this.cuser.token,
          modulo: this.component
        }).subscribe(
          (data) => {
            if (data.success == true) {

              this.selection = data.data["getSelectData"][0];
              ( this.selection.tip_req == '62/4' ) ? this.check = false : this.check = true;

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
      matrizarp: new FormControl(""),
      justification: new FormControl(""),
      observations: new FormControl(""),
      aprobacion1: new FormControl(""),
      aprobacion2: new FormControl(""),
      aprobacion3: new FormControl(""),
      fec_req: new FormControl(""),
      state: new FormControl(""),
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
    this.formVac = new FormGroup({
      create_User: new FormControl(this.cuser.iduser),
      con_fin: new FormControl(""),
    });
    this.formInsp = new FormGroup({
        idsel: new FormControl(this.idSel),
      create_User: new FormControl(this.cuser.iduser),
    });
  }
  getDataInit() {
    this.loading.emit(false);
    this.WebApiService.getRequest(this.endpoint, {
      action: "getParamView",
        idUser: this.cuser.iduser,
        idSel: this.data.codigo,
        token: this.cuser.token,
        modulo: this.component
    }).subscribe(
      (data) => {
        if (data.success == true) {
          //DataInfo
          this.selection = data.data["getDataTechno"];
          this.position = data.data["getPosition"];
          this.typeRequisition = data.data["getRequisition"];
          this.pos = data.data["getPost"];
          this.typeManage = data.data["getManage"];
          this.typeStateRq = data.data["getStateRq"];
          this.typeMatriz      = data.data["getMatriz"].slice(0, 3);

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
      this.handler.showLoadin("Guardando Registro", "Por favor espere...");
      this.WebApiService.postRequest(this.endpoint, body, {
        idUser: this.cuser.iduser,
        token: this.cuser.token,
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
        idUser: this.cuser.iduser,
        token: this.cuser.token,
        modulo: this.component,
        id: this.idSel
    }).subscribe(
      (data) => {
        this.formSelec.get("car_sol").setValue(data.data["getSelecUpdat"][0].car_sol);
        this.formSelec.get("num_vac").setValue(data.data["getSelecUpdat"][0].num_vac);
        this.formSelec.get("salary").setValue(data.data["getSelecUpdat"][0].salary);
        this.formSelec.get("matrizarp").setValue(data.data["getSelecUpdat"][0].matrizarp);
        this.formSelec.get("tip_req").setValue(data.data["getSelecUpdat"][0].tip_req);
        this.formSelec.get("justification").setValue(data.data["getSelecUpdat"][0].justification);
        this.formSelec.get("observations").setValue(data.data["getSelecUpdat"][0].observations);
        this.formSelec.get("aprobacion1").setValue(data.data["getSelecUpdat"][0].aprobacion1);
        this.formSelec.get("aprobacion2").setValue(data.data["getSelecUpdat"][0].aprobacion2);
        this.formSelec.get("aprobacion3").setValue(data.data["getSelecUpdat"][0].aprobacion3);
        this.requ = data.data["getSelecUpdat"][0].tip_req;
        this.pop = this.cuser.iduser
      },
      (error) => {
        this.handler.showError();
        this.loading.emit(false);
      }
    );
  }
  openDialog(e) {
        if( e == '65/1'){
            this.dialog.open(ApprovalDialog);
          }else if(e == '65/2'){
            this.dialog.open(DeclineDialog);
          }
  }
  openDialog2(e){
      if( e == '65/1'){
          this.dialog.open(ApprovalDialog);
        }else if(e == '65/2'){
          this.dialog.open(DeclineDialog);
        }
  }
  openDialog3(e){
    if( e == '65/1'){
        this.dialog.open(ApprovalDialog);
      }else if(e == '65/2'){
        this.dialog.open(DeclineDialog);
      }
}
  
  onSubmitUpdate(){
    if(this.formSelec.value['aprobacion1'] == '65/1' && this.formSelec.value['aprobacion2'] == '65/1' && this.formSelec.value['aprobacion3'] == '65/1'){
      this.formSelec.value['state'] = '65/1';
    }else if(this.formSelec.value['tip_req'] == '62/4' && this.formSelec.value['aprobacion2'] == '65/1'){
      this.formSelec.value['state'] = '65/1';
    }else if(this.formSelec.value['aprobacion1'] == '65/2' && this.formSelec.value['aprobacion2'] == '65/2' && this.formSelec.value['aprobacion3'] == '65/2'){
        this.formSelec.value['state'] = '65/2';
    }else{
      this.formSelec.value['state'] = '30/1';
    }

    if( this.view == 'update' && this.formSelec.value['create_User'] == 255 ){
      this.formSelec.value['aprobacion1'] = '30/3'; 
      this.formSelec.value['state'] = '30/3';
    }else if( this.view == 'update' && this.formSelec.value['create_User']== 255){
      this.formSelec.value['aprobacion2'] = '30/3'; 
    }else if( this.view == 'update' && this.formSelec.value['create_User']== 255 ){
      this.formSelec.value['aprobacion3'] = '30/3'; 
    }
    // 
    
    console.log('=>',this.formSelec.value);
    let body = {
        listas: this.formSelec.value,
        formacion:this.formTraining.value,
        vacant: this.formVac.value,
        seguimiento: this.formInsp.value
    }
  
    if (this.formSelec.valid) {
      this.loading.emit(true);
      this.WebApiService.putRequest(this.endpoint+'/'+this.idSel,body,{
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
rechazar(idet){
  if( this.view == 'update' && this.cuser.role == 63 && idet == '30/3' ){
    this.formSelec.get('aprobacion1').setValue('30/3'); 
  }else if( this.view == 'update' && this.cuser.role == 63 && idet == '30/3'  ){
   this.formSelec.get('aprobacion2').setValue('30/3'); 
  }else if( this.view == 'update' && this.cuser.role == 63 && idet == '30/3'  ){
   this.formSelec.get('aprobacion3').setValue('30/3'); 
  }
}
onSelectionAttributes(idet){
  if(idet =='16/1'){
    this.matriz = true
  }else{
    this.matriz = false

  }
}

}

