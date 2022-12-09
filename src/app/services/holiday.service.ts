import { Injectable } from '@angular/core';
import * as moment from 'moment';

@Injectable({
  providedIn: 'root'
})
export class calculateDays {
    constructor() {
    }
    holiday(f1, f2){

      if(f1 && f2){
        var festivos  = [
            [9,1],
            [20,3],
            [6,4],
            [7,4],
            [1,5],
            [22,5],
            [12,6],
            [19,6],
            [3,7],
            [20,7],
            [7,8],
            [21,8],
            [16,10],
            [6,11],
            [13,11],
            [8,12],
            
            
          ];
        // console.log(festivos.length)
          
            // var ini = moment(f1);
            var ini2 = (f1);
            // console.log('fec_inicial',ini)
            
        
            var diff = f2;
            // console.log('dias_solicitar',diff);
        
            var arrFecha = ini2.split('-');
            var fecha = new Date(arrFecha[0], arrFecha[1] - 1, arrFecha[2]);
            // console.log(fecha)
        
            for (var i = 0; i < diff; i++) {
             
             var diaInvalido = false;
              fecha.setDate(fecha.getDate() + 1); // Sumamos de dia en dia
                for (var j = 0; j < festivos.length; j++) { // Verificamos si el dia + 1 es festivo
                  var mesDia =festivos[j];
                  // console.log(mesDia[1])
        
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
