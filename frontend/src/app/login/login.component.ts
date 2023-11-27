import {Component} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from "@angular/forms";
import {ApiService} from '../api.service';
import {StorageService} from '../storage.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  constructor(private _apiService: ApiService, private _storageService: StorageService) {
  }


  username: string = "";
  password: string = "";

  onLogin() {
    if (this.username.trim() == "" || this.password.trim() == "") return;

    this._apiService.loginPost(this.username, this.password).pipe().subscribe(
        data => {
          sessionStorage.setItem('token', data);
          console.log("Login successful");

          window.location.href = "/vault";
          this._storageService.masterPassword = this.password;
        },
        error => {
          console.warn("Login failed");
        }
    );
  }

  onRegister() {
    if (this.username.trim() == "" || this.password.trim() == "") return;

    this._apiService.registerPost(this.username, this.password).pipe().subscribe(
        data => {
          sessionStorage.setItem('token', data);
          console.log("Register successful");

          window.location.href = "/vault";
          this._storageService.masterPassword = this.password;
        },
        error => {
          console.warn("Register failed");
        }
    );
  }
}
