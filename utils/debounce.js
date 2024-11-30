export function debounce(func, ms) {
    let timeout
    return function (query) {
        clearTimeout(timeout)
        timeout = setTimeout(() => func.apply(this, arguments), ms)
    }
}
