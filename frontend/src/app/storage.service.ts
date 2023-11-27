import {Injectable} from '@angular/core';
import {sha3_512} from "js-sha3";
import CryptoJS from "crypto-js";
import MersenneTwister from "mersenne-twister";

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  public _masterPassword: string = "";
  public _newMasterPassword: string = "";


  constructor() {
  }

  get masterPassword(): string {
    return sessionStorage.getItem('masterPassword') || "";
    // return this._masterPassword;
  }

  set masterPassword(value: string) {
    sessionStorage.setItem('masterPassword', value);
    // this._masterPassword = value;
  }

  get newMasterPassword(): string {
    return sessionStorage.getItem('newMasterPassword') || "";
    // return this._newMasterPassword;
  }

  set newMasterPassword(value: string) {
    sessionStorage.setItem('newMasterPassword', value);
    // this._newMasterPassword = value;
  }

  encrypt_aes(plain: string): string {
    console.log("encrypt old", sha3_512(this.masterPassword), "encrypt old unhashed", this.masterPassword)
    return CryptoJS.AES.encrypt(this.generate_salt() + plain, sha3_512(this.masterPassword)).toString();
  }

  encrypt_aes_new(plain: string): string {
    console.log("encrypt new", sha3_512(this.newMasterPassword), "encrypt new unhashed", this.newMasterPassword)
    return CryptoJS.AES.encrypt(this.generate_salt() + plain, sha3_512(this.newMasterPassword)).toString();
  }

  decrypt_aes(cipher: string): string {
    console.log("decrypt old", sha3_512(this.masterPassword), "decrypt old unhashed", this.masterPassword)
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