import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DatafilterPipe } from './datafilter.pipe';



@NgModule({
  declarations: [DatafilterPipe],
  imports: [
    CommonModule
  ],
  exports:[DatafilterPipe]
})
export class DatafilterModule { }
