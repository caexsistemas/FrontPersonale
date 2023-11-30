import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from "@angular/material/dialog";

import { Component, OnInit, Output, EventEmitter } from "@angular/core";
import { WebApiService } from "../../../services/web-api.service";
import { HandlerAppService } from "../../../services/handler-app.service";
import { FormGroup, FormControl } from "@angular/forms";
import { DatePipe } from "@angular/common";
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
} from "@angular/material/core";
import { Observable } from "rxjs";
import {map, startWith} from 'rxjs/operators';
@Component({
  selector: 'app-reports-disciplinary',
  templateUrl: './reports-disciplinary.component.html',
  styleUrls: ['./reports-disciplinary.component.css']
})
export class ReportsDisciplinaryComponent implements OnInit {

  ndpoint: string = "/reception";
  formDownoadIngreso: FormGroup;
  loading_: boolean = false;
  //History
  historyMon: any = [];
  personale: any = [];
  displayedColumns: any = [];
  tipMatriz: string = "";
  tipState: string = "";
  job:  any = [];
  filteredPersonale : any = [];
  today: Date = new Date();
  pipe = new DatePipe("en-US");
  public clickedRows;
  public cuser: any = JSON.parse(localStorage.getItem("currentUser"));
  component = "/process/reception";

  @Output() loading = new EventEmitter();
  @Output() reload = new EventEmitter();

  constructor(
    private WebApiService: WebApiService,
    private handler: HandlerAppService
  ) {}

  ngOnInit(): void {
    // this.getGroupedPersonale();
    let fi = null;
    fi = this.pipe.transform(Date.now(), "dd/MM/yyyy");

    this.dataIni();
    this.formDownoadIngreso = new FormGroup({
      fi: new FormControl(""),
      ff: new FormControl(""),
      state: new FormControl(""),
      idPosition: new FormControl(""),
      person: new FormControl(""),
      iduser: new FormControl(this.cuser.iduser),
    });
    
    // this.formDownoadIngreso.get('personale').valueChanges.subscribe(value => {
    //   this.filteredPersonale = this._filter(value);
    // });
  }
  dataIni() {
    this.loading.emit(true);
    this.WebApiService.getRequest(this.ndpoint, {
      action: "getParamView",
      role: this.cuser.role,
      matrizarp: this.cuser.matrizarp,
      token: this.cuser.token,
      idUser: this.cuser.iduser,
      modulo: this.component,
    }).subscribe(
      (data) => {
        if (data.success == true) {
          this.job = data.data["job"];
          this.personale = data.data["getDataPersonale"]
          // console.log('nombre =>', this.personale);
          
          this.loading.emit(false);
        } else {
          this.handler.handlerError(data);
          this.loading.emit(false);
        }
      },
      (error) => {
        this.handler.showError("Se produjo un error");
        this.loading.emit(false);
      }
    );
  }
  acc: any = [];
  filteredNames: any[];
  filteredOptions: Observable<string[]>;
  getGroupedPersonale() {
    // Agrupa los datos por algún criterio (por ejemplo, 'names')
    // const grouped = this.personale.reduce((acc, current) => {
    //   console.log('==>1',acc);
    //   console.log('==>2',current);
      
    //   const groupKey = 'idPersonale'; // Cambia esto según tu criterio de agrupación
    //   console.log('>>', groupKey);
      
  
    //   if (!acc[groupKey]) {
    //     acc[groupKey] = [];
    //   }
  
    //   acc[groupKey].push({ id: current.idPersonale, name: current.name });
    //   console.log(acc[groupKey].push({ id: current.id, name: current.name }));
      
    //   return acc;
    // }, {});
    // const grouped = this.personale.map((value) => {
    //   // console.log(value);
    //   this.acc.push({ id: value.idPersonale, name: value.name });
    //   console.log('***',this.acc);
      
    //   return this.acc;
      
    // },{});
    this.filteredNames = this.personale;
    const grouped = this.personale;

    this.formDownoadIngreso.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value.personale))
    ).subscribe(filteredNames => {
      this.filteredNames = filteredNames;
    });
  
    // Convierte el objeto agrupado en un array
    return Object.values(grouped);
  }

  
  private _filter(value): any[] {
    console.log('==>',value);
    
    // Filtrar la lista según el valor ingresado en el input
    // const filterValue = value;
    console.log('==>',this.personale.filter(name => name.name.includes(value)).map(name => ({ id: name.idPersonale, name: name.name })));
    

    return this.personale.filter(name => name.name.includes(value)).map(name => ({ id: name.ididPersonale, name: name.name }));
  }
  // private _filter(value: string): any[] {
  //   return this.personale.filter(name => name.name.includes(value));
  // }
  onSelectionChange(event) {
    console.log('even',event);
    console.log('array', this.personale);
    
    let exitsPersonal = this.personale.find(
      (element) => element.name == event
    );

    if (exitsPersonal) {
      this.formDownoadIngreso
        .get("person")
        .setValue(exitsPersonal.name);
      // this.formDownoadIngreso.get("dis_pos").setValue(exitsPersonal.idPosition);
      // this.formCreate
      //   .get("immediateBoss")
      //   .setValue(exitsPersonal.jef_idPersonale);
      // this.formCreate.get("us_are_tra").setValue(this.exitsPersonal.idPosition);
    }
  }

  descargarArchivos() {
    // console.log('body=>',this.formDownoadIngreso.value );

    //    this.formDownoadIngreso.value['fi'];
    //    let fecha1 = this.pipe.transform(this.formDownoadIngreso.value['fi'], 'dd/MM/yyyy');
    //   console.log('FI=>', fecha1);
    //    this.formDownoadIngreso.value['ff'];
    //   let fecha2 = this.pipe.transform( this.formDownoadIngreso.value['ff'], 'dd/MM/yyyy');
    //   console.log('Ff=>', fecha2);

    if (this.formDownoadIngreso.valid) {
      // if( fecha1 <= fecha2 && fecha1 != '' && fecha2 != '' ){
      // if( this.formDownoadIngreso.value['fi'] <= this.formDownoadIngreso.value['ff'] && this.formDownoadIngreso.value['fi'] != '' && this.formDownoadIngreso.value['ff'] != '' ){
      // if( this.pipe.transform(this.formDownoadIngreso.value['fi'], 'dd/MM/yyyy') <= this.pipe.transform( this.formDownoadIngreso.value['ff'], 'dd/MM/yyyy') && this.pipe.transform(this.formDownoadIngreso.value['fi'], 'dd/MM/yyyy') != '' && this.pipe.transform(this.formDownoadIngreso.value['ff'], 'dd/MM/yyyy') != '' ){

      let body = {
        valest: this.formDownoadIngreso.value,
      };

      this.loading.emit(true);
      this.WebApiService.getRequest(this.ndpoint, {
        action: "downloadFiles",
        report: "" + JSON.stringify({ body }),
        token: this.cuser.token,
        idUser: this.cuser.iduser,
        modulo: this.component,
      }).subscribe(
        (data) => {
          // console.log(data);
          if (data.success) {
            const link = document.createElement("a");
            link.href = data.data.url;
            link.download = data.data.file;
            link.click();
            this.handler.showSuccess(data.data.file);
            this.loading.emit(false);
          } else {
            this.handler.handlerError(data);
            this.loading.emit(false);
          }
        },
        (error) => {
          this.handler.showError(error);
          console.log(error);
          this.loading.emit(false);
        }
      );
      // }else{
      //     this.handler.showError('Periodo de consulta invalido');
      //     this.loading.emit(false);
      // }
    } else {
      this.handler.showError("Complete la informacion necesaria");
      this.loading.emit(false);
    }
  }

  labelMatriz(event) {
    this.tipMatriz = event;
  }

}

