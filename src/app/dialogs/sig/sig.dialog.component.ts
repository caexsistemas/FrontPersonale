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
import { HandlerAppService } from "../../services/handler-app.service";
import { environment } from "../../../environments/environment";
import { global } from "../../services/global";
import { MatTableDataSource } from "@angular/material/table";
import { MatSort } from "@angular/material/sort";
import { Observable } from "rxjs";
import { NovedadesnominaServices } from "../../services/novedadesnomina.service";
import { DatePipe } from "@angular/common";
import { WebApiService } from "../../services/web-api.service";
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
  selector: 'app-sig.dialog',
  templateUrl: './sig.dialog.component.html',
  styleUrls: ['./sig.dialog.component.css']
})
export class SigDialog  {
  endpoint: string = "/sig";
  maskDNI = global.maskDNI;
  title: string = null;
  view: string = null;
  formSelec: FormGroup;
  permissions: any = null;
  component = "/sig/sigReport";
  dataSource: any = [];
  idSig:number = null;
  archivo = {
    nombre: null,
    nombreArchivo: null,
    base64textString: null,
  };
  //History
  historyMon: any = [];
  check: boolean;
  displayedColumns: any = [];
  selection:any = [];
  confor:any = [];
  work:any = [];
  factor:any = [];
  cierr: any = [];
  state:any = [];
  calidad:any = []
  PersonaleInfo:any = [];
  managemenProcess: any = []
  responsibleProcess:any = [];
  sigProcess:any = [];
  logProcess:any = [];
  contactProcess:any = [];
  comProcess:any = [];
  comunProcess:any = [];
  adminProcess:any = [];
  talentProcess:any = [];
  tecnoProcess:any = [];
  fecPro:any = [];
  fecEje:any =[];
  typeNo:any = []
  typeejc:any = []
  typimp:any = []
  public clickedRows;
  public cuser: any = JSON.parse(localStorage.getItem("currentUser"));
  //OUTPUTS
  @Output() loading = new EventEmitter();
  @Output() reload = new EventEmitter();
  @ViewChildren(MatSort) sort = new QueryList<MatSort>();

  constructor(
    public dialogRef: MatDialogRef<SigDialog>,
    private WebApiService: WebApiService,
    private handler: HandlerAppService,
    @Inject(MAT_DIALOG_DATA) public data,
    public dialog: MatDialog,
    private uploadFileService: NovedadesnominaServices
  ) {
    this.view = this.data.window;
    this.idSig = null;

    switch (this.view) {
      case "create":
        this.initForms();
        this.title = "Reporte de no conformidades";
      break;
      case "update":
        this.idSig = this.data.codigo;       
        this.initForms();
        this.title = "Actualizar Reporte de no conformidades";
      break;
      case "view":
        this.idSig = this.data.codigo;
        this.loading.emit(true);
        this.WebApiService.getRequest(this.endpoint + "/"+ this.idSig, {
          token: this.cuser.token,
          idUser: this.cuser.iduser,
          modulo: this.component
        }).subscribe(
          (data) => {
            if (data.success == true) {
              this.selection = data.data["getDataPerson"][0];
              // this.typeReq = this.selection.tip_req;
              // ( !(this.typeReq == '62/1' || this.typeReq == '62/2' ) ? this.checked = true : this.checked );
              // ( this.typeReq == '62/4' ) ? this.check = false : this.check = true;

              // this.cancel= this.selection.state;
              // ( this.cancel == '65/6') ? this.title = ' Requisición Cancelada': '';
              // this.typeCargo = this.selection.car_sol;

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
      document: new FormControl("",[Validators.required]),
      idPersonale: new FormControl("", [Validators.required]),
      type: new FormControl("", [Validators.required]),
      fec_rep: new FormControl("", [Validators.required]),
      fec_pla: new FormControl("",[Validators.required]),
      are_res: new FormControl("", [Validators.required]),
      pro_res: new FormControl("",[Validators.required]),
      resp: new FormControl("",[Validators.required]),
      des_conf: new FormControl("",[Validators.required]),
      fact: new FormControl("",[Validators.required]),
      cau_conf: new FormControl("",[Validators.required]),
      corr: new FormControl("",[Validators.required]),
      pla_acc: new FormControl("",[Validators.required]),
      res_acc: new FormControl("",[Validators.required]),
      fec_prop: new FormControl("",[Validators.required]),
      fec_eje: new FormControl("",[Validators.required]),
      opo_cier: new FormControl("",[Validators.required]),
      state: new FormControl("",[Validators.required]),
      evi: new FormControl("",[Validators.required]),
      con_are_cal: new FormControl("",[Validators.required]),
      obs_sig: new FormControl("",[Validators.required]),
      create_User: new FormControl(this.cuser.iduser),
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
          this.confor        = data.data["getTipNo"];
          this.work        = data.data["getArea"];
          this.factor = data.data["getFactor"];
          this.cierr = data.data["tipCierre"];
          this.state = data.data["stateConf"];
          this.PersonaleInfo = data.data['getDataPersonale']; 
          this.calidad = data.data["calid"];
          this.managemenProcess = data.data["managemenProcess"];
          this.sigProcess = data.data["sigProcess"];
          this.logProcess = data.data["logProcess"];
          
          this.contactProcess = data.data["contactProcess"];
          this.comProcess = data.data["comProcess"];
          this.comunProcess = data.data["comunProcess"];
          this.adminProcess = data.data["adminProcess"];
          this.talentProcess = data.data["talentProcess"];
          this.tecnoProcess = data.data["tecnoProcess"];

          // this.typeRequisition = data.data["getRequisition"];sigProcess
          // this.typeMatriz      = data.data["getMatriz"].slice(0, 3);getFactorstateConf
          // this.state         = data.data['getCancel'].slice(5);

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
  onSelectionChange(event){
        
       
    let exitsPersonal = this.PersonaleInfo.find(element => element.document == event);
  
    if( exitsPersonal ){
      
        this.formSelec.get('idPersonale').setValue(exitsPersonal.idPersonale);
        // this.formNomi.get('car_user').setValue(exitsPersonal.idArea);
       
    }        
  }
  getDataUpdate() {

    this.loading.emit(true);
    this.WebApiService.getRequest(this.endpoint, {
      action: "getParamUpdateSig",
      id: this.idSig,
      token: this.cuser.token,
      idUser: this.cuser.iduser,
      modulo: this.component
      // tipRole:this.tipRole
    }).subscribe(
      (data) => {
        this.formSelec.get("idPersonale").setValue(data.data["getDataUpda"][0].idPersonale);
        this.formSelec.get("document").setValue(data.data["getDataUpda"][0].document);
        this.formSelec.get("fec_rep").setValue(data.data["getDataUpda"][0].fec_rep);
        this.formSelec.get("fec_pla").setValue(data.data["getDataUpda"][0].fec_pla);
        this.formSelec.get("type").setValue(data.data["getDataUpda"][0].type);
        this.formSelec.get("are_res").setValue(data.data["getDataUpda"][0].are_res);
        this.formSelec.get("pro_res").setValue(data.data["getDataUpda"][0].pro_res);
        this.formSelec.get("resp").setValue(data.data["getDataUpda"][0].resp);
        this.formSelec.get("des_conf").setValue(data.data["getDataUpda"][0].des_conf);
        this.formSelec.get("cau_conf").setValue(data.data["getDataUpda"][0].cau_conf);
        this.formSelec.get("fact").setValue(data.data["getDataUpda"][0].fact);
        this.formSelec.get("corr").setValue(data.data["getDataUpda"][0].corr);
        this.formSelec.get("pla_acc").setValue(data.data["getDataUpda"][0].pla_acc);
        this.formSelec.get("res_acc").setValue(data.data["getDataUpda"][0].res_acc);
        this.formSelec.get("fec_prop").setValue(data.data["getDataUpda"][0].fec_prop);
        this.formSelec.get("fec_eje").setValue(data.data["getDataUpda"][0].fec_eje);
        this.formSelec.get("opo_cier").setValue(data.data["getDataUpda"][0].opo_cier);
        this.formSelec.get("state").setValue(data.data["getDataUpda"][0].state);
        this.formSelec.get("evi").setValue(data.data["getDataUpda"][0].evi);
        this.formSelec.get("con_are_cal").setValue(data.data["getDataUpda"][0].con_are_cal);
        this.formSelec.get("obs_sig").setValue(data.data["getDataUpda"][0].obs_sig);
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
      
    }
    if (this.formSelec.valid) {
      this.loading.emit(true);
      this.WebApiService.putRequest(this.endpoint+'/'+this.idSig,body,{
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
  //   this.mat = e

  // }
  
  onSelectionAttributes(event){
   // gerencia 14/17
   //sig 14/5
   
   if(event == '14/17'){
        this.responsibleProcess =  this.managemenProcess;
      }else if(event == '14/5'){
        this.responsibleProcess = this.sigProcess;
        }else if(event == '14/22'){
          this.responsibleProcess = this.logProcess;
          }else if (event == '14/23'){
            this.responsibleProcess = this.comProcess;
           }else if(event == '14/24'){
            this.responsibleProcess = this.comunProcess;
            }else if(event == '14/25'){
              this.responsibleProcess = this.adminProcess;
             }else if (event == '14/4'){
              this.responsibleProcess = this.tecnoProcess;
              }else if ( event == '14/6'){
                this.responsibleProcess = this.talentProcess;
                }else if(event == '14/1'){
                  this.responsibleProcess = this.contactProcess;
                
              }else{
                this.responsibleProcess = null;
              }
    
  
  }
  onSelectionImplement(event){
    this.fecPro = event
    this.onSelectionClosing(this.fecPro,this.fecEje);
    

  }
  onSelectionEjecc(event){
    this.fecEje = event;
   this.onSelectionClosing(this.fecPro,this.fecEje);

  }
  
  onSelectionClosing(imp,ejec){
    this.typeejc = new Date(ejec)
    this.typimp = new Date(imp)
   

    if(this.typeejc <=  this.typimp){
          this.typeNo = 'Oportuno';
          this.formSelec.get('opo_cier').setValue( this.typeNo);
          
    }else if ( this.typeejc > this.typimp){
          this.typeNo = 'Inoportuno';
          this.formSelec.get('opo_cier').setValue( this.typeNo);

    }else{
      this.cierr = null;
    }
    

  }
  // onSelectionPerson(event){
  //   let exitsPersonal = this.PersonaleInfo.find(element => element.document == event);
  
  //   if( exitsPersonal ){
  //       this.formTraining.get('idPersonale').setValue(exitsPersonal.idPersonale);       
  //   }        
  // }
  getDocuInvalid(){
      //  return this.formSelec.get('car_sol').invalid && this.formSelec.get('car_sol').touched;
  }
  getTypeInvalid(){
    // return this.formSelec.get('tip_req').invalid && this.formSelec.get('tip_req').touched;
}
  getSalaryInvalid(){
    // return this.formSelec.get('salary').invalid && this.formSelec.get('salary').touched;
  }
  getNumInvalid(){
    // return this.formSelec.get('num_vac').invalid && this.formSelec.get('num_vac').touched;
}
  getJustInvalid(){
    // return this.formSelec.get('justification').invalid && this.formSelec.get('justification').touched;
  }


}
