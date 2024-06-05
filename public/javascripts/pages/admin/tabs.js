onLoad(() => {
    loadTabs()
})

function formatGrade(grade) {
    return grade == null ? 'N/A' : (grade > 12) ? 'Out' : grade
}

function formatPhoneNumber(phoneNumber) {
    return phoneNumber == null || phoneNumber === '' ? 'N/A' : phoneNumber
}

async function loadTabs() {
    const { tabs } = await getRequest('/tabs')
    tabs.sort((a, b) => b.tab - a.tab)
    console.log(tabs)

    byId('loading-indicator').remove()

    const tabsTable = byId('tabs-table')

    for (let tab of tabs) {
        const row = createElement('tr', { p: tabsTable })
        createElement('td', { p: row, t: tab.id })
        createElement('td', { p: row, t: tab.name })
        createElement('td', { p: row, t: tab.surname })
        createElement('td', { p: row, t: `R${tab.tab}` })
    }

    setVisible(tabsTable)
}