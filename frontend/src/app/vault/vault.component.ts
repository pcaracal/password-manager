import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {StorageService} from "../storage.service";
import {ApiService} from "../api.service";
import {FormsModule} from "@angular/forms";
import {PasswordStrengthMeterComponent} from "angular-password-strength-meter";

@Component({
  selector: 'app-vault',
  standalone: true,
  imports: [CommonModule, FormsModule, PasswordStrengthMeterComponent],
  templateUrl: './vault.component.html',
  styleUrl: './vault.component.scss'
})
export class VaultComponent implements OnInit {
  isCreating: boolean = false;
  isViewing: boolean = false;


  _Id: number = -1;
  _Name: string = '';
  _Username: string = '';
  _Password: string = '';
  _Url: string = '';
  _Notes: string = '';
  _FolderId: number = -1;

  folders: { id: number, name: string }[] = [];

  _FolderName: string = '';
  isCreatingFolder: boolean = false;
  newFolderName: string = '';
  isFolderSelected: boolean = false;

  selectFolder(id: number) {
    this._FolderId = id;
    this.isFolderSelected = true;
    this._FolderName = this.folders.find(x => x.id == id)?.name as string;
    this.renderData = this.data.filter(e => {
      return e.fk_folder_id == id;
    });
  }

  deleteFolder(id: number) {
    this._apiService.deleteFolder(id).pipe().subscribe(
      data => {
        window.location.reload();
      },
      error => {
      }
    );
  }

  saveFolder() {
    this._apiService.folderPost(this.newFolderName).pipe().subscribe(
      data => {
        window.location.reload();
      },
      error => {
      }
    );
  }

  cancelFolder() {
    this.isCreatingFolder = false;
    this.newFolderName = '';
    this.isFolderSelected = false;
    this.renderData = this.data;
  }

  _NewPasswordLength: number = 16;
  isViewingPassword: boolean = false;

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
    fk_folder_id: number
  }[] = [];

  renderData = this.data;

  constructor(private _apiService: ApiService, protected _storageService: StorageService) {
  }

  ngOnInit(): void {
    this._apiService.getData().pipe().subscribe(
      data => {
        this.data = data;
        this.renderData = data;
        console.log("Data:", data);
      },
      error => {
        console.log(error);
      }
    );

    this._apiService.getFolders().pipe().subscribe(
      data => {
        this.folders = data;
        console.log("Folders:", data);
      },
      error => {
        console.log(error);
      }
    );
  }

  searchText: string = '';

  searchChange() {
    this.renderData = this.data.filter(e => {
      if (this.isFolderSelected) {
        return this._storageService.decrypt_aes(e.name)
          .toLowerCase()
          .includes(
            this.searchText.toLowerCase()
              .trim()
              .replace("   ", "  ")
              .replace("  ", " ")
          ) && e.fk_folder_id == this._FolderId;
      }

      return this._storageService.decrypt_aes(e.name)
        .toLowerCase()
        .includes(
          this.searchText.toLowerCase()
            .trim()
            .replace("   ", "  ")
            .replace("  ", " ")
        );
    });
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
    this._FolderId = oldData.fk_folder_id;
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
        this._storageService.encrypt_aes(this._Notes),
        this._FolderId
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
        this._storageService.encrypt_aes(this._Notes),
        this._FolderId
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

    this._OldPassword = '';
    this._NewPassword = '';
    this._NewPassword2 = '';
    this.isChangingMasterPassword = false;
  }

  generatePassword() {
    this.isViewingPassword = true;
    this._Password = this._storageService.generate_password(this._NewPasswordLength);
  }


  // Master password stuff
  _OldPassword: string = '';
  _NewPassword: string = '';
  _NewPassword2: string = '';
  isChangingMasterPassword: boolean = false;

  changeMasterPassword() {
    if (this._NewPassword != this._NewPassword2 || this._NewPassword == '' || this._storageService.masterPassword != this._OldPassword) {
      return;
    }

    this._storageService.newMasterPassword = this._NewPassword;

    this.data?.forEach(e => {
      this._apiService.dataPatch(
        e.id,
        this._storageService.encrypt_aes_new(this._storageService.decrypt_aes(e.name)),
        this._storageService.encrypt_aes_new(this._storageService.decrypt_aes(e.username)),
        this._storageService.encrypt_aes_new(this._storageService.decrypt_aes(e.password)),
        this._storageService.encrypt_aes_new(this._storageService.decrypt_aes(e.url)),
        this._storageService.encrypt_aes_new(this._storageService.decrypt_aes(e.notes)),
        e.fk_folder_id
      ).pipe().subscribe(
        data => {
          if (e.id == this.data?.slice(-1)[0].id) {
            this._apiService.userPatch(this._storageService.newMasterPassword).pipe().subscribe(
              data => {
                this._storageService.masterPassword = this._storageService.newMasterPassword;
                this._storageService.newMasterPassword = '';
                this.isChangingMasterPassword = false;
                window.location.reload();
              },
              error => {
                console.error(error);
              }
            );
          }
        },
        error => {
          console.error(error);
        }
      );
    })
  }

  protected readonly event = event;
}