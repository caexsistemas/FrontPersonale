
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
import { empty, Observable } from "rxjs";
import { NovedadesnominaServices } from "../../../../services/novedadesnomina.service";
import { DatePipe } from "@angular/common";
import { WebApiService } from "../../../../services/web-api.service";
import { decimalDigest } from "@angular/compiler/src/i18n/digest";
import { exists } from "fs";
import { TrainingDialog } from "../training.dialog.component";
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
  endpoint: string = "/training";
  // endpoint: string = "/vacant";
  maskDNI = global.maskDNI;
  title: string = null;
  view: string = null;
  permissions: any = null;
  formSelec: FormGroup;
  formInsp:FormGroup;
  formTraining: FormGroup;
  formVac: FormGroup;
  selection: any = [];
  vacant: any = [];
  position: any = [];
  typeRequisition: any = [];
  idSel: number = null;
  rol: number;
  typeMatriz: any = [];
  component      = "/selection/training";
  // component = "/selection/assignment";
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
  idvac: number = null;
  num:number = null;
  nume:number = null;
  element: any = [];
  product: any = [];
  asiste: any = [];
  name: any = [];
  totalHelp: any = [];
  idUser: number = null;
  nomi: boolean;
  stateReq: any = [];
  idreq: any =[];
  concept: boolean;
  conceptNo: boolean;
  // ---------------{{{{{{}}}}}}
  asistt:number=0;
  noAsistt = 0;
  tto = 0;
  ex = 0;
  idIns: number = null;
  // ---------------------

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
    this.idUser= this.cuser.iduser

    // this.rol = this.cuser.role;
    if( this.idUser == 255 || this.idUser == 62 ){
      this.nomi = true;
    }else{
      this.nomi = false;
    }
    switch (this.view) {
      
      case "state":
        this.idSel = this.data;
        console.log('==>',this.data)
        this.initForms();
        this.title = "Actualizar Formación";
      break;
      case "update":
        this.idvac = this.data.codigo;
        this.name = this.data.name;
        this.num = this.data.num;
        this.idIns = this.data.isnp;
        // console.log('id',this.data)
        this.idreq = this.data.id
        this.stateReq = this.data.state
       

        if(this.num){
         
          for (let day = 1; day <= this.num; day++) {
            this.element.push(day); 
          }
          // console.log( this.element.length )
        }

        this.initForms();
        this.title = "Seguimiento Formación";
        break;
      case "training":
        // this.rol = this.cuser.role;
        this.idSel = this.data.codigo;
        this.initForms();
        this.title = "Ingresar Formador";
      break;
      case "view":
        this.idSel = this.data.codigo;
        this.name = this.data.name;
        this.nume = this.data.num;
        if(this.nume){
         
          for (let pre = 1; pre <= this.nume; pre++) {
            this.element.push(pre); 
          }
          // console.log( this.element.length )
        }
        this.loading.emit(true);
        this.WebApiService.getRequest(this.endpoint+"/"+this.idSel, {
          // action: "getData",
          // id: this.idSel,
          // idUser: this.cuser.iduser,
          token: this.cuser.token,
          idUser: this.cuser.iduser,
          modulo: this.component

        }).subscribe(
          (data) => {
            if (data.success == true) {
              this.selection = data.data[0][0];
              this.asiste = data.data[0][0];
              this.vacant = data.data['getSelectData'][0];
              this.vacant.con_fin == '70/1'? this.concept = true: this.concept = false;
              this.vacant.con_fin == '70/2'? this.conceptNo = true: this.conceptNo = false;
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
      idsel: new FormControl(this.idreq),
      state: new FormControl(this.stateReq),
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
      birthDate: new FormControl(""),
      create_User: new FormControl(this.cuser.iduser),
      con_fin: new FormControl(""),
      des_can: new FormControl(""),
      asp_pos: new FormControl(""),
      asp_for: new FormControl(""),
      mot_no: new FormControl(""),
      idins: new FormControl(this.idIns),
    });
      this.formInsp = new FormGroup({
        day1: new FormControl(""),
        day2: new FormControl(""),
        day3: new FormControl(""),
        day4: new FormControl(""),
        day5: new FormControl(""),
        day6: new FormControl(""),
        day7: new FormControl(""),
        day8: new FormControl(""),
        day9: new FormControl(""),
        day10: new FormControl(""),
        day11: new FormControl(""),
        day12: new FormControl(""),
        day13: new FormControl(""),
        day14: new FormControl(""),
        day15: new FormControl(""),
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
        idvac: new FormControl(this.idvac),
        aux_tra: new FormControl(""),
        aux_tot: new FormControl(""),
        create_User: new FormControl(this.cuser.iduser)


    });
  }
  getDataInit() {
    this.loading.emit(false);
    this.WebApiService.getRequest(this.endpoint, {
      action: "getParamView",
      idvac: this.data.codigo,
      token: this.cuser.token,
      idUser: this.cuser.iduser,
      modulo: this.component
    }).subscribe(
      (data) => {
        if (data.success == true) {
          //DataInfo
          this.selection       = data.data["getDataTechno"];
          this.position        = data.data["getPosition"];
          this.typeRequisition = data.data["getRequisition"];
          this.typeMatriz      = data.data["getMatriz"].slice(0, 3);
          this.PersonaleInfo   = data.data['getDataPersonale'];
          this.trainingType    = data.data['getTraining'];
          this.methodology     = data.data['getMethod'];
          this.typeDocument    = data.data["getDocument"];
          this.depart          = data.data["getDepart"];
          this.citytBirth      = data.data["getCity"];
          this.position        = data.data["getPosition"];
          this.eps             = data.data["getEps"];
          this.pension         = data.data["getPension"];
          this.area            = data.data["getArea"];
          this.stateFormation  = data.data["getFinal"];
          this.asist           = data.data['getAsist'];
          this.totalHelp       = data.data['getHelp'];

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
      action: "getinspectionUp",
      id: this.idvac,
      token: this.cuser.token,
      idUser: this.cuser.iduser,
      modulo: this.component
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
        this.formInsp.get("day11").setValue(data.data["getSelecUpdat"][0].day11);
        this.formInsp.get("day12").setValue(data.data["getSelecUpdat"][0].day12);
        this.formInsp.get("day13").setValue(data.data["getSelecUpdat"][0].day13);
        this.formInsp.get("day14").setValue(data.data["getSelecUpdat"][0].day14);
        this.formInsp.get("day15").setValue(data.data["getSelecUpdat"][0].day15);
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
        this.formInsp.get("tot_asi").setValue(data.data["getSelecUpdat"][0].tot_asi);
        this.formInsp.get("aux_tra").setValue(data.data["getSelecUpdat"][0].aux_tra);
        this.formInsp.get("aux_tot").setValue(data.data["getSelecUpdat"][0].aux_tot);
        //vacant
        this.formVac.get("con_fin").setValue(data.data[0][0].con_fin);
        this.formVac.get("des_can").setValue(data.data[0][0].des_can);
        this.formVac.get("asp_pos").setValue(data.data[0][0].asp_pos);
        this.formVac.get("asp_for").setValue(data.data[0][0].asp_for);
        this.formVac.get("mot_no").setValue(data.data[0][0].mot_no);
      },
      (error) => {
        this.handler.showError();
        this.loading.emit(false);
      }
    );
  }
  onSubmitUpdate(){

    let body = {
        listas: this.formVac.value, 
        segui: this.formInsp.value,
        req: this.formSelec.value   
    }
    if (this.formInsp.valid && this.formVac.valid) {
      this.loading.emit(true);
      this.WebApiService.putRequest(this.endpoint+'/'+this.idvac,body,{
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
  resultado = 0;
  eva_ind_sst: number;
  eva_ind_cal: number;
  val1: any;
  
  // onProme(e){
  //   console.log('=>',e)
  //   this.resultado = (this.formInsp.value.eva_ind_sst + this.formInsp.value.eva_ind_cal)
  //   console.log("++",this.resultado)
    

  // }
  onSumar():void {
   
    if(this.view == 'update'){
      this.resultado = (this.formInsp.value.eva_ind_sst + this.formInsp.value.eva_ind_cal + this.formInsp.value.cer_pro_tel_hog + this.formInsp.value.cer_pro_mov +
        this.formInsp.value.cer_sis_inf_pol +  this.formInsp.value.cer_tyt +   this.formInsp.value.cer_in1 + this.formInsp.value.cer_in2 +
        this.formInsp.value.cer_in3 +  this.formInsp.value.cer11 +  this.formInsp.value.cer12) /11 ;

      this.formInsp.value.pro_gen = this.resultado
    }
  }
  
  onTotalPresence(e){
    
    // if(this.formInsp.get('day1').value == '35/1'){
    //   // this.formInsp.get('day1').setValue(1);
    //   console.log('++',this.formInsp.get('day1').value);
      //---------------------------------------------------------
      if( e == '35/1'){
          this.asistt +=  1;
          // this.ex =this.formInsp.value.tot_asi
          // this.tto = (this.asistt + this.ex)
          // console.log('===',this.tto)
    
          // console.log('d1s=>',this.formInsp.get("day1").value)
    
          console.log('dias=>',this.asistt)
          // this.formInsp.value.tot_asi = this.asistt;
          // this.tto = (this.asist - this.noAsistt)
    
        }else if(e == '35/2'){
          this.asistt -= 1
          console.log('no=>',this.asistt)
          // this.formInsp.value.tot_asi = this.asistt;
        }
      // -----------------------------------------------------------
      this.tto = this.asistt ;
  }
  apto:boolean;
  noApto:boolean;
  canditateAttitudes(event){
    event == '70/1'? this.apto = true: this.apto = false;
    event == '70/2'? this.noApto = true: this.noApto = false;
  }

  }
    
  
  

  


