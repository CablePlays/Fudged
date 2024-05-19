import cookies from '../server/cookies.js'

export function requireSignedIn(req, res, next) {
    const { signedIn } = req

    if (signedIn) {
        next()
    } else {
        res.redirect(`/signin?redirect=${req.path}`)
    }
}