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
  ViewChild,
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
import { MatPaginator } from "@angular/material/paginator";
import { MatStepper, MatStepperModule } from "@angular/material/stepper";
import { calculateDays } from "../../services/holiday.service";
import { CitationDialog } from "../citation/citation.dialog.component";
import { PostponementDialog } from "../postponement/postponement.dialog.component";
import { ClarificationDialog } from "../clarification/clarification.dialog.component";
import { ConclusionDialog } from "../conclusion/conclusion.dialog.component";
export interface PeriodicElement {
  currentm_user: string;
  date_move: string;
  type_move: string;
}

@Component({
  selector: "app-reception.dialog",
  templateUrl: "./reception.dialog.component.html",
  styleUrls: ["./reception.dialog.component.css"],
})
export class ReceptionDialogComponent {
  @ViewChild("stepper") stepper: MatStepper;
  @ViewChild("stepCase") stepCase: MatStepper;
  @ViewChild("stepCon") stepCon: MatStepper;
  endpoint: string = "/reception";
  maskDNI = global.maskDNI;
  view: string = null;
  title: string = null;
  idRol: number = null;
  permissions: any = null;
  ValorRol: any = [];
  valoresList: any = [];
  loadingCit: boolean = false;
  component = "/process/reception";
  dataSource: any = [];
  dataSourceCli: any = [];
  dataSourcePost: any = [];
  dataSourceConc: any = [];
  RolInfo: any[];
  selection: any = [];
  PersonaleInfo: any = [];
  exitsPersonal: any = [];
  typeFalt: any = [];
  application: any = [];
  ab_cer: any = [];
  position: any = [];
  check_user: boolean = false;
  check_cood: boolean = false;
  rol_user: any = [];
  mod: any = [];
  checkUs: boolean = false;
  checkOption: boolean = false;
  title_us: any = [];
  nuevoArchivo: any = [];
  city: any = [];
  state: any = [];
  caract: boolean;
  conclu_fin: any = [];
  respec_jornad: any = [];
  respec_mate: any = [];
  respec_rela: any = [];
  respec_orde: any = [];
  contraHones: any = [];
  respect_acti: any = [];
  concer_ord: any = [];
  fecSus: any = [];
  daySus: any = [];
  totaLfecHol: any = [];
  fec_fin: any = [];
  sumTotalMen: any = [];
  monthAll: any = [];
  sundaySus: any = [];
  totalSunday: any = [];
  typeSuspen: any = [];
  count: number = 0;
  sundayDesc: any = [];
  level: any = [];
  afirm: any = [];
  contenTable: any = [];
  checkCita: boolean;
  checkAcla: boolean;
  checkAp: boolean;
  checkConc: boolean;
  citTable: any = [];
  cantidad: string;
  addressCit: any = [];
  archivo = {
    nombre: null,
    nombreArchivo: null,
    base64textString: null,
  };
  // formularios
  formCreate: FormGroup;
  formCase: FormGroup;
  formCitation: FormGroup;
  formPostpo: FormGroup;
  formClasifi: FormGroup;
  formConclu: FormGroup;

  checkOther: boolean;
  checkAddress: boolean;
  public cuser: any = JSON.parse(localStorage.getItem("currentUser"));
  //OUTPUTS
  @Output() loading = new EventEmitter();
  @Output() reload = new EventEmitter();
  @ViewChildren(MatSort) sort = new QueryList<MatSort>();
  @ViewChildren(MatPaginator) paginator = new QueryList<MatPaginator>();

  historyMon: any = [];
  displayedColumns: any = [];
  displayedColumnsCla: any = [];
  displayedColumnsPost: any = [];
  displayedColumnsConc: any = [];
  updateButtonEnabled:boolean[] = [];


  public clickedRows;

  constructor(
    public dialogRef: MatDialogRef<ReceptionDialogComponent>,
    private WebApiService: WebApiService,
    private handler: HandlerAppService,
    @Inject(MAT_DIALOG_DATA) public data,
    public dialog: MatDialog,
    private holiday: calculateDays
  ) {
    this.view = this.data.window;
    this.idRol = null;

    switch (this.view) {
      case "create":
        this.initFormsRole();
        this.title = "Solicitud procesos disciplinarios";
        break;
      case "update":
        this.initFormsRole();
        this.title = "Actualizar Solicitud procesos disciplinarios";
        this.idRol = this.data.codigo;
        break;
      case "view":
        this.idRol = this.data.codigo;
        this.title = "Información detallada del proceso";
        this.loading.emit(true);
        this.WebApiService.getRequest(this.endpoint + "/" + this.idRol, {
          token: this.cuser.token,
          idUser: this.cuser.iduser,
          modulo: this.component,
        }).subscribe(
          (data) => {
            if (data.success == true) {
              this.selection = data.data["getSelectData"][0];
              this.selection.dis_fal === "121/16"
                ? (this.checkUs = true)
                : (this.checkUs = false);

              if (!this.selection.file_sp || this.selection.file_sp === "[]") {
                this.caract = false;
              } else {
                this.caract = true;
                this.selection.file_sp = JSON.parse(this.selection.file_sp);
              }
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
  initFormsRole() {
    this.getDataInit();
    this.formCreate = new FormGroup({
      dis_doc: new FormControl(""),
      dis_idPersonale: new FormControl(""),
      dis_pos: new FormControl(),
      dis_doc_sol: new FormControl(this.cuser.username),
      dis_idp_sol: new FormControl(this.cuser.idPersonale),
      dis_po_sol: new FormControl(""),
      dis_fal: new FormControl(""),
      dis_oth_fal: new FormControl(""),
      dis_fal_des: new FormControl(""),
      dis_des_rel: new FormControl(""),
      dis_niv: new FormControl(""),
      dis_sop: new FormControl(""),
      file_sp: new FormControl(""),
      dis_con: new FormControl(""),
      cityWork: new FormControl(""),
      dis_est: new FormControl(""),
      cas_op_clo: new FormControl(""),
      create_User: new FormControl(this.cuser.iduser),
    });
    this.formCase = new FormGroup({
      dis_fal: new FormControl(""),
      dis_id: new FormControl(""),
      cas_des: new FormControl(""),
      cas_mod: new FormControl(""),
      cas_link: new FormControl(""),
      dis_est: new FormControl(""),
      cas_op_clo: new FormControl(""),
      dis_oth_fal: new FormControl(""),
      cas_address: new FormControl(""),
      cas_reasons_falt: new FormControl(""),
    });
    this.formCitation = new FormGroup({
      idPersonale: new FormControl(""),
      cit_id: new FormControl(""),
      cit_fec_hor: new FormControl(""),
      cit_fec_elab: new FormControl(""),
      cit_con: new FormControl(""),
      cit_fec_two: new FormControl(""),
    });
    this.formClasifi = new FormGroup({
      idPersonale: new FormControl(""),
      // dis_id: new FormControl(""),
      cit_id: new FormControl(""),
      cla_fec_ref: new FormControl(""),
      cla_fec_pres: new FormControl(""),
      cla_description: new FormControl(""),
    });
    this.formPostpo = new FormGroup({
      idPersonale: new FormControl(""),
      // dis_id: new FormControl(""),
      cit_id: new FormControl(""),
      pos_fec_ela: new FormControl(""),
      pos_apl: new FormControl(""),
      cla_description: new FormControl(""),
    });
  }
  closeDialog() {
    this.dialogRef.close();
    this.reload.emit();
  }
  ngOnInit(): void {
    this.permissions = this.handler.permissionsApp;
  }
  getDataInit() {
    this.loading.emit(false);
    this.WebApiService.getRequest(this.endpoint, {
      action: "getParamView",
      token: this.cuser.token,
      idUser: this.cuser.iduser,
      modulo: this.component,
    }).subscribe(
      (data) => {
        if (data.success == true) {
          //DataInfo
          this.RolInfo = data.data["getDataRole"];
          this.PersonaleInfo = data.data["getDataPersonale"];
          this.ab_cer = data.data["ab_cer"];
          this.position = data.data["idPosition"];
          this.mod = data.data["modali"];
          this.rol_user = this.cuser.role;
          this.conclu_fin = data.data["conclu_fin"];
          this.level = data.data["level"];
          this.afirm = data.data["afirm"];

          // faltas regalamento
          this.respec_jornad = data.data["respec_jornad"];
          this.respec_mate = data.data["respec_mate"];
          this.respec_rela = data.data["respec_rela"];
          this.respec_orde = data.data["respec_orde"];
          this.contraHones = data.data["contraHones"];
          this.respect_acti = data.data["respect_acti"];
          this.concer_ord = data.data["concer_ord"];

          this.typeFalt = data.data["typeFal"];
          this.city = data.data["citys"];
          this.state = data.data["state"];
          this.addressCit = data.data["addressCit"];
          this.exitsPersonal = this.PersonaleInfo.find(
            (element) => element.idPersonale == this.cuser.idPersonale);

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
    // this.loading.emit(true);
    this.loadingCit = true;
    this.WebApiService.getRequest(this.endpoint, {
      action: "getParamsUpdateSub",
      id: this.idRol,
      token: this.cuser.token,
      idUser: this.cuser.iduser,
      modulo: this.component,
    }).subscribe(
      (data) => {
        if (data.success) {
          this.formCreate.get("dis_doc").setValue(data.data[0][0].dis_doc);
          this.formCreate
            .get("dis_idPersonale")
            .setValue(data.data[0][0].dis_idPersonale);
          this.formCreate
            .get("dis_idp_sol")
            .setValue(data.data[0][0].dis_idp_sol);
          this.formCreate.get("dis_pos").setValue(data.data[0][0].dis_pos);
          this.formCreate
            .get("dis_po_sol")
            .setValue(data.data[0][0].dis_po_sol);
          this.formCreate.get("dis_fal").setValue(data.data[0][0].dis_fal);
          this.formCreate.get("dis_niv").setValue(data.data[0][0].dis_niv);
          this.formCreate
            .get("dis_oth_fal")
            .setValue(data.data[0][0].dis_oth_fal);
          this.formCreate
            .get("dis_fal_des")
            .setValue(data.data[0][0].descripcion_falta);
          this.formCreate
            .get("dis_des_rel")
            .setValue(data.data[0][0].elementos_relev);
          this.formCreate.get("dis_sop").setValue(data.data[0][0].dis_sop);
          this.formCreate.get("cityWork").setValue(data.data[0][0].cityWork);
          this.formCreate
            .get("cas_op_clo")
            .setValue(data.data[0][0].cas_op_clo);
          if (!data.data[0][0].file_sp) {
            this.caract = false;
          } else {
            this.caract = true;
            this.selection.file_sp = JSON.parse(data.data[0][0].file_sp);
          }
          this.formCreate.get("dis_con").setValue(data.data[0][0].dis_con);
          this.archivo.nombre = JSON.parse(data.data[0][0].file_sp);
          this.formCreate.get("dis_niv").setValue(data.data[0][0].dis_niv);
          //CASE
          this.formCase.get("dis_id").setValue(data.data[1][0].dis_id);
          this.formCase.get("dis_fal").setValue(data.data[1][0].dis_fal);
          this.formCase.get("cas_des").setValue(data.data[1][0].cas_des);
          this.formCase.get("cas_mod").setValue(data.data[1][0].cas_mod);
          this.formCase.get("dis_est").setValue(data.data[1][0].dis_est);
          this.formCase.get("cas_op_clo").setValue(data.data[1][0].cas_op_clo);
          this.formCase.get("cas_address").setValue(data.data[1][0].cas_address);
          this.formCase.get("cas_reasons_falt").setValue(data.data[1][0].cas_reasons_falt);
          //citacion 
          this.formCitation.get("idPersonale").setValue(data.data[1][0].dis_idPersonale);
          this.formCitation.get("cit_id").setValue(data.data[2][0].cit_id);

          if (data.data[2].length > 0 && data.data[2][0].cit_fec_hor) {
            this.checkCita = true;
            this.formCitation.get("cit_fec_hor").setValue(data.data[2][0].cit_fec_hor);
            this.formCitation.get("cit_fec_elab").setValue(data.data[2][0].cit_fec_elab);
          }
          //aclaracion
          if (data.data[4].length > 0) {
            this.checkAcla = true;
            this.formClasifi.get("cla_fec_ref").setValue(data.data[4][0].cla_fec_ref);
          }
          //aplazamiento
          if (data.data[3].length > 0) {
            this.checkAp = true;
            this.formPostpo.get("pos_fec_ela").setValue(data.data[3][0].pos_fec_ela);
          }
          //conclusion
          if (data.data[5][0].cas_reasons_falt) {
            this.checkConc = true;
          }
          
          this.nametext(data.data[2], data.data[4], data.data[3], data.data[5]);
          this.generateTableCitation(data.data[2]);
          this.tableClarification(data.data[4]);
          this.tablePostponement(data.data[3]);
         this.cantEstadoCit(data.data[2])
          // habilitar boton de conclusion
          this.updateButtonEnabled = data.data[5].map((row, index) => {
            if (data.data[5].slice(index + 1).every(subsequentRow => subsequentRow.con_fec_ela !== null) ) {
              return true; 
            }
          });
          

          this.tableConclusion(data.data[5]);
          // this.loading.emit(false);
          this.loadingCit = false;
        } else {
          this.handler.handlerError(data);
          // this.loading.emit(false);
          this.loadingCit = false;
          this.closeDialog();
        }
      },
      (error) => {
        this.handler.showError();
        this.loadingCit = false;
        // this.loading.emit(false);
      }
    );
  }

  colorMap = {
    "1ra Citación": "#CE9E08",
    "1ra Aclaración": "#CE9E08",
    "1ra Aplazamiento": "#CE9E08",
    "1ra Proceso": "#CE9E08",
    "2do Citación": "#CA342B",
    "2do Aclaración": "#CA342B",
    "2do Aplazamiento": "#CA342B",
    "2do Proceso": "#CA342B",
    "3ra Citación": "#CA342B",
    "3ra Aclaración": "#CA342B",
    "3ra Aplazamiento": "#CA342B",
    "3ro Proceso": "#CA342B",
    "4to Citación": "#CA342B",
    "4to Aclaración": "#CA342B",
    "4to Aplazamiento": "#CA342B",
    "4to Proceso": "#CA342B",
  };

  colorState(state) {
    return this.colorMap[state] || "";
  }
  fechref: any = [];
  nametext(cita, acla, apla, conc) {
    if (cita) {
      for (let index = 0; index < cita.length; index++) {
        const elemento = cita[index];
        this.citTable = cita[index].cit_id;
        this.fechref = cita[index].cit_fec_hor;

        if (index === 0) {
          elemento.cantidadTexto = "1ra Citación";
        } else if (index === 1) {
          elemento.cantidadTexto = "2do Citación";
        } else if (index === 2) {
          elemento.cantidadTexto = "3ra Citación";
        } else if (index === 3) {
          elemento.cantidadTexto = "4to Citación";
        }
      }
    }
    if (acla) {
      for (let index = 0; index < acla.length; index++) {
        const elemento = acla[index];

        if (index === 0) {
          elemento.cantidadAcla = "1ra Aclaración";
        } else if (index === 1) {
          elemento.cantidadAcla = "2do Aclaración";
        } else if (index === 2) {
          elemento.cantidadAcla = "3ra Aclaración";
        } else if (index === 3) {
          elemento.cantidadAcla = "4to Aclaración";
        }
      }
    }
    if (apla) {
      for (let index = 0; index < apla.length; index++) {
        const elemento = apla[index];

        if (index === 0) {
          elemento.cantidadAcla = "1ra Aplazamiento";
        } else if (index === 1) {
          elemento.cantidadAcla = "2do Aplazamiento";
        } else if (index === 2) {
          elemento.cantidadAcla = "3ra Aplazamiento";
        } else if (index === 3) {
          elemento.cantidadAcla = "4to Aplazamiento";
        }
      }
    }
    if (conc) {
      for (let index = 0; index < conc.length; index++) {
        const elemento = conc[index];

        if (index === 0) {
          elemento.cantidadConc = "1ra Proceso";
        } else if (index === 1) {
          elemento.cantidadConc = "2do Proceso";
        } else if (index === 2) {
          elemento.cantidadConc = "3ro Proceso";
        } else if (index === 3) {
          elemento.cantidadConc = "4to Proceso";
        }
      }
    }
  }
  generateTableCitation(data) {
    this.displayedColumns = [
      "cantidadTexto",
      "cit_fec_hor",
      "idPersonale",
      "description",
      "cit_fec_elab",
      "actions",
    ];
    this.dataSource = new MatTableDataSource(data);
    this.dataSource.sort = this.sort.toArray()[0];
    this.dataSource.paginator = this.paginator.toArray()[0];
    let search;
    if (document.contains(document.querySelector("search-input-table"))) {
      search = document.querySelector(".search-input-table");
      search.value = "";
    }
  }
  
  getEstado(data, estado) {
    if (data == "135/1") {
      return estado;
    }
    if (data == "135/2") {
      return estado;
    }
  }

  cantEstadoCit(citacion){
    
    const estados = ['135/2', '135/3'];

    const citacionesFiltradas = citacion.filter(c => estados.includes(c.cit_estado));
    
    citacionesFiltradas.sort((a, b) => (a.cit_fec_hor < b.cit_fec_hor ? -1 : 1));

      let contador = 1;
      citacionesFiltradas[0].clasificacion = `${contador}`;

      for (let i = 1; i < citacionesFiltradas.length; i++) {
        
        const fechaActual = new Date(citacionesFiltradas[i].cit_fec_hor);
        const fechaAnterior = new Date(citacionesFiltradas[i - 1].cit_fec_hor);

        if (fechaActual.toDateString() !== fechaAnterior.toDateString()) {
            contador++;          
           }

        citacionesFiltradas[i].clasificacion = `${contador}`;
        
      }
  }

  tableClarification(data) {
    this.displayedColumnsCla = [
      "cantidadAcla",
      "fecha_cita_anterior",
      "cla_fec_ref",
      "idPersonale",
      "description",
      "cla_fec_pres",
      "actions",
    ];
    this.dataSourceCli = new MatTableDataSource(data);
    this.dataSourceCli.sort = this.sort.toArray()[0];
    this.dataSourceCli.paginator = this.paginator.toArray()[0];
    let search;
    if (document.contains(document.querySelector("search-input-table"))) {
      search = document.querySelector(".search-input-table");
      search.value = "";
    }
  }
  tablePostponement(data) {
    this.displayedColumnsPost = [
      "cantidadAcla",
      "pos_apl",
      "idPersonale",
      "pos_fec_ela",
      "actions",
    ];
    this.dataSourcePost = new MatTableDataSource(data);
    this.dataSourcePost.sort = this.sort.toArray()[0];
    this.dataSourcePost.paginator = this.paginator.toArray()[0];
    let search;
    if (document.contains(document.querySelector("search-input-table"))) {
      search = document.querySelector(".search-input-table");
      search.value = "";
    }
  }
  tableConclusion(data) {
    this.displayedColumnsConc = [
      "cantidadConc",
      "idPersonale",
      "description",
      "con_fec_ela",
      "con_final",
      "actions",
    ];
    this.dataSourceConc = new MatTableDataSource(data);
    this.dataSourceConc.sort = this.sort.toArray()[0];
    this.dataSourceConc.paginator = this.paginator.toArray()[0];
    let search;
    if (document.contains(document.querySelector("search-input-table"))) {
      search = document.querySelector(".search-input-table");
      search.value = "";
    }
  }

  applyFilter(event: Event) {
    console.log(event);
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
  getSelectedModalityName(): string {
    const selectedValue = this.formCase.get("cas_mod").value;
    const selectedOption = this.mod.find(
      (option) => option.ls_codvalue === selectedValue
    );
    return selectedOption ? selectedOption.description : "";
  }
  checkMotiv: boolean;
  getSelectedReasonName(): string {
    const selectedReason = this.formCreate.get("dis_fal").value;
    (selectedReason === '121/19') ? this.checkMotiv = false : this.checkMotiv = true;
    const optionReason = this.typeFalt.find(
      (option) => option.ls_codvalue === selectedReason
    );
    return optionReason ? optionReason.description : "";
  }
  getSelectedConclusion(): string {
    const selectConclusion = this.formCase.get("cas_reasons_falt").value;
    const selectOptionCon = this.typeFalt.find(
      (option) => option.ls_codvalue === selectConclusion
    );
    return selectConclusion ? selectOptionCon.description : "";
  }
  getNivel(): string {
    const selectLevel = this.formCreate.get("dis_niv").value;
    const optionLev = this.level.find(
      (option) => option.ls_codvalue === selectLevel
    );
    return optionLev ? optionLev.description : "";
  }
  getSoporte(): string {
    const selectOpti = this.formCreate.get("dis_sop").value;
    const optionLev = this.afirm.find(
      (option) => option.ls_codvalue === selectOpti
    );
    return optionLev ? optionLev.description : "";
  }

  onSubmitUpdate() {
    if (this.formCitation.valid) {
      this.loading.emit(true);
      let body = {
        case: this.formCase.value,
        citation: this.formCitation.value,
      };
      this.WebApiService.putRequest(this.endpoint + "/" + this.idRol, body, {
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
  onSubmit() {
    if (this.formCreate.valid) {
      this.loading.emit(true);
      let body = {
        incapacidades: this.formCreate.value,
        archivoRes: this.nuevoArchivo,
      };
      this.handler.showLoadin("Guardando Registro", "Por favor espere...");
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
  onSelectionChange(event) {
    let exitsPersonal = this.PersonaleInfo.find(
      (element) => element.document == event
    );

    if (exitsPersonal) {
      this.formCreate.get("dis_idPersonale").setValue(exitsPersonal.idPersonale);
      this.formCreate.get("dis_pos").setValue(exitsPersonal.dis_pos);
    }
  }
  generateTable(data) {
    this.displayedColumns = ["currentm_user", "date_move", "type_move"];
    this.historyMon = data;
    this.clickedRows = new Set<PeriodicElement>();
  }
  step = 0;

  setStep(index: number) {
    this.step = index;
  }
  nextStep1() {
    this.step++;
  }
  nextStep(stepIndex: number) {
    this.stepper.selectedIndex = 4;
    this.stepper.selectedIndex = stepIndex + 1;
  }
  nextStepConclu(index: number) {
    this.stepCon.selectedIndex = index + 1;
  }
  nextStepCase(index: number) {
    this.stepCase.selectedIndex = index + 1;
  }
  prevStep() {
    this.step--;
  }
  onRadioChange(event) {
    event === "121/16" ? (this.checkUs = true) : (this.checkUs = false);
  }
  onTypeMod(event) {
    event === "127/3" ? (this.checkOption = true) : (this.checkOption = false);
    event === "127/2"
      ? (this.checkAddress = true)
      : (this.checkAddress = false);
  }
  onChangeAfirm(event) {
    event === "17/1" ? (this.check_cood = true) : (this.check_cood = false);
    if (this.view == "update" && event === "17/0") {
      this.caract = false;
      this.formCreate.get("file_sp").setValue("");
    } else {
      this.caract = true;
    }
  }
  isObsRequired(stateValue: string): boolean {
    return stateValue === "39/1" || stateValue === "39/3";
  }
  seleccionarArchivo(event) {
    var files = event.target.files;
    var archivos = [];
    // Función para leer archivos de manera secuencial con Promesas
    const leerArchivo = (file) => {
      return new Promise<void>((resolve) => {
        var reader = new FileReader();
        reader.onload = (readerEvent) => {
          var archivo = {
            nombreArchivo: file.name,
            base64textString: btoa(readerEvent.target.result.toString()),
          };
          archivos.push(archivo);
          resolve();
        };
        reader.readAsBinaryString(file);
      });
    };
    // Utilizar async/await para leer archivos secuencialmente
    const leerArchivosSecuencialmente = async () => {
      for (var i = 0; i < files.length; i++) {
        await leerArchivo(files[i]);
      }
      this.nuevoArchivo = archivos; 
    };
    leerArchivosSecuencialmente();
  }
  // Tabla Contenido
  option(action, codigo = null, idPersonale, dis_id) {
    var dialogRef;
    switch (action) {
      case "viewCit":
        this.loading.emit(true);
        // this.loading = true;
        dialogRef = this.dialog.open(CitationDialog, {
          data: {
            window: "viewCit",
            codigo,
          },
        });
        dialogRef.disableClose = true;
        // LOADING
        dialogRef.componentInstance.loading.subscribe((val) => {
          this.loading = val;
        });
        dialogRef.afterClosed().subscribe((result) => {
          // this.sendRequest();
          console.log("The dialog was closed");
          console.log(result);
        });
        break;
      case "createCit":
        // this.loading.emit(true);createApla
        // this.loading = true;
        dialogRef = this.dialog.open(CitationDialog, {
          data: {
            window: "createCit",
            codigo,
            
          },
        });
        dialogRef.disableClose = true;

        // LOADING
        dialogRef.componentInstance.loading.subscribe((val) => {
          this.loading = val;
        });
        // RELOAD
        dialogRef.componentInstance.reload.subscribe((val) => {
          this.getDataUpdate();
        });
        break;
      case "updateCit":
        // this.loading.emit(true);
        // this.loading = true;
        dialogRef = this.dialog.open(CitationDialog, {
          data: {
            window: "updateCit",
            codigo,
          },
        });
        dialogRef.disableClose = true;
        // this.getDataUpdate();

        // LOADING
        dialogRef.componentInstance.loading.subscribe((val) => {
          this.loading = val;
        });
        // RELOAD
        dialogRef.componentInstance.reload.subscribe((val) => {
          this.getDataUpdate();
        });
        break;

      case "updateAc":
        // this.loading.emit(true);
        // this.loading = true;
        dialogRef = this.dialog.open(CitationDialog, {
          data: {
            window: "updateCit",
            codigo,
          },
        });
        dialogRef.disableClose = true;
        // this.getDataUpdate();

        // LOADING
        dialogRef.componentInstance.loading.subscribe((val) => {
          this.loading = val;
        });
        // RELOAD
        dialogRef.componentInstance.reload.subscribe((val) => {
          this.getDataUpdate();
        });
        break;
      case "createApla":
        // this.loading.emit(true);updateApla
        // this.loading = true;
        // dialogRef = this.dialog.open(CitationDialog, {
          dialogRef = this.dialog.open(PostponementDialog, {
          data: {
            window: "createApla",
            codigo,
            idPersonale,
            dis_id,
          },
        });
        dialogRef.disableClose = true;

        // LOADING
        dialogRef.componentInstance.loading.subscribe((val) => {
          this.loading = val;
        });
        // RELOAD
        dialogRef.componentInstance.reload.subscribe((val) => {
          this.getDataUpdate();
        });
        break;
      case "updateApla":
        // this.loading.emit(true);updateAcla
        // this.loading = true;
        dialogRef = this.dialog.open(PostponementDialog, {
          data: {
            window: "updateApla",
            codigo,
            idPersonale,
            dis_id,
          },
        });
        dialogRef.disableClose = true;

        // LOADING
        dialogRef.componentInstance.loading.subscribe((val) => {
          this.loading = val;
        });
        // RELOAD
        dialogRef.componentInstance.reload.subscribe((val) => {
          this.getDataUpdate();
        });
        break;
      case "createAcla":
        // this.loading.emit(true);updateConc
        // this.loading = true;
        dialogRef = this.dialog.open(ClarificationDialog, {
          data: {
            window: "createAcla",
            codigo,
            idPersonale,
            dis_id,
          },
        });
        dialogRef.disableClose = true;

        // LOADING
        dialogRef.componentInstance.loading.subscribe((val) => {
          this.loading = val;
        });
        // RELOAD
        dialogRef.componentInstance.reload.subscribe((val) => {
          this.getDataUpdate();
        });
        break;
      case "updateAcla":
        // this.loading.emit(true);updateConc
        // this.loading = true;
        dialogRef = this.dialog.open(ClarificationDialog, {
          data: {
            window: "updateAcla",
            codigo,
            idPersonale,
            dis_id,
          },
        });
        dialogRef.disableClose = true;

        // LOADING
        dialogRef.componentInstance.loading.subscribe((val) => {
          this.loading = val;
        });
        // RELOAD
        dialogRef.componentInstance.reload.subscribe((val) => {
          this.getDataUpdate();
        });
        break;
      case "updateConc":
        // this.loading.emit(true);
        // this.loading = true;
        dialogRef = this.dialog.open(ConclusionDialog, {
          data: {
            window: "updateConc",
            codigo,
            idPersonale,
            dis_id,
          },
        });
        dialogRef.disableClose = true;

        // LOADING
        dialogRef.componentInstance.loading.subscribe((val) => {
          this.loading = val;
        });
        // RELOAD
        dialogRef.componentInstance.reload.subscribe((val) => {
          this.getDataUpdate();
        });
        break;
        case "pdfCitation":
          dialogRef = this.dialog.open(CitationDialog, {
            data: {
              window: "pdfCitation",
              codigo,
              idPersonale
            },
          });
        break;
        case "pdfClarification":
          dialogRef = this.dialog.open(ClarificationDialog, {
            data: {
              window: "pdfClarification",
              codigo,
              idPersonale
            },
          });
        break;
        case "pdfPostponement":
          dialogRef = this.dialog.open(PostponementDialog, {
            data: {
              window: "pdfPostponement",
              codigo,
              idPersonale
            },
          });
        break;
        case "pdfConclusion":
          dialogRef = this.dialog.open(ConclusionDialog, {
            data: {
              window: "pdfConclusion",
              codigo,
              idPersonale
            },
          });
        break;
        case "firma_pdf":
          dialogRef = this.dialog.open(ConclusionDialog, {
            data: {
              window: "firma_pdf",
              codigo,
              idPersonale
            },
          });
           // LOADING
          dialogRef.componentInstance.loading.subscribe((val) => {
            this.loading = val;
          });
          // RELOAD
          dialogRef.componentInstance.reload.subscribe((val) => {
            this.getDataUpdate();
          });
        break;
        case "firma_up":
          dialogRef = this.dialog.open(ConclusionDialog, {
            data: {
              window: "firma_up",
              codigo,
              idPersonale
            },
          });
           // LOADING
          dialogRef.componentInstance.loading.subscribe((val) => {
            this.loading = val;
          });
          // RELOAD
          dialogRef.componentInstance.reload.subscribe((val) => {
            this.getDataUpdate();
          });
        break;
    }
  }

 
}
