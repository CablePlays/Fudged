const COOKIE_USER = 'user_id'
const COOKIE_SESSION_TOKEN = 'session_token'

function _getCookie(name) {
    let cookies = decodeURIComponent(document.cookie || '').split(';')
    let cname = name + '='

    for (let cookie of cookies) {
        cookie = cookie.trim()

        if (cookie.startsWith(cname)) {
            return cookie.substring(cname.length, cookie.length)
        }
    }

    return null
}

function _removeCookie(name) {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`
}

function getUserId() {
    const id = _getCookie(COOKIE_USER)
    return (id == null) ? null : parseInt(id)
}

function signOut() {
    _removeCookie(COOKIE_USER)
    _removeCookie(COOKIE_SESSION_TOKEN)
}