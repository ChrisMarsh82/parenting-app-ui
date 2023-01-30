import { Injectable } from "@angular/core";
import { SyncServiceBase } from "../syncService.base";

@Injectable({
  providedIn: "root",
})
export class LocalStorageService extends SyncServiceBase {
  constructor() {
    super("LocalStorage");
  }

  getString(key: string): string | null {
    return localStorage.getItem(key);
  }

  setString(key: string, value: string) {
    return localStorage.setItem(key, value);
  }

  getJSON(key: string): any {
    let jsonString = localStorage.getItem(key);
    try {
      return JSON.parse(jsonString);
    } catch (ex) {
      return null;
    }
  }

  setJSON(key: string, value: any): any {
    try {
      let jsonString = JSON.stringify(value);
      localStorage.setItem(key, jsonString);
    } catch (ex) {
      return null;
    }
  }

  setBoolean(key: string, value: boolean) {
    this.setString(key, "" + value);
  }

  getBoolean(key: string): boolean | null {
    const result = localStorage.getItem(key);
    if (result === null) {
      return null;
    }
    return result === "true";
  }

  getFloat(key: string): number {
    const result = localStorage.getItem(key);
    if (result === null) {
      return null;
    }
    return Number.parseFloat(result);
  }

  setFloat(key: string, value: number) {
    this.setString(key, "" + value);
  }

  clear() {
    localStorage.clear();
  }
}
