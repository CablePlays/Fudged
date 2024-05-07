import cookies from '../server/cookies.js'

export function requireSelf(req, res, next) {
    if (req.userId === req.targetUserId) {
        next()
    } else {
        res.res(403, 'not_self')
    }
}