onLoad(() => {
    setupInputs()
})

function setupInputs() {
    const userInput = byId('user-input')
    const userId = parseInt(getParam('user'))

    if (!isNaN(userId)) {
        userInput.value = userId
    }

    const createButton = byId('create-button')
    createButton.classList.remove('disabled')

    createButton.addEventListener('click', async () => {
        const userId = parseInt(userInput.value)
        const itemId = byId('item-input').value
        const quantity = parseInt(byId('quantity-input').value)
        const fulfilled = byId('fulfilled-input').checked
        const tab = byId('tab-input').checked
        const reward = byId('reward-input').checked

        setVisible('error-element', false)
        setVisible('success-element', false)

        if (isNaN(userId) || isNaN(quantity)) {
            setVisible('info-element')
            return
        }

        setVisible('info-element', false)
        createButton.classList.add('disabled')

        const { ok } = await postRequest('/orders', { userId, itemId, quantity, fulfilled, tab, reward })
        createButton.classList.remove('disabled')

        if (ok) {
            setVisible('success-element')
        } else {
            setVisible('error-element')
        }
    })
}