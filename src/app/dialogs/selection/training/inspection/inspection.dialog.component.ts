
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
import { decimalDigest } from "@angular/compiler/src/i18n/digest";
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
  selector: "app-inspection",
  templateUrl: "./inspection.dialog.component.html",
  styleUrls: ["./inspection.dialog.component.css"],
})

export class InspectionDialog {
  endpoint: string = "/requisition";
  maskDNI = global.maskDNI;
  title: string = null;
  view: string = null;
  permissions: any = null;
  formSelec: FormGroup;
  formInsp:FormGroup;
  formTraining: FormGroup;
  formVac: FormGroup;
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
  checked = 0;
  disabled = false;
  matriz: boolean = false;
  typeCargo: any = [];
  PersonaleInfo: any = [];
  trainingType: any = [];
  methodology: any = [];
  cargo:any = [];
  typeDocument: any = [];
  depart: any = [];
  citytBirth: any = [];
  eps: any= [];
  pension: any= [];
  area: any= [];
  stateFormation: any = [];
  asist: any =[];
  

  public clickedRows;
  public cuser: any = JSON.parse(localStorage.getItem("currentUser"));
  //OUTPUTS
  @Output() loading = new EventEmitter();
  @Output() reload = new EventEmitter();
  @ViewChildren(MatSort) sort = new QueryList<MatSort>();

  constructor(
    public dialogRef: MatDialogRef<InspectionDialog>,
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
        this.title = "Formador";
      break;
      case "update":
        // this.rol = this.cuser.role;
        console.log('++',this.data);
        this.idSel = this.data.codigo;
        this.initForms();
        this.title = "Seguimiento Formacion";
        break;
      case "training":
        // this.rol = this.cuser.role;
        this.idSel = this.data.codigo;
        console.log('dat=>',this.data);
        console.log('idsel=>',this.idSel);
        this.initForms();
        this.title = "Ingresar Formador";
      break;
      case "view":
        this.idSel = this.data.codigo;
        console.log('**',this.idSel);
        this.loading.emit(true);
        this.WebApiService.getRequest(this.endpoint+"/"+this.idSel, {
          // action: "getData",
          // id: this.idSel,
          // idUser: this.cuser.iduser,

        }).subscribe(
          (data) => {
            if (data.success == true) {
              this.selection = data.data[0][0];
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
      this.formInsp = new FormGroup({
        day1: new FormControl(false),
        day2: new FormControl(false),
        day3: new FormControl(false),
        day4: new FormControl(""),
        day5: new FormControl(""),
        day6: new FormControl(""),
        day7: new FormControl(""),
        day8: new FormControl(""),
        day9: new FormControl(""),
        day10: new FormControl(""),
        eva_ind_sst: new FormControl(""),
        eva_ind_cal: new FormControl(""),
        cer_pro_tel_hog: new FormControl(""),
        cer_pro_mov: new FormControl(""),
        cer_sis_inf_pol: new FormControl(""),
        cer_tyt: new FormControl(""),
        cer_in1: new FormControl(""),
        cer_in2: new FormControl(""),
        cer_in3: new FormControl(""),
        cer11: new FormControl(""),
        cer12: new FormControl(""),
        pro_gen: new FormControl(""),
        pro_cer: new FormControl(""),
        cer: new FormControl(""),
        obs: new FormControl(""),
        tot_asi: new FormControl(""),
        idsel: new FormControl(this.idSel),
        create_User: new FormControl(this.cuser.iduser)


    });
  }
  getDataInit() {
    this.loading.emit(false);
    this.WebApiService.getRequest(this.endpoint, {
      action: "getParamView",
      idSel: this.data.codigo
    }).subscribe(
      (data) => {
        if (data.success == true) {
          //DataInfo
          this.selection = data.data["getDataTechno"];
          this.position        = data.data["getPosition"];
          this.typeRequisition = data.data["getRequisition"];
          this.typeMatriz      = data.data["getMatriz"].slice(0, 3);
          this.PersonaleInfo = data.data['getDataPersonale'];
          this.trainingType = data.data['getTraining'];
          this.methodology = data.data['getMethod'];
          this.typeDocument = data.data["getDocument"];
          this.depart = data.data["getDepart"];
          this.citytBirth  = data.data["getCity"];
          this.position  = data.data["getPosition"];
          this.eps  = data.data["getEps"];
          this.pension  = data.data["getPension"];
          this.area  = data.data["getArea"];
          this.stateFormation  = data.data["getFinal"];
          this.asist = data.data['getAsist'];

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
    if (this.formInsp.valid) {
      // this.loading.emit(true);
      let body = {
        listas: this.formInsp.value,
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
      action: "getinspectionUp",
      id: this.idSel,
      // tipRole:this.tipRole
    }).subscribe(
      (data) => {
        this.formInsp.get("day1").setValue(data.data["getSelecUpdat"][0].day1);
        this.formInsp.get("day2").setValue(data.data["getSelecUpdat"][0].day2);
        this.formInsp.get("day3").setValue(data.data["getSelecUpdat"][0].day3);
        this.formInsp.get("day4").setValue(data.data["getSelecUpdat"][0].day4);
        this.formInsp.get("day5").setValue(data.data["getSelecUpdat"][0].day5);
        this.formInsp.get("day6").setValue(data.data["getSelecUpdat"][0].day6);
        this.formInsp.get("day7").setValue(data.data["getSelecUpdat"][0].day7);
        this.formInsp.get("day8").setValue(data.data["getSelecUpdat"][0].day8);
        this.formInsp.get("day9").setValue(data.data["getSelecUpdat"][0].day9);
        this.formInsp.get("day10").setValue(data.data["getSelecUpdat"][0].day10);
        this.formInsp.get("eva_ind_sst").setValue(data.data["getSelecUpdat"][0].eva_ind_sst);
        this.formInsp.get("eva_ind_cal").setValue(data.data["getSelecUpdat"][0].eva_ind_cal);
        this.formInsp.get("cer_pro_tel_hog").setValue(data.data["getSelecUpdat"][0].cer_pro_tel_hog);
        this.formInsp.get("cer_pro_mov").setValue(data.data["getSelecUpdat"][0].cer_pro_mov);
        this.formInsp.get("cer_sis_inf_pol").setValue(data.data["getSelecUpdat"][0].cer_sis_inf_pol);
        this.formInsp.get("cer_tyt").setValue(data.data["getSelecUpdat"][0].cer_tyt);
        this.formInsp.get("cer_in1").setValue(data.data["getSelecUpdat"][0].cer_in1);
        this.formInsp.get("cer_in2").setValue(data.data["getSelecUpdat"][0].cer_in2);
        this.formInsp.get("cer_in3").setValue(data.data["getSelecUpdat"][0].cer_in3);
        this.formInsp.get("cer11").setValue(data.data["getSelecUpdat"][0].cer11);
        this.formInsp.get("cer12").setValue(data.data["getSelecUpdat"][0].cer12);
        this.formInsp.get("pro_gen").setValue(data.data["getSelecUpdat"][0].pro_gen);
        this.formInsp.get("idsel").setValue(data.data["getSelecUpdat"][0].idsel);
        // this.cargo =data.data["getSelecUpdat"][0].car_sol
      //  console.log('depp=>',data.data["getSelecUpdat"][0].dep_nac);
      //  console.log('ciu=>',data.data["getSelecUpdat"][0].ciu_nac);
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
        formacion:this.formTraining.value,
        vacant: this.formVac.value,
        seguimiento: this.formInsp.value   
    }
    if (this.formInsp.valid) {
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
  resultado = 0;
  eva_ind_sst: number;
  eva_ind_cal: number;
  val1: any;
  
  onProme(e){
    console.log('=>',e)
    this.resultado = (this.formInsp.value.eva_ind_sst + this.formInsp.value.eva_ind_cal)
    console.log("++",this.resultado)
    // this.result = this.
    // this.result = ((this.formInsp.controls['eva_ind_sst'].value) + (this.formInsp.controls['eva_ind_cal'].value))
    // console.log("sum=>",this.result)
  //  for(let pro in e){
  //   console.log("sum=>",pro)
  //  }

    // for(let val of e){
    //   console.log("valor=>",val)
    //   this.result =+val
    //   console.log("sum=>",this.result)
    // }

  }
  onSumar():void {
   
    if(this.view == 'update'){
      this.resultado = (this.formInsp.value.eva_ind_sst + this.formInsp.value.eva_ind_cal + this.formInsp.value.cer_pro_tel_hog + this.formInsp.value.cer_pro_mov +
        this.formInsp.value.cer_sis_inf_pol +  this.formInsp.value.cer_tyt +   this.formInsp.value.cer_in1 + this.formInsp.value.cer_in2 +
        this.formInsp.value.cer_in3 +  this.formInsp.value.cer11 +  this.formInsp.value.cer12) /11 ;

      this.formInsp.value.pro_gen = this.resultado
    }
  }
    
    
  }
  

  


