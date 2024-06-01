const DROPZONE_HOVER_CLASS = 'dropzone-hover'
const FOOD_HOVER_CLASS = 'food-hover'
const petPadding = -50

const petObjects = []
let draggingItemId
let targetFeedingPet

const useItemFunctions = {} // called when an item is used to update the amount

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
        useItemFunctions[itemId] = () => {
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

    for (let petId in pets) {
        const petData = pets[petId]
        new Pet(parseInt(petId), petData.id, petData.age)
    }
}

function getPetFromElement(element) {
    for (let pet of petObjects) {
        if (pet.element === element) {
            return pet
        }
    }

    return null
}

function setupPetsContainerListeners() {
    const petsContainer = getPetsContainer()

    petsContainer.addEventListener('dragenter', e => {
        if (draggingItemId == null) {
            return
        }

        const { target } = e
        const { food, petId } = INVENTORY_ITEMS[draggingItemId]

        if (food != null && target.classList.contains('pet')) {
            if (targetFeedingPet != null) {
                targetFeedingPet.classList.remove(FOOD_HOVER_CLASS)
            }

            const pet = getPetFromElement(target)

            if (pet.getAge() < 100) {
                targetFeedingPet = target
                target.classList.add(FOOD_HOVER_CLASS)
            } else {
                targetFeedingPet = null
            }
        } else if (petId != null) {
            petsContainer.classList.add(DROPZONE_HOVER_CLASS)
        }
    })

    petsContainer.addEventListener('dragover', e => {
        e.preventDefault()
    })

    petsContainer.addEventListener('dragleave', e => {
        const { fromElement: toElement } = e

        if (!toElement.classList.contains('pet')) {
            if (targetFeedingPet != null) {
                targetFeedingPet.classList.remove(FOOD_HOVER_CLASS)
                targetFeedingPet = null
            }
            if (toElement !== petsContainer) {
                petsContainer.classList.remove(DROPZONE_HOVER_CLASS)
            }
        }
    })

    petsContainer.addEventListener('drop', e => {
        if (draggingItemId == null) {
            return
        }

        const { food: foodAmount, petId: petTypeId } = INVENTORY_ITEMS[draggingItemId]

        if (foodAmount != null) {
            if (targetFeedingPet != null) {
                targetFeedingPet.classList.remove(FOOD_HOVER_CLASS)
                useItemFunctions[draggingItemId]()

                const pet = getPetFromElement(targetFeedingPet)
                const { id: petId } = pet

                if (petId == null) { // ID yet retreieved after creation
                    return
                }

                pet.setAge(pet.getAge() + foodAmount)
                postRequest(`/users/${getUserId()}/pets/${petId}/age`, { itemId: draggingItemId })
            }
        } else if (petTypeId != null) {
            petsContainer.classList.remove(DROPZONE_HOVER_CLASS)
            useItemFunctions[draggingItemId]()

            const rect = petsContainer.getBoundingClientRect()
            const posX = e.clientX - rect.left
            const posY = e.clientY - rect.top

            const idPromise = new Promise(r => postRequest(`/users/${getUserId()}/pets`, { itemId: draggingItemId }).then(v => r(v.id)))
            const pet = new Pet(idPromise, petTypeId)
            pet.setPosition(posX - pet.element.clientWidth / 2, posY - pet.element.clientHeight / 2)
        }
    })
}

class Pet {
    #age // [0; 100]
    #ageData
    #animationChecker
    #idle = true

    constructor(id, typeId, age = 0) {
        setTimeout(async () => this.id = await id) // allow ID to be promise
        this.typeId = typeId
        this.element = createElement('div', { c: 'pet', p: getPetsContainer() })
        petObjects.push(this)

        this.setAge(age)
        this.setPosition(...this.#getRandomPosition())
        this.applyAi()
    }

    getAge() {
        return this.#age
    }

    setAge(age) {
        age = clamp(age, 0, 100)

        this.#age = age
        const { ages } = PETS[this.typeId]
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