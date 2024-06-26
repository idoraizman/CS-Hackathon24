// contentScript.js
console.log('Started processing');

const style = document.createElement('style');
style.type = 'text/css';
style.innerHTML = `
.tweet-blurred-content {
    filter: blur(15px);
    pointer-events: none;
    position: relative;
}
.button-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 1000;
    pointer-events: auto;
}
.undo-blur-btn, .video-btn {
    background-color: #ffffff;
    border: none;
    border-radius: 5px;
    color: #ffffff;
    padding: 10px 15px;
    cursor: pointer;
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
    font-size: 14px;
    font-weight: bold;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
    transition: background-color 0.3s, box-shadow 0.3s;
    margin-bottom: 10px;
}
.undo-blur-btn {
    background-color: #1da1f2;
}
.undo-blur-btn:hover {
    background-color: #0c85d0;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
}
.video-btn {
    background-color: #8a2be2;
}
.video-btn:hover {
    background-color: #6a1bb1;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
}
`;
document.head.appendChild(style);

// Function to add an undo blur button and video link to a tweet
function addButtons(tweetElement) {
    const buttonContainer = document.createElement('div');
    buttonContainer.classList.add('button-container');

    const undoButton = document.createElement('button');
    undoButton.innerText = 'This content is offensive, show anyway';
    undoButton.classList.add('undo-blur-btn');
    console.log('Adding undo button');
    undoButton.onclick = () => {
        console.log('Undo button clicked');
        tweetElement.classList.remove('tweet-blurred');
        tweetElement.querySelector('.tweet-blurred-content').classList.remove('tweet-blurred-content');
        buttonContainer.remove();
    };
    buttonContainer.appendChild(undoButton);

    const videoButton = document.createElement('button');
    videoButton.innerText = 'See funny cats video';
    videoButton.classList.add('video-btn');
    videoButton.onclick = () => {
        window.open('https://www.youtube.com/watch?v=82MaJuoUiH8', '_blank');
    };
    buttonContainer.appendChild(videoButton);

    tweetElement.appendChild(buttonContainer);
}

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

    console.log('Analyzing tweet:', tweetContent);

    // Check if the tweet is offensive
    const block = await isOffensive(tweetContent, userData);
    if (block) {
        // Blur the tweet content
        const contentContainer = document.createElement('div');
        contentContainer.classList.add('tweet-blurred-content');

        // Move all children of the tweetElement to the content container
        while (tweetElement.firstChild) {
            contentContainer.appendChild(tweetElement.firstChild);
        }

        // Append the content container and the undo button to the tweetElement
        tweetElement.appendChild(contentContainer);
        tweetElement.classList.add('tweet-blurred');
        addButtons(tweetElement);
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
