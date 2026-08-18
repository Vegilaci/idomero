export interface CurrentWeather {
  temperature: number;
  weatherCode: number;
  isDay: boolean;
}

interface OpenMeteoResponse {
  current: {
    temperature_2m: number;
    weather_code: number;
    is_day: number;
  };
}

export async function getCurrentWeather(
  latitude: number,
  longitude: number,
): Promise<CurrentWeather> {
  const params = new URLSearchParams({
    latitude: latitude.toString(),
    longitude: longitude.toString(),
    current: "temperature_2m,weather_code,is_day",
    timezone: "auto",
  });

  const response = await fetch(
    `https://api.open-meteo.com/v1/forecast?${params.toString()}`,
  );

  if (!response.ok) {
    throw new Error(
      `Az időjárás lekérése sikertelen: ${response.status}`,
    );
  }

  const data: OpenMeteoResponse = await response.json();

  return {
    temperature: data.current.temperature_2m,
    weatherCode: data.current.weather_code,
    isDay: data.current.is_day === 1,
  };
}