const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
const port = 3000;

const apiKey = 'a11434d7a299c2c041c313115c02529a';

function kelvinToCelsius(kelvin) {
  const celsius = kelvin - 273.15;
  return parseFloat(celsius.toFixed(0));
}

async function getWeatherDataForCities(cityDataArray, apiKey) {
  const weatherData = [];

  for (const cityData of cityDataArray) {
    try {
      const { lat, lon, name } = cityData;
      const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}`);
      const { temp_min, temp_max, temp } = response.data.main;
      const weather = {
        min: kelvinToCelsius(temp_min),
        max: kelvinToCelsius(temp_max),
        feels_like: kelvinToCelsius(temp),
        city: name
      };
      weatherData.push({ weather });
    } catch (error) {
      console.error(`Fehler beim Abrufen der Wetterdaten für ${cityData.name}: ${error.message}`);
    }
  }

  return weatherData;
}

app.get('/weather', async (req, res) => {
  try {
    const { region, radius, population } = req.query;
    if (!region || !radius || !population) {
      res.status(400).json({ error: 'Stellen Sie sicher, dass alle erforderlichen Parameter (region, radius, population) angegeben sind.' });
      return;
    }

    // 1. Schritt: Abrufen der Längen- und Breitengrad-Koordinaten der Stadt
    const geoNamesCoordinatesURL = `http://api.geonames.org/searchJSON?q=${region}&maxRows=1&username=dgdms`;
    const coordinatesResponse = await axios.get(geoNamesCoordinatesURL);
    const cityData = coordinatesResponse.data.geonames[0];
    const latitude = cityData.lat;
    const longitude = cityData.lng;

    // 2. Schritt: Abrufen aller Städte im Umkreis
    const geoNamesAPIURL = `http://api.geonames.org/findNearbyPlaceNameJSON?lat=${latitude}&lng=${longitude}&radius=${radius}&cities=cities15000&maxRows=500&username=dgdms`;
    const response = await axios.get(geoNamesAPIURL);
    const geonamesAll = response.data.geonames;
    const filteredCities = geonamesAll.filter(city => city.population >= population);

    // Extrahiere Längen- und Breitengrade der gefundenen Städte
    const cityDataArray = filteredCities.map(city => {
      return {
        lat: city.lat,
        lon: city.lng,
        name: city.name
      };
    });

    // Aufruf der Funktion und Verwendung des Promise
    getWeatherDataForCities(cityDataArray, apiKey)
        .then((weatherDataArray) => {
          weatherDataArray.filter(element => element !== undefined);
          weatherDataArray.sort((a, b) => b.weather.feels_like - a.weather.feels_like);
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

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
