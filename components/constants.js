// Константы для дат
export const dateConstants = {
    daysOfWeek: ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'],
    dayOfWeekReduction: ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
    monthsOfYear: ['Января', 'Февраля', 'Марта', 'Апреля', 'Мая', 'Июня', 'Июля', 'Августа', 'Сентября', 'Октября', 'Ноября', 'Декабря']
}

// Определение селекторов DOM
export const selectors = {
    weatherBlock: document.querySelector('.current-weather'),
    locationName: document.querySelector('.location__name'),
    feelsLike: document.querySelector('.feels-like'),
    currentTemperature: document.querySelector('.temp'),
    currentStatus: document.querySelector('.weatherStatus'),
    currentHumidity: document.querySelector('.humidity'),
    currentWind: document.querySelector('.wind'),
    currentPressure: document.querySelector('.pressure'),
    weatherIconElement: document.querySelector('.weatherIcon'),
    citySearchInput: document.querySelector('.city-search-input'),
    suggestionList: document.querySelector('.suggestion-list'),
    dayButton: document.querySelector('.day-btn'),
    weekButton: document.querySelector('.week-btn'),
    cards: document.querySelector('.cards')
}
