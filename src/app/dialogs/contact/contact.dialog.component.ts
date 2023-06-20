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
import { log } from "console";
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
  selector: 'app-contact.dialog',
  templateUrl: './contact.dialog.component.html',
  styleUrls: ['./contact.dialog.component.css']
})
export class ContactDialog  {
  endpoint: string = "/contact";
  endpointContact: string = "/campana";
  endpointSuper: string = "/supervisor";
  endpointRolContact: string = "/roles"
  endpointCreate: string = "create";
  maskDNI = global.maskDNI;
  title: string = null;
  view: string = null;
  formSelec: FormGroup;
  permissions: any = null;
  component = "/admin/contact";
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
  role: any = [];
  perid:any = [];
  typeDocument:any = [];
  public campanaData: any;
  public supervisor: any;
  public Id_user_contact: any;
  public clickedRows;
  public cuser: any = JSON.parse(localStorage.getItem("currentUser"));
  //OUTPUTS
  @Output() loading = new EventEmitter();
  @Output() reload = new EventEmitter();
  @ViewChildren(MatSort) sort = new QueryList<MatSort>();

  constructor(
    public dialogRef: MatDialogRef<ContactDialog>,
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
        this.title = "Create User Contact";
      break;
      case "update":
        this.idSig = this.data.codigo;       
        this.initForms();
        this.title = "Update User Contact";
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
      user_nombre: new FormControl("", ),
      user_ident: new FormControl("",),
      user_rol: new FormControl("", ),
      user_camp: new FormControl("",),
      user_ti: new FormControl("", ),
      user_canal: new FormControl("",),
      user_wolk: new FormControl("",),
      user_nred: new FormControl("",),
      user_sup: new FormControl("",),
      // Id_user_contact: new FormControl("")
      // createUser: new FormControl(this.cuser.iduser),endpointRolContact
    });
    
  }
  getDataInit() {
    this.loading.emit(false);
    this.WebApiService.getRequestContact(this.endpointContact).subscribe((campana) =>{
      if(campana){
        this.campanaData = campana.data;
        console.log('====>',this.campanaData);  
      }
     
    } ,
    (error) => {
      this.handler.showError("Se produjo un error");
      this.loading.emit(false);
    }
    );
    this.WebApiService.getRequestContact(this.endpointSuper).subscribe((sup) =>{
      if(sup){
        this.supervisor = sup.data;
        console.log('=super=>',this.supervisor);  
      }
     
    } ,
    (error) => {
      this.handler.showError("Se produjo un error");
      this.loading.emit(false);
    }
    );
    this.WebApiService.getRequestContact(this.endpointRolContact).subscribe((data) =>{
      if(data){
        this.role = data.data;
        console.log('=super=>',this.role);  
      }
     
    } ,
    (error) => {
      this.handler.showError("Se produjo un error");
      this.loading.emit(false);
    }
    );
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
        
          this.typeDocument        = data.data["typeDocument"];
          this.PersonaleInfo = data.data['getDataPersonale'];        
          // this.role = data.data['getDataRole'];        
          
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
  // onSubmit() {
  //   if (this.formSelec.valid) {
  //     this.loading.emit(true);
  //     let body = {
  //       listas: this.formSelec.value,
       
  //     };
  //     console.log('form => ',body);

  //     this.WebApiService.postRequest(this.endpoint, body, {
  //       token: this.cuser.token,
  //       idUser: this.cuser.iduser,
  //       modulo: this.component
  //     }).subscribe(
  //       (data) => {
  //         if (data.success) {
  //           this.handler.showSuccess(data.message);
  //           this.reload.emit();
  //           this.closeDialog();
  //         } else {
  //           this.handler.handlerError(data);
  //           this.loading.emit(false);
  //         }
  //       },
  //       (error) => {
  //         this.handler.showError();
  //         this.loading.emit(false);
  //       }
  //     );
  //   } else {
  //     this.handler.showError("Complete la informacion necesaria");
  //     this.loading.emit(false);
  //   }
  // }
  onSubmit() {
    if (this.formSelec.valid) {
      // this.loading.emit(true);
  
      const contact = this.formSelec.value;
      // let body = {
      //    retribution,
      // };
      

      // console.log('form =>',this.formSelec.value);
      console.log('form =>',contact);
      
      this.WebApiService.postRequestContact(this.endpointCreate,this.formSelec.value).subscribe(
        (data) => {
          if (data && data.status === 'true') {

            this.Id_user_contact = data.data;
            console.log('====>', this.Id_user_contact);

            // this.formSelec.value['Id_user_contact'] = data.data;
            let body = {
              listas:this.formSelec.value,
            };
           
  
            this.WebApiService.postRequest(this.endpoint, body, {
              token: this.cuser.token,
              idUser: this.cuser.iduser,
              modulo: this.component,
            }).subscribe(
              (data) => {
                if (data.success) {
                  this.handler.showSuccess(data.message);
                  this.reload.emit();
                  this.closeDialog();
                } else {
                  this.handler.handlerError(data);
                }
              },
              (error) => {
                this.handler.showError();
              }
            );
          } else if (data && data.status === 'false') {
            this.handler.handlerError(data.message);
          } else {
            this.handler.handlerError('Error en la respuesta de la API');
          }
        },
        (error) => {
          this.handler.showError("Se produjo un error");
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
      console.log(exitsPersonal);
      
        this.formSelec.get('user_nombre').setValue(exitsPersonal.name);
        // this.formNomi.get('car_user').setValue(exitsPersonal.idArea);
       
    }        
  }
  onSelectionCanal(event){
    this.campanaData;
    console.log('event =>', event);
    console.log('***',this.campanaData);

    let canal = this.campanaData.find(element => element.cam_id == event);
    if(canal){
    console.log('canal===>',canal);
      this.formSelec.get('user_canal').setValue(canal.cam_canal);

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
    return this.formSelec.get('user_ident').invalid && this.formSelec.get('user_ident').touched;
  }
}
