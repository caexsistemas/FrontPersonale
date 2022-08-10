import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Component, Inject, Output, EventEmitter, OnInit, ChangeDetectorRef, AfterContentChecked } from '@angular/core';
import { WebApiService } from '../../services/web-api.service';
import { FormGroup, FormControl, Validators, ValidatorFn, ValidationErrors, FormArray } from '@angular/forms';
import { environment } from '../../../environments/environment';
import { HandlerAppService } from '../../services/handler-app.service';
import { global } from '../../services/global';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';

//import { Console } from 'console';

export interface CountryI{
    idState: number;
    name: string;
}

export interface CityI{
    idCity: number;
    name: string;
    idState: number;
}

@Component({
    selector: 'management-dialog',
    templateUrl: 'management.dialog.html',
    styleUrls: ['./management.dialog.component.css'],
})

export class ManagementDialog implements AfterContentChecked{
    // VARIABLES
    view: string = null;
    personale: any = []; 
    per: any = []; 
    medical: any = []; 
    academic: any = []; 
    working: any = []; 
    salary: any = []; 
    family: any = []; 
    children: any = []; 
    sos : any = [];
    endowmentData : any = [];
    title: string = null;
    id: number = null;
    typeidentifi: any = []; 
    typerol: any = [];
    typegender: any = []; 
    selSiNo: any = [];
    typeEtn: any = []; 
    selSnCer: any = []; 
    steCilv: any = []; 
    rol : any = [];
    stuPer: any = [];
    typeblood: any = [];
    typeEps: any = [];
    typePension: any = [];
    typeCesantias: any = [];
    typeCajaComp: any = [];
    nevAcademy: any = [];
    typeContr: any = [];
    typeArea: any = [];
    typeposition: any = [];
    typefamilyinf: any = [];
    typeSalaryinfo: any = [];
    typehouse: any = [
        {ls_codvalue: 'Apartamento', description:'Apartamento'},
        {ls_codvalue: 'Casa', description:'Casa'},
        {ls_codvalue: 'Apartaestudio', description:'Apartaestudio'},
        {ls_codvalue: 'Habitacion', description:'Habitación'}
    ];
    typezona: any = [
        {ls_codvalue:'Urbana', description: 'Urbana'},
        {ls_codvalue:'Rural', description: 'Rural'}
    ];

    public age;
    public usuario;
    public medicalinf;
    public foncepinf;
    public academyinf;
    public workininf;
    public childrensinf;
    panelOpenState = false;
    email = new FormControl('', [Validators.required, Validators.email]);

    public selectdCountry: CountryI = {idState: 0, name: ''};
    public countries: CountryI[];
    public countriesBirt: CountryI[];
    public cities: CityI[];
    public citiestem: CityI[];
    public citiesbirth: CityI[];
    public citieswork: CityI[];
    //Acordion
    step = 0;

    setStep(index: number) {
        this.step = index;
    }

    nextStep() {
        this.step++;
    }

    prevStep() {
        this.step--;
    }
   
    // registro a consultar.
    endpoint: string = '/personal';
    // maskphone       = global.maskPhone;
    // maskphonehogar  = global.maskPhoneHogar;
    maskDNI         = global.maskDNI;
    public cuser: any = JSON.parse(localStorage.getItem('currentUser'));
    component = "/management/gestion";

    // FORMULARIOS
    formUsuario: FormGroup;
    formUmedical: FormGroup;
    formFoncep: FormGroup;
    formAcademy: FormGroup;
    formWorking: FormGroup;
    formChildren: FormGroup;
    formFamily: FormGroup; 
    formSalary:FormGroup;

    status: any = [
        { codigo: '', nombre: 'Seleccione..' },
        { codigo: 1, nombre: 'Activo' },
        { codigo: 0, nombre: 'Inactivo' }
    ];

    // // OUTPUTS
    @Output() loading = new EventEmitter();
    @Output() reload = new EventEmitter();

    constructor(
        public dialogRef: MatDialogRef<ManagementDialog>,
        private WebApiService: WebApiService,
        private handler: HandlerAppService,
        @Inject(MAT_DIALOG_DATA) public data,
        public dialog: MatDialog,
        private cdref: ChangeDetectorRef
    ) {
        this.view = this.data.window;
        this.id = null;
        
        switch (this.view) {
            case 'view':
                this.id = this.data.codigo;
                this.loading.emit(true);
                this.WebApiService.getRequest(this.endpoint + '/' + this.id, {
                    token: this.cuser.token,
                    idUser: this.cuser.iduser,
                    modulo: this.component
                })
                    .subscribe(
                        data => {
                            if (data.success == true) {
                                let date = new Date();
                                this.personale     = data.data[0][0];
                                this.medical       = data.data[1][0];
                                this.academic      = data.data[2][0];
                                this.working       = data.data[3][0];
                                this.salary        = data.data[4][0];
                                this.family        = data.data[5][0];
                                this.sos           = data.data[6][0];
                                this.endowmentData = data.data[7][0];
                                this.children      = data.data[8];       
                                this.loading.emit(false);
                            } else {
                                this.handler.handlerError(data);
                                this.closeDialog();
                                this.loading.emit(false);
                            }
                        },
                        error => {
                            this.handler.showError('Se produjo un error');
                            this.loading.emit(false);
                        }
                    );
                break;
            case 'create':
                this.initForms();
                this.title = "Crear usuario ";
                break;
            case 'update':
                this.initForms();
                this.id = this.data.codigo;
                this.title = "Editar usuario" + this.id;
                break;
        }
    }

    ngAfterContentChecked() : void {
        //this.cdref.detectChanges();
        //console.log("Repito");
    }

    initForms() {
        this.getDataInit();
        this.formUsuario = new FormGroup({
            name: new FormControl(""),
            //surname: new FormControl(""),
            document: new FormControl(""),
            email: new FormControl(""),
            phone: new FormControl(""),
            //password: new FormControl(""),
            //role: new FormControl(""),
            idDocumentType: new FormControl(""),
            expeditionDate: new FormControl(""),
            idGender: new FormControl(""),
            birthDate:new FormControl(""),
            isColombian:new FormControl(""),
            idEthnicGroup:new FormControl(""),
            certificate:new FormControl(""),
            idMarital:new FormControl(""),
            nameContact:new FormControl(""),
            businessEmail:new FormControl(""),
            zone:new FormControl(""),
            houseType:new FormControl(""),
            stratum:new FormControl(""),
            address:new FormControl(""),
            neighborhood:new FormControl(""),
            displacementTime:new FormControl(""),
            Departamentexpedition:new FormControl(""),
            expeditionCity:new FormControl(""),
            DepartamentBirth:new FormControl(""),
            citybBirth:new FormControl(""),
            city:new FormControl(""),
            phoneEmergency:new FormControl(""),
            status:new FormControl("")
        });  
        this.formUmedical = new FormGroup({
            idBlood:new FormControl(""),
            height:new FormControl(""),
            weight:new FormControl(""),
            trauma:new FormControl(""),
            diseases:new FormControl(""),
            treatment:new FormControl("")
        });
        this.formFoncep = new FormGroup({
            idEps:new FormControl(""),
            idPension:new FormControl(""),
            idSeverance:new FormControl(""),
            idBenefit:new FormControl(""),
            coverageArl:new FormControl("")
        });
        this.formAcademy = new FormGroup({
            idAcademicLevel:new FormControl(""),
            isStudying:new FormControl(""),
            notStudying:new FormControl(""),
            typeStudy:new FormControl(""),
            studyMotivation:new FormControl("")
        });
        this.formWorking = new FormGroup({
            idContract:new FormControl(""),
            idPosition:new FormControl(""),
            idArea:new FormControl(""),
            immediateBoss:new FormControl(""),
            cityWork:new FormControl(""),
            vacantInformation:new FormControl(""),
            bringResume:new FormControl(""),
            admissionDate:new FormControl(""),
            withdrawalDate:new FormControl(""),
            reason:new FormControl(""),
            Departamentworking:new FormControl("")
        });
        this.formFamily = new FormGroup({
            ownHouse:new FormControl(""),
            economicContribution:new FormControl(""),
            economicDependence:new FormControl(""),	
            peopleCoexist:new FormControl(""),
            familyIncome:new FormControl(""),	
            incomeExpenses:new FormControl(""),
            typeHome:new FormControl(""),
            familyDisability:new FormControl(""),
            numberChildren:new FormControl(""),  
            childrenDepends:new FormControl("")
        });
        this.formChildren = new FormGroup({
            lessons: new FormArray([])
        });
        this.formSalary = new FormGroup({
            year: new FormControl(""),
            salary: new FormControl(""),
            transportation: new FormControl("")
        });
    }


    dateKeys(event) {
        return false;
    }

    getDataInit() {
        this.loading.emit(false);
        this.WebApiService.getRequest(this.endpoint, {
            action: 'getParamsUpdate',
            token: this.cuser.token,
            idUser: this.cuser.iduser,
            modulo: this.component
        })
        .subscribe(
           
            data => {
                if (data.success == true) {
                    let datos = data.data['values_list'];
                    this.countries = data.data['states'];
                    this.countriesBirt = data.data['states'];
                    this.cities = data.data['citys'];
                    this.optionSelect(datos);
                    this.loading.emit(false);
                    //console.log(this.countries);

                    if (this.view == 'update') {
                        this.getDataUpdate();
                    }
                } else {
                    this.handler.handlerError(data);
                    this.loading.emit(false);
                }
            },
            error => {
                // console.log(error);
                this.handler.showError('Se produjo un error');
                this.loading.emit(false);
            }
        );
    }

    optionSelect(datos){

        for(let val in datos){
            //Tipo de Identificacion
            if( datos[val]['list_id'] == 6 ){

                this.typeidentifi.push(datos[val]);
            }
            //Tipo de Roll
            if( datos[val]['list_id'] == 19 ){this.typerol.push(datos[val]);}
            //Genero
            if( datos[val]['list_id'] == 9 ){this.typegender.push(datos[val]);}
            //Colombiano
            if(datos[val]['list_id'] == 17 ){this.selSiNo.push(datos[val]);}
            //Grupo Etnico
            if( datos[val]['list_id'] == 7 ){this.typeEtn.push(datos[val]);}
            //Sino Certificado
            if( datos[val]['list_id'] == 18 ){this.selSnCer.push(datos[val]);}
            //EStado Civil
            if( datos[val]['list_id'] == 10 ){this.steCilv.push(datos[val]);}
            //Estado
            if( datos[val]['list_id'] == 13 ){this.stuPer.push(datos[val]);}
            //Tipo Sangre
            if( datos[val]['list_id'] == 2 ){this.typeblood.push(datos[val]);}
            //Eps
            if( datos[val]['list_id'] == 15 ){this.typeEps.push(datos[val]);}
            //Pension
            if( datos[val]['list_id'] == 11 ){this.typePension.push(datos[val]);}
            //Cesantias
            if( datos[val]['list_id'] == 12 ){this.typeCesantias.push(datos[val]);}
            //Caja Compensacion
            if( datos[val]['list_id'] == 8 ){this.typeCajaComp.push(datos[val]);}
            //Nivel Academico
            if( datos[val]['list_id'] == 1 ){this.nevAcademy.push(datos[val]);}
            //Tipo de contrato
            if( datos[val]['list_id'] == 5 ){this.typeContr.push(datos[val]);}
            //Area
            if( datos[val]['list_id'] == 14 ){this.typeArea.push(datos[val]);}
            //Posicion
            if( datos[val]['list_id'] == 16 ){this.typeposition.push(datos[val]);}
        }

    }

    onSelect(idState:any):void{
        
        this.loading.emit(true);

        setTimeout(()=>{        
            this.citiestem = this.cities.filter(item => item.idState == idState);
        },3);   
        //console.log(idState);
        this.loading.emit(false);
    }

    onSelectBirth(idState:any):void{
        
        this.loading.emit(true);

        setTimeout(()=>{       
            this.citiesbirth = this.cities.filter(item => item.idState == idState);
            //console.log(this.citiesbirth);
        },3);   

        this.loading.emit(false);
    }

    onSelectLabor(idState:any):void{
        
        this.loading.emit(true);

        setTimeout(()=>{       
            this.citieswork = this.cities.filter(item => item.idState == idState);
            //console.log(this.citieswork);
        },3);   

        this.loading.emit(false);
    }
    
    //Harray Para Hijos
    get lessons(){
        return this.formChildren.controls["lessons"] as FormArray;
    }

    addChildrens(){

        const lessonsForm = new FormGroup({
            idChildren: new FormControl(""),
            name: new FormControl(""),
            idGender: new FormControl(""),
            birthDate: new FormControl("")
        });

        this.lessons.push(lessonsForm);
    }

    deleteChildren(chlindrensIndex: number){
        this.lessons.removeAt(chlindrensIndex);
    }

    onSubmit() {

        if (this.formUsuario.valid) {
            this.loading.emit(true);
            let body = {
                usuarios: this.formUsuario.value,
                infomedical: this.formUmedical.value,
                foncep: this.formFoncep.value,
                academy: this.formAcademy.value,
                working: this.formWorking.value,
                family: this.formFamily.value,
                children: this.formChildren.value,
                salary: this.formSalary.value
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
                            this.reload.emit();
                            this.closeDialog();
                        } else {
                            this.handler.handlerError(data);
                            this.loading.emit(false);
                        }
                    },
                    error => {
                        this.handler.showError();
                        this.loading.emit(false);
                    }
                )
        } else {
            this.handler.showError('Complete la informacion necesaria');
            this.loading.emit(false);
        }
    }

    getDataUpdate() {
        this.loading.emit(true);
        this.WebApiService.getRequest(this.endpoint, {
            action: 'getParamUpdateSet',
            id: this.id,
            token: this.cuser.token,
            idUser: this.cuser.iduser,
            modulo: this.component
        })
        .subscribe(
            data => {
                if (data.success) {
                    
                    this.usuario = data.data[0][0];              
                    this.formUsuario.get('name').setValue(this.usuario.name);
                    //console.log(this.usuario.name);
                    this.formUsuario.get('document').setValue(this.usuario.document);
                    this.formUsuario.get('status').setValue(this.usuario.status);
                    this.formUsuario.get('email').setValue(this.usuario.email);
                    this.formUsuario.get('phone').setValue(this.usuario.phone);
                    this.formUsuario.get('businessEmail').setValue(this.usuario.businessEmail);
                    this.formUsuario.get('idDocumentType').setValue(this.usuario.idDocumentType);
                    //Validar Data
                    if( this.usuario.expeditionDate !== null ){
                        this.formUsuario.get('expeditionDate').setValue(this.usuario.expeditionDate.split('-').reverse().join('-')); 
                    }else{
                        this.formUsuario.get('expeditionDate').setValue(""); 
                    }      
                    this.formUsuario.get('idGender').setValue(this.usuario.idGender);
                    this.formUsuario.get('birthDate').setValue(this.usuario.birthDate);
                    this.formUsuario.get('isColombian').setValue(this.usuario.isColombian);
                    this.formUsuario.get('idEthnicGroup').setValue(this.usuario.idEthnicGroup);
                    this.formUsuario.get('certificate').setValue(this.usuario.certificate);
                    this.formUsuario.get('idMarital').setValue(this.usuario.idMarital);
                    this.formUsuario.get('nameContact').setValue(this.usuario.nameContact);
                    this.formUsuario.get('phoneEmergency').setValue(this.usuario.phoneEmergency);
                    this.formUsuario.get('businessEmail').setValue(this.usuario.businessEmail);
                    this.formUsuario.get('houseType').setValue(this.usuario.houseType);
                    this.formUsuario.get('stratum').setValue(this.usuario.stratum);
                    this.formUsuario.get('address').setValue(this.usuario.address);
                    this.formUsuario.get('neighborhood').setValue(this.usuario.neighborhood);
                    this.formUsuario.get('displacementTime').setValue(this.usuario.displacementTime);
                    this.formUsuario.get('zone').setValue(this.usuario.zone);
                    //Departamentexpedition
                    this.formUsuario.get('Departamentexpedition').setValue(this.usuario.idstateexpedition);
                    this.onSelect(this.usuario.idstateexpedition);
                    //DepartamentBirth 
                    this.formUsuario.get('DepartamentBirth').setValue(this.usuario.idstatebirth);
                    this.onSelectBirth(this.usuario.idstatebirth);
                    //Departamentworking
                    this.formUsuario.get('expeditionCity').setValue(this.usuario.expeditionCity);
                    this.formUsuario.get('citybBirth').setValue(this.usuario.citybBirth);
                    this.formUsuario.get('city').setValue(this.usuario.city);
                    //Informacion Medica
                    this.medicalinf = data.data[1][0]; 
                    this.formUmedical.get('idBlood').setValue(this.medicalinf.idBlood);
                    this.formUmedical.get('height').setValue(this.medicalinf.height);
                    this.formUmedical.get('weight').setValue(this.medicalinf.weight);
                    this.formUmedical.get('trauma').setValue(this.medicalinf.trauma);
                    this.formUmedical.get('diseases').setValue(this.medicalinf.diseases);
                    this.formUmedical.get('treatment').setValue(this.medicalinf.treatment);
                    //foncep
                    this.foncepinf = data.data[2][0]; 
                    this.formFoncep.get('idEps').setValue(this.foncepinf.idEps);
                    this.formFoncep.get('idPension').setValue(this.foncepinf.idPension);
                    this.formFoncep.get('idSeverance').setValue(this.foncepinf.idSeverance);
                    this.formFoncep.get('idBenefit').setValue(this.foncepinf.idBenefit);
                    this.formFoncep.get('coverageArl').setValue(this.foncepinf.coverageArl);
                    //Academy
                    this.academyinf = data.data[3][0]; 
                    this.formAcademy.get('idAcademicLevel').setValue(this.academyinf.idAcademicLevel);
                    this.formAcademy.get('isStudying').setValue(this.academyinf.isStudying);
                    this.formAcademy.get('notStudying').setValue(this.academyinf.notStudying);
                    this.formAcademy.get('typeStudy').setValue(this.academyinf.typeStudy);
                    this.formAcademy.get('studyMotivation').setValue(this.academyinf.studyMotivation);
                    //working
                    this.workininf = data.data[4][0]; 
                    this.formWorking.get('idContract').setValue(this.workininf.idContract);
                    this.formWorking.get('idPosition').setValue(this.workininf.idPosition);
                    this.formWorking.get('idArea').setValue(this.workininf.idArea);
                    this.formWorking.get('immediateBoss').setValue(this.workininf.immediateBoss);
                    //Departamentworking
                    this.formWorking.get('Departamentworking').setValue(this.workininf.stateidworkin);
                    this.onSelectLabor(this.workininf.stateidworkin);
                    this.formWorking.get('cityWork').setValue(this.workininf.cityWork);
                    this.formWorking.get('vacantInformation').setValue(this.workininf.vacantInformation);
                    //Validar Data
                    if( this.workininf.admissionDate != null ){
                        this.formWorking.get('admissionDate').setValue(this.workininf.admissionDate.split('-').reverse().join('-'));
                    }else{
                        this.formWorking.get('admissionDate').setValue("");
                    }    
                    this.formWorking.get('withdrawalDate').setValue(this.workininf.withdrawalDate);
                    this.formWorking.get('reason').setValue(this.workininf.reason);
                    this.formWorking.get('bringResume').setValue(this.workininf.bringResume);
                    //Family
                    this.typefamilyinf = data.data[5][0]; 
                    this.formFamily.get('ownHouse').setValue(this.typefamilyinf.ownHouse);
                    this.formFamily.get('economicContribution').setValue(this.typefamilyinf.economicContribution);
                    this.formFamily.get('economicDependence').setValue(this.typefamilyinf.economicDependence);
                    this.formFamily.get('peopleCoexist').setValue(this.typefamilyinf.peopleCoexist);
                    this.formFamily.get('familyIncome').setValue(this.typefamilyinf.familyIncome);
                    this.formFamily.get('incomeExpenses').setValue(this.typefamilyinf.incomeExpenses);
                    this.formFamily.get('typeHome').setValue(this.typefamilyinf.typeHome);
                    this.formFamily.get('familyDisability').setValue(this.typefamilyinf.familyDisability);
                    this.formFamily.get('numberChildren').setValue(this.typefamilyinf.numberChildren);
                    this.formFamily.get('childrenDepends').setValue(this.typefamilyinf.childrenDepends);
                    //Salary
                    this.typeSalaryinfo = data.data[7][0]; 
                    this.formSalary.get('year').setValue(this.typeSalaryinfo.year);
                    this.formSalary.get('salary').setValue(this.typeSalaryinfo.salary);
                    this.formSalary.get('transportation').setValue(this.typeSalaryinfo.transportation);
                    //Children
                    this.childrensinf  = data.data[6]; 
                    this.childrensinf .forEach(function(obj, index) {

                        const lessonsFormUP = new FormGroup({
                            idChildren: new FormControl(obj['idChildren']),
                            name: new FormControl(obj['name']),
                            idGender: new FormControl(obj['idGender']),
                            birthDate: new FormControl(obj['birthDate'])
                        });
                
                        this.lessons.push(lessonsFormUP);
                        
                    }.bind(this));


                    this.loading.emit(false);
                } else {
                    this.handler.handlerError(data);
                    this.loading.emit(false);
                    this.closeDialog();
                }
            },
            error => {
                this.handler.showError();
                this.loading.emit(false);
            }
        );
    }

    onSubmitUpdate() {
        if( (this.formUsuario.valid )){
            let body = {
                usuario:   this.formUsuario.value,
                infomedical: this.formUmedical.value,
                foncep: this.formFoncep.value,
                academy: this.formAcademy.value,
                working: this.formWorking.value,
                family: this.formFamily.value,
                children: this.formChildren.value,
                salary: this.formSalary.value
            }
            this.loading.emit(true);
            this.WebApiService.putRequest(this.endpoint+'/'+this.id,body,{
                action: 'getParamUpdateData',
                token: this.cuser.token,
                idUser: this.cuser.iduser,
                modulo: this.component
            })
            .subscribe(
                data=>{
                    if(data.success){
                        this.handler.showSuccess(data.message);
                        this.reload.emit();
                        this.closeDialog();
                    }else{
                        this.handler.handlerError(data);
                        this.loading.emit(false);
                    }
                },
                error=>{
                    this.handler.showError(Object.values(error));
                    this.loading.emit(false);
                }
            );
        }else{
            this.handler.showError('Complete la información necesaria');
        }
    }

    closeDialog() {
        this.dialogRef.close();
    }

    getErrorMessage() {
        if (this.email.hasError('required')) {
          return 'Debes ingresar un valor';
        }
        return this.email.hasError('email') ? 'Not a valid email' : '';
      }















}
