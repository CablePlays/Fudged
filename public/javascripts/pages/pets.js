onLoad(() => {
    createPet('blue')
    createPet('red')
    createPixelArtPet()
})

function getPetsContainer() {
    return byId('pets-container')
}

function createPixelArt(resX, resY, pixelSize, pixels) {
    const canvas = createElement('div', { c: 'pixel-art' })
    canvas.style.height = `${resY * pixelSize}px`
    canvas.style.width = `${resX * pixelSize}px`

    for (let i = 0; i < resX * resY; i++) {
        const pixel = createElement('div', { p: canvas })
        pixel.style.height = pixelSize + 'px'
        pixel.style.width = pixelSize + 'px'
        pixel.style['background-color'] = pixels[i]
    }

    return canvas
}

function createPixelArtPet() {
    const pixels = []

    for (let i = 0; i < 8 * 8; i++) {
        const r = Math.random()

        if (r < 1 / 3) {
            pixels.push('blue')
        } else if (r < 2 / 3) {
            pixels.push('red')
        } else {
            pixels.push('')
        }
    }

    const pet = createPixelArt(8, 8, 10, pixels)
    pet.classList.add('pet')

    getPetsContainer().appendChild(pet)
    applyAI(pet)
}

function createPet(color) {
    const pet = createElement('div', { c: 'pet', p: getPetsContainer() });
    pet.style['background-color'] = color

    applyAI(pet)
}

function applyAI(element) {
    const petsContainer = getPetsContainer()

    const petPadding = 16
    const petSpeed = 50
    const petSizeX = element.clientWidth
    const petSizeY = element.clientHeight

    setTimeout(async () => {
        let x = 0, y = 0

        element.style.left = '0'
        element.style.top = '0'

        while (true) {
            let newX = petPadding + Math.random() * (petsContainer.clientWidth - petSizeX - petPadding * 2)
            let newY = petPadding + Math.random() * (petsContainer.clientHeight - petSizeY - petPadding * 2)

            let distance = Math.sqrt(Math.pow(x - newX, 2) + Math.pow(y - newY, 2))
            let time = distance / petSpeed

            element.style.transition = time + 's linear'
            element.style.left = newX + 'px'
            element.style.top = newY + 'px'

            x = newX
            y = newY

            const cooldown = 1000 + Math.random() * 2000
            await new Promise(r => setTimeout(r, time * 1000 + cooldown))
        }
    })
}