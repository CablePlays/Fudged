async function handleLogin(val) {
    const { credential } = val

    setInfo('Signing in, please wait.')

    const { ok, newUser } = await putRequest('/handle-signin', { token: credential })

    if (ok) {
        setInfo('Signed in, redirecting...')

        if (newUser) {
            location.href = '/details'
        } else {
            location.href = getParam('redirect') ?? '/'
        }
    } else {
        setInfo('Could not sign in.')
    }
}

function setInfo(text) {
    byId('info').innerHTML = text
}