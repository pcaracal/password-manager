import {Injectable} from '@angular/core';
import {sha3_512} from "js-sha3";
import CryptoJS from "crypto-js";
import MersenneTwister from "mersenne-twister";

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private _masterPassword: string = "";


  constructor() {
  }

  get masterPassword(): string {
    return this._masterPassword;
  }

  set masterPassword(value: string) {
    this._masterPassword = value;
  }

  encrypt_aes(plain: string): string {
    return CryptoJS.AES.encrypt(plain, sha3_512(this._masterPassword)).toString();
  }

  decrypt_aes(cipher: string): string {
    return CryptoJS.AES.decrypt(cipher, sha3_512(this._masterPassword)).toString(CryptoJS.enc.Utf8);
  }

  generate_salt(): string {
    let mt = new MersenneTwister();
    mt.init_seed(new Date().getTime());
    let salt = "";

    for (let i = 0; i < 64; i++) {
      salt += String.fromCharCode(Math.floor(mt.random() * 256));
    }
    return sha3_512(salt);
  }
}