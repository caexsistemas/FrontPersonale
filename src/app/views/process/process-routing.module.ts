import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { from } from "rxjs";
import { DisciplinaryComponent } from "./disciplinary/disciplinary.component";

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
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProcessRoutingModule {}
