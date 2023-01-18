import { Injectable } from '@angular/core';
import { WebApiService } from "../services/web-api.service";

import * as moment from 'moment';
import { HandlerAppService } from './handler-app.service';

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
        // var festivos  = [
        //     [9,1],
        //     [20,3],
        //     [6,4],
        //     [7,4],
        //     [1,5],
        //     [22,5],
        //     [12,6],
        //     [19,6],
        //     [3,7],
        //     [20,7],
        //     [7,8],
        //     [21,8],
        //     [16,10],
        //     [6,11],
        //     [13,11],
        //     [8,12],
            
            
        //   ];
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
                            diaInvalido = true;
        
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
  
        return [fec_fin, sumTotalMen ];
      }else{
        false;
      }
        
    }
    
  
}
