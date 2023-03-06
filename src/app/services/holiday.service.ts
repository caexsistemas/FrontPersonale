import { Injectable } from '@angular/core';
import { WebApiService } from "../services/web-api.service";

import * as moment from 'moment';
import { HandlerAppService } from './handler-app.service';
import { addDays, differenceInWeeks, startOfWeek } from 'date-fns';
@Injectable({
  providedIn: 'root'
})

export class calculateDays {
  // arrFor: any = [];

  endpoint: string = "/holiday";
  public cuser: any = JSON.parse(localStorage.getItem("currentUser"));
  component = "/selfManagement/holiday";
  permissions: any = null;
  loading: boolean = false;
  getHoliday: any = [];
  day_sun: any = []

    constructor(
    private WebApiService: WebApiService,
    public handler: HandlerAppService,
    ) {
    }
    
    holiday(f1, f2){
      this.loading = true;
      this.WebApiService.getRequest(this.endpoint,{
        action: "getHoliday",
        idUser: this.cuser.iduser,
        token: this.cuser.token,
        modulo: this.component,
      }).subscribe(data =>{
        this.permissions = this.handler.getPermissions(this.component);
        // console.log(this.permissions);
        console.log(data.success);
          if(data.success == true){
              this.getHoliday = data.data["getHoliday"];
              this.loading = false;
              // console.log("prueba de service=>",this.getHoliday);
          }else{
              this.handler.handlerError(data);
              this.loading = false;
          }
      }, (error)=>{
          this.handler.showError("Se produce un error");
          this.loading = false;
      });
   

      if(f1 && f2 && this.getHoliday){
       
        const arrFor = [];
        this.getHoliday.forEach(element => {
            arrFor.push([element.day_hol, element.month]);
        });
          
            // var ini = moment(f1);
            var ini2 = (f1);
            // console.log('fec_inicial',ini)
            
        
            var diff = f2;
            // console.log('dias_solicitar',diff);
        
            var arrFecha = ini2.split('-');
            var fecha = new Date(arrFecha[0], arrFecha[1] - 1, arrFecha[2]);
            // console.log(fecha)
        
            for (var i = 0; i < diff; i++) {
        // console.log("fesServicefor2=>",this.arrFor);
             
             var diaInvalido = false;
              fecha.setDate(fecha.getDate() + 1); // Sumamos de dia en dia
                for (var j = 0; j < arrFor.length; j++) { // Verificamos si el dia + 1 es festivo
                  var mesDia =arrFor[j];
                  // console.log(mesDia[1])
                  // console.log(mesDia)
        
                  // var ite= festivos[mes][j]                                                  //ejemplo
                  if (fecha.getMonth() +1 == mesDia[1] && fecha.getDate() == mesDia[0]) {
                        //   console.log(fecha.getDate() + ' es dia festivo (Sumamos un dia)');
                          diaInvalido = true;
                          break;
        
                      } 
                    };
                  if( fecha.getDay() == 0) { // Verificamos si es domingo
                            // console.log(fecha.getDate() + ' es  domingo (Sumamos un dia)');
                            // console.log(this.day_sun);
                            diaInvalido = true;
                            // this.cuentaFindes(f1)
                            // (diaInvalido) ? day_sun++ : '';
        
                      } 
        
                    if (diaInvalido){
                    diff++; // Si es fin de semana o festivo le sumamos un dia
                    }
          }
        //   console.log('dias',fecha.getDate());

     var fec_fin = fecha.getFullYear() + '-' + (fecha.getMonth() + 1).toString().padStart(2, '0') + '-' + (fecha.getDate() - 1).toString().padStart(2,'0' );
    // this.fec_fin = fecha.getFullYear() + '-' + (fecha.getMonth() + 1).toString().padStart(2, '0') + '-' + (fecha.getDate() ).toString().padStart(2,'0' );
    // this.sumTotalMen = fecha.getFullYear() + '-' + (fecha.getMonth() + 1).toString().padStart(2, '0') + '-' + fecha.getDate().toString().padStart(2,'0' );
    var sumTotalMen = fecha.getFullYear() + '-' + (fecha.getMonth() + 1).toString().padStart(2, '0') + '-' + (fecha.getDate() ).toString().padStart(2,'0' );

    // console.log('fin',fecha.getFullYear() + '-' + (fecha.getMonth() + 1).toString().padStart(2, '0') + '-' + (fecha.getDate() - 1).toString().padStart(2,'0' ));
    // console.log('reint',fecha.getFullYear() + '-' + (fecha.getMonth() + 1).toString().padStart(2, '0') + '-' + fecha.getDate().toString().padStart(2,'0' ));
  
        return [fec_fin, sumTotalMen,this.day_sun ];
      }else{
        false;
      }
        
    }
    // fechasDomingos: Date[] = [];
    // domingosPorSemana: number[] = [];
     getDomingos(fechaInicio, dias) {
      let fecha = new Date(fechaInicio);
      const resultado = [];
      let domingos = 0;
      
      for(let i = 0; i < dias; i++) {
        fecha.setDate(fecha.getDate() + 1);
        if (fecha.getDay() === 0) {
          domingos++;
          resultado.push(new Date(fecha.getTime()));
          
        }
      }
    
      const domingosPorSemana = [];
      let semanaActual = [];
      resultado.forEach((domingo) => {
        // const semana = this.getSemana(domingo,dias,fechaInicio);
        // if (semana !== semanaActual) {
        //   domingosPorSemana.push(semanaActual);
        //   semanaActual = semana;
        //   // console.log(semanaActual);
          
        // }
        // semanaActual.push(domingo);
      });
      domingosPorSemana.push(semanaActual);
    // console.log(domingosPorSemana);
    
      return domingosPorSemana;
    }
    
     getSemana(fecha2,dias) {

// console.log(fecha);

    const fechaInicio = new Date(fecha2);
    const diasRecorrer = 10;
    const fechaFin = addDays(fechaInicio, diasRecorrer);

    let fecha = new Date(fechaInicio);
    while (fecha <= fechaFin) {
      const inicioSemana = startOfWeek(fecha);
      const finSemana = addDays(inicioSemana, 6);
      
      if (fecha >= inicioSemana && fecha <= finSemana && fecha.getDay() === 0) {
        console.log(fecha);
      }
      
      fecha = addDays(fecha, 1);
    }















      // console.log(dias);
      // console.log(fechaInicio);
      
      
      // const mes = fecha.getMonth() + 1;
      // const dia = fecha.getDate();
      // const anio = fecha.getFullYear();
    
      // const fechaObj = new Date(anio, mes - 1, dia);
      // const numeroDia = fechaObj.getDay();
      // const primerDia = new Date(anio, mes - 1, dia - numeroDia);
    
      // const semana = [];
      // const fechaInici = fecha;
      // // const fechaIniciop = new Date('2022-02-01');
      // const diasRecorre = 5; // La cantidad de días que deseas recorrer
      // // const diasRecorrer = dias; // La cantidad de días que deseas recorrer
      // const diasAsumar = 7; // Sumas al menos 7 días para abarcar una semana completa
      // // const fechaFi = addDays(fechaInicio, diasRecorrer + diasAsumar); // Sumas los días a la fecha de inicio

      // console.log(diasRecorrer);
      
      // const fechaFin = addDays(fechaIniciop, diasRecorrer); // Sumas los días a la fecha de inicio
      // console.log(fechaFin);
      
      // const cantidadSemanas = differenceInWeeks(fechaFin, fechaIniciop);
      // console.log(cantidadSemanas); // output: 3

      // for (let i = 0; i <= 15; i++) {
      //   // const diaSemana = new Date(anio, mes - 1, primerDia.getDate() + i);
      //   // semana.push(diaSemana);
      // }
      // console.log(semana);
      
      // return semana;
    }
    
  //    cuentaFindes(f1){
  //     f1 = f1.split("-");
  //    let fechaFinal: Date = ('2023-03-10');
  //     let fechaFinalq = fechaFinal.split("-");
      
  //     var dtInicial = new Date(f1[2], f1[1] - 1, f1[0]);
  //     var dtFinal =new Date(fechaFinal[2], fechaFinal[1] - 1, fechaFinal[0]);
      
  //     var contadorDias = 0;
  //     while(dtInicial <=dtFinal){
  //         if(dtInicial.getDay()===0||dtInicial.getDay()===6){
  //          console.log("dia contado:"+dtInicial);
  //          contadorDias++;
  //         }
  //     dtInicial = new Date(dtInicial.getTime()+86400000);// se agrega un dia
      
  //     }
  //     return contadorDias;
  // }
  
  }


