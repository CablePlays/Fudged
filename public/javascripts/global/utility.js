const INVENTORY_ITEMS = {
    basicDogFood: {
        food: 10,
        image: '/assets/placeholder.png',
        price: 35
    },
    brownEgg: {
        image: '/assets/inventory/brown-egg.png',
        petId: 'brownDog',
        price: 150
    },
    buffedDogFood: {
        food: 20,
        image: '/assets/placeholder.png',
        price: 65
    },
    primeDogFood: {
        food: 30,
        image: '/assets/placeholder.png',
        price: 95
    },
    whiteEgg: {
        image: '/assets/inventory/white-egg.png',
        petId: 'whiteDog',
        price: 150
    }
}

const ITEMS = {
    batch: {
        mass: 600,
        max: 2,
        name: 'Batch',
        price: 140
    },
    jar: {
        mass: 400,
        max: 3,
        name: 'Jar',
        price: 100
    },
    packet: {
        mass: 50,
        max: 10,
        name: 'Packet',
        price: 12
    }
}

const PETS = { // ages range from 0 - 100
    brownDog: {
        name: 'Brown Dog',
        ages: {
            0: {
                idleImage: 'brown',
                speed: 0
            },
            20: {
                idleImage: 'maroon',
                moveAnimation: [
                    {
                        cooldown: 500,
                        image: 'red'
                    },
                    {
                        cooldown: 500,
                        image: 'orange'
                    }
                ],
                speed: 100
            }
        }
    },
    whiteDog: {
        name: 'White Dog',
        ages: {
            0: {
                idleImage: 'rgb(0,0,0)',
                speed: 0
            },
            20: {
                idleImage: 'rgb(50,50,50)',
                moveAnimation: [
                    {
                        cooldown: 500,
                        image: 'rgb(150,150,150)'
                    },
                    {
                        cooldown: 500,
                        image: 'rgb(200,200,200)'
                    }
                ],
                speed: 50
            }
        }
    }
}

function onLoad(onLoad) {
    window.addEventListener('load', onLoad)
}

function clamp(val, min, max) {
    return Math.min(Math.max(val, min), max)
}

function formatDate(date) {
    if (typeof date === 'string') {
        date = new Date(date)
    }

    let day = date.getDate() + ''
    if (day.length === 1) day = '0' + day

    let month = date.getMonth() + 1 + ''
    if (month.length === 1) month = '0' + month

    return `${day}/${month}/${date.getFullYear()}`
}

/* URL */

function getParam(param) {
    return new URLSearchParams(location.search).get(param)
}

function setParam(param, value) {
    const url = new URL(location.href)
    const { searchParams } = url

    if (value == null) {
        searchParams.delete(param)
    } else {
        searchParams.set(param, value)
    }

    window.history.replaceState({}, '', url.toString())
}

/* Elements */

function byId(id) {
    return (typeof id === 'string') ? document.getElementById(id) : id
}

function setVisible(element, visible = true) {
    element = byId(element)

    if (visible) {
        element.classList.remove('invisible')
    } else {
        element.classList.add('invisible')
    }
}

function createElement(type, options) {
    const element = document.createElement(type)
    const { c, onClick, consumer, p, r, t } = options ?? {}

    if (c) {
        const parts = c.split(' ')

        for (let clazz of parts) {
            element.classList.add(clazz)
        }
    }

    if (onClick) element.addEventListener('click', e => onClick(e, element))
    if (p) byId(p).appendChild(element)
    if (r) byId(r).replaceWith(element)
    if (t != null) element.innerHTML = t
    if (consumer) consumer(element)

    return element
}

function createSpacer(space, options) {
    const e = createElement('div', options)
    e.classList.add('spacer')
    e.classList.add('v' + space)
    return e
}