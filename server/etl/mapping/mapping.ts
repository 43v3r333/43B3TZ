import { createLogger } from "../../core/logger";

const logger = createLogger("ETLMappingEngine");

export class MappingEngine {
  // Bidirectional country code lookups
  private countryToIsoCode: Record<string, string> = {
    "united kingdom": "GBR",
    "england": "ENG",
    "south africa": "ZAF",
    "spain": "ESP",
    "germany": "DEU",
    "italy": "ITA",
    "france": "FRA",
    "united states": "USA",
    "brazil": "BRA"
  };

  private isoCodeToCountry: Record<string, string> = {
    "GBR": "United Kingdom",
    "ENG": "England",
    "ZAF": "South Africa",
    "ESP": "Spain",
    "DEU": "Germany",
    "ITA": "Italy",
    "FRA": "France",
    "USA": "United States",
    "BRA": "Brazil"
  };

  /**
   * Standardizes country names to the unified platform nomenclature.
   */
  public normalizeCountry(countryName: string): string {
    if (!countryName) return "Global";
    const key = countryName.toLowerCase().trim();
    
    // Check if it's already an ISO code
    if (this.isoCodeToCountry[countryName.toUpperCase()]) {
      return this.isoCodeToCountry[countryName.toUpperCase()];
    }

    return this.isoCodeToCountry[this.countryToIsoCode[key]] || countryName;
  }

  /**
   * Converts country names into standard 3-letter ISO-3166 codes.
   */
  public countryToIso(countryName: string): string {
    if (!countryName) return "GLO";
    const key = countryName.toLowerCase().trim();
    return this.countryToIsoCode[key] || "GLO";
  }

  /**
   * Standardizes sporting abbreviations and terminology
   */
  public mapSportCode(code: string): string {
    const norm = code?.toLowerCase().trim();
    if (norm === "soccer" || norm === "football" || norm === "assoc_football") return "FTB";
    if (norm === "rugby" || norm === "rugby_union") return "RGB";
    if (norm === "cricket") return "CRK";
    if (norm === "basketball") return "BSK";
    return "OTH";
  }
}

export const etlMappingEngine = new MappingEngine();
