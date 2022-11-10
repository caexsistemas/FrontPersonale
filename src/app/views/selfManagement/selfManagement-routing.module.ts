import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { from } from "rxjs";
import { AcceptanceComponent } from "./acceptance/acceptance.component";
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
      {
        path: "acceptance",
        component: AcceptanceComponent,
        data: {
          title: "Aprobación",
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
