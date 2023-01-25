import { Injectable } from '@angular/core';
import {HttpClient,HttpHeaders, HttpParams} from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { ICurrentWeather } from '../Models/ICurrentWeather';
import {IDailyWeather} from '../Models/IDailyWeather';
import { IAlertWeather } from '../Models/IAlertWeather';

@Injectable({
  providedIn: 'root'
})
export class GetWeatherDetailsService {

  constructor(private _http:HttpClient) { }

  getWeatherDetails(url:string):Observable<ICurrentWeather>{
   const headers = new HttpHeaders({
    'Content-type':'application/json',
    'X-RapidAPI-Key': '051fca80d9mshd849e95e36c953ep11f873jsne29b32c1ac73',
    'X-RapidAPI-Host': 'weatherbit-v1-mashape.p.rapidapi.com'
  })
    return this._http.get<ICurrentWeather>(url,{headers})
  }

  getDailyWeatherDetails(url:string):Observable<IDailyWeather>{
    const headers = new HttpHeaders({
      'Content-type':'application/json',
      'X-RapidAPI-Key': '051fca80d9mshd849e95e36c953ep11f873jsne29b32c1ac73',
      'X-RapidAPI-Host': 'weatherbit-v1-mashape.p.rapidapi.com'
    })
    return this._http.get<IDailyWeather>(url,{headers});
  }

  getHourlyWeatherDetails(url:string):Observable<IDailyWeather>{
    const headers = new HttpHeaders({
      'Content-type':'application/json',
      'X-RapidAPI-Key': '051fca80d9mshd849e95e36c953ep11f873jsne29b32c1ac73',
      'X-RapidAPI-Host': 'weatherbit-v1-mashape.p.rapidapi.com'
    })
    return this._http.get<IDailyWeather>(url,{headers});
  }
  getEmergencyAlerts(url:string):Observable<IAlertWeather>{
    const headers = new HttpHeaders({
      'Content-type':'application/json',
      'X-RapidAPI-Key': '051fca80d9mshd849e95e36c953ep11f873jsne29b32c1ac73',
      'X-RapidAPI-Host': 'weatherbit-v1-mashape.p.rapidapi.com'
    })
    return this._http.get<IAlertWeather>(url,{headers});
  }
}
