export interface IAlertWeather{
    alerts: Array<{
        description:string,
        effective_local:string,
        expires_local:string,
        regions:string[],
        severity:string,
        title:string,
    }>,
    city_name: string,
    country_code: string,
    lat: number,
    lon: number,
    state_code: string,
    timezone:string
}
