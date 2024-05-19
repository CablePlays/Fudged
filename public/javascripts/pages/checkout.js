const itemId = parseInt(window.location.pathname.split('/')[2])
let quantity = 1

function getAmountDecreaseButton() {
    return byId('amount-decrease')
}

function getAmountIncreaseButton() {
    return byId('amount-increase')
}

function getItemDetails() {
    return ITEMS[itemId]
}

function updateDisplays() {
    const { max, price } = getItemDetails()

    byId('amount-display').innerHTML = quantity
    byId('price-display').innerHTML = `R${quantity * price}`

    if (quantity > 1) {
        getAmountDecreaseButton().classList.remove('disabled')
    } else {
        getAmountDecreaseButton().classList.add('disabled')
    }
    if (quantity < max) {
        getAmountIncreaseButton().classList.remove('disabled')
    } else {
        getAmountIncreaseButton().classList.add('disabled')
    }
}

function handleProceedButton() {
    const proceedButton = byId('proceed-button')
    let waiting = false

    proceedButton.addEventListener('click', async () => {
        if (waiting) {
            return
        }

        waiting = true
        proceedButton.classList.add('disabled')
        const { ok, url } = await postRequest('/purchase', { quantity, itemId })

        if (ok) {
            location.href = url
        } else {
            waiting = false
            proceedButton.classList.remove('disabled')
        }
    })
}

onLoad(() => {
    updateDisplays()
    handleProceedButton()

    getAmountIncreaseButton().addEventListener('click', () => {
        if (quantity < getItemDetails().max) {
            quantity++
            updateDisplays()
        }
    })
    getAmountDecreaseButton().addEventListener('click', () => {
        if (quantity > 1) {
            quantity--
            updateDisplays()
        }
    })
})