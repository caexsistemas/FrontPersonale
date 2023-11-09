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
  isFilExist: boolean = true;
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
    base64file: null,
    extension: null
  }

  dowlExcel = {
    name: null,
    url: null
  };
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
        var reader = new FileReader();
        reader.onload = this._handleReaderLoaded.bind(this);
        reader.readAsBinaryString(file);
        this.archivo.extension = fileExtension;
        this.archivo.nombre    = file.name.replace(/\.[^/.]+$/, '');
      } else {
        this.selectedFileName = 'Archivo no permitido';
        this.isFileValid = false;
        this.cargForm.get('file').setValue(null);
      }
    } else {
      this.selectedFileName = 'Ningún archivo seleccionado (.xlsx)';
    }
  }

  _handleReaderLoaded(readerEvent){
    var binaryString = readerEvent.target.result;
    this.archivo.base64file = btoa(binaryString);
  }

  onSubmiBase(){
    if (this.cargForm.valid && this.isFileValid) {
      this.loading = true;
      this.handler.showTimePross("Procesando Base: "+this.archivo.nombre);
      
      let body = {
          carBase: this.cargForm.value,
          archivoRes: this.archivo
      }
      this.WebApiService.postRequest(this.endpoint, body, {
        token: this.cuser.token,
        idUser: this.cuser.iduser,
        modulo: this.component
      })
          .subscribe(
              data => {
                  if (data.success) {
                     
                    this.handler.closeShow();
                    this.dowlExcel.name = data.data['name_file'];
                    this.dowlExcel.url  = data.data['url_file'];
                    this.isFilExist     = false;
                    this.handler.showSuccess("La carga se completó con éxito; ahora puedes descargar haciendo clic en el botón <b>Base</b> o al siguiente <b>Link</b> <a href='"+this.dowlExcel.url+"'>"+this.dowlExcel.name+"</a>");
                      

                      this.loading = false;
                  } else {
                      this.handler.closeShow();
                      this.handler.handlerError(data);
                      this.loading = false;
                  }
              },
              error => {
                this.handler.closeShow();
                  this.handler.showError();
                  this.loading = false;
              }
          );
    }else {
      this.handler.closeShow();
        this.handler.showError('Complete la informacion Necesaria');
        this.loading = false;
    }
  } 
  
  
  dowloadExcel() {
    const link = document.createElement("a");
    link.href = this.dowlExcel.url;
    link.download = this.dowlExcel.name;
    link.target = "_blank";
    link.click();
    this.handler.showSuccess(this.dowlExcel.name);
    this.loading = false;
 }

}
