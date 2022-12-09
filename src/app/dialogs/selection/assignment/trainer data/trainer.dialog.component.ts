
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
    // this.rol = this.cuser.role;

    switch (this.view) {
      case "create":
        this.initForms();
        this.title = "Formador";
      break;
      case "update":
        this.rol = this.cuser.role;
        this.idSel = this.data.codigo;
        this.matriz = this.data.tipoMat
        this.initForms();
        this.title = "Asignación de Formador";
        break;
      case "training":
        // this.rol = this.cuser.role;
        this.idSel = this.data.codigo;
        // console.log('dat=>',this.data);
        // console.log('idsel=>',this.idSel);
        console.log('num=>',this.data);
        this.initForms();
        this.title = "Ingresar Formador";
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
              console.log('==>',this.selection.car_sol);
              this.typeCargo = this.selection.car_sol
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
      // car_sol: new FormControl(""),
      // num_vac: new FormControl(""),
      // salary: new FormControl(""),
      // tip_req: new FormControl(""),
      // matrizarp: new FormControl(""),
      // justification: new FormControl(""),
      state: new FormControl(""),
      aprobacion1: new FormControl(""),
      aprobacion2: new FormControl(""),
      aprobacion3: new FormControl(""),
      day_for: new FormControl(""),
      create_User: new FormControl(this.cuser.iduser),

    });this.formVac = new FormGroup({
      // fec_sel:  new FormControl(""),
      // tip_doc: new FormControl(""),
      // document: new FormControl(""),
      // nom_com: new FormControl(""),
      // birthDate: new FormControl(""),
      // ciu_nac: new FormControl(""),
      // dep_nac: new FormControl(""),
      // are_tra: new FormControl(""),
      // car_sol: new FormControl(""),
      // eps: new FormControl(""),
      // pension: new FormControl(""),
      // obs_vac: new FormControl(""),
      create_User: new FormControl(this.cuser.iduser),
      con_fin: new FormControl(""),
      // idGender: new FormControl(""),
      // age: new FormControl(""),
      // idsel: new FormControl(this.idTec)
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

              // this.typeMatriz.slice(0, 2);
        
          // console.log('==>mt',this.typeMatriz)


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
      // this.loading.emit(true);
      let body = {
        listas: this.formSelec.value,
        formacion: this.formTraining.value
      };
      console.log('req=>',body);
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
      action: "getTrainUpdateSet",
      id: this.idSel,
      token: this.cuser.token,
      idUser: this.cuser.iduser,
      modulo: this.component
      // tipRole:this.tipRole
    }).subscribe(
      (data) => {

        // this.formSelec.get("idPersonale").setValue(data.data["getSelecUpdat"][0].idPersonale);
        // this.formSelec.get("document").setValue(data.data["getSelecUpdat"][0].document);
        // this.formSelec.get("car_sol").setValue(data.data["getSelecUpdat"][0].car_sol);
        // this.formSelec.get("num_vac").setValue(data.data["getSelecUpdat"][0].num_vac);
        // this.formSelec.get("salary").setValue(data.data["getSelecUpdat"][0].salary);
        // this.formSelec.get("matrizarp").setValue(data.data["getSelecUpdat"][0].matrizarp);
        // this.formSelec.get("tip_req").setValue(data.data["getSelecUpdat"][0].tip_req);
        // this.formSelec.get("justification").setValue(data.data["getSelecUpdat"][0].justification);
        // this.formSelec.get("observations").setValue(data.data["getSelecUpdat"][0].observations);
        // this.formSelec.get("aprobacion1").setValue(data.data["getSelecUpdat"][0].aprobacion1);
        // this.formSelec.get("aprobacion2").setValue(data.data["getSelecUpdat"][0].aprobacion2);
        // this.formSelec.get("state").setValue(data.data["getSelecUpdat"][0].state);

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
    console.log('cargo=>',idet)
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
  days = 0;
  
//   calculate1(event){
//     if(event){
//       this.CheckTrue = false;
//       this.prue = event;
//       // this.calculateDays(this.prue,this.prue2);
//       this.holiday.holiday(this.prue,this.prue2);
//     }
   
//   }
//    calculate(event){  
//     if(event){
//       this.prue2 = event;
//       // this.calculateDays(this.prue,this.prue2);
//       this.totalDays(this.prue2);
//       this.holiday.holiday(this.prue,this.prue2);
  
//       this.totaLfecHol = this.holiday.holiday(this.prue,this.prue2);
//       this.fec_fin = this.totaLfecHol[0];
//       this.sumTotalMen = this.totaLfecHol[1];
//       this.formTraining.get('fec_fin').setValue(this.fec_fin);
//       // this.formSelec.get('fec_rei').setValue(this.sumTotalMen);      
//       // this.formSelec.get('immediateBoss').setValue(this.jefe);
//     }
    

//   }
//   // daysCom(event){
//   //   this.comp = event;
//   //   this.totalDays(this.prue2,this.comp);

//   // }
//   totalDays(d1){
//     // console.log(" dias solocitados =>",d1, "dias compensar =>",d2)
//     this.totalFin = (d1);
//     // console.log("total dias solicitados =>",this.totalFin);
//     if(this.totalFin > 15){
//       this.handler.showError("No puedes solicitar mas de 15 dias!");
//       this.reload.emit();
//       this.loading.emit(false);
//     }
//      // this.totalFii(this.totalFin,this.prue2);
// }
}
  
  
  
   

  





