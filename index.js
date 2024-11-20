"use strict"

const isMobile = {
    Android: function (){
        return navigator.userAgent.match(/Android/i);
    },
    BlackBerry: function (){
        return navigator.userAgent.match(/BlackBerry/i);
    },
    iOS: function (){
        return navigator.userAgent.match(/iPhone|iPad|iPod/i);
    },
    Opera: function (){
        return navigator.userAgent.match(/Opera Mini/i);
    },
    Windows: function (){
        return navigator.userAgent.match(/IEMobile/i);
    },
    any: function (){
        return(
            isMobile.Android()||
            isMobile.BlackBerry()||
            isMobile.iOS()||
            isMobile.Opera()||
            isMobile.Windows()
        );
    }
}

if (isMobile.any()){
    document.body.classList.add('_touch')
} else {
    document.body.classList.add('_pc')
}

document.addEventListener('DOMContentLoaded', () => {
    const mainElement = document.querySelector('.main')
    const isFirstVisit = !localStorage.getItem('hasVisitedBefore')

    if (isFirstVisit) {
        localStorage.setItem('hasVisitedBefore', 'true')
    } else {
        mainElement.classList.remove('hidden')
        loadSavedCities()
    }
})
function loadSavedCities() {
    const savedCities = JSON.parse(localStorage.getItem('cities')) || []
    if (savedCities.length > 0) {
        const lastCity = savedCities[savedCities.length-1]
        locationName.textContent = lastCity.name
        const currentWeatherApiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${lastCity.name}&appid=${apiKey}&lang=ru&units=metric`
        loadCurrentWeather(currentWeatherApiUrl)

        const forecastWeatherApiUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${lastCity.name}&appid=${apiKey}&lang=ru&units=metric`
        loadForecastWeather(forecastWeatherApiUrl)
        renderCities(savedCities)
    }
}


// Константы для дат
const daysOfWeek = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота']
const dayOfWeekReduction = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']
const monthsOfYear = ['Января', 'Февраля', 'Марта', 'Апреля', 'Мая', 'Июня', 'Июля', 'Августа', 'Сентября', 'Октября', 'Ноября', 'Декабря']

// Отображение текущей даты
let currentTime = new Date()
let currentDate = currentTime.getDate()
let currentDay = currentTime.getDay()
let currentMonth = currentTime.getMonth()
let nameOfDay = daysOfWeek[currentDay] || 'Ошибка получения дня недели'
let nameOfMonth = monthsOfYear[currentMonth] || 'Ошибка получения месяца'
const date = document.querySelector('.date__name')
date.textContent = `${nameOfDay}, ${currentDate} ${nameOfMonth}`

// Определение селекторов DOM
const weatherBlock = document.querySelector('.current-weather')
const locationName = document.querySelector('.location__name')
const feelsLike = document.querySelector('.feels-like')
const currentTemperature = document.querySelector('.temp')
const currentStatus = document.querySelector('.weatherStatus')
const currentHumidity = document.querySelector('.humidity')
const currentWind = document.querySelector('.wind')
const currentPressure = document.querySelector('.pressure')
const weatherIconElement = document.querySelector('.weatherIcon')
const citySearchInput = document.querySelector('.city-search-input')
const suggestionList = document.querySelector('.suggestion-list')
const dayButton = document.querySelector('.day-btn')
const weekButton = document.querySelector('.week-btn')
const cards = document.querySelector('.cards')

// Функции для получения и обработки города
const apiKey = '8541c148f60b708908f49e28c1cdaa88'
const limit = 5
async function fetchCitySuggestions(query) {
    const cityApiUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=${limit}&appid=${apiKey}`
    try {
        const response = await fetch(cityApiUrl)
        if (!response.ok) throw new Error(`Ошибка: ${response.statusText}`)
        const cities = await response.json()

        suggestionList.innerHTML = ''
        activeIndex = -1
        for (let city of cities) {
            if (city.local_names?.ru) {
                const suggestionItem = document.createElement("li")
                suggestionItem.textContent = `${city.local_names.ru}, ${city.country}`
                suggestionItem.onclick = () => selectSuggestion(city.local_names.ru, city.lat, city.lon)
                suggestionList.appendChild(suggestionItem)
            }
        }
    } catch (error) {
        console.log("Ошибка получения подсказок:", error)
    }
}

async function loadCurrentWeather(apiUrl) {
    const response = await fetch(apiUrl, { method: 'GET' })
    const weatherData = await response.json()

    if (response.ok) {
        fetchCurrentWeatherData(weatherData)
    } else {
        weatherBlock.innerHTML = weatherData.message
    }
}

async function loadForecastWeather(apiUrl) {
    try {
        const response = await fetch(apiUrl, { method: 'GET' })
        const weatherData = await response.json()
        fetchForecastHourWeatherData(weatherData)
        switchForecastPanel(weatherData)
    } catch (error) {
        console.log(error)
    }
}

function fetchForecastHourWeatherData(data) {
    renderWeatherCards(data, 'hour')
}

function fetchForecastDailyWeatherData(data) {
    renderWeatherCards(data, 'day')
}

function fetchCurrentWeatherData(data) {
    const cityName = data.name
    const dataTemp = Math.round(data.main.temp)
    const dataFeelsLike = Math.round(data.main.feels_like)
    const dataWeatherStatus = data.weather[0].description
    const dataIconStatus = data.weather[0].main
    const dataIconId = data.weather[0].id
    const dataHumidity = data.main.humidity
    const dataWind = Math.round(data.wind.speed)
    const dataPressure = Math.round(data.main.pressure * 0.75)

    feelsLike.textContent = `${dataFeelsLike}`
    currentTemperature.textContent = `${dataTemp}`
    currentStatus.textContent = `${dataWeatherStatus}`
    currentHumidity.textContent = `${dataHumidity} %`
    currentWind.textContent = `${dataWind} м/с`
    currentPressure.textContent = `${dataPressure} мм рт. ст.`

    const weatherImage = getWeatherIcon(dataIconStatus, dataIconId)
    weatherIconElement.src = `img/weather/${weatherImage}.svg`
    weatherIconElement.alt = dataIconStatus
    changeBackground(weatherImage)

    saveCityInLocalStorage(cityName, dataWeatherStatus, dataTemp, dataIconStatus, dataIconId)
}

function changeBackground(icon) {
    const panel = document.querySelector('.forecast-panel')
    const textContentChanges = document.querySelectorAll('.location__name, .current-weather__temp, .current-weather__feels-like')
    const body = document.body
    panel.classList.remove('_light', '_dark')
    body.classList.remove('_light', '_dark')
    textContentChanges.forEach(text => {
        text.classList.remove('_dark')
    })
    if (icon === 'sunny' || icon === 'cloudySunny' || icon === 'cloudy') {
        if (body.classList.contains('_pc')) {
            panel.classList.add('_light')
        } else {
            body.classList.add('_light')
        }
    } else {
        if (body.classList.contains('_pc')) {
            panel.classList.add('_dark')
        } else {
            body.classList.add('_dark')
            textContentChanges.forEach(text => {
                text.classList.add('_dark')
            })
        }
    }
}

// Функция для рендеринга погодных карточек
function renderWeatherCards(data, type) {
    cards.innerHTML = ''
    const step = (type === 'hour') ? 1 : 8
    const dataListLength = (type === 'hour') ? 8 : 40
    for (let i = 0; i < dataListLength; i += step) {
        const card = createWeatherCard(data.list[i], type)
        cards.append(card)
    }
}

function switchForecastPanel(data) {
    dayButton.addEventListener('click', () => {
        setActiveForecastButton(dayButton)
        fetchForecastHourWeatherData(data)
    })
    weekButton.addEventListener('click', () => {
        setActiveForecastButton(weekButton)
        fetchForecastDailyWeatherData(data)
    })
    setActiveForecastButton(dayButton)
}

// Функция для создания карточки погоды
function createWeatherCard(item, type) {
    const cardWrapper = document.createElement('div')
    cardWrapper.classList.add('card-wrapper')

    const time = (type === 'hour')
        ? new Date(item.dt * 1000).getHours() + ':00'
        : dayOfWeekReduction[new Date(item.dt * 1000).getDay()]

    const weatherImage = getWeatherIcon(item.weather[0].main, item.weather[0].id)
    if (document.body.classList.contains('_pc')) {
        cardWrapper.innerHTML = `
        <div class="card__info">
            <h2 class="card__title">${time}</h2>
            <h3 class="card__sub-title">${item.weather[0].description}</h3>
            <div class="wind">
                <h3>${Math.round(item.wind.speed)} м/с</h3>
            </div>
            <div class="humidity">
                <h3>${item.main.humidity} %</h3>
            </div>
        </div>
        <div class="card__visualisation">
            <img src="img/weather/${weatherImage}.svg" alt="${item.weather[0].main}" height="66px">
            <h1>${Math.round(item.main.temp)} °C</h1>
        </div>`
    } else {
        cardWrapper.innerHTML = `
        <div class="card__info">
            <h2 class="card__title">${time}</h2>
            <div class="card__visualisation">
                <img src="img/weather/${weatherImage}.svg" alt="${item.weather[0].main}" height="66px">
                <h1>${Math.round(item.main.temp)} °C</h1>
            </div>
        </div>`
    }

    return cardWrapper
}

function getWeatherIcon(iconStatus, iconId) {
    switch (iconStatus) {
        case 'Thunderstorm':
            return 'stormy'
        case 'Drizzle':
            return 'rainy'
        case 'Rainy':
            return 'rainy'
        case 'Snow':
            return 'snowy'
        case 'Atmosphere':
            return 'cloudy'
        case 'Clear':
            return 'sunny'
        case 'Clouds':
            return iconId === 801 ? 'cloudySunny' : 'cloudy'
        default:
            return 'cloudy'
    }
}

function setActiveForecastButton(button) {
    const buttons = document.querySelectorAll('.toggle-btn')
    buttons.forEach(button => {
        button.classList.remove('_active')
    })
    button.classList.add('_active')
}

function selectSuggestion(cityName, lat, lon) {
    citySearchInput.value = cityName
    locationName.textContent = cityName
    suggestionList.innerHTML = ""

    const currentWeatherApiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&lang=ru&units=metric`
    loadCurrentWeather(currentWeatherApiUrl)

    const forecastWeatherApiUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&lang=ru&units=metric`
    loadForecastWeather(forecastWeatherApiUrl)
    citySearchInput.value = ""
}

let activeIndex = -1
citySearchInput.addEventListener('keydown', (e) => {
    const items = suggestionList.querySelectorAll('li')

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
        citySearchInput.value = ""
        suggestionList.innerHTML = ""
    }
})

function updateActiveItem(items) {
    items.forEach((item, index) => {
        item.classList.toggle("active", index === activeIndex)
    })
}

// Сброс активного индекса при новом вводе текста
citySearchInput.addEventListener("input", () => {
    const query = citySearchInput.value.trim()
    if (query.length > 1) {
        fetchCitySuggestions(query)
    } else {
        suggestionList.innerHTML = ''
    }
    activeIndex = -1
})

//сохранение городов
function saveCityInLocalStorage(cityName, weatherStatus, temperature, iconStatus, iconId) {
    let cities = JSON.parse(localStorage.getItem('cities')) || []
    const cityData = {
        name: cityName,
        temperature: temperature,
        weather_status: weatherStatus,
        icon_status: iconStatus,
        icon_id: iconId,

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
    const savedCities = JSON.parse(localStorage.getItem('cities')) || []
    renderCities(cities)

    const mainElement = document.querySelector('.main')
    if (mainElement.classList.contains('hidden')) {
        mainElement.classList.remove('hidden')
    }
}

//рендеринг недавних городов
function renderCities(cities) {
    const citiesWrapper = document.querySelector('.cities')
    const citiesElements = citiesWrapper.querySelectorAll('.cities__wrapper')
    citiesElements.forEach(city => city.remove())

    for (let city of cities) {
        const weatherImage = getWeatherIcon(city.icon_status, city.icon_id)
        const cityContent = document.createElement('div')
        cityContent.classList.add('cities__wrapper')
        cityContent.innerHTML = `
                <div class="cities__wrapper_info">
                    <h2 class="cities__name">${city.name}</h2>
                    <h3>${city.weather_status}</h3>
                </div>
                <div class="cities__wrapper_temp">
                    <h2>${city.temperature} °C</h2>
                    <img src="img/weather/${weatherImage}.svg" alt="${weatherImage}" height="66px" width="90px">
                </div>`
        citiesWrapper.append(cityContent)
    }
}
