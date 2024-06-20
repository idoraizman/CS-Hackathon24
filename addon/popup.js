// popup.js

document.addEventListener('DOMContentLoaded', function () {
    console.log("Popup DOM loaded");

    const sexualAssaultCheckbox = document.getElementById('sexualAssault');
    const warCheckbox = document.getElementById('war');
    const vehicularAccidentsCheckbox = document.getElementById('vehicularAccidents');
    const naturalDisastersCheckbox = document.getElementById('naturalDisasters');
    const diseasesCheckbox = document.getElementById('diseases');
    const textInput = document.getElementById('freeSpeech');
    const saveButton = document.getElementById('saveSettings');

    // Load the settings from storage
    chrome.storage.sync.get([
        'sexualAssault', 'war', 'vehicularAccidents',
        'naturalDisasters', 'diseases', 'freeSpeech'
    ], data => {
        console.log("Settings loaded from storage", data);
        sexualAssaultCheckbox.checked = !!data.sexualAssault;
        warCheckbox.checked = !!data.war;
        vehicularAccidentsCheckbox.checked = !!data.vehicularAccidents;
        naturalDisastersCheckbox.checked = !!data.naturalDisasters;
        diseasesCheckbox.checked = !!data.diseases;
        textInput.value = data.freeSpeech || '';
    });

    // Save the settings when the button is clicked
    saveButton.addEventListener('click', () => {
        console.log("Save button clicked");

        const userData = {
            sexualAssault: sexualAssaultCheckbox.checked,
            war: warCheckbox.checked,
            vehicularAccidents: vehicularAccidentsCheckbox.checked,
            naturalDisasters: naturalDisastersCheckbox.checked,
            diseases: diseasesCheckbox.checked,
            freeSpeech: textInput.value
        };

        chrome.runtime.sendMessage({
            type: 'saveSettings',
            userData: userData
        }, response => {
            console.log('Settings saved', response);
        });
    });
});
