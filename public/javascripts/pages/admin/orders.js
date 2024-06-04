onLoad(() => {
    loadOrders()
})

function formatGrade(grade) {
    return grade == null ? 'N/A' : (grade > 12) ? 'Out' : grade
}

function formatPhoneNumber(phoneNumber) {
    return phoneNumber == null || phoneNumber === '' ? 'N/A' : phoneNumber
}

async function loadOrders() {
    const { orders } = await getRequest('/orders')
    orders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    byId('loading-indicator').remove()

    const ordersTable = byId('orders-table')

    for (let order of orders) {
        const { userInfo } = order
        const row = createElement('tr', { p: ordersTable })
        createElement('td', { p: row, t: formatDate(order.date) })
        createElement('td', { p: row, t: `${userInfo.name} ${userInfo.surname}` })
        createElement('td', { p: row, t: formatGrade(userInfo.grade) })
        createElement('td', { p: row, t: formatPhoneNumber(userInfo.phoneNumber) })
        createElement('td', { p: row, t: ITEMS[order.itemId].name })
        createElement('td', { p: row, t: order.quantity })
        createElement('td', { p: row, t: order.type })

        let fulfilled = order.fulfilled
        const fulfilledElement = createElement('td', { p: row, t: fulfilled ? 'Yes' : 'No' })

        const buttonContainer = createElement('td', { p: row })
        let toggleRequestSent = false

        createElement('button', {
            c: 'primary', p: buttonContainer, t: 'Toggle Fulfilled', onClick: async (e, el) => {
                if (toggleRequestSent) return
                toggleRequestSent = true

                fulfilled = !fulfilled
                fulfilledElement.innerHTML = fulfilled ? 'Yes' : 'No'
                el.classList.add('disabled')

                const { ok } = await putRequest(`/orders/${order.id}`, { fulfilled })

                if (ok) {
                    el.classList.remove('disabled')
                    toggleRequestSent = false
                }
            }
        })
    }

    setVisible(ordersTable)
}