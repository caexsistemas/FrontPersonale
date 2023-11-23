import {
  Component,
  OnInit,
  ViewChild,
  QueryList,
  ViewChildren,
} from "@angular/core";
import { Tools } from "../../../Tools/tools.page";
import { WebApiService } from "../../../services/web-api.service";
import { ModalDirective } from "ngx-bootstrap/modal";
import { HandlerAppService } from "../../../services/handler-app.service";
import { global } from "../../../services/global";
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from "@angular/material/dialog";
import { MatTableDataSource } from "@angular/material/table";
import { MatSort } from "@angular/material/sort";
import { MatPaginator } from "@angular/material/paginator";
import { RqcalidadDialog } from "../../../dialogs/rqcalidad/rqcalidad.dialog.component";
import { MatBottomSheet } from "@angular/material/bottom-sheet";
import { FeedbackDialog } from "../../../dialogs/feedback/feedback.dialog.component";
import { ReportsFeddBackComponent } from "../../../dialogs/reports/feedback/reports-feedback.component";
import { FormControl, FormGroup } from "@angular/forms";

@Component({
  selector: "app-dwlcontact",
  templateUrl: "./dwlcontact.component.html",
  styleUrls: ["./dwlcontact.component.css"],
})
export class DwlcontactComponent implements OnInit {
  endpoint: string = "/dwcontac";
  id: number = null;
  permissions: any = null;
  campana: any = [];
  idcamp: string;
  subCampana: any = [];
  subCampanaorigin: any = [];
  asigCampana: any = [];
  asigBase: any = [];
  dataPdf: any = [];
  loading: boolean = false;
  displayedColumns: any = [];
  dataSource: any = [];
  public detaNovSal = [];
  contaClick: number = 0;
  valorFeed: any[];
  dwlForm: FormGroup;
  //Control Permiso
  //History
  public cuser: any = JSON.parse(localStorage.getItem("currentUser"));
  // @Output() loading = new EventEmitter();
  // @Output() reload = new EventEmitter();
  @ViewChildren(MatSort) sort = new QueryList<MatSort>();
  @ViewChildren(MatPaginator) paginator = new QueryList<MatPaginator>();
  @ViewChild("infoModal", { static: false }) public infoModal: ModalDirective;

  component = "/callcenter/dwcontac";

  constructor(
    private _tools: Tools,
    private WebApiService: WebApiService,
    public handler: HandlerAppService,
    public dialog: MatDialog,
    private matBottomSheet: MatBottomSheet
  ) {}

  ngOnInit(): void {
    this.sendRequest();
    this.initFormsRole();
    this.permissions = this.handler.permissionsApp;
  }
  initFormsRole() {
    this.sendRequest();
    this.dwlForm = new FormGroup({
      name: new FormControl(""),
      status: new FormControl(""),
      base: new FormControl(""),
      createdBy: new FormControl(""),
    });
  }
  sendRequest() {
    this.loading = true;
    this.WebApiService.getRequest(this.endpoint, {
      action: "getDownloadContact",
      idUser: this.cuser.iduser,
      role: this.cuser.role,
      matrizarp: this.cuser.matrizarp,
      idPersonale: this.cuser.idPersonale,
      token: this.cuser.token,
      modulo: this.component,
    }).subscribe(
      (data) => {
        if (data.success == true) {
          this.permissions = this.handler.getPermissions(this.component);
          // this.generateTable(data.data["getContData"]);
          this.campana = data.data["getCampana"];
          this.subCampanaorigin = data.data["getSubCampana"];
          this.asigCampana = data.data["getAsigcampana"];
          this.loading = false;
        } else {
          this.handler.handlerError(data);
          this.loading = false;
        }
      },
      (mistake) => {
        let msjErr = "Tu sesión se ha cerrado o el Módulo presenta alguna Novedad";
        //let msjErr = mistake.error.message;
        this.handler.showError(msjErr);
        this.loading = false;
      }
    );
  }
  getSubcampana(event) {
    this.idcamp = event;
    this.subCampana = this.subCampanaorigin.filter(
      (subcampanaItem) => subcampanaItem.sub_camid === event
    );

    // console.log("subcampna => ", this.subCampana);
  }
  getasigBase(event) {
    this.asigBase = this.asigCampana.filter(
      (base) =>
        base.asc_campana === this.idcamp && base.asc_subcampana === event
    );

    // console.log("bases => ", this.asigBase);
  }

  descargarArchivos() {
    if (this.dwlForm.valid) {
      // if( this.formDownoadTechnology.value['fi'] <= this.formDownoadTechnology.value['ff'] && this.formDownoadTechnology.value['fi'] != '' && this.formDownoadTechnology.value['ff'] != '' ){

      let body = {
        valest: this.dwlForm.value,
      };
      // this.loading.emit(true);
      this.loading = true;
      this.WebApiService.getRequest(this.endpoint, {
        action: "downloadFiles",
        report: "" + JSON.stringify({ body }),
        token: this.cuser.token,
        idUser: this.cuser.iduser,
        modulo: this.component,
      }).subscribe(
        (data) => {
          if (data.success) {
            const link = document.createElement("a");
            link.href = data.data.url;
            link.download = data.data.file;
            link.click();
            this.handler.showSuccess(data.data.file);
            this.loading = false;
            // this.loading.emit(false);
          } else {
            this.handler.handlerError(data);
            this.loading = false;
            // this.loading.emit(false);
          }
        },
        (mistake) => {
          let msjErr = "Se produjo un Error al descargar el Archivo";
          //let msjErr = mistake.error.message;
          this.handler.showError(msjErr);
          this.loading = false;
        }
        
      );
      // }else{
      //     this.handler.showError('Periodo de consulta invalido');
      //     this.loading.emit(false);
      // }
    } else {
      this.handler.showError("Complete la informacion necesaria");
      this.loading = false;
      // this.loading.emit(false);
    }
  }
  onTriggerSheetClick() {
    this.matBottomSheet.open(ReportsFeddBackComponent);
  }
  openc() {
    if (this.contaClick == 0) {
      this.sendRequest();
    }
    this.contaClick = this.contaClick + 1;
  }
}
