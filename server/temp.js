import config from '../config.json' assert { type: "json" }

// fetch('https://payments.yoco.com/api/webhooks', {
//     method: 'POST',
//     headers: {
//         'Content-Type': 'application/json',
//         'Authorization': `Bearer ${config.yocoPrivateKey}`
//     },
//     body: JSON.stringify({
//         name: 'temp',
//         url: 'https://eoplxf93d5h24go.m.pipedream.net'
//     })
// }).then(res => res.json()).then(res => console.log(res))

// fetch('https://payments.yoco.com/api/webhooks', {
//     method: 'GET',
//     headers: {
//         'Content-Type': 'application/json',
//         'Authorization': `Bearer ${config.yocoPrivateKey}`
//     }
// }).then(res => res.json()).then(res=> console.log(res))

// fetch('https://payments.yoco.com/api/webhooks/sub_o28EjYwDlGvnbfNf8WIbkLaN', {
//     method: 'DELETE',
//     headers: {
//         'Content-Type': 'application/json',
//         'Authorization': `Bearer ${config.yocoPrivateKey}`
//     }
// }).then(res => res.json()).then(res => console.log(res))

export default {}