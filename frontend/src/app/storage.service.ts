import {Injectable} from '@angular/core';
import {sha3_512} from "js-sha3";
import CryptoJS from "crypto-js";
import MersenneTwister from "mersenne-twister";
import {BehaviorSubject, Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private _isLoggedInSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  isLoggedIn$: Observable<boolean> = this._isLoggedInSubject.asObservable();

  setLoggedIn(value: boolean): void {
    this._isLoggedInSubject.next(value);
  }


  constructor() {
  }

  get masterPassword(): string {
    return atob(sessionStorage.getItem(btoa('masterPassword')) || '');
  }

  set masterPassword(value: string) {
    sessionStorage.setItem(btoa('masterPassword'), btoa(value));
  }

  get newMasterPassword(): string {
    return atob(sessionStorage.getItem(btoa('newMasterPassword')) || '');
  }

  set newMasterPassword(value: string) {
    sessionStorage.setItem(btoa('newMasterPassword'), btoa(value));
  }

  encrypt_aes(plain: string): string {
    return CryptoJS.AES.encrypt(this.generate_salt() + plain, sha3_512(this.masterPassword)).toString();
  }

  encrypt_aes_new(plain: string): string {
    return CryptoJS.AES.encrypt(this.generate_salt() + plain, sha3_512(this.newMasterPassword)).toString();
  }

  decrypt_aes(cipher: string): string {
    return CryptoJS.AES.decrypt(cipher, sha3_512(this.masterPassword)).toString(CryptoJS.enc.Utf8).substring(128);
  }

  generate_salt(): string {
    let mt = new MersenneTwister();
    mt.init_seed(new Date().getTime());
    let salt = "";

    for (let i = 0; i < 64; i++) {
      salt += String.fromCharCode(Math.floor(mt.random() * 94) + 33);
    }

    return sha3_512(salt);
  }

  generate_password(length: number): string {
    let mt = new MersenneTwister();
    mt.init_seed(new Date().getTime());
    let password = "";

    let forbidden = [34, 39, 40, 41, 47, 91, 92, 93, 96, 123, 124, 125];
    while (password.length < length) {
      let c = Math.floor(mt.random() * 94) + 33;
      if (forbidden.includes(c)) {
        continue;
      }

      password += String.fromCharCode(c);
    }

    return password;
  }
}
