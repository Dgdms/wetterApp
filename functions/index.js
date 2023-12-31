const {onRequest} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const functions = require('firebase-functions');

const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors())


function kelvinToCelsius(kelvin) {
    const celsius = kelvin - 273.15;
    return parseFloat(celsius.toFixed(0));
}

async function getWeatherDataForCities(cityNames) {
    const weatherData = [];

    for (const city of cityNames) {
        try {
            const response = await axios.get(`http://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${process.env.WETTERAPI}`);
            const { temp_min, temp_max, feels_like } = response.data.main;
            const weather = {
                min: kelvinToCelsius(temp_min),
                max: kelvinToCelsius(temp_max),
                feels_like: kelvinToCelsius(feels_like),
                city: city
            };
            weatherData.push({ weather });
        } catch (error) {
            console.error(`Fehler beim Abrufen der Wetterdaten für ${city}: ${error.message}`);
        }
    }

    return weatherData;
}








app.get('/weather', async (req, res) => {
    try {
        const { region, radius, population} = req.query;
        if (!region || !radius || !population) {
            res.status(400).json({ error: 'Stellen Sie sicher, dass alle erforderlichen Parameter (cityName, radius, username) angegeben sind.' });
            return;
        }

        // 1. Schritt: Abrufen der Längen- und Breitengrad-Koordinaten der Stadt
        const geoNamesCoordinatesURL = `http://api.geonames.org/searchJSON?q=${region}&maxRows=1&username=${process.env.GEOAPI}`;
        const coordinatesResponse = await axios.get(geoNamesCoordinatesURL);
        const cityData = coordinatesResponse.data.geonames[0];
        const latitude = cityData.lat;
        const longitude = cityData.lng;

        // 2. Schritt: Abrufen aller Städte im Umkreis
        const geoNamesAPIURL = `http://api.geonames.org/findNearbyPlaceNameJSON?lat=${latitude}&lng=${longitude}&radius=${radius}&cities=cities15000&maxRows=500&username=${process.env.GEOAPI}`;
        const response = await axios.get(geoNamesAPIURL);
        const geonamesAll = response.data.geonames;
        const filteredCities = geonamesAll.filter(city => city.population >= population);
        const cityNames = filteredCities.map(city => city.name);



// Aufruf der Funktion und Verwendung des Promise
        getWeatherDataForCities(cityNames)
            .then((weatherDataArray) => {
                weatherDataArray.filter(element => element !== undefined)
                weatherDataArray.sort((a, b) => b.weather.max - a.weather.max);
                res.json(weatherDataArray);
            })
            .catch((error) => {
                console.error(error);
                res.status(500).json({ error: 'Ein allgemeiner Fehler ist aufgetreten' });
            });


    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Fehler bei der Abfrage von Geonames' });
    }
});



exports.app = functions.https.onRequest(app);
