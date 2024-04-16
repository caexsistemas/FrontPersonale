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
import { element } from "protractor";
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
  selector: 'app-retribution.dialog',
  templateUrl: './retribution.dialog.component.html',
  styleUrls: ['./retribution.dialog.component.css']
})
export class RetributionDialog  {
  endpoint: string = "/retribution";
  maskDNI = global.maskDNI;
  title: string = null;
  view: string = null;
  formSelec: FormGroup;
  permissions: any = null;
  component = "/nomi/retribution";
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
 
  PersonaleInfo:any = [];
  
  perid:any = []
  public clickedRows;
  public cuser: any = JSON.parse(localStorage.getItem("currentUser"));
  //OUTPUTS
  @Output() loading = new EventEmitter();
  @Output() reload = new EventEmitter();
  @ViewChildren(MatSort) sort = new QueryList<MatSort>();

  constructor(
    public dialogRef: MatDialogRef<RetributionDialog>,
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
        this.title = "Liquidación de Prima";
      break;
      case "update":
        this.idSig = this.data.codigo;       
        this.initForms();
        this.title = "Actualizar Liquidación de Prima ";
      break;
      case "view":
        this.title ="Información General"
        this.idSig = this.data.codigo;
        this.loading.emit(true);
        this.WebApiService.getRequest(this.endpoint + "/"+ this.idSig, {
          token: this.cuser.token,
          idUser: this.cuser.iduser,
          modulo: this.component
        }).subscribe(
          (data) => {
            if (data.success == true) {
              this.selection = data.data["getSelectData"][0];
              const formatoPeso = new Intl.NumberFormat('es-CO', {
                style: 'currency',
                currency: 'COP'
             });

                this.selection.sal_pro= formatoPeso.format(this.selection.sal_pro);
                this.selection.val_pri = formatoPeso.format(this.selection.val_pri);
                this.selection.ant_pri = formatoPeso.format(this.selection.ant_pri);
                this.selection.others_dev = formatoPeso.format(this.selection.others_dev);
                this.selection.others_ded = formatoPeso.format(this.selection.others_ded);

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
      document: new FormControl("",),
      idPersonale: new FormControl("", ),
      fec_ini: new FormControl("", ),
      // fec_rad: new FormControl("", ),
      fec_fin: new FormControl("",),
      day_per: new FormControl("", ),
      day_aus: new FormControl("",),
      day_liq: new FormControl("",),
      sal_pro: new FormControl("",),
      val_pri: new FormControl("",),
      ant_pri: new FormControl("",),
      semester: new FormControl("",),
      others_dev: new FormControl("",),
      others_ded: new FormControl("",),
      createUser: new FormControl(this.cuser.iduser),
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
          this.perid        = data.data["getSemester"];
          this.PersonaleInfo = data.data['getDataPersonale'];        
          
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
        retribution: this.formSelec.value,
       
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
      action: "getParamUpdateSet",
      id: this.idSig,
      token: this.cuser.token,
      idUser: this.cuser.iduser,
      modulo: this.component
      // tipRole:this.tipRole
    }).subscribe(
      (data) => {
        this.formSelec.get("idPersonale").setValue(data.data["getSelecUpdat"][0].idPersonale);
        this.formSelec.get("document").setValue(data.data["getSelecUpdat"][0].document);
        this.formSelec.get("fec_ini").setValue(data.data["getSelecUpdat"][0].fec_ini);
        this.formSelec.get("fec_fin").setValue(data.data["getSelecUpdat"][0].fec_fin);
        this.formSelec.get("day_per").setValue(data.data["getSelecUpdat"][0].day_per);
        this.formSelec.get("day_aus").setValue(data.data["getSelecUpdat"][0].day_aus);
        this.formSelec.get("day_liq").setValue(data.data["getSelecUpdat"][0].day_liq);
        this.formSelec.get("sal_pro").setValue(data.data["getSelecUpdat"][0].sal_pro);
        this.formSelec.get("val_pri").setValue(data.data["getSelecUpdat"][0].val_pri);
        this.formSelec.get("ant_pri").setValue(data.data["getSelecUpdat"][0].ant_pri);
        this.formSelec.get("semester").setValue(data.data["getSelecUpdat"][0].semester);
        this.formSelec.get("others_dev").setValue(data.data["getSelecUpdat"][0].others_dev);
        this.formSelec.get("others_ded").setValue(data.data["getSelecUpdat"][0].others_ded);
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
  
  // onSelectionAttributes(event){
  //  // gerencia 14/17
  //  //sig 14/5
   
  //  if(event == '14/17'){
  //       this.responsibleProcess =  this.managemenProcess;
  //     }else if(event == '14/5'){
  //       this.responsibleProcess = this.sigProcess;
  //       }else if(event == '14/22'){
  //         this.responsibleProcess = this.logProcess;
  //         }else if (event == '14/23'){
  //           this.responsibleProcess = this.comProcess;
  //          }else if(event == '14/24'){
  //           this.responsibleProcess = this.comunProcess;
  //           }else if(event == '14/25'){
  //             this.responsibleProcess = this.adminProcess;
  //            }else if (event == '14/4'){
  //             this.responsibleProcess = this.tecnoProcess;
  //             }else if ( event == '14/6'){
  //               this.responsibleProcess = this.talentProcess;
  //               }else if(event == '14/1'){
  //                 this.responsibleProcess = this.contactProcess;
                
  //             }else{
  //               this.responsibleProcess = null;
  //             }
    
  
  // }
  // onSelectionImplement(event){
  //   this.fecPro = event
  //   this.onSelectionClosing(this.fecPro,this.fecEje);
    

  // }
  // onSelectionEjecc(event){
  //   this.fecEje = event;
  //  this.onSelectionClosing(this.fecPro,this.fecEje);

  // }
  
  // onSelectionClosing(imp,ejec){
  //   this.typeejc = new Date(ejec)
  //   this.typimp = new Date(imp)
   

  //   if(this.typeejc <=  this.typimp){
  //         this.typeNo = 'Oportuno';
  //         this.formSelec.get('opo_cier').setValue( this.typeNo);
          
  //   }else if ( this.typeejc > this.typimp){
  //         this.typeNo = 'Inoportuno';
  //         this.formSelec.get('opo_cier').setValue( this.typeNo);

  //   }else{
  //     this.cierr = null;
  //   }
    

  // }
  // onSelectionPerson(event){
  //   let exitsPersonal = this.PersonaleInfo.find(element => element.document == event);
  
  //   if( exitsPersonal ){
  //       this.formTraining.get('idPersonale').setValue(exitsPersonal.idPersonale);       
  //   }        
  // }
//   getDocuInvalid(){
//       //  return this.formSelec.get('car_sol').invalid && this.formSelec.get('car_sol').touched;
//   }
//   getTypeInvalid(){
//     // return this.formSelec.get('tip_req').invalid && this.formSelec.get('tip_req').touched;
// }
//   getSalaryInvalid(){
//     // return this.formSelec.get('salary').invalid && this.formSelec.get('salary').touched;
//   }
//   getNumInvalid(){
//     // return this.formSelec.get('num_vac').invalid && this.formSelec.get('num_vac').touched;
// }
//   getJustInvalid(){
//     // return this.formSelec.get('justification').invalid && this.formSelec.get('justification').touched;
//   }

  getDocument(){
    return this.formSelec.get('document').invalid && this.formSelec.get('document').touched;
  }
}
