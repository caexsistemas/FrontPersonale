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
import { WebApiService } from "../../services/web-api.service";
import {
  FormGroup,
  FormControl,
  Validators,
  ValidatorFn,
  ValidationErrors,
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
  selector: "app-technology",
  templateUrl: "./technology.dialog.component.html",
  styleUrls: ["./technology.dialog.component.css"],
})
export class TechnologyDialog {
  endpoint: string = "/technology";
  maskDNI = global.maskDNI;
  title: string = null;
  view: string = null;
  permissions: any = null;
  formNomi: FormGroup;

  component = "/inventory/technology";
  dataSource: any = [];
  archivo = {
    nombre: null,
    nombreArchivo: null,
    base64textString: null,
  };
  dataNovNi: any = [];
  personalData: any = [];
  idTec: number = null;
  techno: any = [];
  list: any = [];
  acti: any = [];
  prue: any = [];
  listActivo: any = [];
  listSub: any = [];
  listOpcion: any = [];
  listCamara: any = [];
  typeControl: any = [];
  typeServer: any = [];
  typeTelephony: any = [];
  typePrinters: any = [];
  typeScanner: any = [];
  typeHeadbands: any = [];
  typeAir: any = [];
  typeCampus: any = [];
  typeCampusFl: any = [];
  typeCampus2: any = [];
  typeCampusCambu: any = [];
  typeCampusCedro: any = [];
  typeflat: any = [];
  typeDisk: any = [];
  activo: any = [];
  product: any = [];
  attribute: any =[];
  sub: any = [];
  select: boolean = false;
  PersonaleInfo: any = [];

  //History
  historyMon: any = [];
  check: 0;
  displayedColumns: any = [];
  checked = false;
  disabled = false;
  listPosition: any = [];
  stateCerti: any = [];
  repo: any = [];
  public clickedRows;
  public cuser: any = JSON.parse(localStorage.getItem("currentUser"));

  //OUTPUTS
  @Output() loading = new EventEmitter();
  @Output() reload = new EventEmitter();
  @ViewChildren(MatSort) sort = new QueryList<MatSort>();

  constructor(
    public dialogRef: MatDialogRef<TechnologyDialog>,
    private WebApiService: WebApiService,
    private handler: HandlerAppService,
    @Inject(MAT_DIALOG_DATA) public data,
    public dialog: MatDialog,
    private uploadFileService: NovedadesnominaServices
  ) {
    this.view = this.data.window;
    this.idTec = null;
    // this.rol = this.cuser.role;

    switch (this.view) {
      case "create":
        this.initForms();
        this.title = "Crear Activos";
        break;
      case "update":
        this.idTec = this.data.codigo;
        this.initForms();
        this.title = "Actualizar Activos";
        console.log("=>",this.cuser)
        break;
      case "view":
        this.idTec = this.data.codigo;
        this.loading.emit(true);
        this.WebApiService.getRequest(
          this.endpoint + "/" + this.idTec,
          {}
        ).subscribe(
          (data) => {
            if (data.success == true) {
              this.techno = data.data["getDataTechno"][0];
              this.acti = data.data['getSubActivo'];
              this.list = data.data['getSubActivo'];
              this.sub = this.techno.listSub;
              this.repo = this.techno.sta_equ;
              // console.log('===>',this.techno)
              console.log(this.sub)
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
    this.formNomi = new FormGroup({
      fecha_compra: new FormControl(""),
      listActivo: new FormControl(""),
      listSub: new FormControl(""),
      document: new FormControl(""),
      idPersonale: new FormControl(""),
      create_User: new FormControl(this.cuser.iduser),

      // pc
      pc_mar: new FormControl(""),
      pc_mod: new FormControl(""),
      pc_ram: new FormControl(""),
      pc_pro: new FormControl(""),
      pc_tam_dis: new FormControl(""),
      pc_car: new FormControl(""),
      pc_tam_pan: new FormControl(""),
      pc_tip_dis: new FormControl(""),
      //monitor
      // mon_mar: new FormControl(""),
      // mon_mod: new FormControl(""),
      // mon_tam: new FormControl(""),
      //Camaras / DVR
      // cam_mod: new FormControl(""), 
      // cam_mar: new FormControl(""),
      cam_res: new FormControl(""),
      cam_tip: new FormControl(""),
      cam_can: new FormControl(""),
      //Control Acceso
      // cont_acc_marc: new FormControl(""),
      // cont_acc_mod: new FormControl(""),
      cont_acc_tip: new FormControl(""),
      // Switches
      // swi_mod: new FormControl(""),
      // swi_mar: new FormControl(""),
      swi_pue: new FormControl(""),
      // Servidores
      // ser_mod:new FormControl(""),
      // ser_mar:new FormControl(""),
      ser_ram:new FormControl(""),
      ser_pro:new FormControl(""),
      ser_alm:new FormControl(""),
      ser_cap_fue:new FormControl(""),
      ser_tip:new FormControl(""),
      // Telefonia IP
      // tel_mod: new FormControl(""),
      // tel_mar: new FormControl(""),
      tel_tip: new FormControl(""),
      // AP/Router
      // ap_rou_mod: new FormControl(""),
      // ap_rou_mar: new FormControl(""),
      // Impresoras
      // imp_mod: new FormControl(""),
      // imp_mar: new FormControl(""),
      imp_tip: new FormControl(""),

      // Escaner / Lectores Barras
      // esc_mod: new FormControl(""),
      // esc_mar: new FormControl(""),
      esc_tip: new FormControl(""),

      // Diademas
      // diad_mod: new FormControl(""),
      // diad_mar: new FormControl(""),
      diad_tip: new FormControl(""),

      // UPS
      // ups_mod: new FormControl(""),
      // ups_mar: new FormControl(""),
      ups_cap: new FormControl(""),

      // Racks
      // rac_tam: new FormControl(""),

      // Planta Electrica
      // plan_elec_mod: new FormControl(""),
      // plan_elec_mar: new FormControl(""),
      plan_elec_cap: new FormControl(""),

      // Transformador Electrico
      // tran_for_ele_mod: new FormControl(""),
      // tran_for_ele_mar: new FormControl(""),
      tran_for_ele_cap: new FormControl(""),

      // Aires
      // air_mod: new FormControl(""),
      // air_mar: new FormControl(""),
      air_cap: new FormControl(""),
      air_tip: new FormControl(""),

      // valores subtipos general
      sub_prec: new FormControl(""),
      sub_num_fac: new FormControl(""),
      sub_sede: new FormControl(""),
      sub_ubi: new FormControl(""),
      // sub_res: new FormControl(""),
      sub_pla_act_fij: new FormControl(""),
      sub_serial: new FormControl(""),
      fec_ent: new FormControl(""),
      car_user: new FormControl(""),
      obs_act: new FormControl(""),
      sta_equ: new FormControl(""),
      obs_rep: new FormControl(""),
      obs_ent: new FormControl("")

    });
  }
  getDataInit() {
    this.loading.emit(false);
    this.WebApiService.getRequest(this.endpoint, {
      action: "getParamView",
      // tipRole: this.cuser.role,
      idTec: this.data.codigo,
      idUser: this.cuser.iduser

    }).subscribe(
      (data) => {
        if (data.success == true) {
          //DataInfo
              this.listActivo = data.data["getTipoActivo"];
              this.listSub = data.data["getSubActivo"];
              this.PersonaleInfo = data.data['getDataPersonale'];
              this.listOpcion = data.data['getOpcion'];
              this.listCamara = data.data['getTipCamera'];
              this.typeControl = data.data['getTipControl'];
              this.typeServer = data.data['getTipServer'];
              this.typeTelephony = data.data['getTipTelephony'];
              this.typePrinters = data.data['getTipPrinters'];
              this.typeScanner = data.data['getTipScanner'];
              this.typeHeadbands = data.data['getTipHeadbands'];
              this.typeAir = data.data['getTipAir'];
              this.typeCampus = data.data['typeCampus'];
              this.typeDisk = data.data['getTypeDisk'];
              this.typeCampusCambu = data.data['getCampusCambu'];
              this.typeCampusCedro = data.data['getCampusCedro'];
              this.listPosition = data.data['getPosition'];
              this.stateCerti = data.data["getCertificate"];

          if (this.view == 'update') {
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
    if (this.formNomi.valid) {
      this.loading.emit(true);
      let body = {
        listas: this.formNomi.value,
      };
      this.WebApiService.postRequest(this.endpoint, body, {
        idUser: this.cuser.iduser,
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
      id: this.idTec,
      idUser: this.cuser.iduser,
      // tipRole:this.tipRole
    }).subscribe(
      (data) => {
        this.formNomi.get("listActivo").setValue(data.data["getDataUpda"][0].listActivo);
        this.formNomi.get("listSub").setValue(data.data["getDataUpda"][0].listSub);
        this.formNomi.get("document").setValue(data.data["getDataUpda"][0].document);
        this.formNomi.get("pc_mod").setValue(data.data["getDataUpda"][0].pc_mod);
        this.formNomi.get("pc_mar").setValue(data.data["getDataUpda"][0].pc_mar);
        this.formNomi.get("pc_ram").setValue(data.data["getDataUpda"][0].pc_ram);
        this.formNomi.get("pc_pro").setValue(data.data["getDataUpda"][0].pc_pro);
        this.formNomi.get("pc_tam_dis").setValue(data.data["getDataUpda"][0].pc_tam_dis);
        this.formNomi.get("pc_tip_dis").setValue(data.data["getDataUpda"][0].pc_tip_dis);
        this.formNomi.get("pc_car").setValue(data.data["getDataUpda"][0].pc_car);
        this.formNomi.get("pc_tam_pan").setValue(data.data["getDataUpda"][0].pc_tam_pan);
        // this.formNomi.get("mon_mar").setValue(data.data["getDataUpda"][0].mon_mar);
        // this.formNomi.get("mon_mod").setValue(data.data["getDataUpda"][0].mon_mod);
        // this.formNomi.get("mon_tam").setValue(data.data["getDataUpda"][0].mon_tam);
        // this.formNomi.get("cam_mod").setValue(data.data["getDataUpda"][0].cam_mod);
        // this.formNomi.get("cam_mar").setValue(data.data["getDataUpda"][0].cam_mar);
        this.formNomi.get("cam_res").setValue(data.data["getDataUpda"][0].cam_res);
        this.formNomi.get("cam_tip").setValue(data.data["getDataUpda"][0].cam_tip);
        this.formNomi.get("cam_can").setValue(data.data["getDataUpda"][0].cam_can);
        // this.formNomi.get("cont_acc_marc").setValue(data.data["getDataUpda"][0].cont_acc_marc);
        // this.formNomi.get("cont_acc_mod").setValue(data.data["getDataUpda"][0].cont_acc_mod);
        this.formNomi.get("cont_acc_tip").setValue(data.data["getDataUpda"][0].cont_acc_tip);
        // this.formNomi.get("swi_mod").setValue(data.data["getDataUpda"][0].swi_mod);
        // this.formNomi.get("swi_mar").setValue(data.data["getDataUpda"][0].swi_mar);
        this.formNomi.get("swi_pue").setValue(data.data["getDataUpda"][0].swi_pue);
        // this.formNomi.get("ser_mod").setValue(data.data["getDataUpda"][0].ser_mod);
        // this.formNomi.get("ser_mar").setValue(data.data["getDataUpda"][0].ser_mar);
        this.formNomi.get("ser_ram").setValue(data.data["getDataUpda"][0].ser_ram);
        this.formNomi.get("ser_pro").setValue(data.data["getDataUpda"][0].ser_pro);
        this.formNomi.get("ser_alm").setValue(data.data["getDataUpda"][0].ser_alm);
        this.formNomi.get("ser_cap_fue").setValue(data.data["getDataUpda"][0].ser_cap_fue);
        this.formNomi.get("ser_tip").setValue(data.data["getDataUpda"][0].ser_tip);
        // this.formNomi.get("tel_mod").setValue(data.data["getDataUpda"][0].tel_mod);
        // this.formNomi.get("tel_mar").setValue(data.data["getDataUpda"][0].tel_mar);
        this.formNomi.get("tel_tip").setValue(data.data["getDataUpda"][0].tel_tip);
        // this.formNomi.get("ap_rou_mod").setValue(data.data["getDataUpda"][0].ap_rou_mod);
        // this.formNomi.get("ap_rou_mar").setValue(data.data["getDataUpda"][0].ap_rou_mar);
        // this.formNomi.get("imp_mod").setValue(data.data["getDataUpda"][0].imp_mod);
        // this.formNomi.get("imp_mar").setValue(data.data["getDataUpda"][0].imp_mar);
        this.formNomi.get("imp_tip").setValue(data.data["getDataUpda"][0].imp_tip);
        // this.formNomi.get("esc_mod").setValue(data.data["getDataUpda"][0].esc_mod);
        // this.formNomi.get("esc_mar").setValue(data.data["getDataUpda"][0].esc_mar);
        this.formNomi.get("esc_tip").setValue(data.data["getDataUpda"][0].esc_tip);
        // this.formNomi.get("diad_mod").setValue(data.data["getDataUpda"][0].diad_mod);
        // this.formNomi.get("diad_mar").setValue(data.data["getDataUpda"][0].diad_mar);
        this.formNomi.get("diad_tip").setValue(data.data["getDataUpda"][0].diad_tip);
        // this.formNomi.get("ups_mod").setValue(data.data["getDataUpda"][0].ups_mod);
        // this.formNomi.get("ups_mar").setValue(data.data["getDataUpda"][0].ups_mar);
        this.formNomi.get("ups_cap").setValue(data.data["getDataUpda"][0].ups_cap);
        // this.formNomi.get("rac_tam").setValue(data.data["getDataUpda"][0].rac_tam);
        // this.formNomi.get("plan_elec_mod").setValue(data.data["getDataUpda"][0].plan_elec_mod);
        // this.formNomi.get("plan_elec_mar").setValue(data.data["getDataUpda"][0].plan_elec_mar);
        this.formNomi.get("plan_elec_cap").setValue(data.data["getDataUpda"][0].plan_elec_cap);
        // this.formNomi.get("tran_for_ele_mod").setValue(data.data["getDataUpda"][0].tran_for_ele_mod);
        // this.formNomi.get("tran_for_ele_mar").setValue(data.data["getDataUpda"][0].tran_for_ele_mar);
        this.formNomi.get("tran_for_ele_cap").setValue(data.data["getDataUpda"][0].tran_for_ele_cap);
        // this.formNomi.get("air_mod").setValue(data.data["getDataUpda"][0].air_mod);
        // this.formNomi.get("air_mar").setValue(data.data["getDataUpda"][0].air_mar);
        this.formNomi.get("air_cap").setValue(data.data["getDataUpda"][0].air_cap);
        this.formNomi.get("air_tip").setValue(data.data["getDataUpda"][0].air_tip);
        this.formNomi.get("sub_prec").setValue(data.data["getDataUpda"][0].sub_prec);
        this.formNomi.get("sub_num_fac").setValue(data.data["getDataUpda"][0].sub_num_fac);
        this.formNomi.get("sub_pla_act_fij").setValue(data.data["getDataUpda"][0].sub_pla_act_fij);
        this.formNomi.get("sub_serial").setValue(data.data["getDataUpda"][0].sub_serial);
        this.formNomi.get("fecha_compra").setValue(data.data["getDataUpda"][0].fecha_compra);
        this.formNomi.get("idPersonale").setValue(data.data["getDataUpda"][0].idPersonale);
        this.formNomi.get("sub_ubi").setValue(data.data["getDataUpda"][0].sub_ubi);
        this.formNomi.get("sub_sede").setValue(data.data["getDataUpda"][0].sub_sede);
        // this.formNomi.get("create_User").setValue(data.data["getDataUpda"][0].create_User);          
        this.formNomi.get("car_user").setValue(data.data["getDataUpda"][0].car_user);          
        this.formNomi.get("fec_ent").setValue(data.data["getDataUpda"][0].fec_ent);          
        this.formNomi.get("obs_act").setValue(data.data["getDataUpda"][0].obs_act);          
        this.formNomi.get("obs_rep").setValue(data.data["getDataUpda"][0].obs_rep);          
        this.formNomi.get("sta_equ").setValue(data.data["getDataUpda"][0].sta_equ);          
        this.formNomi.get("obs_ent").setValue(data.data["getDataUpda"][0].obs_ent);          
      },
      (error) => {
        this.handler.showError();
        this.loading.emit(false);
      }
    );
  }
  onSubmitUpdate(){

    let body = {
        listas: this.formNomi.value,  
        //  id: this.idfeed
    }
    if (this.formNomi.valid) {
      this.loading.emit(true);
      this.WebApiService.putRequest(this.endpoint+'/'+this.idTec,body,{
        idUser: this.cuser.iduser,
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

  onSelectionChange(idet) {
    if (idet == "47/1") {
      this.product = this.listSub.slice(0, 2);
    }
    else if (idet == "47/2") {
      this.product = this.listSub.slice(2, 4);
    }
    else if (idet == "47/3") {
      this.product = this.listSub.slice(4, 7);
    }
    else if (idet == "47/4") {
      this.product = this.listSub.slice(7, 12);
    }
    else if (idet == "47/5") {
      this.product = this.listSub.slice(12, 17);
    }
    else if (idet == "47/6") {
      this.product = this.listSub.slice(17, 21);
    }

    // console.log("id=>", idet);
    
  }
  onSelectionAttributes(idet){
      console.log("idSub=>", idet);
     
      for(let i = idet; i>='48/1'; i++ ){

         this.attribute = idet ;

        }
  }
  onSelectionPerson(event){
    let exitsPersonal = this.PersonaleInfo.find(element => element.document == event);

    if( exitsPersonal ){
        this.formNomi.get('idPersonale').setValue(exitsPersonal.idPersonale);   
        this.formNomi.get('car_user').setValue(exitsPersonal.idPosition);       

    }        
    console.log('=>',exitsPersonal)

  }
  // onSelectionPerson(event){
  //   let exitsPersonal = this.PersonaleInfo.find(element => element.document == event);
  //   console.log('per=>',exitsPersonal)
  
  //   if( exitsPersonal ){
  //       this.formNomi.get('idPersonale').setValue(exitsPersonal.idPersonale);       
  //       this.formNomi.get('car_user').setValue(exitsPersonal.idPosition);       
  //   }        
  // }
  onSelectCampus(idet){ 
    
    // console.log('sede=>',idet);
    if( idet == '58'){
      this.typeflat = this.typeCampusCambu;
      // this.typeflat = this.typeCampus;
      // console.log('sede 1=>',this.typeflat);
      return this.typeflat;

    }else if(idet == '59'){
      this.typeflat= this.typeCampusCedro;
      // this.typeflat= this.typeCampus;
      // console.log('sede 2=>',this.typeflat);
      return this.typeflat;
    }

  }
  obs: boolean;
  rep:boolean;
  onSelectEstate(e){
    console.log('=>',e)
    if(e == '73/2'){
      this.obs = true
    }else{
      this.obs = false
    }
      if(e == '73/1'){
        this.rep = true
      }else{
        this.rep = false
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
}
