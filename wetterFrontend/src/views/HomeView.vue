<template>
  <v-app >
    <v-app-bar app color="purple-lighten-1" height="60" rounded>
      <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
      <v-toolbar-title class="white--text">Hier gibt es das beste Wetter ;)</v-toolbar-title>
    </v-app-bar>

    <v-main>
      <v-container >
        <v-row>
          <v-col cols="12" md="4" lg="4" xl="2">
            <v-btn color="success" @click="updateWeather">Update</v-btn>
          </v-col>
          <v-col cols="12" md="4" lg="4" xl="2">
            <v-text-field label="Region" v-model="region"></v-text-field>
          </v-col>
          <v-col cols="12" md="4" lg="4" xl="2">
            <v-text-field label="Radius" v-model="radius"></v-text-field>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12" md="3" lg="12" xl="2">
            <v-slider
                v-model="value" label="Einwohner" :min = "50000" :max = "1000000" :step="50000" thumb-label></v-slider>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12" sm="6" md="4" lg="12" xl="2" v-for="(forecast, index) in weatherForecasts" :key="index">
            <v-card class="mb-3">
              <v-card-title>{{ forecast.weather.city }} </v-card-title>
              <v-card-text>
                <p>
                  <span class="large-text">{{ forecast.weather.max }}°C / </span>
                  <span class="small-text">{{ forecast.weather.min }}°C.</span>
                </p>
                <p>
                  <v-icon color="red" size="small">mdi-heart</v-icon> {{forecast.weather.feels_like}}°C
                </p>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>


<script>
import {ref} from 'vue'
const value = ref(0)
export default {
  created() {
    this.updateWeather()
  },
  data() {
    return {
      drawer: false,
      region: 'Regensburg',
      radius: 50,
      value: 50000,

      weatherForecasts: [

        // Fügen Sie hier weitere Wettervorhersagen hinzu
      ]
    };
  },
  methods: {
    updateWeather() {
      this.weatherForecasts = {}
      this.$http.get('http://192.168.0.253:3000/weather', {
        params: {
          region: this.region,
          radius: this.radius,
          population: this.value,

        }
      })
          .then(response => {
            this.weatherForecasts = response.data
          })
          .catch(error => {
            console.error('Fehler beim GET-Request:', error);
          });
    }
  },

};

</script>
<style>
.background {
 background-color: #483285;
}
.large-text {
  font-size: 20px;
}

.small-text {
  font-size: 13px;
}
</style>