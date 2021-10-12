/**
    * @description      : 
    * @author           : Maricel Jimenez
    * @group            : 
    * @created          : 09/08/2021 - 14:52:03
    * 
    
**/
import { Component, OnInit, ViewChild } from '@angular/core';
import { Tools } from '../../Tools/tools.page';

import { ModalDirective } from 'ngx-bootstrap/modal';
import { ManagementService } from '../../services/management.service';
import { global } from '../../services/global';
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
 

  public afuConfig = {
    multiple: false,
    formatsAllowed: ".xlsx,.xls",
    maxSize: "20",
    uploadAPI: {
      url: global.url + 'Personale/uploadInformationPersonale',
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
      afterUploadMsg_success: 'Subida de archivo Exitosa !',
      afterUploadMsg_error: 'La subida fallo!',
      sizeLimit: 'Límite de tamaño'
    }
  };


  constructor(private _managementService: ManagementService, private _tools: Tools) { }
  @ViewChild('infoModal', { static: false }) public infoModal: ModalDirective;
  @ViewChild('successModal', { static: false }) public successModal: ModalDirective;
  ngOnInit(): void {
    this.getAllPersonal()

  }


  getAllPersonal() {
    this._managementService.getAllPersonal().subscribe(response => {
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
      this.detailUser['cityBirth']=(this.detailUser['cityBirth']!=null)?this.detailUser['cityBirth']+"/"+this.detailUser['estateBirth']:this.location[0].locationBirth
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
