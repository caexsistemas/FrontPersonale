import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { from } from "rxjs";
import { DisciplinaryComponent } from "./disciplinary/disciplinary.component";
import { ReceptionComponent } from "./reception/reception.component";

const routes: Routes = [
  {
    path: "",
    data: {
      title: "Procesos Disciplinarios",
    },
    children: [
      {
        path: "",
        redirectTo: "",
      },
      {
        path: "disciplinary",
        component: DisciplinaryComponent,
        data: {
          title: "Solicitud procesos disciplinarios",
        },
      },
      {
        path: "reception",
        component: ReceptionComponent,
        data: {
          title: "Recepción",
        },
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProcessRoutingModule {}
