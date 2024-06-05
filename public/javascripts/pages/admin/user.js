const userId = parseInt(location.pathname.split('/')[3])

function setupGrams(grams) {
    const massDisplay = byId('mass-display')
    massDisplay.innerHTML = `${grams}g`

    const massSoldAddButton = byId('mass-sold-add-button')
    let makingRequest = false

    const setInfo = info => {
        const massSoldInfo = byId('mass-sold-info')

        if (info == null) {
            setVisible(massSoldInfo, false)
        } else {
            massSoldInfo.innerHTML = info
            setVisible(massSoldInfo)
        }
    }

    massSoldAddButton.addEventListener('click', async () => {
        if (makingRequest) return

        const amount = parseInt(byId('mass-input').value)

        if (isNaN(amount)) {
            setInfo('Amount is invalid!')
            return
        }

        setInfo(null)
        makingRequest = true
        massSoldAddButton.classList.add('disabled')

        const { ok, grams: newGrams } = await postRequest(`/users/${userId}/grams`, { amount })

        if (ok) {
            setInfo('Amount updated successfully.')
            massDisplay.innerHTML = `${newGrams}g`
        } else {
            setInfo('Amount could not be updated.')
        }

        massSoldAddButton.classList.remove('disabled')
        makingRequest = false
    })
}