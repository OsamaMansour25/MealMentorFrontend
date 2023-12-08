// export const API_URL = "https://mealmentor-backend.azurewebsites.net/api" // Azure: http://localhost:8080/api


export let API_URL = ""

if (window.location.hostname === 'localhost' || window.location.hostname === "127.0.0.1") {
  API_URL = "http://localhost:8080/api"
} else{
  //Add URL to your hosted API, once you have it deployed.
  API_URL = "https://github.com/OsamaMansour25/MealMentorBackend3sem/api"
}


export const FETCH_NO_API_ERROR = " (Is the API online or did the endpoint exists ?)"
