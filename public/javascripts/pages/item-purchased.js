onLoad(async () => {
    const info = byId('info')

    for (let i = 5; i > 0; i--) {
        info.innerHTML = `Redirecting in ${i}`
        await new Promise(r => setTimeout(r, 1000))
    }

    info.innerHTML = "Redirecting..."
    location.href = '/shop'
})