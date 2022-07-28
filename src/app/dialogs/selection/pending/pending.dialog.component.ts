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

  endpoint: string = "/requisition";
  maskDNI = global.maskDNI;
  title: string = null;
  view: string = null;
  permissions: any = null;
  formSelec: FormGroup;
  selection: any = [];
  position: any = [];
  pos: any = [];
  typeRequisition: any = [];
  typeManage: any = [];
  idSel: number = null;
  rol: number;
  retro: boolean = true;
  retro2: boolean = true;
  retro3: boolean = true;
  retro4: boolean = true;
  idUser: number = null;
  component = "/selection/requisition";
  dataSource: any = [];
  requ: any = [];
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
        console.log('cuser=>',this.cuser);
        console.log('idsel=>',this.idSel);
        console.log('iduser=>',this.idUser);
        if( this.idUser == 63 ){
          this.retro = false;
        }else if(this.idUser == 44){
            this.retro2 = false;

        } else if(this.idUser == 58 ){
          this.retro3 = false;
        }
          else if( this.idUser == 43){
            this.retro4 = false;
          }
         

          // }else{
          //   this.retro = true;

          // }
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
        idUser: this.cuser.iduser,
        idSel: this.data.codigo
    }).subscribe(
      (data) => {
        if (data.success == true) {
          //DataInfo
          this.selection = data.data["getDataTechno"];
          this.position = data.data["getPosition"];
          this.typeRequisition = data.data["getRequisition"];
          this.pos = data.data["getPost"];
          this.typeManage = data.data["getManage"];
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
        idUser: this.cuser.iduser,
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
        this.requ = data.data["getSelecUpdat"][0].tip_req;
        console.log('rrr', this.requ);
      },
      (error) => {
        this.handler.showError();
        this.loading.emit(false);
      }
    );
  }
  openDialog(e) {
      if( e == '30/2'){
        console.log('id',e);
          this.dialog.open(ApprovalDialog);
        }else if(e == '30/3'){
          this.dialog.open(DeclineDialog);
        }else if(e == '30/1'){
          this.dialog.open(Pending);
        }    
  }
  openDialog2(e){
      if( e == '30/2'){
        this.dialog.open(ApprovalDialog);
      }else if(e == '30/3'){
        this.dialog.open(DeclineDialog);
      }else if(e == '30/1'){
        this.dialog.open(Pending);
      }  
  }
  openDialog3(e){
    if( e == '30/2'){
      this.dialog.open(ApprovalDialog);
    }else if(e == '30/3'){
      this.dialog.open(DeclineDialog);
    }else if(e == '30/1'){
      this.dialog.open(Pending);
    }  
}
  // openDialogRe(){
  //   if(this.idUser == 63){

  //   this.dialog.open(DeclineDialog);
  //   }
  // }
  onSubmitUpdate(){

    let body = {
        listas: this.formSelec.value,  
        //  id: this.idfeed
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
  // onSelectBirth(idet){
  //   console.log('ap=>',idet)
  //   if(idet == true){
  //     this.dialog.open(ApprovalDialog);
  //   }
// 
  // }
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

