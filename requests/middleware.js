export function requireSelf(req, res, next) {
    if (req.userId === req.targetUserId) {
        next()
    } else {
        res.res(403, 'not_self')
    }
}

export function requireSignedIn(req, res, next) {
    const { signedIn } = req

    if (signedIn) {
        next()
    } else {
        res.res(400, 'not_signed_in')
    }
}