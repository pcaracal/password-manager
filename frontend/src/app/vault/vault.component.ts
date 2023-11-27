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

export class VaultComponent implements OnInit {
  isCreating: boolean = false;
  isEditing: boolean = false;

  isViewingPassword: boolean = false;

  isChangingMasterPassword: boolean = false;

  editId: number = -1;

  newName: string = "";
  newUsername: string = "";
  newPassword: string = "";
  newUrl: string = "";
  newNotes: string = "";

  newPasswordLength = 16;

  newMasterPassword: string = "";
  oldMasterPassword: string = "";
  newMasterPasswordConfirm: string = "";

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

  changeMasterPassword() {
    if (this.newMasterPassword !== this.newMasterPasswordConfirm) {
      return;
    }

    this._storageService.newMasterPassword = this.newMasterPassword;

    this.data?.forEach(e => {
      let nName = this._storageService.encrypt_aes_new(this._storageService.decrypt_aes(e.name));
      let nUsername = this._storageService.encrypt_aes_new(this._storageService.decrypt_aes(e.username));
      let nPassword = this._storageService.encrypt_aes_new(this._storageService.decrypt_aes(e.password));
      let nUrl = this._storageService.encrypt_aes_new(this._storageService.decrypt_aes(e.url));
      let nNotes = this._storageService.encrypt_aes_new(this._storageService.decrypt_aes(e.notes));

      this._apiService.patchData(
          e.id,
          nName,
          nUsername,
          nPassword,
          nUrl,
          nNotes
      ).pipe().subscribe({
        next: data => {
          if (e.id === this.data?.slice(-1)[0].id) {
            this._apiService.getData().pipe().subscribe(
                data => {
                  this._apiService.patchUser(this._storageService.newMasterPassword).pipe().subscribe(
                      data => {
                        sessionStorage.removeItem('token');
                        sessionStorage.removeItem('masterPassword');
                        sessionStorage.removeItem('newMasterPassword');
                        window.location.href = "/login";
                      },
                      error => {
                        console.error(error);
                      }
                  );


                },
                error => {
                  console.error(error);
                }
            );
          }
        },
        error: error => {
          console.error(error);
        }
      });
    })


  }

  cancelChangeMasterPassword() {
    this.isChangingMasterPassword = false;
    this.newMasterPassword = "";
    this.oldMasterPassword = "";
    this.newMasterPasswordConfirm = "";
  }

  onSubmit() {
    let eName = this._storageService.encrypt_aes(this.newName);
    let eUsername = this._storageService.encrypt_aes(this.newUsername);
    let ePassword = this._storageService.encrypt_aes(this.newPassword);
    let eUrl = this._storageService.encrypt_aes(this.newUrl);
    let eNotes = this._storageService.encrypt_aes(this.newNotes);

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

    this.isViewingPassword = false;


    this.editId = -1;
  }

  editData(id: number) {
    let oldData = this.data?.find(x => x.id === id) as any;

    this.editId = id;

    this.newName = this._storageService.decrypt_aes(oldData.name);
    this.newUsername = this._storageService.decrypt_aes(oldData.username);
    this.newPassword = this._storageService.decrypt_aes(oldData.password);
    this.newUrl = this._storageService.decrypt_aes(oldData.url);
    this.newNotes = this._storageService.decrypt_aes(oldData.notes);


    this.isEditing = true;
  }

  generatePassword() {
    this.newPassword = this._storageService.generate_password(this.newPasswordLength);
  }
}