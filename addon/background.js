// background.js

chrome.runtime.onInstalled.addListener(() => {
    console.log("Simple Ad Blocker Extension Installed");
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'classifyTweet') {
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
        .then(response => response.json())
        .then(data => {
            sendResponse({ block: data.block });
        })
        .catch(error => {
            console.error('Error:', error);
            sendResponse({ block: false }); // במקרה של שגיאה, נחזיר false (לא לחסום)
        });
        return true;  // Keep the message channel open for sendResponse
    }
});
