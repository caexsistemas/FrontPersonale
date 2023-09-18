import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { from } from "rxjs";
import { ApplicationUserComponent } from "./application-user/application-user.component";
import { RequestsUserComponent } from "./requests-user/requests-user.component";
import { ReqComponent } from "./req/req.component";
import { UpdateAplicationsComponent } from "./update-aplications/update-aplications.component";

const routes: Routes = [
  {
    path: "",
    data: {
      title: "Aplicativos",
    },
    children: [
      {
        path: "",
        redirectTo: "",
      },
      {
        path: "application-user",
        component: ApplicationUserComponent,
        data: {
          title: "Aplicativos",
        },
      },
      {
        path: "request-user",
        component: RequestsUserComponent,
        data: {
          title: "Solicitudes",
        },
      },
      {
        path: "req",
        component: ReqComponent,
        data: {
          title: "REQ",
        },
      },
      {
        path: "update_applications",
        component: UpdateAplicationsComponent,
        data: {
          title: "Aplicativos de usuarios",
        },
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AplicationsRoutingModule {}
