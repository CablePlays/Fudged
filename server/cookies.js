const COOKIE_USER = 'user_id'
const COOKIE_SESSION_TOEN = 'session_token'

function getCookie(name, req) {
    const cookies = decodeURIComponent(req.headers.cookie || '').split(';')
    const cname = name + '='

    for (let cookie of cookies) {
        cookie = cookie.trim()

        if (cookie.startsWith(cname)) {
            return cookie.substring(cname.length, cookie.length)
        }
    }

    return null
}

function getUserId(req) {
    const userId = getCookie(COOKIE_USER, req)
    return (userId == null) ? null : parseInt(userId)
}

function getSessionToken(req) {
    return getCookie(COOKIE_SESSION_TOEN, req)
}

function isLoggedIn(req) {
    return (getUserId(req) != null) && (getSessionToken(req) != null)
}

function logOut(res) {
    res.clearCookie(COOKIE_USER)
    res.clearCookie(COOKIE_SESSION_TOEN)
}

export default {
    COOKIE_USER,
    COOKIE_SESSION_TOEN,

    getUserId,
    getSessionToken,
    isSignedIn: isLoggedIn,
    signOut: logOut
}