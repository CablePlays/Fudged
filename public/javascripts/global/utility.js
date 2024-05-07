function onLoad(onLoad) {
    window.addEventListener('load', onLoad)
}

function clamp(val, min, max) {
    return Math.min(Math.max(val, min), max)
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
    if (t) element.innerHTML = t
    if (consumer) consumer(element)

    return element
}

function createSpacer(space, options) {
    const e = createElement('div', options)
    e.classList.add('spacer')
    e.classList.add('v' + space)
    return e
}