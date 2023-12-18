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
  isFileValid: boolean = true;
  isFileAdjunt: boolean = false;
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
          this.generateTable(data.data["getDescbase"]);
          this.contenTable = data.data["getDescbase"];

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

  generateTable(data) {
    this.displayedColumns = [
      "bda_base",
      "dba_desc",
      "fech_ini",
      "fech_fin",
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

  openc() {
    if (this.contaClick == 0) {
      this.sendRequest();
    }
    this.contaClick = this.contaClick + 1;
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
        this.isFileValid  = true; 
        this.isFileAdjunt = true;      
        var reader = new FileReader();
        reader.onload = this._handleReaderLoaded.bind(this);
        reader.readAsBinaryString(file);
        this.archivo.extension = fileExtension;
        this.archivo.nombre    = file.name.replace(/\.[^/.]+$/, '');
      } else {
        this.selectedFileName = 'Archivo no permitido';
        this.isFileValid  = false;
        this.isFileAdjunt = false; 
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
    if (this.cargForm.valid && this.isFileAdjunt) {
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
                    this.sendRequest();
                    this.handler.showSuccess("La carga se completó con éxito; ahora puedes descargar haciendo clic en el botón <b>Base</b> o al siguiente <b>Link</b> <a href='"+this.dowlExcel.url+"'>"+this.dowlExcel.name+"</a>");
                      

                      this.loading = false;
                  } else {
                      this.handler.closeShow();
                      this.handler.handlerError(data);
                      this.loading = false;
                  }
              },
              mistake => {
                this.handler.closeShow();
                let msjErr = "Se presento problema al cargar el archivo";
                //let msjErr = mistake.error.message;
                this.handler.showError(msjErr);
                this.loading = false;
              }
          );
    }else {
      this.handler.closeShow(); 
        this.handler.shoWarning('¡Faltan Detalles!', 'Por favor, asegúrate de proporcionar todos los datos requeridos.');
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

  option(action, codigo = null, tipoMat) {
    var dialogRef;
    switch (action) {
      case "update":
        this.loading = true;
        dialogRef = this.dialog.open(cargueBaseDialog, {
          data: {
            window: "update",
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
    }
  }

}
