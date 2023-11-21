import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ApiService} from "../api.service";
import {FormsModule} from "@angular/forms";
import {StorageService} from '../storage.service';

@Component({
  selector: 'app-vault',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './vault.component.html',
  styleUrl: './vault.component.scss'
})

// interface Data {
//   id: number;
//   fk_user_id: number;
//   name: string;
//   username: string;
//   password: string;
//   created_at: number;
//   updated_at: number;
//   url: string;
//   notes: string;
// }

export class VaultComponent implements OnInit {

  newName: string = "";
  newUsername: string = "";
  newPassword: string = "";
  newUrl: string = "";
  newNotes: string = "";

  data: [
    {
      id: number;
      fk_user_id: number;
      name: string;
      username: string;
      password: string;
      created_at: number;
      updated_at: number;
      url: string;
      notes: string;
    }
  ] | undefined;

  constructor(private _apiService: ApiService, protected _storageService: StorageService) {
  }

  ngOnInit() {
    if (sessionStorage.getItem('token') == null) {
      window.location.href = "/login";
    }

    this._apiService.getData().pipe().subscribe(
      data => {
        this.data = data;
        console.log(data);
      },
      error => {
        console.log(error);
      }
    );
  }

  onSubmit() {
    this._apiService.postData(
      this._storageService.encrypt_aes(this._storageService.generate_salt() + this.newName),
      this._storageService.encrypt_aes(this._storageService.generate_salt() + this.newUsername),
      this._storageService.encrypt_aes(this._storageService.generate_salt() + this.newPassword),
      this._storageService.encrypt_aes(this._storageService.generate_salt() + this.newUrl),
      this._storageService.encrypt_aes(this._storageService.generate_salt() + this.newNotes)
    ).pipe().subscribe(
      data => {
        // console.log(data);
        this._apiService.getData().pipe().subscribe(
          data => {
            this.data = data;
            console.log(data);

            this.newName = "";
            this.newUsername = "";
            this.newPassword = "";
            this.newUrl = "";
            this.newNotes = "";
          },
          error => {
            console.log(error);
          }
        );
      },
      error => {
        // console.log(error);
      }
    );
  }
}
