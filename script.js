const APIKEY         = "9c8778b9a7b9f840a2eb89aaf2bab6a5";
const TIMEZONE_APIKEY = "6N67GZOS8ZNQ";

let localTimeInterval = null;

// ─── Horloge globale (heure du navigateur) ───────────────────────────────────
setInterval(() => {
  const now = new Date();
  const h = String(now.getHours()).padStart(2, '0');
  const m = String(now.getMinutes()).padStart(2, '0');
  const s = String(now.getSeconds()).padStart(2, '0');
  document.getElementById('clock').textContent = `${h}:${m}:${s}`;
}, 1000);

// ─── Éléments DOM ────────────────────────────────────────────────────────────
const cityInput     = document.getElementById('cityInput');
const searchButton  = document.getElementById('searchButton');
const weatherResult = document.getElementById('weather-result');
const emptyState    = document.getElementById('empty-state');
const errorState    = document.getElementById('error-state');

// ─── Événements ──────────────────────────────────────────────────────────────
searchButton.addEventListener('click', handleSearch);
cityInput.addEventListener('keypress', e => { if (e.key === 'Enter') handleSearch(); });

function handleSearch() {
  const ville = cityInput.value.trim();
  if (!ville) { cityInput.focus(); return; }
  apiCall(ville);
}

// ─── Appel API météo ──────────────────────────────────────────────────────────
function apiCall(city) {
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${APIKEY}&units=metric&lang=fr`;

  fetch(url)
    .then(r => r.json())
    .then(data => {
      if (data.cod !== 200) { showError(); return; }
      showResults(data);
      getLocalTime(data.coord.lat, data.coord.lon);
    })
    .catch(() => showError());
}

// ─── Afficher les résultats ───────────────────────────────────────────────────
function showResults(data) {
  // Cacher états vide/erreur, montrer résultats
  emptyState.classList.add('hidden');
  errorState.classList.add('hidden');
  weatherResult.classList.remove('hidden');

  document.getElementById('cityName').textContent      = data.name + ', ' + data.sys.country;
  document.getElementById('temp').textContent          = Math.round(data.main.temp) + ' °C';
  document.getElementById('humidity').textContent      = data.main.humidity + ' %';
  document.getElementById('wind').textContent          = Math.round(data.wind.speed) + ' km/h';

  const icon = getWeatherIcon(data.weather[0].main);
  document.getElementById('conditionIcon').className   = icon;
  document.getElementById('conditionText').textContent = capitalize(data.weather[0].description);
}

// ─── Afficher l'erreur ────────────────────────────────────────────────────────
function showError() {
  emptyState.classList.add('hidden');
  weatherResult.classList.add('hidden');
  errorState.classList.remove('hidden');
  if (localTimeInterval) { clearInterval(localTimeInterval); }
  document.getElementById('localTime').textContent = '--';
}

// ─── Heure locale via TimezoneDB ──────────────────────────────────────────────
function getLocalTime(lat, lon) {
  const url = `http://api.timezonedb.com/v2.1/get-time-zone?key=${TIMEZONE_APIKEY}&format=json&by=position&lat=${lat}&lng=${lon}`;

  fetch(url)
    .then(r => r.json())
    .then(data => {
      if (localTimeInterval) clearInterval(localTimeInterval);
      const offset = data.gmtOffset;

      localTimeInterval = setInterval(() => {
        const local = new Date(Date.now() + offset * 1000);
        const h = String(local.getUTCHours()).padStart(2, '0');
        const m = String(local.getUTCMinutes()).padStart(2, '0');
        const s = String(local.getUTCSeconds()).padStart(2, '0');
        document.getElementById('localTime').textContent = `${h}:${m}:${s}`;
      }, 1000);
    })
    .catch(() => {
      document.getElementById('localTime').textContent = 'N/A';
    });
}

// ─── Icônes météo ─────────────────────────────────────────────────────────────
function getWeatherIcon(condition) {
  const map = {
    clear:        'fas fa-sun',
    clouds:       'fas fa-cloud',
    rain:         'fas fa-cloud-rain',
    snow:         'fas fa-snowflake',
    thunderstorm: 'fas fa-bolt',
    drizzle:      'fas fa-cloud-showers-heavy',
    mist:         'fas fa-smog',
    fog:          'fas fa-smog',
    haze:         'fas fa-smog',
  };
  return map[condition.toLowerCase()] || 'fas fa-cloud';
}

// ─── Utilitaire ───────────────────────────────────────────────────────────────
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
