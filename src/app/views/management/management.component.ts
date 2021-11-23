
import { Component, OnInit, ViewChild, QueryList, ViewChildren } from '@angular/core';
import { Tools } from '../../Tools/tools.page';

import { ModalDirective } from 'ngx-bootstrap/modal';
import { ManagementService } from '../../services/management.service';
import { global } from '../../services/global';
import { WebApiService } from '../../services/web-api.service';
import { HandlerAppService } from '../../services/handler-app.service';

import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';


import { ManagementDialog } from '../../dialogs/management/management.dialog.component';
import { environment } from '../../../environments/environment';



@Component({
  selector: 'app-management',
  templateUrl: './management.component.html',
  styleUrls: ['./management.component.css'],
  providers: [Tools, ManagementService]
})
export class ManagementComponent implements OnInit {

  public data
  public detailUser = []
  public medicalInf = []
  public academicInf = []
  public workInf = []
  public salaryInf = []
  public familyInf = []
  public clothingInf = []
  public cosecInf = []
  public location = []
  public imc: any
  public imcInf: string
  public textImc: string
  public grEta: string

  public filters = { searchId: "", searchName: "" }

  endpoint: string = '/personal';
  endpointup: string = '/personaleupload';
  urlKaysenBackend = environment.url;
  url = this.urlKaysenBackend + this.endpointup;

  permissions: any = null;
  datapersonale: any = [];
  loading: boolean = false;

  displayedColumns: any = [];
  dataSource: any = [];

  personaleData: any = [];

  modal: 'successModal';

  @ViewChildren(MatSort) sort = new QueryList<MatSort>();
  @ViewChildren(MatPaginator) paginator = new QueryList<MatPaginator>();

  @ViewChild('infoModal', { static: false }) public infoModal: ModalDirective;
  @ViewChild('successModal', { static: false }) public successModal: ModalDirective;



  public afuConfig = {

    multiple: false,
    formatsAllowed: ".xlsx,.xls",
    maxSize: "20",
    uploadAPI: {
      url: this.url,
      method: "POST",
      headers: {
        'Authorization': this._tools.getToken()
      },
    },
    theme: "dragNDrop",
    hideProgressBar: false,
    hideResetBtn: true,
    hideSelectBtn: false,
    replaceTexts: {
      selectFileBtn: 'Seleccione Archivo',
      resetBtn: 'Limpiar',
      uploadBtn: 'Subir Archivo',
      attachPinBtn: 'Sube información usuarios',
      hideProgressBar: false,
      afterUploadMsg_success: 'El archivo se cargo exitosamente !',
      afterUploadMsg_error: 'Fallo al momento de cargar el archivo!',
      sizeLimit: 'Límite de tamaño'
    }
  };


  constructor(private _managementService: ManagementService,
    private _tools: Tools,
    private WebApiService: WebApiService,
    public handler: HandlerAppService,
    public dialog: MatDialog) { }

  getAllPersonal() {
    this.WebApiService.getRequest(this.endpoint, {
    })
      .subscribe(
        response => {
          // this.permissions = this.handler.getPermissions(this.component);
          if (response.success) {
            this.handler.showSuccess('El archivo se cargo exitosamente');
            this.personaleData = response.data;
            this.loading = false;
            this.successModal.hide();
          } else {
            this.datapersonale = [];
            this.handler.handlerError(response);
          }
        },
        error => {
          this.loading = false;
          //this.permissions = this.handler.getPermissions(this.component);
          this.handler.showError();
        }
      );
  }

  ngOnInit(): void {
    this.sendRequest();
    this.permissions = this.handler.permissionsApp;
  }


  sendRequest() {
    this.WebApiService.getRequest(this.endpoint, {
    })
      .subscribe(
        response => {
          // this.permissions = this.handler.getPermissions(this.component);
          if (response.success) {
            this.generateTable(response.data);
            this.personaleData = response.data
            this.loading = false;
          } else {
            this.datapersonale = [];
            this.handler.handlerError(response);
          }
        },
        error => {
          // this.loading = false;
          // this.permissions = this.handler.getPermissions(this.component);
          // this.handler.showError();
        }
      );
  }

  generateTable(data) {
    this.displayedColumns = [
      'view',
      'nombre',
      'documento',
      'correo',
      'telefono',
      'actions'
    ];
    this.dataSource = new MatTableDataSource(data);
    this.dataSource.sort = this.sort.toArray()[0];
    this.dataSource.paginator = this.paginator.toArray()[0];
    let search;
    if (document.contains(document.querySelector('search-input-table'))) {
      search = document.querySelector('.search-input-table');
      search.value = "";
    }
  }

  applyFilter(search) {
    this.dataSource.filter = search.trim().toLowerCase();
  }

  option(action, codigo = null) {
    var dialogRef;
    switch (action) {
      case 'view':
        this.loading = true;
        dialogRef = this.dialog.open(ManagementDialog, {
          data: {
            window: 'view',
            codigo
          }
        });
        dialogRef.disableClose = true;
        // LOADING
        dialogRef.componentInstance.loading.subscribe(val => {
          this.loading = val;
        });
        dialogRef.afterClosed().subscribe(result => {
          console.log('The dialog was closed');
          console.log(result);
        });
        break;
      case 'create':
        this.loading = true;
        dialogRef = this.dialog.open(ManagementDialog, {
          data: {
            window: 'create',
            codigo
          }
        });
        dialogRef.disableClose = true;
        // LOADING
        dialogRef.componentInstance.loading.subscribe(val => {
          this.loading = val;
        });
        // RELOAD
        dialogRef.componentInstance.reload.subscribe(val => {
          this.sendRequest();
        });
        break;
      case 'update':
        this.loading = true;
        dialogRef = this.dialog.open(ManagementDialog, {
          data: {
            window: 'update',
            codigo
          }
        });
        dialogRef.disableClose = true;
        // LOADING
        dialogRef.componentInstance.loading.subscribe(val => {
          this.loading = val;
        });
        // RELOAD
        dialogRef.componentInstance.reload.subscribe(val => {
          this.sendRequest();
        });
        break;
      // case 'active':
      //   this.updateStatus('active');
      // break;
      // case 'inactive':
      //   this.updateStatus('inactive');
      // break;
    }

  }






  searchData() {
    this._managementService.getFiltersUser(this.filters).subscribe(response => {
      this.data = response
      console.log(response)
    },
      error => {
        //console.log(<any>error)
        if (<any>error.status == 401) {
          this._tools.goToPage('login')
        } else if (<any>error.status == 500) {
          this._tools.showNotify("error", "GESTIN", "Error Interno")
        } else if (<any>error.status == 403) {
          this._tools.goToPage('403')
        }
      }
    )

  }
  cleanfilterId() {
    this.filters.searchId = ""
    this.getAllPersonal()
  }
  cleanfilterName() {
    this.filters.searchName = ""
    this.getAllPersonal()
  }

  getInformation(idPersonale) {

    this._managementService.getInformationUser(idPersonale).subscribe(response => {
      this.medicalInf = response['medical']
      this.academicInf = response['academic']
      this.workInf = response['work']
      this.salaryInf = response['salary']
      this.familyInf = response['family']
      this.familyInf[0].children = response['children']
      this.clothingInf = response['clothing']
      this.cosecInf = response['sosec']
      this.location = response['location']
      this.detailUser['cityBirth'] = (this.detailUser['cityBirth'] != null) ? this.detailUser['cityBirth'] + "/" + this.detailUser['estateBirth'] : this.location[0].locationBirth
      this.valuesNom()
      this.calculateimc(this.medicalInf[0].height, this.medicalInf[0].weight)
    },
      error => {
        //console.log(<any>error)
        if (<any>error.status == 401) {
          this._tools.goToPage('login')
        } else if (<any>error.status == 500) {
          this._tools.showNotify("error", "GESTIN", "Error Interno")
        } else if (<any>error.status == 403) {
          this._tools.goToPage('403')
        }
      }
    )
  }
  valuesNom() {
    this.salaryInf[0].nomina = parseInt(this.salaryInf[0].transportation) + parseInt(this.salaryInf[0].salary)
    this.salaryInf[0].pension = (parseInt(this.salaryInf[0].salary) * 0.12).toFixed(0)
    this.salaryInf[0].family = (parseInt(this.salaryInf[0].salary) * 0.04).toFixed(0)
    if (this.salaryInf[0].idPosition == 2 || this.salaryInf[0].idPosition == 21) {
      this.salaryInf[0].arl = (parseInt(this.salaryInf[0].salary) * 0.0435).toFixed(0)
    } else {
      this.salaryInf[0].arl = (parseInt(this.salaryInf[0].salary) * 0.00522).toFixed(0)
    }
    this.salaryInf[0].total = parseInt(this.salaryInf[0].pension) + parseInt(this.salaryInf[0].family) + parseInt(this.salaryInf[0].arl)
  }
  calculateimc(height, weight) {
    let mt = (height * 0.01)
    let number = Math.pow(mt, 2)
    this.imc = (weight / number).toFixed(1)
    if (this.imc >= '18.5' && this.imc <= '24.9') {
      this.imcInf = 'Normal'
      this.textImc = 'success'
    } else if (this.imc >= '25' && this.imc <= '29.9') {
      this.imcInf = 'Sobrepeso'
      this.textImc = 'warning'
    } else if (this.imc >= '30' && this.imc <= '34.9') {
      this.imcInf = 'Obesidad grado I'
      this.textImc = 'danger'
    } else if (this.imc >= '35' && this.imc <= '39.9') {
      this.imcInf = 'Obesidad grado II'
      this.textImc = 'danger'
    } else if (this.imc >= '40') {
      this.imcInf = 'Obesidad grado III'
      this.textImc = 'danger'
    } else if (this.imc < '18.5') {
      this.imcInf = 'Bajo de peso'
      this.textImc = 'primary'
    }


  }

  showDetails(item) {
    this.detailUser = item;
    this.detailUser['age'] = this._tools.CalculateAge(item.birthDate)
    let month = this._tools.monthDate(item.birthDate)
    this.detailUser['birthDate'] = month[0].date
    this.detailUser['month'] = month[0].month
    this.getInformation(item.idPersonale)
    this.getGroupEta(this.detailUser['age'])
    this.infoModal.show()
  }
  getGroupEta(age) {
    if (age >= '18' && age <= '29') {
      this.grEta = '18-29 años'
    } else if (age >= '30' && age <= '39') {
      this.grEta = '30-39 años'
    } else if (age >= '40' && age <= '49') {
      this.grEta = '40-49 años'
    } else if (age >= '50' && age <= '59') {
      this.grEta = '50-59 años'
    } else if (age >= '60') {
      this.grEta = '60 años o más'
    }
  }
  ageChildren(birthDate) {
    let month = this._tools.monthDate(birthDate)
    this.detailUser['agech'] = this._tools.CalculateAge(birthDate)
    return month[0].date
  }
}
