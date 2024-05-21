const INVENTORY_ITEMS = {
    brownEgg: {
        name: 'Brown Egg',
        price: 150
    },
    whiteEgg: {
        name: 'White Egg',
        price: 150
    },
    2: {
        mass: 1500,
        max: 1,
        name: 'Batch',
        price: 200
    }
}

const ITEMS = {
    batch: {
        mass: 1500,
        max: 1,
        name: 'Batch',
        price: 200
    },
    jar: {
        mass: 1000,
        max: 2,
        name: 'Jar',
        price: 100
    },
    packet: {
        mass: 50,
        max: 20,
        name: 'Packet',
        price: 12
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

    window.history.replaceState({}, "", url.toString())
}

/* Elements */

function byId(id) {
    return (typeof id === 'string') ? document.getElementById(id) : id
}

function setVisible(element, visible = true) {
    element = byId(element)

    if (visible) {
        element.classList.remove("invisible")
    } else {
        element.classList.add("invisible")
    }
}

function createElement(type, options) {
    const element = document.createElement(type)
    const { c, onClick, consumer, p, r, t } = options ?? {}

    if (c) {
        const parts = c.split(" ")

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