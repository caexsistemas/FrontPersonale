import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, Inject, Output, EventEmitter, OnInit, ChangeDetectorRef, AfterContentChecked } from '@angular/core';
import { WebApiService } from '../../services/web-api.service';
import { FormGroup, FormControl, Validators, ValidatorFn, ValidationErrors, FormArray } from '@angular/forms';
import { HandlerAppService } from '../../services/handler-app.service';
import { global } from '../../services/global';
import {Observable} from 'rxjs';

export interface PeriodicElement {
    currentm_user: string,
    date_move:string,
    type_move: string
  }

export interface personale {
    idPersonale: number,
    name: string,
    document: string
}

@Component({
    selector: 'incapacidades-dialog',
    templateUrl: 'incapacidades.dialog.html',
    styleUrls: ['./incapacidades.dialog.component.css'],
})

export class IncapacidadesDialog implements OnInit {

    view: string = null;
    id: number = null;
    endpoint: string = '/inability';
    dataIncap: any = []; 
    title: string = null;
    filteredOptions: Observable<personale[]>;
    options: personale[];
    PersonaleInfo: any = [];
    PersonaleInfoJF: any = [];
    myControl = new FormControl();
    motausenList: any = [];
    origenausenList: any = [];
    descorigenList: any = [];
    descorigenListTemp: any = [];
    optmotausen: string = null;
    optorigenausen: string = null;
    medRecepInList: any = [];
    siNoList: any = [];
    tipIncaList: any = [];
    fechInicInc: string = "";
    fechaFinInc: string = "";
    estIncAis: any = [];
    codDiagSegList: any = [];
    stadgestionList: any = [];
    ListEps:       any = [];
    ListPension:   any = [];
    public sidebarMinimized = false;
    bluedRequired: boolean = true;
    textAreRequired: boolean = false;
    //History
    historyMon: any = [];
    displayedColumns:any  = [];
    public clickedRows;
    public cuser: any = JSON.parse(localStorage.getItem('currentUser'));
    component = "/incapacidades/gestion";
    gesAnteSopo: string = "";

    archivo = {
        nombre: null,
        nombreArchivo: null,
        base64textString: null
    }
    //OUTPUTS
    @Output() loading = new EventEmitter();
    @Output() reload = new EventEmitter();

     // FORMULARIOS
     formIncapad: FormGroup;

    constructor(
        public dialogRef: MatDialogRef<IncapacidadesDialog>,
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
                                this.dataIncap = data.data['getDatIna'][0];   
                                this.generateTable(data.data['getDatHistory']);                      
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
                this.title = "Crear Ausentimos por Incapacidad";
            break;
            case 'update':
                this.initForms();
                this.title = "Actualizar Ausentimos por Incapacidad";
                this.id = this.data.codigo;
            break;
        }
    }

    closeDialog() {
        this.dialogRef.close();
    }

    //Formulario
    initForms() {

        this.getDataInit();
        this.formIncapad = new FormGroup({
            numdocument: new FormControl(""),
            idPersonale: new FormControl(""),
            motausen: new FormControl(""),
            origenausen: new FormControl(""),
            descorigen: new FormControl(""),
            medrecepin: new FormControl(""),
            incaporiginal: new FormControl(""),
            nombentreinc: new FormControl(""),
            fechainicausen: new FormControl(""),
            fechafinausen: new FormControl(""),
            tipoincap: new FormControl(""),
            numdiasincap: new FormControl(""),
            codcie: new FormControl(""),
            fechageneracion: new FormControl(""),
            anexhistclin: new FormControl(""),
            fecharepinc: new FormControl(""),
            idententreinc: new FormControl(""),
            segincapamed: new FormControl(""),
            estadincapad: new FormControl(""),
            capitcie: new FormControl(""),
            nomdisgnod: new FormControl(""),
            estado_gs: new FormControl(""),
            observacion_tb: new FormControl(""),
            idEps: new FormControl(""),
            idPension: new FormControl(""),
            coverageArl: new FormControl(""),
            createUser: new FormControl(this.cuser.iduser),
            soporte_nove: new FormControl("")
        });
    }

    ngAfterViewChecked()
    {
        this.options = [{idPersonale: 1178, name: 'rwer', document: '234234'}];
        this.cdref.detectChanges();
    }

    generateTable(data){
        this.displayedColumns = [
          'currentm_user',
          'date_move',
          'type_move'  
        ];
        this.historyMon = data;
        this.clickedRows = new Set<PeriodicElement>();
    }

    getDataInit() {
        this.loading.emit(false);
        this.WebApiService.getRequest(this.endpoint, {
            action: 'getParamCreUpd',
            token: this.cuser.token,
            idUser: this.cuser.iduser,
            modulo: this.component
        })
        .subscribe(
           
            data => {
                if (data.success == true) {

                    this.PersonaleInfo = data.data['personale'];
                    this.PersonaleInfoJF = data.data['personale'];
                    this.motausenList = data.data['motausen'];
                    this.origenausenList = data.data['origenausen']; 
                    this.descorigenList = data.data['descorigen']; 
                    this.medRecepInList = data.data['medrepinc']; 
                    this.siNoList = data.data['sino']; 
                    this.tipIncaList = data.data['tipincapci']; 
                    this.estIncAis = data.data['etincais']; 
                    this.codDiagSegList = data.data['codiaosct']; 
                    this.stadgestionList = data.data['stadgestion']; 
                    this.ListEps       = data.data['getEps'];
                    this.ListPension   = data.data['getPension'];
                 
                    this.loading.emit(false);
                   
                    if (this.view == 'update') {
                        this.getDataUpdate();
                    }
                } else {
                    this.handler.handlerError(data);
                    this.loading.emit(false);
                }
            },
            error => {
                // //console.log(error);
                this.handler.showError('Se produjo un error');
                this.loading.emit(false);
            }
        );
    }

    ngOnInit() {

        

    }

    //Interacciones ------------------------------

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

                this.formIncapad.get('numdocument').setValue(data.data[0].numdocument);
                this.formIncapad.get('idPersonale').setValue(data.data[0].idPersonale);
                this.formIncapad.get('motausen').setValue(data.data[0].motausen);
                this.formIncapad.get('origenausen').setValue(data.data[0].origenausen);
                this.formIncapad.get('descorigen').setValue(data.data[0].descorigen);
                this.formIncapad.get('medrecepin').setValue(data.data[0].medrecepin);
                this.formIncapad.get('incaporiginal').setValue(data.data[0].incaporiginal);
                this.formIncapad.get('anexhistclin').setValue(data.data[0].anexhistclin);
                this.formIncapad.get('fecharepinc').setValue(data.data[0].fecharepinc);
                this.formIncapad.get('fechainicausen').setValue(data.data[0].fechainicausen);
                this.formIncapad.get('fechafinausen').setValue(data.data[0].fechafinausen);
                this.formIncapad.get('idententreinc').setValue(data.data[0].idententreinc);
                //this.formIncapad.get('nombentreinc').setValue(data.data[0].nombentreinc);
                this.formIncapad.get('tipoincap').setValue(data.data[0].tipoincap);
                //this.formIncapad.get('numdiasincap').setValue(data.data[0].numdiasincap);
                //this.formIncapad.get('segincapamed').setValue(data.data[0].segincapamed);
                //this.formIncapad.get('estadincapad').setValue(data.data[0].estadincapad);
                if(data.data[0].codcie){
                    this.formIncapad.get('codcie').setValue(data.data[0].codcie.toUpperCase());
                }
                this.formIncapad.get('nomdisgnod').setValue(data.data[0].nomdisgnod);
                this.formIncapad.get('capitcie').setValue(data.data[0].capitcie);
                this.archivo.nombre = data.data[0].file_sp;
                this.formIncapad.get('estado_gs').setValue(data.data[0].estado_gs);
                this.formIncapad.get('observacion_tb').setValue(data.data[0].observacion_tb);
                this.formIncapad.get('idEps').setValue(data.data[0].idEps);
                this.formIncapad.get('idPension').setValue(data.data[0].idPension);
                this.formIncapad.get('coverageArl').setValue(data.data[0].coverageArl);
                this.formIncapad.get('soporte_nove').setValue(data.data[0].soporte_nove);
                this.gesAnteSopo = data.data[0].soporte_nove;
                //
            },
            error => {
                this.handler.showError();
                this.loading.emit(false);
            }
        );
    }

    onSubmitUpdate(){

        if (this.formIncapad.valid) {
            if( this.formIncapad.value.fechainicausen <= this.formIncapad.value.fechafinausen){
                this.loading.emit(true);
                let body = {
                    incapacidades: this.formIncapad.value,
                    archivoRes: this.archivo        
                }
                this.WebApiService.putRequest(this.endpoint+'/'+this.id,body,{
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
                        this.handler.showError();
                        this.loading.emit(false);
                    }
                );
            }else {
                this.handler.showError('Por favor validar el rango de fechas');
                this.loading.emit(false);
            }
        } else {
            this.handler.showError('Complete la informacion necesaria');
            this.loading.emit(false);
        }
    }

    onSubmit() {

        if (this.formIncapad.valid) {
            if( this.formIncapad.value.fechainicausen <= this.formIncapad.value.fechafinausen){
                this.loading.emit(true);
                let body = {
                    incapacidades: this.formIncapad.value,    
                    archivoRes: this.archivo    
                }
                this.handler.showLoadin("Guardando Registro", "Por favor espere...");
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
                                //console.log('vbv');
                            } else {
                                this.handler.handlerError(data);
                                this.loading.emit(false);
                                //console.log('yxy');
                            }
                        },
                        error => {
                            this.handler.showError();
                            this.loading.emit(false);
                            //console.log('fhf');
                        }
                    );
            }else {
                this.handler.showError('Por favor validar el rango de fechas');
                this.loading.emit(false);
            }
        } else {
            this.handler.showError('Complete la informacion necesaria');
            this.loading.emit(false);
        }
    }

    onCodcieChange(event){

        let exitsCodDiag = this.codDiagSegList.find(element => element.ls_codvalue.substr(3).toUpperCase() == event.toUpperCase());
        if( exitsCodDiag ){
            this.formIncapad.get('nomdisgnod').setValue(exitsCodDiag.description);
            this.formIncapad.get('capitcie').setValue(exitsCodDiag.complemento);
        }        
    }

    onFechaIniChange(event){

       this.fechInicInc = event;
       this.calFechaNumReq(this.fechInicInc, this.fechaFinInc);
    }
    
    onFechaFinChange(event){
        
        this.fechaFinInc = event;
        this.calFechaNumReq(this.fechInicInc, this.fechaFinInc);
        this.calFechaInAis();
    }

    calFechaNumReq(f1, f2){

        //Limite de fecha
        
        var dias = this.restaFechas(f1, f2);
        if( dias > 0 ){
            
            this.formIncapad.get('numdiasincap').setValue(dias);
            
            if( dias >= 30 ){
                this.formIncapad.get('segincapamed').setValue('17/1');
            }else{
                this.formIncapad.get('segincapamed').setValue('17/0');
            }
        }else{
            this.formIncapad.get('numdiasincap').setValue(0);
            this.formIncapad.get('segincapamed').setValue('17/0');
        }
    }

    calFechaInAis(){

        let now = new Date();
        let fechaAct = now.getUTCFullYear()+"-"+(now.getUTCMonth()+1)+"-"+now.getDate(); 
        let procesFecha = this.restaFechas(fechaAct, this.fechaFinInc);

        if( procesFecha > 0){
            this.formIncapad.get('estadincapad').setValue('27/1');
        }else{
            this.formIncapad.get('estadincapad').setValue('27/2');
        }
    }

    //Rango De Dias 
    restaFechas(f1, f2)
    {
        var aFecha1 = f1.split('-');
        var aFecha2 = f2.split('-');
        var fecha1 = new Date(aFecha1[0]+'-'+aFecha1[1]+'-'+aFecha1[2]).getTime();
        var fecha2 = new Date(aFecha2[0]+'-'+aFecha2[1]+'-'+aFecha2[2]).getTime();
        var diff = fecha2 - fecha1;
        let dias = 1 + (diff/(1000*60*60*24));
        //console.log(diff/(1000*60*60*24) );

        //console.log(aFecha1[0]+'-'+aFecha1[1]+'-'+aFecha1[2]);
        //console.log(aFecha2[0]+'-'+aFecha2[1]+'-'+aFecha2[2]);

        if( dias < 0 ){
           dias = 0;
        }

        return dias;
    }

    onSelectionChange(event){
        
        let exitsPersonal = this.PersonaleInfo.find(element => element.document == event);
        if( exitsPersonal ){
            this.formIncapad.get('idPersonale').setValue(exitsPersonal.idPersonale);
            this.formIncapad.get('idEps').setValue(exitsPersonal.idEps);
            this.formIncapad.get('idPension').setValue(exitsPersonal.idPension);
            this.formIncapad.get('coverageArl').setValue(exitsPersonal.coverageArl);
        }        
    }

    onSelectionJFChange(event){
        
        let exitsPersonal = this.PersonaleInfoJF.find(element => element.document == event);
        if( exitsPersonal ){
            this.formIncapad.get('nombentreinc').setValue(exitsPersonal.idPersonale);
            ////console.log(exitsPersonal.idPersonale+ "sonso");
        }        
    }

    onMotivoChange(event){
        this.optmotausen = event; 
        this.restEventSelc();
    }

    onoPtorigenausen(event){
        this.optorigenausen = event;
        this.restEventSelc();
    }

    restEventSelc(){

        this.loading.emit(true);
        this.descorigenListTemp = [];

        if( this.optmotausen != null && this.optmotausen != "undefined" ){

            if( this.optmotausen == "22/1" && this.optorigenausen == "23/1" ){

                let  motausenList: any = ['24/6', '24/2', '24/3'];
                for(let val in this.descorigenList){

                    if(motausenList.indexOf(this.descorigenList[val]['ls_codvalue']) !== -1) {
                        this.descorigenListTemp.push(this.descorigenList[val]);
                    }           
                }
            }else if( this.optmotausen == "22/1" && this.optorigenausen == "23/2" ){

                let  motausenList: any = ['24/1', '24/4', '24/5'];
                for(let val in this.descorigenList){

                    if(motausenList.indexOf(this.descorigenList[val]['ls_codvalue']) !== -1) {
                        this.descorigenListTemp.push(this.descorigenList[val]);
                    }           
                }
            }else if( this.optmotausen == "22/2" && this.optorigenausen == "23/1" ){

                let  motausenList: any = ['24/6'];
                for(let val in this.descorigenList){

                    if(motausenList.indexOf(this.descorigenList[val]['ls_codvalue']) !== -1) {
                        this.descorigenListTemp.push(this.descorigenList[val]);
                    }           
                }
            }else if( this.optmotausen == "22/2" && this.optorigenausen == "23/2" ){

                let  motausenList: any = ['24/1'];
                for(let val in this.descorigenList){

                    if(motausenList.indexOf(this.descorigenList[val]['ls_codvalue']) !== -1) {
                        this.descorigenListTemp.push(this.descorigenList[val]);
                    }           
                }
            }
        }
        this.loading.emit(false);       
    }

    seleccionarArchivo(event){
        var files = event.target.files;
        var file  = files[0];
        this.archivo.nombreArchivo = file.name;

        if(files && file){
            var reader = new FileReader();
            reader.onload = this._handleReaderLoaded.bind(this);
            reader.readAsBinaryString(file);
        }
    }

    _handleReaderLoaded(readerEvent){
        var binaryString = readerEvent.target.result;
        this.archivo.base64textString = btoa(binaryString);
    }

    toggleMinimize(e) {
        this.sidebarMinimized = e;
      }
    
    validRequid(event){
        if( event == '30/3' || event == '30/5' ){
            this.bluedRequired = false;
            this.textAreRequired = true;
        }else{
            this.bluedRequired = true;
            this.textAreRequired = false;
        }

        if(event == '30/5'){
            this.formIncapad.get('soporte_nove').setValue('17/0');
        }else{
            this.formIncapad.get('soporte_nove').setValue(this.gesAnteSopo);
        }
    }

}