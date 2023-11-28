import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterOutlet} from '@angular/router';
import {LoginComponent} from "./login/login.component";
import {VaultComponent} from "./vault/vault.component";
import {StorageService} from "./storage.service";
import {ApiService} from "./api.service";
import {log} from "@angular-devkit/build-angular/src/builders/ssr-dev-server";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, LoginComponent, VaultComponent],
  templateUrl: './app.component.html',
  styleUrl: 'app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'Password Vault';
  isLoggedIn: boolean = false;


  constructor(private _apiService: ApiService, private _storageService: StorageService) {
    this._storageService.isLoggedIn$.subscribe(
      value => {
        this.isLoggedIn = value;
      }
    );
  }

  ngOnInit(): void {
    this._apiService.getLogin().pipe().subscribe(
      data => {
        this.isLoggedIn = true;
      },
      error => {
        console.log(error);
      }
    );
  }
}