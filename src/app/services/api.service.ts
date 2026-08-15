import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  constructor(private http: HttpClient) {}

  post(url: string, body: any, headers?: any) {
    return this.http.post(environment.url + url, body, { headers: headers });
  }

  put(url: string, body: any, headers?: any) {
    return this.http.put(environment.url + url, body, { headers: headers });
  }

  /**
   * Mengubah sebagian ruas pada catatan yang sudah ada.
   *
   * Dibedakan dari put(): put menggantikan seluruh catatan, sedangkan yang
   * dipakai di sini menyentuh satu keadaan saja — misalnya menandai kelebihan
   * bayar sudah dikembalikan. Memakai put untuk itu berarti mengirim kembali
   * seluruh isi catatan hanya demi mengubah satu boolean, dan setiap ruas yang
   * lupa disertakan akan terhapus.
   */
  patch(url: string, body: any, headers?: any) {
    return this.http.patch(environment.url + url, body, { headers: headers });
  }

  get(url: string, queryParams?: any, headers?: any) {
    return this.http.get(environment.url + url, {
      params: queryParams,
      headers: headers,
    });
  }

  delete(url: string) {
    return this.http.delete(environment.url + url);
  }
}
