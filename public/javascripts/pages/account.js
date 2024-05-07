let _infoChanged = false
let _saving = false

function getSaveButton() {
    return byId('save')
}

function updateSave() {
    const button = getSaveButton()

    if (_infoChanged && !_saving) {
        button.classList.remove('disabled')
    } else {
        button.classList.add('disabled')
    }
}

function setInfo(text, error) {
    const info = byId('info')
    info.innerHTML = text

    if (error) {
        info.classList.add('error')
    } else {
        info.classList.remove('error')
    }
}

async function saveInfo() {
    if (!_infoChanged || _saving) return

    const name = byId('name-input').value
    const surname = byId('surname-input').value
    const grade = byId('grade-input').value

    if (grade === 'none') {
        setInfo('Please select your grade!', true)
        return
    }

    _saving = true
    _infoChanged = false // set here to account for changing during saving
    updateSave()
    setInfo('Saving...', false)

    const userId = getUserId()
    const { ok } = await putRequest(`/users/${userId}`, { name, surname, grade: parseInt(grade) })

    _saving = false

    if (ok) {
        setInfo('Information saved successfully.', false)
    } else {
        setInfo('Could not save information.', true)
        _infoChanged = true
    }

    updateSave()
}

onLoad(() => {
    const infoChanged = () => {
        _infoChanged = true
        updateSave()
    }

    byId('grade-input').addEventListener('change', infoChanged)
    byId('name-input').addEventListener('input', infoChanged)
    byId('surname-input').addEventListener('input', infoChanged)

    getSaveButton().addEventListener('click', saveInfo)
})