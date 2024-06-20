// background.js

chrome.runtime.onInstalled.addListener(() => {
    console.log("Simple Ad Blocker Extension Installed");
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'classifyTweet') {
        console.log("Received classifyTweet request", request);

        fetch('http://localhost:5000/classify', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userData: request.userData,
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
        return true;  // Keep the message channel open for sendResponse
    }
});
