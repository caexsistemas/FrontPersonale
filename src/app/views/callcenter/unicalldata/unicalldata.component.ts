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
import { MatBottomSheet } from '@angular/material/bottom-sheet';
//import { ReportsRqcalidadComponent } from "../../../dialogs/reports/rqcalidad/reports-rqcalidad.component";

@Component({
  selector: 'app-unicalldata',
  templateUrl: './unicalldata.component.html',
  styleUrls: ['./unicalldata.component.css']
})
export class UnicalldataComponent implements OnInit {

  endpoint: string = "/unicalldata";
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
  component = "/callcenter/unicalldata";
  //History
  public cuser: any = JSON.parse(localStorage.getItem("currentUser"));
  // @Output() loading = new EventEmitter();
  // @Output() reload = new EventEmitter();
  @ViewChildren(MatSort) sort = new QueryList<MatSort>();
  @ViewChildren(MatPaginator) paginator = new QueryList<MatPaginator>();
  @ViewChild("infoModal", { static: false }) public infoModal: ModalDirective;


  constructor(
    private _tools: Tools,
    private WebApiService: WebApiService,
    public handler: HandlerAppService,
    public dialog: MatDialog,
    private matBottomSheet : MatBottomSheet
  ) { }

  ngOnInit(): void {
    
  }

}
