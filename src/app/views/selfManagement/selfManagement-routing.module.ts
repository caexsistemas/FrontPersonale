import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { from } from "rxjs";
import { AcceptanceComponent } from "./acceptance/acceptance.component";
import { AdvanceComponent } from "./advance/advance.component";
import { HolidayComponent } from "./holiday/holiday.component";
import { LiquidationComponent } from "./liquidation/liquidation.component";


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
      {
        path: "liquidation",
        component: LiquidationComponent,
        data: {
          title: "Gestión Vacaciones"
        }
      },
      {
        path: "advance",
        component: AdvanceComponent,
        data: {
          title: "Anticipo Vacaciones"

        },
      }
    
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class selfManagementRoutingModule {}
