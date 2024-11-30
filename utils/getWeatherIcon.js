export function getWeatherIcon(iconStatus, iconId) {
    switch (iconStatus) {
        case 'Thunderstorm':
            return 'stormy'
        case 'Drizzle':
            return 'rainy'
        case 'Rain':
            return 'rainy'
        case 'Snow':
            return 'snowy'
        case 'Atmosphere':
            return 'cloudy'
        case 'Clear':
            return 'sunny'
        case 'Clouds':
            return (iconId === 801) ? 'cloudySunny' : 'cloudy'
        default:
            return 'cloudy'
    }
}