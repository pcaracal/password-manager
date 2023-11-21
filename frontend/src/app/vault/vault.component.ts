import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ApiService} from "../api.service";
import {FormsModule} from "@angular/forms";
import {StorageService} from '../storage.service';
import {ExtendedTemplateDiagnosticName} from "@angular/compiler-cli/src/ngtsc/diagnostics";

@Component({
  selector: 'app-vault',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './vault.component.html',
  styleUrl: './vault.component.scss'
})

export class VaultComponent implements OnInit {
  isCreating: boolean = false;
  isEditing: boolean = false;

  editId: number = -1;

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
    let eName = this._storageService.encrypt_aes(this._storageService.generate_salt() + this.newName);
    let eUsername = this._storageService.encrypt_aes(this._storageService.generate_salt() + this.newUsername);
    let ePassword = this._storageService.encrypt_aes(this._storageService.generate_salt() + this.newPassword);
    let eUrl = this._storageService.encrypt_aes(this._storageService.generate_salt() + this.newUrl);
    let eNotes = this._storageService.encrypt_aes(this._storageService.generate_salt() + this.newNotes);

    if (this.isEditing) {
      this._apiService.patchData(
        this.editId,
        eName,
        eUsername,
        ePassword,
        eUrl,
        eNotes
      ).pipe().subscribe(
        data => {
          this._apiService.getData().pipe().subscribe(
            data => {
              this.data = data;
              console.log(data);

              this.onCancel();
            },
            error => {
              console.log(error);
            }
          );
        },
        error => {
          // console.log(error);
        }
      )
    }

    if (this.isCreating) {
      this._apiService.postData(
        eName,
        eUsername,
        ePassword,
        eUrl,
        eNotes
      ).pipe().subscribe(
        data => {
          // console.log(data);
          this._apiService.getData().pipe().subscribe(
            data => {
              this.data = data;
              console.log(data);

              this.onCancel();
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

  onCancel() {
    this.isCreating = false;
    this.isEditing = false;

    this.newName = "";
    this.newUsername = "";
    this.newPassword = "";
    this.newUrl = "";
    this.newNotes = "";

    this.editId = -1;
  }

  editData(id: number) {
    let oldData = this.data?.find(x => x.id === id) as any;

    this.editId = id;

    this.newName = this._storageService.decrypt_aes(oldData.name).substring(128);
    this.newUsername = this._storageService.decrypt_aes(oldData.username).substring(128);
    this.newPassword = this._storageService.decrypt_aes(oldData.password).substring(128);
    this.newUrl = this._storageService.decrypt_aes(oldData.url).substring(128);
    this.newNotes = this._storageService.decrypt_aes(oldData.notes).substring(128);


    this.isEditing = true;
  }
}
