import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup,FormBuilder,Validator, Validators } from '@angular/forms';
import {GetWeatherDetailsService } from 'src/app/Services/get-weather-details.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { animate, animation, state, style, transition, trigger } from '@angular/animations';
import { IDailyWeather } from 'src/app/Models/IDailyWeather';
import { IAlertWeather } from './Models/IAlertWeather';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  animations:[
    trigger("detailExpand",[
      state("collapsed",style({height:'0px',minHeight:'0'})),
      state("expanded",style({height:'*'})),
      transition('expanded <=> collapsed',animate('255ms ease-in-out'))
    ])
  ]
})
export class AppComponent implements OnInit{
  
  //FormGroups for formcontrols
  longlatitude!:FormGroup;
  Preference!:FormGroup; 
  
  //Objects to store the response
  currentWeather!:any;
  dailyWeatherObject:any[]=[];
  hourlyWeatherDetails:any[]=[];
  emergencyAlert!:IAlertWeather["alerts"];

  //helper variables
  windSpeed!:number;
  day!:string;
  image!:string;
  expandedElement:any;
  userName!:string;

  /**
   * Restrict the User for 4 calls.
   * check Pagination.
   */



  //To show data in Table and paginating the table
  displayedColumns: string[] = ["More Details",'Temparature', 'Clouds', 'Precipitation', 'Pressure',"Humidity","Snow","Time(H)","Visibility"];
  dataSource:any;
  @ViewChild(MatPaginator)paginator!: MatPaginator;

  //flags 
  dailyFlag:boolean=false;
  hourlyFlag:boolean=false;
  currentFlag:boolean=false;
  alertFlag:boolean=false;
  alertMessage:boolean=false;

  constructor(private _getWeather:GetWeatherDetailsService,private fb:FormBuilder){
  }

  days:Array<string> = ["Sunday","Monday","Tuesday","Wednesday","Thrusday","Friday","Saturday"];
  weatherCodeImage!:Object;

  ngOnInit():void{
    this.dailyFlag=false;
    this.hourlyFlag=false;
    this.currentFlag=false;
    this.alertFlag=false;
    this.alertMessage=false;
    this.longlatitude = this.fb.group({
      Latitude:['',Validators.required],
      Longitude:['',Validators.required]
    })
    this.Preference = this.fb.group({
      Preference:['',Validators.required],
    })
    this.Preference.patchValue({"Preference":"current"});
    if(localStorage.getItem("attempts")===null){
      document.getElementById("forOpacity")!.style.opacity="0.1";
    }
    this.userName  = localStorage.getItem("UserName")||"";
    if(this.userName==""){
      this.alertMessage=true;
    }
    this.Preference.controls['Preference'].disable();

  }

  getLantitude(){
    navigator.geolocation.getCurrentPosition(position=>{
      this.longlatitude.patchValue({"Latitude":position.coords.latitude});
      this.longlatitude.patchValue({"Longitude":position.coords.longitude});
      localStorage.setItem("attempts",(parseInt(localStorage.getItem("attempts")!)-1).toString());
      this.getWeather("current");
      this.Preference.controls['Preference'].enable();
    },
    error=>
    {
      alert("Please give access to your location");
      window.location.reload();
    })
  }
  weatherPreference(value:string){
    //lat : 18.8316339 long: 78.713608
    //console.log(value);
    let weatherURl = "https://weatherbit-v1-mashape.p.rapidapi.com/"+value+"?lon="+this.longlatitude.get('Longitude')!.value+"&lat="+this.longlatitude.get('Latitude')!.value;
    switch(value){
      case "forecast/daily":
        this.dailyWeather(weatherURl);
        break;
      case "forecast/hourly":
        this.hourlyWeatherForcast(weatherURl);
        break;
      case "alerts":
        this.weatherAlertsMethod(weatherURl);
        break;
      case "current":
        this.getWeather(weatherURl);
    }
  }
  getWeather(weatherState:string){
    this.noOfAttempts();
    if(this.noOfAttempts()!="error"){
      localStorage.setItem("attempts",(parseInt(localStorage.getItem("attempts")!)-1).toString());
      //current  //forecast/daily  //forecast/hourly //alerts
      let weatherURl = "https://weatherbit-v1-mashape.p.rapidapi.com/current?lon="+this.longlatitude.get('Longitude')!.value+"&lat="+this.longlatitude.get('Latitude')!.value;
      this._getWeather.getWeatherDetails(weatherURl).subscribe({
        next:(value) =>{
          this.currentWeather = value.data[0];
          console.log(value);
          this.getImageByWeatherCode(this.currentWeather.weather.code);
          this.windSpeed = Math.round(this.currentWeather.wind_spd);
          let day =new Date(this.currentWeather.ob_time).getDay();
          this.day = this.days[day];
          //console.log(this.currentWeather);
          this.flagsMethodToShowandHideContent(false,false,true,false);
        },
        error:(err)=> {
          //console.log(err);
          this.image="error";
          this.flagsMethodToShowandHideContent(false,false,false,false);
          localStorage.clear();
        },
      })
    }
  }

  getImageByWeatherCode(weatherCode:number){
    const weatherImageObject={
      "thunder.svg":[200,233],
      "rainy-7.svg":[300,302],
      "rainy-6.svg":[500,522],
      "snowy-6.svg":[600,623],
      "allWeathersymbol.svg":[700,751],
      "sun.png":[800],
      "cloudy-day-3.svg":[801,804],
      "rainy-5.svg":[900]
    }
    const values = Object.values(weatherImageObject);
    let min,max;let key;
    values.forEach(element => {
      [min,max=900]=element;
      if(weatherCode>=min&& weatherCode<=max){
        key = Object.keys(weatherImageObject).find(key => weatherImageObject[key as keyof typeof weatherImageObject]===element)
        console.log(key);
        this.image="assets/Images/"+key;
      }
    });
    if(key==undefined){
        this.image="assets/Images/allWeathersymbol.svg";
    }
    return this.image;
  }

  dailyWeather(url:string){
    this.noOfAttempts();
    if(this.noOfAttempts()!="error"){
      localStorage.setItem("attempts",(parseInt(localStorage.getItem("attempts")!)-1).toString());
      let tempArray;
      this._getWeather.getDailyWeatherDetails(url).subscribe({
        next:(value)=>{
          console.log(value);
            tempArray = value.data;
            this.dailyWeatherObject.splice(0);
          for(let i=0;i<tempArray.length;i++){
            let day = new Date(tempArray[i].datetime).getDay();
            tempArray[i].datetime = this.days[day];
            this.dailyWeatherObject.push(tempArray[i]);
          }
          this.flagsMethodToShowandHideContent(true,false,false,false)
        },
        error:(err)=>{
          console.log(err);
          this.image="error";
          this.flagsMethodToShowandHideContent(false,false,false,false);
          localStorage.clear();
        }
      })
    }
  }

  hourlyWeatherForcast(url:string){
    this.noOfAttempts();
    if(this.noOfAttempts()!="error"){
      localStorage.setItem("attempts",(parseInt(localStorage.getItem("attempts")!)-1).toString());
      this._getWeather.getHourlyWeatherDetails(url).subscribe({
        next:(value)=>{
          console.log(value);
          let tempArray=value.data;
          this.hourlyWeatherDetails.splice(0);
          for(let i=0;i<tempArray.length;i++){
            let day = new Date(tempArray[i].timestamp_local);
            tempArray[i]["day"] = this.days[day.getDay()].slice(0,3);
            tempArray[i]["time"]= day.toLocaleString([],{hour:'2-digit',minute:'2-digit'});
            tempArray[i].weather["Weather Icon"]=this.getImageByWeatherCode(tempArray[i].weather.code);
            tempArray[i].weather["Wind Speed(m/s)"] = tempArray[i].wind_spd;
            tempArray[i].weather["Wind Direction"] = tempArray[i].wind_cdir_full;
            delete tempArray[i].weather.icon;
            delete tempArray[i].weather.code;
            delete tempArray[i].wind_spd;
            delete tempArray[i].wind_cdir_full;
            this.hourlyWeatherDetails.push(tempArray[i]);
          }
          console.log(this.hourlyWeatherDetails);
          this.dataSource=new MatTableDataSource(this.hourlyWeatherDetails);
          setTimeout(() => this.dataSource.paginator = this.paginator);
          this.flagsMethodToShowandHideContent(false,true,false,false)
        },
        error:(err)=>{
          console.log(err);
          this.image="error";
          this.flagsMethodToShowandHideContent(false,false,false,false);
          localStorage.clear();
        }
      })
    }
  }
  getKey(object:Object):string[]{
    let keys:string[]=[];
    if(object!=undefined){
      keys = Object.keys(object);
    }
    return keys;
  }

  getValues(object:Object):string[]{
    let values:string[]=[];
    if(values!=undefined){
      values = Object.values(object);
    }
    return values;
  }

  checkImage(value:any){
    if(isNaN(value) && value.startsWith("assets")){
      return value.indexOf("Images")>-1
    }else{
      return false;
    }
  }

  attempts(){
    let userName = (<HTMLInputElement>document.getElementById("userName")).value;
    localStorage.setItem("attempts","5");
    localStorage.setItem("UserName",userName);
    this.userName  = localStorage.getItem("UserName")||"";
    this.alertMessage=false;
    document.getElementById("forOpacity")!.style.opacity="1";
  }

  weatherAlertsMethod(url:string){
    if( this.noOfAttempts()!="error"){
      localStorage.setItem("attempts",(parseInt(localStorage.getItem("attempts")!)-1).toString());
      this._getWeather.getEmergencyAlerts(url).subscribe({
        next:(value)=>{
          console.log(value);
          this.emergencyAlert = value.alerts;
          console.log(this.emergencyAlert);
          if(this.emergencyAlert.length>0){
            this.emergencyAlert[0].effective_local = new Date(this.emergencyAlert[0].effective_local).toLocaleString([],{hour:'2-digit',minute:'2-digit'});
            this.emergencyAlert[0].expires_local = new Date(this.emergencyAlert[0].expires_local).toLocaleString([],{hour:'2-digit',minute:'2-digit'});
          }else{
            this.flagsMethodToShowandHideContent(false,false,false,true);
          }
        },
        error:(err)=>{
          console.log(err);
          this.image="error";
          this.flagsMethodToShowandHideContent(false,false,false,false);
          localStorage.clear();
        }
      })
    }
  }

  flagsMethodToShowandHideContent(daily: boolean,hourly: boolean,current: boolean,alert: boolean){
    this.dailyFlag=daily;
    this.hourlyFlag=hourly;
    this.currentFlag=current;
    this.alertFlag=alert;
  }
  noOfAttempts(){
    if(parseInt(localStorage.getItem("attempts")!)<=0){
      this.image="error";
      this.flagsMethodToShowandHideContent(false,false,false,false);
      localStorage.clear();
    }
    return this.image;
  }
}


