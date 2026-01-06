// Country detection and location utilities

export interface CountryInfo {
  code: string
  name: string
  flag: string
}

// Supported countries with their flags (emoji)
export const COUNTRIES: Record<string, CountryInfo> = {
  Latvia: { code: "LV", name: "Latvia", flag: "🇱🇻" },
  Sweden: { code: "SE", name: "Sweden", flag: "🇸🇪" },
  Germany: { code: "DE", name: "Germany", flag: "🇩🇪" },
  Finland: { code: "FI", name: "Finland", flag: "🇫🇮" },
  Norway: { code: "NO", name: "Norway", flag: "🇳🇴" },
  Poland: { code: "PL", name: "Poland", flag: "🇵🇱" },
  UK: { code: "GB", name: "United Kingdom", flag: "🇬🇧" },
  USA: { code: "US", name: "United States", flag: "🇺🇸" },
  Canada: { code: "CA", name: "Canada", flag: "🇨🇦" },
  Australia: { code: "AU", name: "Australia", flag: "🇦🇺" },
}

// Default country
const DEFAULT_COUNTRY = "Latvia"

/**
 * Detect user's country using IP-based geolocation
 * Falls back to default country if detection fails
 */
export async function detectUserCountry(): Promise<CountryInfo> {
  try {
    // Try to detect country from IP using a free geolocation API
    const response = await fetch("https://ipapi.co/json/", {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    })

    if (!response.ok) {
      throw new Error("Failed to fetch location")
    }

    const data = await response.json()
    const countryName = data.country_name

    // Map country name to our supported countries
    if (countryName && COUNTRIES[countryName]) {
      return COUNTRIES[countryName]
    }

    // Try to match by country code
    const countryCode = data.country_code
    if (countryCode) {
      const matchedCountry = Object.values(COUNTRIES).find(
        (c) => c.code === countryCode
      )
      if (matchedCountry) {
        return matchedCountry
      }
    }

    // Fallback to default
    return COUNTRIES[DEFAULT_COUNTRY]
  } catch (error) {
    console.error("Error detecting country:", error)
    // Fallback to default country
    return COUNTRIES[DEFAULT_COUNTRY]
  }
}

/**
 * Get country info by name
 */
export function getCountryInfo(countryName: string): CountryInfo {
  return COUNTRIES[countryName] || COUNTRIES[DEFAULT_COUNTRY]
}

/**
 * Get all supported countries as an array
 */
export function getAllCountries(): CountryInfo[] {
  return Object.values(COUNTRIES)
}

