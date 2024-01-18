import {
  Component,
  Inject,
  Output,
  EventEmitter,
  ViewChildren,
  QueryList,
} from "@angular/core";
import { WebApiService } from "../../../services/web-api.service";
import {
  FormGroup,
  FormControl,
  Validators,
  ValidatorFn,
  ValidationErrors,
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
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from "@angular/material/dialog";
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
  selector: 'app-assignment-view.dialog',
  templateUrl: './assignment-view.dialog.component.html',
  styleUrls: ['./assignment-view.dialog.component.css']
})
export class AssignmentViewDialog  {

  endpoint: string = "/Assignment";
  maskDNI = global.maskDNI;
  title: string = null;
  view: string = null;
  permissions: any = null;
  formNomi: FormGroup;
  form:FormGroup;
  formInsp:FormGroup;
  component = "/selection/assignment";
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
  
  typeDocument: any = [];
  depart: any = [];
  citytBirth: any = [];
  area: any = [];
  position: any = [];
  eps: any = [];
  pension: any = [];
  citieswork: any =[];
  cities: any = [];
  cargo: any =[];
  typeMatriz: any = [];
  //History
  historyMon: any = [];
  check: 0;
  displayedColumns: any = [];
  checked = false;
  disabled = false;
  matriz: boolean = false;
  country: any = [];
  typeCargo: any = [];
  birth: boolean = false;
  extra: boolean = false;
  ages: any = [];
  typeGender: any [];
  group: any = [];
  public clickedRows;
  public cuser: any = JSON.parse(localStorage.getItem("currentUser"));
  // public citieswork: CityI[];

  //OUTPUTS
  @Output() loading = new EventEmitter();
  @Output() reload = new EventEmitter();
  @ViewChildren(MatSort) sort = new QueryList<MatSort>();

  constructor(
    public dialogRef: MatDialogRef<AssignmentViewDialog>,
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
      case "view":
        this.title = "Información General";
        this.idTec = this.data.codigo;
        this.loading.emit(true);
        this.WebApiService.getRequest(
          this.endpoint + "/" + this.idTec,
          {
            token: this.cuser.token,
            idUser: this.cuser.iduser,
            modulo: this.component
          }
        ).subscribe(
          (data) => {
            if (data.success == true) {
              this.techno = data.data["getDatviewPerson"][0];
              this.country = this.techno.pais_nac
              this.typeCargo = this.techno.car_sol
              // this.generateTable(data.data["getDatHistory"]);
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
  closeDialog() {
    this.dialogRef.close();
    this.reload.emit(true);
  }
  step = 0;

  setStep(index: number) {
    this.step = index;
  }

}
