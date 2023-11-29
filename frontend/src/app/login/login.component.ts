import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from "@angular/forms";
import {StorageService} from "../storage.service";
import {ApiService} from "../api.service";
import {ToastrService} from "ngx-toastr";

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {
  username = '';
  password = '';
  passwordConfirm = '';
  isRegister = false;

  constructor(private _apiService: ApiService, private _storageService: StorageService, private toastr: ToastrService) {
  }

  ngOnInit(): void {
  }

  onLogin(): void {
    if (this.username.trim() == "" || this.password.trim() == "") return;

    this._apiService.loginPost(this.username, this.password).pipe().subscribe(
      data => {
        sessionStorage.setItem('token', data);
        this._storageService.masterPassword = this.password;

        this._storageService.setLoggedIn(true);

        this.toastr.success("Successfully logged in", "Success");
        console.log("Login: Success");
      },
      error => {
        switch (error.error.error.code) {
          case 401:
          case 404:
            this.toastr.error("Invalid username or password", "Error");
            console.warn("Login: Invalid username or password");
            break;
          default:
            this.toastr.error("Unknown error", "Error");
            console.warn("Login: Unknown error");
            break;
        }
      }
    );
  }

  onRegister(): void {
    if (this.username.trim() == "" || this.password.trim() == "" || this.passwordConfirm.trim() == "") return;
    if (this.password != this.passwordConfirm) return;

    this._apiService.registerPost(this.username, this.password).pipe().subscribe(
      data => {
        sessionStorage.setItem('token', data);
        this._storageService.masterPassword = this.password;
        this._storageService.setLoggedIn(true);

        this.toastr.success("Successfully registered", "Success");
        console.log("Register: Success");
      },
      error => {
        switch (error.status) {
          case 409:
            this.toastr.warning("Username already exists", "Warning");
            console.warn("Register: Username already exists");
            break;
          default:
            this.toastr.error("Unknown error", "Error");
            console.warn("Register: Unknown error");
            break;
        }
      }
    );
  }
}