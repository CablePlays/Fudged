import config from '../config.json' assert { type: "json" }

export function createWebhook(name, url) {
    console.info(`Creating webhook: ${url}`)

    fetch('https://payments.yoco.com/api/webhooks', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${config.yocoPrivateKey}`
        },
        body: JSON.stringify({
            name,
            url
        })
    }).then(res => res.json()).then(res => console.log(res))
}

export function getWebhooks() {
    fetch('https://payments.yoco.com/api/webhooks', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${config.yocoPrivateKey}`
        }
    }).then(res => res.json()).then(res => console.log(res))
}

export function deleteWebhook(id) {
    fetch(`https://payments.yoco.com/api/webhooks/${id}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${config.yocoPrivateKey}`
        }
    }).then(res => res.json()).then(res => console.log(res))
}