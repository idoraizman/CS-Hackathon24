// background.js

chrome.runtime.onInstalled.addListener(() => {
    console.log("Simple Ad Blocker Extension Installed");
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'analyzeTweet') {
        // Send the tweet text and media URLs to a local Flask server
        fetch('http://localhost:5000/analyze', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                tweetText: request.tweetText,
                mediaUrls: request.mediaUrls
            })
        })
        .then(response => response.json())
        .then(data => {
            sendResponse({
                replacementText: data.replacementText,
                replacementMediaUrls: data.replacementMediaUrls
            });
        })
        .catch(error => {
            console.error('Error:', error);
            sendResponse({
                replacementText: request.tweetText,
                replacementMediaUrls: request.mediaUrls
            }); // במקרה של שגיאה, נחזיר את הטקסט והמדיה המקוריים
        });
        return true;  // Keep the message channel open for sendResponse
    }
});
