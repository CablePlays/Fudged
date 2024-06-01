const DROPZONE_HOVER_CLASS = 'dropzone-hover'
const petPadding = -50
let draggingItemId

const dropItemFunctions = {}

onLoad(() => {
    loadInventory()
    loadPets()
    setupPetsContainerListeners()
})

function getPetsContainer() {
    return byId('pets-container')
}

async function loadInventory() {
    const itemsContainer = byId('items')
    const { inventory: items } = await getRequest(`/users/${getUserId()}/inventory`)

    byId('inventory-loading').remove()

    for (let itemId in items) {
        let amount = items[itemId]
        if (amount <= 0) continue

        const item = INVENTORY_ITEMS[itemId]

        const itemElement = createElement('div', { c: 'item', p: itemsContainer })
        const imageElement = createElement('img', { p: itemElement })
        imageElement.src = item.image

        const amountElement = createElement('p', { p: itemElement, t: amount })
        dropItemFunctions[itemId] = () => {
            amount--
            amountElement.innerHTML = amount

            if (amount <= 0) {
                itemElement.remove()
            }
        }

        imageElement.addEventListener('dragstart', e => {
            draggingItemId = itemId
        })
        imageElement.addEventListener('dragend', e => {
            draggingItemId = null
        })
    }
}

async function loadPets() {
    const { pets } = await getRequest(`/users/${getUserId()}/pets`)

    for (let petData of pets) {
        const pet = new Pet(petData.id)
        pet.setAge(petData.age)
    }
}

function setupPetsContainerListeners() {
    const petsContainer = getPetsContainer()

    petsContainer.addEventListener('dragenter', e => {
        if (draggingItemId != null) {
            petsContainer.classList.add(DROPZONE_HOVER_CLASS)
        }
    })

    petsContainer.addEventListener('dragover', e => {
        e.preventDefault()
    })

    petsContainer.addEventListener('dragleave', e => {
        const { fromElement: toElement } = e

        if (!toElement.classList.contains('pet') && toElement !== petsContainer) {
            petsContainer.classList.remove(DROPZONE_HOVER_CLASS)
        }
    })

    petsContainer.addEventListener('drop', e => {
        if (draggingItemId == null) {
            return
        }

        petsContainer.classList.remove(DROPZONE_HOVER_CLASS)
        dropItemFunctions[draggingItemId]()

        const rect = petsContainer.getBoundingClientRect()
        const posX = e.clientX - rect.left
        const posY = e.clientY - rect.top

        const { petId } = INVENTORY_ITEMS[draggingItemId]
        const pet = new Pet(petId)
        pet.setPosition(posX - pet.element.clientWidth / 2, posY - pet.element.clientHeight / 2)

        postRequest(`/users/${getUserId()}/pets`, { itemId: draggingItemId })
    })
}

class Pet {
    #ageData
    #animationChecker
    #idle = true

    constructor(petId) {
        this.id = petId
        this.element = createElement('div', { c: 'pet', p: getPetsContainer() })

        this.setAge(0)
        this.setPosition(...this.#getRandomPosition())
        this.applyAi()
    }

    setAge(age) {
        const { ages } = PETS[this.id]
        let usingAge

        for (let ageKey in ages) {
            if (usingAge == null || age >= ageKey && ageKey > usingAge) {
                usingAge = ageKey
            }
        }

        this.#ageData = ages[usingAge]
        this.#setIdleAnimation()
    }

    #setIdleAnimation(idle = this.#idle) {
        this.#idle = idle

        if (idle) {
            this.#animationChecker = null
            this.element.style['background-color'] = this.#ageData.idleImage
        } else {
            setTimeout(async () => {
                const animationChecker = [] // used to check if animation is cancelled
                this.#animationChecker = animationChecker
                const frames = this.#ageData.moveAnimation

                for (let i = 0; this.#animationChecker === animationChecker; i++) {
                    if (i >= frames.length) i = 0 // back to first frame

                    const { image, cooldown } = frames[i]
                    this.element.style['background-color'] = image

                    await new Promise(r => setTimeout(r, cooldown))
                }
            })
        }
    }

    #getRandomPosition() {
        const petsContainer = getPetsContainer()

        return [
            petPadding + Math.random() * (petsContainer.clientWidth - this.element.clientWidth - petPadding * 2),
            petPadding + Math.random() * (petsContainer.clientHeight - this.element.clientHeight - petPadding * 2)
        ]
    }

    applyAi() {
        setTimeout(async () => {
            while (true) {
                const { speed } = this.#ageData

                if (speed > 0) {
                    const [posX, posY] = this.getPosition()
                    const [newX, newY] = this.#getRandomPosition()

                    const distance = Math.sqrt(Math.pow(posX - newX, 2) + Math.pow(posY - newY, 2))
                    const time = distance / speed

                    this.#setIdleAnimation(false)
                    this.setPosition(newX, newY, time)
                    await new Promise(r => setTimeout(r, time * 1000))
                }

                this.#setIdleAnimation(true)
                await new Promise(r => setTimeout(r, 1000 + Math.random() * 4000))
            }
        }, Math.random() * 3000)
    }

    getPosition() {
        const containerRect = getPetsContainer().getBoundingClientRect()
        const petRect = this.element.getBoundingClientRect()
        return [petRect.left - containerRect.left, petRect.top - containerRect.top]
    }

    setPosition(x, y, transitionTime = 0) {
        this.element.style.transition = `left ${transitionTime}s linear, top ${transitionTime}s linear`
        this.element.style.left = `${x}px`
        this.element.style.top = `${y}px`
    }
}