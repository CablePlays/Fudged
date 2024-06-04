onLoad(() => {
    loadUsers()
})

function formatGrade(grade) {
    return grade == null ? 'N/A' : (grade > 12) ? 'Out' : grade
}

function formatPhoneNumber(phoneNumber) {
    return phoneNumber == null || phoneNumber === '' ? 'N/A' : phoneNumber
}

async function loadUsers() {
    const { users } = await getRequest('/users')

    byId('loading-indicator').remove()

    const usersTable = byId('users-table')

    for (let userId in users) {
        const user = users[userId]
        const row = createElement('tr', { p: usersTable })
        createElement('td', { p: row, t: userId })
        createElement('td', { p: row, t: user.name })
        createElement('td', { p: row, t: user.surname })
        createElement('td', { p: row, t: formatPhoneNumber(user.phoneNumber) })
        createElement('td', { p: row, t: formatGrade(user.grade) })
        const linkContainer = createElement('td', { p: row })
        createElement('a', { c: 'primary', p: linkContainer, t: 'Create Order' }).href = `/admin/create-order?user=${userId}`
    }

    setVisible(usersTable)
}