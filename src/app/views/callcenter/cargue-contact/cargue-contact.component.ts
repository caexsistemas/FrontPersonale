import {
  Component,
  OnInit,
  ViewChild,
  QueryList,
  ViewChildren,
  EventEmitter,
  Output,
  Inject
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
import { FormGroup, FormControl, Validators, ValidatorFn, ValidationErrors } from '@angular/forms';
import { cargueBaseDialog } from "../../../dialogs/cargueBase/cargueBase.dialog.component";
import { MatBottomSheet } from '@angular/material/bottom-sheet';

@Component({
  selector: 'app-cargue-contact',
  templateUrl: './cargue-contact.component.html',
  styleUrls: ['./cargue-contact.component.css']
})

export class CargueContactComponent implements OnInit {

  endpoint: string = "/carguecontac";
  id: number = null;
  permissions: any = null;
  contenTable: any = [];
  dataPdf: any = [];
  loading: boolean = false;
  displayedColumns: any = [];
  dataSource: any = [];
  public detaNovSal = [];
  contaClick: number = 0;
  //Control Permiso
  component = "/callcenter/cargue-contact";
  //History
  public cuser: any = JSON.parse(localStorage.getItem("currentUser"));

  @ViewChildren(MatSort) sort = new QueryList<MatSort>();
  @ViewChildren(MatPaginator) paginator = new QueryList<MatPaginator>();
  @ViewChild("infoModal", { static: false }) public infoModal: ModalDirective;

  constructor(
    private _tools: Tools,
    private WebApiService: WebApiService,
    public handler: HandlerAppService,
    public dialog: MatDialog,
    private matBottomSheet : MatBottomSheet
  ) {}

  ngOnInit(): void {
    this.sendRequest();
    // this.permissions = this.handler.permissionsApp;
  }


  sendRequest() {
    this.loading = true;
    this.WebApiService.getRequest(this.endpoint, {
      action: "desBaseContact",
      idUser: this.cuser.iduser,
      role: this.cuser.role,
      token: this.cuser.token,
      modulo: this.component
    }).subscribe(
      (data) => {
        
        if (data.success == true) {
          this.permissions = this.handler.getPermissions(this.component);
          this.generateTable(data.data["desBaseContact"]);
          this.contenTable = data.data["desBaseContact"];
          this.loading = false;
        } else {
          this.handler.handlerError(data);
          this.loading = false;
        }
      },
      (error) => {
        this.handler.showError("Se produjo un error"+error);
        this.loading = false;
      }
    );
  }
  //Tabla Contenido
  generateTable(data) {
    this.displayedColumns = [
      "view",
      "id_cargue",
      "name",
      "camapana",
      "nomb_arch",
      "fch_hra_reg",
      "matriz",
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

  //Filtro Tabla
  applyFilter(search) {
    this.dataSource.filter = search.trim().toLowerCase();
  }

  option(action, codigo = null, tipoMat) {
    var dialogRef;
    switch (action) {
      case "view":
        this.loading = true;
        dialogRef = this.dialog.open(cargueBaseDialog, {
          data: {
            window: "view",
            codigo,
          },
        });
        dialogRef.disableClose = true;
        // LOADING
        dialogRef.componentInstance.loading.subscribe((val) => {
          this.loading = val;
        });
        dialogRef.afterClosed().subscribe((result) => {
        });
        break;

        case "create":
          this.loading = true;
          dialogRef = this.dialog.open(cargueBaseDialog, {
            data: {
              window: "create",
              codigo
            },
          });
          dialogRef.disableClose = true;
          // LOADING
          dialogRef.componentInstance.loading.subscribe((val) => {
            this.loading = val;
          });
          // RELOAD
          dialogRef.componentInstance.reload.subscribe((val) => {
            this.sendRequest();
          });
          break;

          case "update":
            this.loading = true;
            dialogRef = this.dialog.open(cargueBaseDialog, {
              data: {
                window: "update",
                codigo,
                tipoMat: tipoMat
              },
            });
            dialogRef.disableClose = true;
            // LOADING
            dialogRef.componentInstance.loading.subscribe((val) => {
              this.loading = val;
            });
            // RELOAD
            dialogRef.componentInstance.reload.subscribe((val) => {
              this.sendRequest();
            });
            break;
        }
     }
  }
