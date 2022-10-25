import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { from } from "rxjs";
import { HolidayComponent } from "./holiday/holiday.component";


const routes: Routes = [
  {
    path: "",
    data: {
      title: "Vacaciones",
    },
    children: [
      {
        path: "",
        redirectTo: "",
      },
      {
        path: "holiday",
        component: HolidayComponent,
        data: {
          title: "Solicitud",
        },
      },
    
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class selfManagementRoutingModule {}
