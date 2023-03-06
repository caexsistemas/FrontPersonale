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
// import {
//   MatDialog,
//   MatDialogRef,
//   MAT_DIALOG_DATA,
// } from "@angular/material/dialog";
@Component({
  selector: 'app-suspend',
  templateUrl: './suspend.component.html',
  styleUrls: ['./suspend.component.css']
})
export class SuspendComponent implements OnInit {

  endpoint:string   = '/suspend';
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
  endpointup: string = '/suspendupload';
  urlKaysenBackend = environment.url;
  url = this.urlKaysenBackend + this.endpointup;
  contaClick:  number = 0;
  selectedFile:any;
  data: any[][];
  file: any;
  totaLfecHol:any = [];
  fin_susp: any = [];
  reg_susp: any = [];
  public detaSuspend = [];

  component = "/nomi/suspend";
  public cuser: any = JSON.parse(localStorage.getItem("currentUser"));
  @ViewChildren(MatSort) sort = new QueryList<MatSort>();
  @ViewChildren(MatPaginator) paginator = new QueryList<MatPaginator>();
  @ViewChild("infoModal", { static: false }) public infoModal: ModalDirective;
  @ViewChild('successModal', { static: false }) public successModal: ModalDirective;
  @ViewChild('fileInput') fileInput: ElementRef;
  public afuConfig = {

    multiple: false,
    formatsAllowed: ".xlsx,.xls",
    // allowedFileTypes: ['file'],
    maxSize: "20",
    uploadAPI: {
      url: this.url,
      method: "POST",
      headers: {
        'Authorization': this._tools.getToken()
      },
      user:this.cuser
    },
    // theme: "dragNDrop",
    hideProgressBar: false,
    hideResetBtn: true,
    hideSelectBtn: false,
    replaceTexts: {
      // selectFileBtn: 'Seleccione Archivo',
      resetBtn: 'Limpiar',
      uploadBtn: 'Subir Archivo',
      attachPinBtn: 'Sube información usuarios',
      hideProgressBar: false,
      afterUploadMsg_success: '',
      afterUploadMsg_error: 'Fallo al momento de cargar el archivo!',
      sizeLimit: 'Límite de tamaño',
      // allowedFileTypes: ['file'],

    }
  };

  constructor(
    private _tools: Tools,
    private WebApiService: WebApiService,
    public handler: HandlerAppService,
    public dialog: MatDialog,
    private holiday: calculateDays,
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
      "fec_rec",
      "document",
      "idPersonale",
      "month",
      "fec_ini",
      "fec_fin",
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
            dialogRef = this.dialog.open(SuspendDialog,{
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
            dialogRef = this.dialog.open(SuspendDialog,{
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
            dialogRef = this.dialog.open(SuspendDialog,{
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
 
  onFileChange(event) {
      this.loading = true;
      // console.log(event);
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
          console.log('=>**',wb);
      
          /* grab first sheet */
          const wsname = wb.SheetNames[0];
          console.log(wsname);
          
          const ws = wb.Sheets[wsname];
            console.log(ws);
            
          /* save data */
          this.data = XLSX.utils.sheet_to_json(ws, {header: 1});
          // console.log('data=>>>',this.data);
          this.data.forEach(element =>{
              // console.log(element[8]);
              
            // element.splice(8,1)              
          });          
          this.data.forEach((row, index) => {
            
            row.forEach((col, colIndex) => {
              
                if(typeof col === 'number' && col > 1 && col < 4294967296 && colIndex != 2 && colIndex != 6) {
                
                  this.data[index][colIndex] =this.convertDate(this.data[index][colIndex]);
                          
                      }if(typeof this.data[index][5] != 'number' && col > 1){
                        // console.log('fec_ini =>',this.data[index][5]);
                        // console.log('dias =>',this.data[index][8]);            
                        this.holiday.holiday(this.data[index][5],this.data[index][6]);
                        this.totaLfecHol = this.holiday.holiday(this.data[index][5],this.data[index][6]);
                        this.fin_susp = this.totaLfecHol[0];
                        this.reg_susp = this.totaLfecHol[1]
                        // console.log('fin =>', this.fin_susp);
                        // console.log('data=>>>',this.data);
                        // ---fecha fin
                        this.data[0][8] = '  FECHA DE FINALIZACION  ';
                        this.data[index][8] = this.fin_susp;
                        //------------------------------------
                        //--------fecha regreso ----------------
                        this.data[0][9] = '  FECHA DE  REINTEGRO  '
                        this.data[index][9] = this.reg_susp;
                        //----------------------------------------
                        // this.data[0][10] ='prueba';
                        // this.data[index][10] = this.fin_susp;
                        // this.data[index][7].push(this.reg_susp);
                        // console.log('fec_fin => ',this.totaLfecHol[0]);
                        // console.log('fec_regre => ',this.totaLfecHol[1]);
                        // this.data[index].push(this.fin_susp)
                        console.log(this.data);
                        if(this.data){
                          // ws['I'+index] =  {t: 'n',v:this.data[index][8],w:this.data[index][8]};
                          ws['I'+index] =  {t: 'n',v:'Wednesday, January 04, 2023,',w:'Wednesday, January 04, 2023,'};
                          // this.data = XLSX.utils.sheet_to_json(ws, {header: 1});
                          console.log('=>>>>',ws);
                          return ws;
                        }
                       

                        // ws['I2'] = this.fin_susp;
                        // ws['I3'] = this.fin_susp;

                        
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
      // console.log(date);
      return date.toLocaleDateString('fr-CA');
    }
  }

  upload(){
    this.loading = true;
    if(this.file){
      // console.log('****',this.file);
      // console.log(this.file);
      // console.log(this.cuser.iduser);
    let body = {
      // tool: this._tools,
      user:this.cuser.iduser
    }; 
      this.WebApiService.uploadRequest(this.endpointup,this.file,this._tools.getIdentity()
      ).subscribe(
        (data) => {
          if (data) {
            // console.log('dta');
            // console.log(data);
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
}
