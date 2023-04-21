import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { from } from "rxjs";
import { SigReportComponent } from "./sigReport/sigReport.component";

const routes: Routes = [
    {
      path: "",
      data: {
        title: "Reporte",
      },
      children: [
        {
          path: "",
          redirectTo: "",
        },
        {
          path: "sigReport",
          component: SigReportComponent,
          data: {
            title: "Reporte",
          },
        },
    ]
}
]




@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class sigRoutingModule {}
