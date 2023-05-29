// import { stringify} from 'fast-json-stable-stringify';
import { Component, ElementRef, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA,} from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { environment } from '../../../../environments/environment';
import { SuspendDialog } from '../../../dialogs/suspend/suspend.dialog.component';
import { HandlerAppService } from '../../../services/handler-app.service';
import { WebApiService } from "../../../services/web-api.service";
import { Tools } from '../../../Tools/tools.page';
import * as XLSX from 'xlsx';
import { element } from 'protractor';
import { calculateDays } from '../../../services/holiday.service';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { ReportsSuspendComponent } from '../../../dialogs/reports/suspend/reports-suspend.component';
import { RetributionDialog } from '../../../dialogs/retribution/retribution.dialog.component';
// import {
//   MatDialog,
//   MatDialogRef,
//   MAT_DIALOG_DATA,
// } from "@angular/material/dialog";
@Component({
  selector: 'app-retribution',
  templateUrl: './retribution.component.html',
  styleUrls: ['./retribution.component.css']
})
export class RetributionComponent implements OnInit {

  endpoint:string   = '/retribution';
  permissions:any = null;
  contenTable : any     = [];
  loading:boolean = false;
  displayedColumns:any  = [];
  displayedColumnsExcel:any  = [];
  dataSource:any        = [];
  dataSourceExcel:any        = [];
  personaleData: any = [];
  modal: 'successModal';
  datapersonale: any = [];
  endpointup: string = '/retributionupload';
  urlKaysenBackend = environment.url;
  url = this.urlKaysenBackend + this.endpointup;
  contaClick:  number = 0;
  selectedFile:any;
  data: any[][];
  dataNew: any[][];
  file: any;
  totaLfecHol:any = [];
  fin_susp: any = [];
  reg_susp: any = [];
  sundaySus: any = [];
  totalSunday:any = [];
  sundayDesc:any = [];

  public detaSuspend = [];

  component = "/nomi/retribution";
  public cuser: any = JSON.parse(localStorage.getItem("currentUser"));
  @ViewChildren(MatSort) sort = new QueryList<MatSort>();
  @ViewChildren(MatPaginator) paginator = new QueryList<MatPaginator>();
  @ViewChild("infoModal", { static: false }) public infoModal: ModalDirective;
  @ViewChild('successModal', { static: false }) public successModal: ModalDirective;
  @ViewChild('fileInput') fileInput: ElementRef;
  // public afuConfig = {

  //   multiple: false,
  //   formatsAllowed: ".xlsx,.xls",
  //   // allowedFileTypes: ['file'],
  //   maxSize: "20",
  //   uploadAPI: {
  //     url: this.url,
  //     method: "POST",
  //     headers: {
  //       'Authorization': this._tools.getToken()
  //     },
  //     user:this.cuser
  //   },
  //   // theme: "dragNDrop",
  //   hideProgressBar: false,
  //   hideResetBtn: true,
  //   hideSelectBtn: false,
  //   replaceTexts: {
  //     // selectFileBtn: 'Seleccione Archivo',
  //     resetBtn: 'Limpiar',
  //     uploadBtn: 'Subir Archivo',
  //     attachPinBtn: 'Sube información usuarios',
  //     hideProgressBar: false,
  //     afterUploadMsg_success: '',
  //     afterUploadMsg_error: 'Fallo al momento de cargar el archivo!',
  //     sizeLimit: 'Límite de tamaño',
  //     // allowedFileTypes: ['file'],

  //   }
  // };

  constructor(
    private _tools: Tools,
    private WebApiService: WebApiService,
    public handler: HandlerAppService,
    public dialog: MatDialog,
    private holiday: calculateDays,
    private matBottomSheet : MatBottomSheet
  ) { }
  step = 0;

  setStep(index: number) {
    this.step = index;
  }
  ngOnInit() {
    this.sendRequest();
    this.permissions = this.handler.permissionsApp;
  }
  sendRequest() {
    this.loading = true;
    this.WebApiService.getRequest(this.endpoint, {
      action: "getSuspend",
      idUser: this.cuser.iduser,
      role: this.cuser.role,
      matrizarp: this.cuser.matrizarp,
      token: this.cuser.token,
      modulo: this.component


    }).subscribe(
      (data) => {
        this.permissions = this.handler.getPermissions(this.component);
        console.log(this.permissions);
        console.log(data.success);

        if (data.success == true) {

          this.generateTable(data.data["getSuspend"]);
          this.contenTable = data.data["getSuspend"];
         
         
          this.loading = false;
        } else {
          this.handler.handlerError(data);
          this.loading = false;
        }
      },
      (error) => {
        this.handler.showError("Se produjo un error");
        this.loading = false;
      }
    );
  }
  generateTable(data) {
    this.displayedColumns = [
      "view",
      "fec_rad",
      "document",
      "idPersonale",
      "fec_ini",
      "fec_fin",
      "day_per",
      "day_aus",
      "day_liq",
      "sal_pro",
      "val_pri",
      "others_dev",
      "others_ded",
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
  applyFilter(search){
    this.dataSource.filter = search.trim().toLowerCase();
  }

  //Modales
  showDetails(item) {
    this.detaSuspend = item;
    this.infoModal.show()
  }
  //Cabecera
  openc(){
    if(this.contaClick == 0){
      this.sendRequest();
    }    
    this.contaClick = this.contaClick + 1;
  }
  option(action,codigo=null){
    var dialogRef;
      switch(action){
          case 'create':
            this.loading = true;
            dialogRef = this.dialog.open(RetributionDialog,{
              data: {
                window: 'create',
                codigo
              }
            });
            dialogRef.disableClose = true;
            // LOADING
            dialogRef.componentInstance.loading.subscribe(val=>{
              this.loading = val;
            });
            // RELOAD
            dialogRef.componentInstance.reload.subscribe(val=>{
              this.sendRequest();
            });
        break;
        case 'update':
            this.loading = true;
            dialogRef = this.dialog.open(RetributionDialog,{
              data: {
                window: 'update',
                codigo
              }
            });
            dialogRef.disableClose = true;
            // LOADING
            dialogRef.componentInstance.loading.subscribe(val=>{
              this.loading = val;
            });
            // RELOAD
            dialogRef.componentInstance.reload.subscribe(val=>{
              this.sendRequest();
            });
          break;
        case 'view':
            this.loading = true;
            dialogRef = this.dialog.open(RetributionDialog,{
              data: {
                window: 'view',
                codigo
              }
            });
            dialogRef.disableClose = true;
            // LOADING
            dialogRef.componentInstance.loading.subscribe(val=>{
              this.loading = val;
            });
            dialogRef.afterClosed().subscribe(result => {
              console.log('The dialog was closed');
              console.log(result);
            });
        break;
      }
  }
  getAllPersonal() {
    
    this.WebApiService.getRequest(this.endpoint,{
      action: 'getDatUpload',
      idUser: this.cuser.iduser,
      token: this.cuser.token,
      modulo: this.component
    })
      .subscribe(
        response => {
          this.permissions = this.handler.getPermissions(this.component);
          if (response.success) {
            console.log("repo: "+response);
            this.handler.showSuccess('El archivo se cargo exitosamente');
            this.personaleData = response.data;
            this.loading = false;
            this.successModal.hide();
            this.sendRequest();
          } else {
            this.datapersonale = [];
            this.handler.handlerError(response);
          }
        },
        error => {
          this.loading = false;
          this.handler.showError();
        }
      );
  }
 count: number = 0;
  onFileChange(event) {
      this.loading = true;
    if(!event.target.files[0]){
        this.handler.showError("Seleccione Archivo Correctamente");
        this.loading = false;
      }else if( event.target.files[0].type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'){
          this.file = event.target.files[0];
          
          const reader = new FileReader();
          const blob = new Blob([this.file]);
          
          reader.onload = (e: any) => {
          /* read workbook */
          const wb = XLSX.read(e.target.result, {type: 'array'});
      
          /* grab first sheet */
          const wsname = wb.SheetNames[0];
          
          var ws = wb.Sheets[wsname];
            
          /* save data */
          this.data = XLSX.utils.sheet_to_json(ws, {header: 1});
          
          
          
          this.data.forEach(element =>{
              
          });          
           
            this.data.forEach((row, index) => {
            
            row.forEach((col, colIndex) => {
              
                if(typeof col === 'number' && col > 1 && col < 4294967296 && colIndex != 0  && colIndex != 4 && colIndex != 5  && colIndex != 6  && colIndex != 7  && colIndex != 8 && colIndex != 9 && colIndex != 10) {
                
                    this.data[index][colIndex] =this.convertDate(this.data[index][colIndex]);     
                  }  
                      
            });
          
          
          });
        };
        reader.readAsArrayBuffer(blob);
        this.fileInput.nativeElement.value = '';
        this.loading = false;

      }else{
            this.handler.showError("Seleccione Archivo Correctamente");
            this.loading = false;
          }
  }
   convertDate(value) {
    if (value) {
      // const date = new Date(Math.round((value - 25569) * 86400 * 1000));
      const date = new Date(1900, 0, value - 1, 0, 0, 0, 0);
      return date.toLocaleDateString('fr-CA');
    }
  }
  

  upload(){
    this.loading = true;
    if(this.file){
     
    let body = {
      user:this.cuser.iduser
    }; 
      this.WebApiService.uploadRequest(this.endpointup,this.file,this._tools.getIdentity()
      ).subscribe(
        (data) => {
          if (data) {
           
            this.handler.showSuccess(data.message);
            this.successModal.hide();
              this.data = null;
              this.sendRequest();
              this.loading = false;
  
          } else {
            this.loading = false;
            this.handler.handlerError(data);
            this.data = null;
            this.successModal.hide();

          }
        },
        (error) => {
          console.log('error');
          console.log(error);
            this.loading = false;
            this.data = null;
            this.handler.showError('Error de documento');
        }
      );
    }else{
      this.handler.showError("Seleccione Archivo Correctamente");
            this.data = null;
            this.loading = false;
    }
  }
  removeFile() {
    this.selectedFile = null;
    this.fileInput.nativeElement.value = '';
  }

  onSubmit() {
    if (this.data.length) {
      
      this.loading = true;
      let body = {
        listas: this.data.slice(1),
        retribution:null
        
      };
      this.WebApiService.postRequest(this.endpoint, body, {
        token: this.cuser.token,
        idUser: this.cuser.iduser,
        modulo: this.component
      }).subscribe(
        (data) => {
          if (data.success) {
            this.handler.showSuccess(data.message);
            this.successModal.hide();
            this.data = null;
            this.sendRequest();
            this.loading = false;
    
          } else {
            this.handler.handlerError(data);
             this.loading = false;
             this.data = null;
             this.successModal.hide();
          }
        },
        (error) => {
          this.handler.showError();
             this.loading = false;
        }
      );
    } else {
      this.handler.showError("Complete la informacion necesaria");
             this.loading = false;
    }
  }
  onTriggerSheetClick(){
    this.matBottomSheet.open(ReportsSuspendComponent)
  }
  pdf(id) {

    this.WebApiService.getRequest(this.endpoint, {
      action: "pdf",
      id: id,
      token: this.cuser.token,
      idUser: this.cuser.iduser,
      modulo: this.component
    }).subscribe(
      (data) => {
        this.permissions = this.handler.getPermissions(this.component);
        if (data.success == true) {
              
              const link = document.createElement("a");
              link.href = data.data.url;
              link.download = data.data.file;
              link.target = "_blank";
              link.click();
              this.handler.showSuccess(data.data.file);
              this.loading = false;
        } else {
                this.handler.handlerError(data);
                this.loading = false;
        }
      },
      (error) => {
              console.log(error);
              this.handler.showError("Se produjo un error");
              this.loading = false;
      }
);
}
}
