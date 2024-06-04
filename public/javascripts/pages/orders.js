function getInfoElement() {
    return byId('info')
}

async function loadOrders() {
    const { orders } = await getRequest(`/orders?user=${getUserId()}`)
    const ordersTable = byId('orders-table')

    if (orders.length === 0) {
        getInfoElement().innerHTML = 'You do not have any orders.'
    } else {
        orders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

        for (let order of orders) {
            const tr = createElement('tr', { p: ordersTable })
            createElement('td', { p: tr, t: formatDate(order.date) })
            createElement('td', { p: tr, t: ITEMS[order.itemId].name })
            createElement('td', { p: tr, t: 'x' + order.quantity })
            createElement('td', { p: tr, t: 'R' + (ITEMS[order.itemId].price * order.quantity) })
            createElement('td', { p: tr, t: order.fulfilled ? 'Yes' : 'No' })
        }

        getInfoElement().remove()
        setVisible(ordersTable)
    }
}

onLoad(loadOrders)