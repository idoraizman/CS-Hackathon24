// contentScript.js
console.log('Started processing');

// Function to analyze and process the tweet
async function analyzeAndProcessTweet(tweetElement) {
    // Wait for a short time to ensure the element is fully parsed
    await new Promise(resolve => setTimeout(resolve, 200));
    const tweetText = tweetElement.querySelector('div[data-testid="tweetText"]');
    // Updated media selector with more specific paths
    const tweetMedia = tweetElement.querySelectorAll(
        'div[aria-label="Image"] img[src*="https://pbs.twimg.com"],' +
        'div[data-testid="tweetPhoto"] img[src*="https://pbs.twimg.com"]'
    );
    console.log('analyizing tweet 1: ', tweetElement); // Log found tweets
    console.log('found the following media: ', tweetMedia);

    const tweetContent = {
        text: tweetText ? tweetText.innerText : '',
        media: []
    };

    tweetMedia.forEach(media => {
        const mediaUrl = media.src || media.currentSrc;
        tweetContent.media.push(mediaUrl);
    });

    const userData = {
        // Add user data if you have any
    };

    console.log('Analyzing tweet 2:', tweetContent);

    // Check if the tweet is offensive
    const block = await isOffensive(tweetContent, userData);
    if (block) {
        // Remove the tweet from the DOM
        // console.log('Removing offensive tweet:', tweetContent);
        tweetElement.remove();
    }
}

// Function to determine if the tweet is offensive
function isOffensive(tweetContent, userData) {
    return new Promise((resolve, reject) => {
       console.log('Sending message to background script with data:', { userData, tweetContent });

        chrome.runtime.sendMessage({
            type: 'classifyTweet',
            userData: userData,
            tweetData: tweetContent // Fixed: It should be tweetContent, not tweetData
        }, response => {
            if (chrome.runtime.lastError) {
                console.error('Error sending message:', chrome.runtime.lastError);
                resolve(false);
                return;
            }

            console.log('Received response from background script:', response);
            if (response && response.block) {
                resolve(true);
            } else {
                resolve(false);
            }
        });
    });
}

// Function to process the entire tweet
function processEntireTweet(node) {
    if (node.nodeType === Node.ELEMENT_NODE) {
        const tweets = node.querySelectorAll('article');
        console.log('Found tweets:', tweets); // Log found tweets
        tweets.forEach(tweet => {
            analyzeAndProcessTweet(tweet);
        });
    }
}

// Initialize MutationObserver to watch for dynamically added tweets
const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
            processEntireTweet(node);
        });
    });
});

// Function to wait for an element to be available
function waitForElement(selector, callback) {
    const element = document.querySelector(selector);
    if (element) {
        callback(element);
    } else {
        setTimeout(() => waitForElement(selector, callback), 100);
    }
}

// Wait for the page to fully load
window.onload = () => {
    console.log('Page fully loaded');

    // Alternative selectors for the timeline container
    const timelineSelectors = [
        '[aria-label="Timeline: Your Home Timeline"]',
        '[role="region"] > div > div > div > div > div:nth-child(2) > div:nth-child(2)', // This is a more generic path
        'main[role="main"] section > div > div' // Another generic path
    ];

    // Try each selector until one works
    for (const selector of timelineSelectors) {
        waitForElement(selector, (timeline) => {
            console.log('Started observing', timeline);
            const config = { childList: true, subtree: true };
            observer.observe(timeline, config);

            // Initial processing of already loaded tweets
            document.querySelectorAll('article').forEach(article => processEntireTweet(article));
        });
    }
};
