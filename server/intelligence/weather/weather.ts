import { WeatherNormalized } from "../types";
import { intelligenceStorage } from "../storage/storage";
import { intelligenceEventBus } from "../events/events";
import { IntelligenceEventType } from "../types";
import { createLogger } from "../../core/logger";

const logger = createLogger("WeatherEngine");

export class WeatherEngine {
  /**
   * Normalizes incoming raw weather forecast and assesses tactical impact of weather conditions.
   */
  public normalizeWeather(
    fixtureId: string,
    rawWeather: {
      temperatureCelcius: number;
      humidityPercent: number;
      windSpeedKph: number;
      condition: string;
    }
  ): WeatherNormalized {
    logger.info(`Running weather normalization for fixture ${fixtureId}`);

    const temp = rawWeather.temperatureCelcius;
    const humidity = rawWeather.humidityPercent;
    const wind = rawWeather.windSpeedKph;
    const condition = rawWeather.condition.toLowerCase();

    // Determine if it's raining or snowing
    const rain = condition.includes("rain") || condition.includes("drizzle") || condition.includes("snow") || condition.includes("shower");

    // Infer Pitch Condition based on condition and temperature
    let pitchCondition: WeatherNormalized["pitchCondition"] = "excellent";
    if (rain) {
      pitchCondition = "poor";
      if (humidity > 90 && wind > 30) {
        pitchCondition = "waterlogged";
      }
    } else if (temp > 32) {
      pitchCondition = "good"; // dry/hard pitch
    } else if (temp < 2) {
      pitchCondition = "poor"; // frozen/hard pitch
    }

    // Forecast confidence (assumed baseline with variance on bad weather conditions)
    let forecastConfidence = 95;
    if (condition.includes("unknown") || condition === "") {
      forecastConfidence = 40;
    } else if (rain || wind > 25) {
      forecastConfidence = 80; // higher volatility in storms
    }

    // Historical weather impact factor:
    // Scale from 0.8 (extreme weather, slow ball, low passes, error prone) to 1.0 (perfect conditions)
    let historicalWeatherImpact = 1.0;
    if (pitchCondition === "waterlogged") {
      historicalWeatherImpact = 0.78;
    } else if (pitchCondition === "poor") {
      historicalWeatherImpact = 0.88;
    } else if (temp > 35 || temp < -5) {
      historicalWeatherImpact = 0.85; // extreme temperatures fatigue players faster
    } else if (wind > 35) {
      historicalWeatherImpact = 0.90; // high wind affects long passes and shots
    }

    const metrics: WeatherNormalized = {
      fixtureId,
      temperature: temp,
      rain,
      windSpeed: wind,
      humidity,
      pitchCondition,
      forecastConfidence,
      historicalWeatherImpact: parseFloat(historicalWeatherImpact.toFixed(2))
    };

    intelligenceStorage.setWeather(fixtureId, metrics);
    logger.debug(`Weather normalized for ${fixtureId}. Pitch surface forecast: ${pitchCondition}, Performance impact factor: ${historicalWeatherImpact}`);

    // Publish event
    intelligenceEventBus.publish(IntelligenceEventType.WeatherUpdated, fixtureId, metrics);

    return metrics;
  }
}

export const weatherEngine = new WeatherEngine();
