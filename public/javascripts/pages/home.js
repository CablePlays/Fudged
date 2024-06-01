onLoad(() => {
    handleFreeFudgeScroll()
    startShopItemsAnimation()
})

function handleFreeFudgeScroll() {
    byId('free-scroll-button').addEventListener('click', () => {
        byId('free-scroll-target').scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
}

async function startShopItemsAnimation() {
    const shopItems = byId('shop-items')
    const viewport = byId('viewport')

    const moveSpeed = 0.08
    const cooldownTime = 500

    const width = viewport.clientWidth

    viewport.style.left = '0'

    while (true) {
        const moveDistance = width - shopItems.clientWidth
        const moveTime = Math.abs(moveDistance) / moveSpeed
        viewport.style.transition = `left ${moveTime}ms linear`
        const totalWait = moveTime + cooldownTime

        viewport.style.left = `${-moveDistance}px`
        await new Promise(r => setTimeout(r, totalWait))
        viewport.style.left = '0'
        await new Promise(r => setTimeout(r, totalWait))
    }
}