import LiveStopper from "./components/LiveStopper";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./assets/home.css";
import { getTeamSummary } from "./api/teams";
import type { TeamSummary } from "./types/teams";
import TeloCsapat from "./components/telefon/TeloCsapat";
import { useIsMobile } from "./hooks/useIsMobile";
import {  getCurrentWeather,  type CurrentWeather,} from "./api/weather";

const WEATHER_LOCATION = {
  name: "Mogyoród",
  latitude: 47.6,
  longitude: 19.25,
};

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [csapatok, setCsapatok] = useState<TeamSummary[]>([]);
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  const [currentTime, setCurrentTime] = useState(new Date());

  const [weather, setWeather] = useState<CurrentWeather | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [weatherError, setWeatherError] = useState(false);

  useEffect(() => {
    getTeamSummary().then((data) => {
      setCsapatok(data);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!loading && csapatok.length === 0) {
      navigate("/mezony", { replace: true });
    }
  }, [csapatok, loading]);
  useEffect(() => {

  const interval = window.setInterval(() => {
    setCurrentTime(new Date());
  }, 1000);

  return () => {
    window.clearInterval(interval);
  };
}, []);

useEffect(() => {
  let active = true;

  async function loadWeather() {
    try {
      setWeatherError(false);

      const currentWeather = await getCurrentWeather(
        WEATHER_LOCATION.latitude,
        WEATHER_LOCATION.longitude,
      );

      if (active) {
        setWeather(currentWeather);
      }
    } catch (error) {
      console.error("Nem sikerült lekérni az időjárást", error);

      if (active) {
        setWeatherError(true);
      }
    } finally {
      if (active) {
        setWeatherLoading(false);
      }
    }
  }

  loadWeather();

  const interval = window.setInterval(
    loadWeather,
    15 * 60 * 1000,
  );

  return () => {
    active = false;
    window.clearInterval(interval);
  };
}, []);

function getWeatherInfo(weatherCode: number, isDay: boolean) {
  if (weatherCode === 0) {
    return {
      icon: isDay ? "pi pi-sun" : "pi pi-moon",
      label: "Tiszta",
    };
  }

  if ([1, 2].includes(weatherCode)) {
    return {
      icon: "pi pi-cloud",
      label: "Gyengén felhős",
    };
  }

  if (weatherCode === 3) {
    return {
      icon: "pi pi-cloud",
      label: "Felhős",
    };
  }

  if ([45, 48].includes(weatherCode)) {
    return {
      icon: "pi pi-eye-slash",
      label: "Ködös",
    };
  }

  if (
    [51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(
      weatherCode,
    )
  ) {
    return {
      icon: "pi pi-cloud",
      label: "Esős",
    };
  }

  if ([71, 73, 75, 77, 85, 86].includes(weatherCode)) {
    return {
      icon: "pi pi-snowflake",
      label: "Havazás",
    };
  }

  if ([95, 96, 99].includes(weatherCode)) {
    return {
      icon: "pi pi-bolt",
      label: "Zivatar",
    };
  }

  return {
    icon: "pi pi-cloud",
    label: "Változó",
  };
}

const weatherInfo = weather
  ? getWeatherInfo(weather.weatherCode, weather.isDay)
  : null;


  return (
  <>
    {loading ? (
      <div className="flex justify-content-center align-items-center home-loader">
        <span className="loader"></span>
      </div>
    ) : (
      <div className="home-page">
        <section className="home-dashboard-header">

          <div className="home-dashboard-clock">
            <div className="dashboard-clock-icon">
              <i className="pi pi-clock" />
            </div>
            
            <div className="dashboard-clock-content">
              <span className="dashboard-clock-label">
                Aktuális idő
              </span>

              <strong className="dashboard-clock-time">
                {currentTime.toLocaleTimeString("hu-HU", {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}
              </strong>

              <span className="dashboard-clock-date">
                {currentTime.toLocaleDateString("hu-HU", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  weekday: "long",
                })}
              </span>

              <div className="dashboard-weather">
                <i className={weatherInfo?.icon ?? "pi pi-cloud"} />

                {weatherLoading ? (
                  <span>Időjárás betöltése...</span>
                ) : weatherError || !weather ? (
                  <span className="dashboard-weather-error">
                    Időjárás nem elérhető
                  </span>
                ) : (
                  <>
                    <strong>
                      {Math.round(weather.temperature)} °C
                    </strong>

                    <span className="dashboard-weather-separator">
                      ·
                    </span>

                    <span>{weatherInfo?.label}</span>

                    <span className="dashboard-weather-location">
                      {WEATHER_LOCATION.name}
                    </span>
                  </>
                )}
              </div>
            </div>            
          </div>
        </section>


        {isMobile ? (
          <TeloCsapat csapatok={csapatok} loading={loading} />
        ) : (
          <div className="home-grid grid grid-nogutter">
            {csapatok.map((csapat) => (
              <div
                className="col-12 md:col-6 home-team-card"
                key={csapat.id}
              >
                <LiveStopper
                  teamName={csapat.name}
                  teamId={csapat.id}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    )}
  </>
);
}
