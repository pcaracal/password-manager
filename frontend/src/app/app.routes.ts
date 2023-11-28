import {Routes} from '@angular/router';
import {VaultComponent} from "./vault/vault.component";
import {LoginComponent} from "./login/login.component";
import {AppComponent} from "./app.component";

export const routes: Routes = [
  {path: "**", component: AppComponent, redirectTo: ""}
];
