// background.js

chrome.runtime.onInstalled.addListener(() => {
    console.log("Simple Ad Blocker Extension Installed");
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'classifyTweet') {
        console.log("Received classifyTweet request", request);

        // Fetch userData from storage
        chrome.storage.sync.get([
            'sexualAssault', 'war', 'vehicularAccidents',
            'naturalDisasters', 'diseases', 'freeSpeech'
        ], data => {
            const userData = {
                sexualAssault: data.sexualAssault,
                war: data.war,
                vehicularAccidents: data.vehicularAccidents,
                naturalDisasters: data.naturalDisasters,
                diseases: data.diseases,
                freeSpeech: data.freeSpeech
            };

            fetch('http://localhost:5000/classify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userData: userData,
                    tweetData: request.tweetData
                })
            })
            .then(response => {
                console.log("Received response from server");
                return response.json();
            })
            .then(data => {
                console.log("Parsed response data", data);
                sendResponse({ block: data.block });
            })
            .catch(error => {
                console.error('Error:', error);
                sendResponse({ block: false }); // In case of an error, return false (don't block)
            });
        });
        return true;  // Keep the message channel open for sendResponse
    } else if (request.type === 'saveSettings') {
        chrome.storage.sync.set({
            sexualAssault: request.userData.sexualAssault,
            war: request.userData.war,
            vehicularAccidents: request.userData.vehicularAccidents,
            naturalDisasters: request.userData.naturalDisasters,
            diseases: request.userData.diseases,
            freeSpeech: request.userData.freeSpeech
        }, () => {
            console.log("Settings saved:", request.userData);
            sendResponse({ success: true });
        });
        return true; // Keep the message channel open for sendResponse
    }
});
