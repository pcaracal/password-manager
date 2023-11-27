import {Component} from '@angular/core';
import {CommonModule} from '@angular/common';
import {StorageService} from "../storage.service";
import {ApiService} from "../api.service";
import {FormsModule} from "@angular/forms";

@Component({
  selector: 'app-vault',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './vault.component.html',
  styleUrl: './vault.component.scss'
})
export class VaultComponent {
  isCreating: boolean = false;
  isViewing: boolean = false;

  _Id: number = -1;
  _Name: string = '';
  _Username: string = '';
  _Password: string = '';
  _Url: string = '';
  _Notes: string = '';

  data: {
    id: number,
    fk_user_id: number,
    name: string,
    username: string,
    password: string,
    notes: string,
    url: string,
    created_at: number,
    updated_at: number
  }[] = [];

  constructor(private _apiService: ApiService, protected _storageService: StorageService) {
  }

  ngOnInit(): void {
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

  viewPassword(id: number) {
    this.isCreating = false;
    this.isViewing = true;

    let oldData = this.data.find(x => x.id == id) as any;

    this._Id = oldData.id;
    this._Name = this._storageService.decrypt_aes(oldData.name);
    this._Username = this._storageService.decrypt_aes(oldData.username);
    this._Password = this._storageService.decrypt_aes(oldData.password);
    this._Url = this._storageService.decrypt_aes(oldData.url);
    this._Notes = this._storageService.decrypt_aes(oldData.notes);
  }

  addPassword() {
    this.isCreating = true;
    this.isViewing = false;
  }

  savePassword() {
    if (this.isCreating && !this.isViewing) {
      this._apiService.dataPost(
        this._storageService.encrypt_aes(this._Name),
        this._storageService.encrypt_aes(this._Username),
        this._storageService.encrypt_aes(this._Password),
        this._storageService.encrypt_aes(this._Url),
        this._storageService.encrypt_aes(this._Notes)
      ).pipe().subscribe(
        data => {
          window.location.reload();
        },
        error => {
        }
      );
    }
    if (this.isViewing && !this.isCreating) {
      this._apiService.dataPatch(
        this._Id,
        this._storageService.encrypt_aes(this._Name),
        this._storageService.encrypt_aes(this._Username),
        this._storageService.encrypt_aes(this._Password),
        this._storageService.encrypt_aes(this._Url),
        this._storageService.encrypt_aes(this._Notes)
      ).pipe().subscribe(
        data => {
          window.location.reload();
        },
        error => {
        }
      );
    }
  }

  deletePassword() {
    this._apiService.dataDelete(this._Id).pipe().subscribe(
      data => {
        window.location.reload();
      },
      error => {
      }
    );
  }

  cancel() {
    this.isCreating = false;
    this.isViewing = false;

    this._Id = -1;
    this._Name = '';
    this._Username = '';
    this._Password = '';
    this._Url = '';
    this._Notes = '';
  }
}
