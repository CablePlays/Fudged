const _REQUEST_PREFIX = '/requests'

async function _sendRequest(method, path, body) {
    const reqParams = { method }

    if (body != null) {
        if (body instanceof FormData) {
            reqParams.body = body
        } else { // assume is object
            reqParams.headers = {
                'Content-Type': 'application/json'
            }
            reqParams.body = JSON.stringify(body)
        }
    }

    console.info('Making ' + method + ' request to ' + path)
    const fetchResponse = await fetch(_REQUEST_PREFIX + path, reqParams)

    const returning = {
        ok: fetchResponse.ok,
        status: fetchResponse.status
    }

    console.log('a')
    if (fetchResponse.headers.get('content-type')?.includes('application/json')) {
        const json = await fetchResponse.json()
        console.log('b')
        Object.assign(returning, json) // add all keys & values to returning

        if (!fetchResponse.ok) {
            console.warn(json.error)
        }
    }

    return returning
}

async function deleteRequest(path, body) {
    return await _sendRequest('DELETE', path, body)
}

async function getRequest(path) {
    return await _sendRequest('GET', path)
}

async function postRequest(path, body) {
    return await _sendRequest('POST', path, body)
}

async function putRequest(path, body) {
    return await _sendRequest('PUT', path, body)
}