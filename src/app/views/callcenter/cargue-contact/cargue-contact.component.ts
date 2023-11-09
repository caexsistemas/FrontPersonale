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
//import { cargueBaseDialog } from "../../../dialogs/cargueBase/cargueBase.dialog.component";
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
  isFileValid: boolean = true;
  displayedColumns: any = [];
  dataSource: any = [];
  public detaNovSal = [];
  idcamp: string;
  contaClick: number = 0; 
  //Campos Contac
  ListSubCamp: any = [];
  ListCampana: any = [];
  ListAsgCamp: any = [];
  FiltersubCampana: any = [];
  ListCanal: any = [];
  cargForm: FormGroup;
  selectedFile: File;
  archivo = {
    nombre: null,
    nombreArchivo: null,
    base64textString: null
}
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
    this.initFormsCarbas();
    this.permissions = this.handler.permissionsApp;
  }

  initFormsCarbas() {
    this.sendRequest();
    this.cargForm = new FormGroup({
      campana: new FormControl(""),
      asc_canal: new FormControl(""),
      subcampana: new FormControl(""),
      date: new FormControl(""),
      file: new FormControl(),
      createdBy: new FormControl(""),
    });
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

          this.ListCampana = data.data["getCampana"];
          this.ListSubCamp = data.data["getSubCampana"];
          this.ListCanal = data.data["getCanal"];

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

  getSubcampana(event) {
    console.log(event);
    this.idcamp = event;
    this.FiltersubCampana = this.ListSubCamp.filter(
      (subcampanaItem) => subcampanaItem.sub_camid === event
    );
  }


  selectedFileName = 'Ningún archivo seleccionado (.xlsx)';

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      const allowedExtensions = ['.xlsx'];
      const fileExtension = file.name.toLowerCase().substr(file.name.lastIndexOf('.'));
      if (allowedExtensions.includes(fileExtension)) {
        this.selectedFileName = file.name;
        this.selectedFile = event.target.files[0];
        this.isFileValid = true;       
      } else {
        this.selectedFileName = 'Archivo no permitido';
        this.isFileValid = false;
        this.cargForm.get('file').setValue(null);
      }
    } else {
      this.selectedFileName = 'Ningún archivo seleccionado (.xlsx)';
    }
  }

  onSubmiBase(){
    if (this.cargForm.valid) {
      this.loading = true;
      
      
      let body = {
          carBase: this.cargForm.value,
          fileArc: JSON.stringify(this.cargForm.value.file)
      }
      this.WebApiService.postRequest(this.endpoint, body, {
        token: this.cuser.token,
        idUser: this.cuser.iduser,
        modulo: this.component
      })
          .subscribe(
              data => {
                  if (data.success) {

                      this.handler.showSuccess(data.message);

                      
                  } else {
                      this.handler.handlerError(data);
                      this.loading = false;
                  }
              },
              error => {
                  this.handler.showError();
                  this.loading = false;
              }
          );
    }else {
        this.handler.showError('Complete la informacion necesaria' + this.cargForm.valid);
        this.loading = false;
    }
  } 
  


}
