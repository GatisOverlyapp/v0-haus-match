// WebAR model URLs for different house styles
export const WEBAR_MODELS = [
  "https://create.overlyapp.com/webar/93cca02f5eaa40db1882d7418ba22d0d10373411",
  "https://create.overlyapp.com/webar/481a0214bd5b8a202170b74f80a38e307999dcbc",
  "https://create.overlyapp.com/webar/7d01b5a4d3a5ed2bb09f89ee62966546f49039b9",
]

// Get a random WebAR model URL
export function getRandomWebARModel(): string {
  const randomIndex = Math.floor(Math.random() * WEBAR_MODELS.length)
  return WEBAR_MODELS[randomIndex]
}

// Get a consistent WebAR model for a specific house ID
export function getWebARModelForHouse(houseId: string | number): string {
  const idString = String(houseId)
  const hash = idString.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const index = hash % WEBAR_MODELS.length
  return WEBAR_MODELS[index]
}
