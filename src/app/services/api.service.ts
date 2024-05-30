import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment.development';

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
