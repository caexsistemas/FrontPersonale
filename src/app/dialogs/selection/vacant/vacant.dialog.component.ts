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
  OnInit,
} from "@angular/core";
// import { WebApiService } from "../../services/web-api.service";
import {
  FormGroup,
  FormControl,
  Validators,
  ValidatorFn,
  ValidationErrors,
  FormArray,
  FormBuilder,
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
  selector: "app-pending",
  templateUrl: "./vacant.dialog.component.html",
  styleUrls: ["./vacant.dialog.component.css"],
})
export class VacantDialog  implements OnInit  {
  

  endpoint: string = "/requisition";
  maskDNI = global.maskDNI;
  title: string = null;
  view: string = null;
  permissions: any = null;
  formSelec: FormGroup;
  formChild: FormGroup;
  selection: any = [];
  position: any = [];
  typeRequisition: any = [];
  typeDocument: any =[];
  area: any = [];
  depart: any = [];
  city: any =[];
  birth: any = [];
  eps: any = [];
  pension: any = [];
  idSel: number = null;
  rol: number;
  citytBirth: any =[];
  component = "/selection/vacant";
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
  public clickedRows;
  public cuser: any = JSON.parse(localStorage.getItem("currentUser"));
  //OUTPUTS
  @Output() loading = new EventEmitter();
  @Output() reload = new EventEmitter();
  @ViewChildren(MatSort) sort = new QueryList<MatSort>();

  // constructor(
  //   private fb:FormBuilder
  // ) { }
  constructor(
    private fb:FormBuilder,
    public dialogRef: MatDialogRef<VacantDialog>,
    private WebApiService: WebApiService,
    private handler: HandlerAppService,
    @Inject(MAT_DIALOG_DATA) public data,
    public dialog: MatDialog,
    private uploadFileService: NovedadesnominaServices
  ) {
    this.view = this.data.window;
    this.idSel = null;
    this.rol = this.cuser.role;

    switch (this.view) {
      case "create":
        this.initForms();
        this.title = "Nueva Requisicion";
        break;
      case "update":
        this.rol = this.cuser.role;
        this.idSel = this.data.codigo;
        console.log('idsel=>',this.idSel);
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
  
  // initForms() {
  //   this.getDataInit();
  //   this.formSelec = new FormGroup({
  //     car_sol: new FormControl(""),
  //     num_vac: new FormControl(""),
  //     salary: new FormControl(""),
  //     tip_req: new FormControl(""),
  //     justification: new FormControl(""),
  //     observations: new FormControl(""),
  //     aprobacion1: new FormControl(""),
  //     aprobacion2: new FormControl(""),
  //     aprobacion3: new FormControl(""),
  //     create_User: new FormControl(this.cuser.iduser),
  //     //
  //     fec_sel: new FormControl(""),
  //     tip_doc: new FormControl(""),
  //     document: new FormControl(""),
  //     nom_com: new FormControl(""),
  //     birthDate: new FormControl(""),
  //     ciu_nac: new FormControl(""),
  //     dep_nac: new FormControl(""),
  //     are_tra: new FormControl(""),
  //     cargo: new FormControl(""),
  //     eps: new FormControl(""),
  //     pension: new FormControl(""),
  //     obs_vac: new FormControl("")
  //   });
  // }
  initForms() {
    this.getDataInit();
    this.formChild = new FormGroup({
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
      //
      fec_sel: new FormControl(""),
      tip_doc: new FormControl(""),
      document: new FormControl(""),
      nom_com: new FormControl(""),
      birthDate: new FormControl(""),
      ciu_nac: new FormControl(""),
      dep_nac: new FormControl(""),
      are_tra: new FormControl(""),
      cargo: new FormControl(""),
      eps: new FormControl(""),
      pension: new FormControl(""),
      obs_vac: new FormControl("")
    });
  }
  getDataInit() {
    this.loading.emit(false);
    this.WebApiService.getRequest(this.endpoint, {
      action: "getParamView",
      // tipRole: this.cuser.role,
      idSel: this.data.codigo
    }).subscribe(
      (data) => {
        if (data.success == true) {
          //DataInfo
          this.selection = data.data["getDataTechno"];
          this.position = data.data["getPosition"];
          this.typeRequisition = data.data["getRequisition"];
          this.typeDocument = data.data["getDocument"];
          this.depart = data.data["getDepart"];
          this.city = data.data["getCity"];
          this.birth = data.data["getDepCit"];
          this.area = data.data["getArea"];
          this.eps = data.data["getEps"];
          this.pension = data.data["getPension"];

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
    if (this.formChild.valid) {
      this.loading.emit(true);
      let body = {
        listas: this.formChild.value,
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
      id: this.idSel
      // tipRole:this.tipRole
    }).subscribe(
      (data) => {
        // this.formSelec.get("car_sol").setValue(data.data["getSelecUpdat"][0].car_sol);
        // this.formSelec.get("num_vac").setValue(data.data["getSelecUpdat"][0].num_vac);
        // this.formSelec.get("salary").setValue(data.data["getSelecUpdat"][0].salary);
        // this.formSelec.get("tip_req").setValue(data.data["getSelecUpdat"][0].tip_req);
        // this.formSelec.get("justification").setValue(data.data["getSelecUpdat"][0].justification);
        // this.formSelec.get("observations").setValue(data.data["getSelecUpdat"][0].observations);
        // this.formSelec.get("aprobacion1").setValue(data.data["getSelecUpdat"][0].aprobacion1);
        // this.formSelec.get("aprobacion2").setValue(data.data["getSelecUpdat"][0].aprobacion2);
        // this.formSelec.get("aprobacion3").setValue(data.data["getSelecUpdat"][0].aprobacion3);
        // this.formSelec.get("fec_sel").setValue(data.data["getSelecUpdat"][0].fec_sel);
        // this.formSelec.get("tip_doc").setValue(data.data["getSelecUpdat"][0].tip_doc);
        // this.formSelec.get("document").setValue(data.data["getSelecUpdat"][0].document);
        // this.formSelec.get("nom_com").setValue(data.data["getSelecUpdat"][0].nom_com);
        // this.formSelec.get("birthDate").setValue(data.data["getSelecUpdat"][0].birthDate);
        // this.formSelec.get("ciu_nac").setValue(data.data["getSelecUpdat"][0].ciu_nac);
        // this.formSelec.get("dep_nac").setValue(data.data["getSelecUpdat"][0].dep_nac);
        // this.formSelec.get("are_tra").setValue(data.data["getSelecUpdat"][0].are_tra);
        // this.formSelec.get("cargo").setValue(data.data["getSelecUpdat"][0].cargo);
        // this.formSelec.get("eps").setValue(data.data["getSelecUpdat"][0].eps);
        // this.formSelec.get("obs_vac").setValue(data.data["getSelecUpdat"][0].obs_vac);
        // this.formSelec.get("pension").setValue(data.data["getSelecUpdat"][0].pension);
      },
      (error) => {
        this.handler.showError();
        this.loading.emit(false);
      }
    );
  }
  onSelectBirth(idState:any):void{
        
    console.log('city=>',idState);
    this.loading.emit(true);

    setTimeout(()=>{       
        this.citytBirth = this.birth.filter(item => item.idState == idState);
        //console.log(this.citieswork);
    },3);   

    this.loading.emit(false);
}

  generateTable(data) {
    this.displayedColumns = ["currentm_user", "date_move", "type_move"];
    this.historyMon = data;
    this.clickedRows = new Set<PeriodicElement>();
  }
  closeDialog() {
    this.dialogRef.close();
  }
  // ngOnInit() {}
  // step = 0;

  // setStep(index: number) {
  //   this.step = index;
  // }
  // nextStep() {
  //   this.step++;
  // }
  // prevStep() {
  //   this.step--;
  // }
  onSubmitUpdate(){}

  //   let body = {
  //       listas: this.formParent.value,  
  //       //  id: this.idfeed
  //   }
  //   if (this.formParent.valid) {
  //     this.loading.emit(true);
  //     this.WebApiService.putRequest(this.endpoint+'/'+this.idSel,body,{})
  //     .subscribe(
  //         data=>{
  //             if(data.success){
  //                 this.handler.showSuccess(data.message);
  //                 this.reload.emit();
  //                 this.closeDialog();
  //             }else{
  //                 this.handler.handlerError(data);
  //                 this.loading.emit(false);
  //             }
  //         },
  //         error=>{
  //           console.log(error);
  //             this.handler.showError(error);
  //             this.loading.emit(false);
  //         }
  //     );
  //   }else {
  //     this.handler.showError('Complete la informacion necesaria');
  //     this.loading.emit(false);
  //   }
  // }
  form:FormGroup;
  result;

  

  ngOnInit(): void {
    this.creatForm();
  }

  creatForm(){
    this.form = this.fb.group(
      {
        fec_sel: new FormControl(""),
        tip_doc: new FormControl(""),
        document: new FormControl(""),
        nom_com: new FormControl(""),
        birthDate: new FormControl(""),
        ciu_nac: new FormControl(""),
        dep_nac: new FormControl(""),
        are_tra: new FormControl(""),
        cargo: new FormControl(""),
        eps: new FormControl(""),
        pension: new FormControl(""),
        obs_vac: new FormControl(""),
        addresses: this.addressForm(),
        contacts: this.fb.array([this.contactFrom()])
      }
    );
  }

  addressForm(){
    return this.fb.group(
      {
        fec_sel: new FormControl(""),
      tip_doc: new FormControl(""),
      document: new FormControl(""),
      nom_com: new FormControl(""),
      birthDate: new FormControl(""),
      ciu_nac: new FormControl(""),
      dep_nac: new FormControl(""),
      are_tra: new FormControl(""),
      cargo: new FormControl(""),
      eps: new FormControl(""),
      pension: new FormControl(""),
      obs_vac: new FormControl("")
      }
    )
  }

  get addresses(){
  return this.form.get("addresses") as FormGroup;
  }


  get contacts(){
    return this.form.get("contacts") as FormArray;
    }

  contactFrom(){
    return this.fb.group(
      {
        phone: [null],
        email: [null]
      }
    );
  }

  onSave(){
    console.log(this.form.getRawValue())
    this.result = this.form.getRawValue();
  }

  addNewContacts(){
    this.contacts.push(this.contactFrom());
  }

  removeContact(i:Required<number>){
    this.contacts.removeAt(i);
  }
}

