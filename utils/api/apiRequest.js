const apiKey = '8541c148f60b708908f49e28c1cdaa88'
const baseUrl = 'https://api.openweathermap.org/'

export async function fetchCitySuggestions(query) {
    const cityApiUrl = `${baseUrl}geo/1.0/direct?q=${query}&limit=5&appid=${apiKey}`
    try {
        const response = await fetch(cityApiUrl)
        return await response.json()
    } catch (error) {
        console.log("Ошибка получения городов:", error)
        return []
    }
}

export async function loadCurrentWeather(lat, lon) {
    const currentWeatherApiUrl = `${baseUrl}data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&lang=ru&units=metric`
    try {
        const response = await fetch(currentWeatherApiUrl, {method: 'GET'})
        return await response.json()
    } catch (error) {
        console.error("Ошибка загрузки текущей погоды:", error)
        return {}
    }
}

export async function loadForecastWeather(lat, lon) {
    const forecastWeatherApiUrl = `${baseUrl}data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&lang=ru&units=metric`
    try {
        const response = await fetch(forecastWeatherApiUrl)
        return await response.json()
    } catch (error) {
        console.error("Ошибка загрузки прогноза погоды:", error)
        return {}
    }
}
