import * as _ from 'lodash';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'datafilter'
  
})
export class DatafilterPipe implements PipeTransform {

  transform(array: any[], args?: any): any {

    //alert(args);

    for(let elemnts of array){

      console.log(elemnts);
    }


    if (args) {
      return _.filter(array, row => row.name.indexOf(args) > -1);
    }
    return array;
  }



}
