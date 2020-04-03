import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {UrlJSON} from '../utils/UrlJSON';

@Injectable({
    providedIn: 'root'
})
export class HttpRequestService {

    constructor(private http:HttpClient) {
    }

    getUsers() {
        return this.http.get(`${UrlJSON.getUsersUrl}/getUsers`);
    }
}
