import {dateConstants, selectors} from "constants/constants.js";
import {getWeatherIcon} from "utils/getWeatherIcon.js";
import {debounce} from "utils/debounce.js";

import {fetchCitySuggestions, loadCurrentWeather, loadForecastWeather} from "/utils/api/apiRequest.js";

let currentIcon = null
let forecastWeatherData = null
let currentType = 'hour'
let activeIndex = -1

document.addEventListener('DOMContentLoaded', () => {
    findLocation()
})
function findLocation() {
    if (!navigator.geolocation) {
        error()
    } else {
        navigator.geolocation.watchPosition(success, error)
    }
    async function success(position) {
        const { latitude, longitude } = position.coords;
        await handleCitySection(latitude, longitude);
    }
    async function error() {
        const defaultCityLat = '55.7505'
        const defaultCityLon = '37.6175'
        await  handleCitySection(defaultCityLat, defaultCityLon)
    }
}

function setDate() {
    let currentTime = new Date()
    let currentDate = currentTime.getDate()
    let currentDay = currentTime.getDay()
    let currentMonth = currentTime.getMonth()
    let nameOfDay = dateConstants.daysOfWeek[currentDay] || 'Ошибка получения дня недели'
    let nameOfMonth = dateConstants.monthsOfYear[currentMonth] || 'Ошибка получения месяца'

    return `${nameOfDay}, ${currentDate} ${nameOfMonth}`
}
selectors.date.textContent = setDate()

selectors.citySearchInput.addEventListener("input", () => {
    const query = selectors.citySearchInput.value.trim()
    selectors.suggestionList.innerHTML = ''
    if (query.length > 1) {
        debounceHandleCitySearch(query)
    } else {
        selectors.suggestionList.innerHTML = ''
    }
    activeIndex = -1
})
const debounceHandleCitySearch = debounce(handleCitySearch, 1000)
selectors.citySearchInput.addEventListener('keydown', (e) => {
    const items = selectors.suggestionList.querySelectorAll('li')

    // Если список пуст, игнорируем нажатия стрелок
    if (items.length === 0) return
    if (e.key === "ArrowDown") {
        activeIndex = (activeIndex + 1) % items.length
        updateActiveItem(items)
        e.preventDefault()
    } else if (e.key === "ArrowUp") {
        activeIndex = (activeIndex - 1 + items.length) % items.length
        updateActiveItem(items)
        e.preventDefault()
    } else if (e.key === "Enter") {
        e.preventDefault()
        if (items.length > 0) {
            if (activeIndex > -1) {
                items[activeIndex].click()
            } else {
                items[0].click()
            }
        }
        selectors.citySearchInput.value = ''
        selectors.suggestionList.innerHTML = ''
    }
})
function updateActiveItem(items) {
    items.forEach((item, index) => {
        item.classList.toggle("active", index === activeIndex)
    })
}

async function handleCitySearch(foundCities) {
    const cities = await fetchCitySuggestions(foundCities)
    if (cities.length === 0) {
        const suggestionItem = document.createElement("li")
        suggestionItem.textContent = `Город не найден`
        selectors.suggestionList.append(suggestionItem)
    } else {
        for (let city of cities) {
            if (city.local_names?.ru) {
                const suggestionItem = document.createElement("li")
                suggestionItem.textContent = `${city.local_names.ru}, ${city.country}`
                selectors.suggestionList.append(suggestionItem)
                suggestionItem.onclick = () => handleCitySection(city.lat, city.lon)
            }
        }
    }
}

async function handleCitySection(lat, lon) {
    try {
        const currentWeather = await loadCurrentWeather(lat, lon)
        const forecastWeather = await loadForecastWeather(lat,lon)
        forecastWeatherData = forecastWeather
        fetchCurrentWeatherData(currentWeather)
        switchForecastPanel(forecastWeather)
    } catch (error) {
        console.error("Ошибка обработки выбора города:", error)
    }
    selectors.suggestionList.innerHTML = ''
    selectors.citySearchInput.value = ''
}

function fetchCurrentWeatherData(data) {
    const cityLat = data.coord.lat
    const cityLon = data.coord.lon
    const cityName = data.name
    let {feels_like: dataFeelsLike, humidity: dataHumidity, pressure: dataPressure, temp: dataTemp} = data.main
    dataFeelsLike = Math.round(dataFeelsLike)
    dataPressure = Math.round(dataPressure * 0.75)
    dataTemp = Math.round(dataTemp)
    let {main: dataIconStatus, description: dataWeatherStatus, id: dataIconId} = data.weather[0]
    const dataWind = Math.round(data.wind.speed)
    selectors.locationName.textContent = cityName
    selectors.feelsLike.textContent = `${dataFeelsLike}`
    selectors.currentTemperature.textContent = `${dataTemp}`
    selectors.currentStatus.textContent = `${dataWeatherStatus}`
    selectors.currentHumidity.textContent = `${dataHumidity} %`
    selectors.currentWind.textContent = `${dataWind} м/с`
    selectors.currentPressure.textContent = `${dataPressure} мм рт. ст.`

    const weatherImage = getWeatherIcon(dataIconStatus, dataIconId)
    selectors.weatherIconElement.src = `img/weather/${weatherImage}.svg`
    selectors.weatherIconElement.alt = dataIconStatus
    currentIcon = weatherImage
    changeBackground(weatherImage)

    saveCityInLocalStorage(cityName, cityLat, cityLon, dataWeatherStatus, dataTemp, dataIconStatus, dataIconId)
}

function switchForecastPanel(data) {
    selectors.dayButton.addEventListener('click', () => {
        setActiveForecastButton(selectors.dayButton)
        fetchForecastHourWeatherData(data)
    })
    selectors.weekButton.addEventListener('click', () => {
        setActiveForecastButton(selectors.weekButton)
        fetchForecastDailyWeatherData(data)
    })
    setActiveForecastButton(selectors.dayButton)
    fetchForecastHourWeatherData(data)
}

function setActiveForecastButton(button) {
    const buttons = document.querySelectorAll('.toggle-btn')
    buttons.forEach(button => {
        button.classList.remove('_active')
    })
    button.classList.add('_active')
}

function fetchForecastHourWeatherData(data) {
    renderWeatherCards(data, 'hour')
}

function fetchForecastDailyWeatherData(data) {
    renderWeatherCards(data, 'day')
}

// Функция для рендеринга погодных карточек
function renderWeatherCards(data, type) {
    selectors.cards.innerHTML = ''
    const step = (type === 'hour') ? 1 : 8
    const dataListLength = (type === 'hour') ? 8 : 40
    for (let i = 0; i < dataListLength; i += step) {
        const card = createWeatherCard(data.list[i], type)
        selectors.cards.append(card)
    }
}

// Функция для создания карточки погоды
function createWeatherCard(item, type) {
    const cardWrapper = document.createElement('div')
    cardWrapper.classList.add('card-wrapper')
    const isTouchDevice = document.body.classList.contains('_touch')
    const time = (type === 'hour')
        ? new Date(item.dt * 1000).getHours() + ':00'
        : dateConstants.dayOfWeekReduction[new Date(item.dt * 1000).getDay()]
    let {main: status, id: id, description: description} = item.weather[0]
    let {humidity: humidity, temp: temp} = item.main
    const weatherImage = getWeatherIcon(status, id)
    if (!isTouchDevice) {
        cardWrapper.innerHTML = `
        <div class="card__info">
            <h2 class="card__title">${time}</h2>
            <p class="card__sub-title">${description}</p>
            <div class="wind">
                <h3>${Math.round(item.wind.speed)} м/с</h3>
            </div>
            <div class="humidity">
                <h3>${humidity} %</h3>
            </div>
        </div>
        <div class="card__visualisation">
            <img src="img/weather/${weatherImage}.svg" alt="${status}" height="66px">
            <h1>${Math.round(temp)} °C</h1>
        </div>`
    } else {
        cardWrapper.innerHTML = `
        <div class="card__info">
            <h2 class="card__title">${time}</h2>
            <div class="card__visualisation">
                <img src="img/weather/${weatherImage}.svg" alt="${status}" height="66px">
                <h1>${Math.round(temp)} °C</h1>
            </div>
        </div>`
    }

    return cardWrapper
}

//сохранение городов
function saveCityInLocalStorage(cityName, lat, lon, weatherStatus, temperature, iconStatus, iconId) {
    let cities = JSON.parse(localStorage.getItem('cities')) || []
    const cityData = {
        name: cityName,
        lat: lat,
        lon: lon,
        temperature: temperature,
        weather_status: weatherStatus,
        icon_status: iconStatus,
        icon_id: iconId
    }
    const cityExistsIndex = cities.findIndex(city => city.name === cityName)
    if (cityExistsIndex !== -1) {
        cities[cityExistsIndex] = cityData
    } else {
        cities.push(cityData)
    }
    if (cities.length > 3) {
        cities.shift()
    }
    localStorage.setItem('cities', JSON.stringify(cities))
    renderCities(cities)
}

//рендеринг недавних городов
function renderCities(cities) {
    const citiesWrapper = document.querySelector('.cities')
    const citiesElements = citiesWrapper.querySelectorAll('.cities__wrapper')
    citiesElements.forEach(city => city.remove())
    for (let city of cities) {
        let {name: name, temperature: temp, weather_status: weather_status, icon_status: icon_status, icon_id: icon_id} = city
        const weatherImage = getWeatherIcon(icon_status, icon_id)
        const cityContent = document.createElement('div')
        cityContent.classList.add('cities__wrapper')
        cityContent.innerHTML = `
                <div class="cities__wrapper_info">
                    <h2 class="cities__name">${name}</h2>
                    <h3>${weather_status}</h3>
                </div>
                <div class="cities__wrapper_temp">
                    <h2>${temp} °C</h2>
                    <img src="img/weather/${weatherImage}.svg" alt="${weatherImage}" height="41px" width="50px">
                </div>`
        citiesWrapper.append(cityContent)
    }
}

function handleResize() {
    const isTouchDevice = window.matchMedia('(max-width: 950px)').matches
    document.body.classList.remove('_touch')
    changeBackground(currentIcon)
    renderWeatherCards(forecastWeatherData, currentType)
    if (isTouchDevice) {
        document.body.classList.add('_touch')
        changeBackground(currentIcon)
        renderWeatherCards(forecastWeatherData, currentType)
    }
}
window.addEventListener('resize', handleResize)
document.addEventListener('DOMContentLoaded', handleResize)

function changeBackground(icon) {
    const panel = document.querySelector('.forecast-panel')
    const textContentChanges = document.querySelectorAll('.location__name, .current-weather__temp, .current-weather__feels-like')
    const buttonsColor = document.querySelectorAll('.toggle-btn')
    const body = document.body
    const isTouchDevice = document.body.classList.contains('_touch')
    panel.classList.remove('_light', '_dark')
    body.classList.remove('_light', '_dark')
    textContentChanges.forEach(text => text.classList.remove('_dark'))
    buttonsColor.forEach(button => button.classList.remove('_dark'))
    if (icon === 'sunny' || icon === 'cloudySunny' || icon === 'cloudy') {
        if (isTouchDevice) {
            body.classList.add('_light')
            buttonsColor.forEach(button => button.classList.add('_light'))
        } else {
            panel.classList.add('_light')
        }
    } else {
        if (isTouchDevice) {
            body.classList.add('_dark')
            textContentChanges.forEach(text => text.classList.add('_dark'))
            buttonsColor.forEach(button => button.classList.add('_dark'))
        } else {
            panel.classList.add('_dark')
        }
    }
}

