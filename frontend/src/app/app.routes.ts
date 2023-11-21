import {Routes} from '@angular/router';
import {LoginComponent} from "./login/login.component";
import {VaultComponent} from "./vault/vault.component";

export const routes: Routes = [
  {
    path: "login",
    component: LoginComponent,
    pathMatch: "full"
  },
  {
    path: "",
    redirectTo: "/login",
    pathMatch: "full"
  },
  {
    path: "vault",
    component: VaultComponent,
    pathMatch: "full"
  }
];
