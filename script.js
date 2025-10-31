// ============ WeatherNow – App Script ============
// Trage hier deinen OpenWeather-Key ein (du hast ihn schon):
const apiKey = "9276df9589a5d9bbc1eb380cb0336e9f";

// Helper
const $ = (sel) => document.querySelector(sel);
const capitalize = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : "");

// ---------- Suche (Mitte) ----------
async function getWeather(city) {
  const box = $(".weather-box");
  box.innerHTML = `<p class="muted">Lade …</p>`;
  try {
    const r = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
        city
      )}&appid=${apiKey}&units=metric&lang=de`
    );
    if (!r.ok) throw new Error("Fehler beim Laden");
    const d = await r.json();

    const iconUrl = `https://openweathermap.org/img/wn/${d.weather[0].icon}@2x.png`;
    const cityName = `${d.name}, ${d.sys.country}`;
    const desc = capitalize(d.weather[0].description);
    const temp = Math.round(d.main.temp);

    box.innerHTML = `
      <div class="weather-result fade-in">
        <h2>${cityName}</h2>
        <p>${desc}</p>
        <div class="weather-info">
          <img class="weather-icon" src="${iconUrl}" alt="${desc}">
          <span class="temperature">${temp}°C</span>
        </div>
      </div>`;
  } catch (e) {
    box.innerHTML = `<p class="error-msg">❌ Stadt nicht gefunden oder API-Fehler.</p>`;
    console.error(e);
  }
}

// ---------- Weltweit (rechts) – rotiert ----------
const worldCities = [
  "London","New York","Tokyo","Berlin",
  "Paris","Sydney","Madrid","Dubai",
  "Toronto","Singapore","Los Angeles","Oslo"
];
let worldIndex = 0;

async function getWorldWeather() {
  const box = $(".world-box");
  const city = worldCities[worldIndex % worldCities.length];
  worldIndex++;

  try {
    const r = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
        city
      )}&appid=${apiKey}&units=metric&lang=de`
    );
    if (!r.ok) throw new Error("Weltwetter nicht ladbar");
    const d = await r.json();

    const iconUrl = `https://openweathermap.org/img/wn/${d.weather[0].icon}@2x.png`;
    const desc = capitalize(d.weather[0].description);
    const temp = Math.round(d.main.temp);

    box.innerHTML = `
      <div class="world-card fade-in">
        <h3>${d.name}, ${d.sys.country}</h3>
        <p>${desc}</p>
        <div class="world-info">
          <img class="weather-icon" src="${iconUrl}" alt="${desc}">
          <span class="temperature">${temp}°C</span>
        </div>
      </div>`;
  } catch (e) {
    box.innerHTML = `<p class="error-msg">🌍 Fehler beim Laden der Weltwetterdaten.</p>`;
    console.error(e);
  }
}

// ---------- Unwetter (links) ----------
async function getSevereWeather() {
  const box = $(".severe-box");
  box.innerHTML = `<p class="muted">Suche Unwetter …</p>`;

  // bis zu 20 IDs erlaubt – Mix aus großen Städten weltweit
  const ids = [
    2950159,2643743,5128581,2968815,1850147,2147714,3448439,1816670,993800,
    524901,1835848,1609350,292223,3435910,3117735,3143244,6167865,1880252,2643123,5128638
  ];

  try {
    const r = await fetch(
      `https://api.openweathermap.org/data/2.5/group?id=${ids.join(
        ","
      )}&appid=${apiKey}&units=metric&lang=de`
    );
    if (!r.ok) throw new Error("Unwetterdaten nicht ladbar");
    const d = await r.json();

    const severe = d.list.filter((x) => {
      const id = x.weather[0].id;
      return (
        (id >= 200 && id < 300) || // Gewitter
        (id >= 502 && id <= 531) || // starker Regen
        (id >= 602 && id <= 622)    // starker Schnee
      );
    });

    if (!severe.length) {
      box.innerHTML = `<p>Keine aktuellen Unwetter gemeldet ✅</p>`;
      return;
    }

    box.innerHTML = severe
      .slice(0, 6)
      .map(
        (x) => `
        <div class="severe-item fade-in">
          <div><strong>${x.name}</strong> – ${capitalize(
          x.weather[0].description
        )}</div>
          <span class="badge">${Math.round(x.main.temp)}°C</span>
        </div>`
      )
      .join("");
  } catch (e) {
    box.innerHTML = `<p class="error-msg">⚠️ Unwetterdaten konnten nicht geladen werden.</p>`;
    console.error(e);
  }
}

// ---------- Init ----------
document.addEventListener("DOMContentLoaded", () => {
  // Suche
  $("#searchBtn").addEventListener("click", () => {
    const q = $("#cityInput").value.trim();
    if (q) getWeather(q);
  });
  $("#cityInput").addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const q = e.currentTarget.value.trim();
      if (q) getWeather(q);
    }
  });

  // Startdaten
  getSevereWeather();
  getWorldWeather();
  setInterval(getWorldWeather, 10000);
});
