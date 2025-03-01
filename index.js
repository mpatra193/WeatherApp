import express, { response } from "express";
import bodyParser from "body-parser";
import axios from "axios";
import cors from "cors";
import path from "path";
import { fileURLToPath } from 'url';
import dotenv from "dotenv";

dotenv.config();

// Simulate __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const port = 3000;
const app = express();

app.use(cors());  // This allows cross-origin requests



app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')); // Define the views folder

app.use(express.json());


//for connecting the static files
app.use(express.static("public"));

//for body parser
app.use(bodyParser.urlencoded({ extended: true }));

//API key

const API_key = process.env.API_KEY_OPENWEATHER;


//forecast_API url and geocoding_API url
// const geocoding_API = `https://api.api-ninjas.com/v1/geocoding?city=${city_name}`;
// const  forecast_API = `https://api.openuv.io/api/v1/uv?lat=${lat}&lng=${lon}`;

//header



app.get("/", async (req, res) => {
    res.render("index.ejs");
})

app.post("/get-weather-submit", async (req, res) => {    // user typed
    console.log(req.body);
    const { lat, lon } = req.body;
    const weatherResponse = await axios.get(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_key}&units=metric`);

    const location = weatherResponse.data.city.name;
    const forecast = weatherResponse.data.list;



    res.json({
        location,
        forecast,
    });
})

app.post("/get-weather", async (req, res) => {     // user taps on the map

    // let city_name = req.body["cityName"];
    // console.log(req.body);
    const { lat, lon } = req.body;
    console.log(`Received coordinates: Latitude: ${lat}, Longitude: ${lon}`);


    try {
        const geoResponse = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`)
        console.log(geoResponse.data.display_name);

        // https://api.openweathermap.org/data/3.0/onecall?lat={lat}&lon={lon}&exclude={part}&appid={API key}
        // const weatherResponse = await axios.get(`http://api.weatherapi.com/v1/forecast.json?key=e6cb31c30f2743e4874173315250101&q=${lat},${lon}&alerts=yes&days=7`);


        const weatherResponse = await axios.get(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_key}&units=metric`);
        // console.log(weatherResponse.data.forecast.forecastday[1]); // for next day forecast for 2 days
        // console.log(weatherResponse.data.location.name);
        const location = weatherResponse.data.city.name;
        const forecast = weatherResponse.data.list;
        
        console.log({
            location: `${location} (${lat.toFixed(2)}, ${lon.toFixed(2)})`,
            temperature: `${forecast[0].main.temp}°C`,
            humidity: `${forecast[0].main.humidity}%`,
            wind: `${forecast[0].wind.speed} kph`,
        });


        res.json({
            location,
            forecast,
        });

    } catch (error) {

        console.error(error.message);
        console.log(error.response.data);
    }
})

app.listen(port, () => {
    console.log(`listening on the port ${port}`);
})