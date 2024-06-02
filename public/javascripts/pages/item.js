const itemId = getParam('id')

onLoad(() => {
    byId('display-image').src = INVENTORY_ITEMS[itemId].image
    handleProceedButton()
})

function getItemDetails() {
    return INVENTORY_ITEMS[itemId]
}

function checkBalance(balance) {
    const { price } = getItemDetails()

    if (balance >= price) {
        setVisible('proceed-button')
    } else {
        setVisible('error')
        setVisible('back')
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
        const { ok } = await postRequest('/purchase/inventory', { itemId })

        if (ok) {
            location.href = `/item/purchased?id=${itemId}`
        } else {
            waiting = false
            proceedButton.classList.remove('disabled')
        }
    })
}