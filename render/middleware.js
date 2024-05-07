import cookies from '../server/cookies.js'

export function requireSignedIn(req, res, next) {
    if (cookies.isSignedIn(req)) {
        next()
    } else {
        res.redirect(`/signin?redirect=${req.path}`)
    }
}