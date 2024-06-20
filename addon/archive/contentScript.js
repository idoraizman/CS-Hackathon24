// contentScript.js

function removeLinks() {
    const links = document.querySelectorAll('a[href^="https://www.ynet.co.il/topics/"]');
    links.forEach(link => {
        const parentDiv = link.closest('div.tagName');
        if (parentDiv) {
            parentDiv.remove();
        }
    });
}

function replaceTweetsWithExclamation() {
    function analyzeAndReplaceTweet(tweet) {
        const tweetText = tweet.textContent;
        const mediaElements = tweet.querySelectorAll('img, video');
        const mediaUrls = Array.from(mediaElements).map(el => el.src);

        chrome.runtime.sendMessage({
            type: 'analyzeTweet',
            tweetText: tweetText,
            mediaUrls: mediaUrls
        }, response => {
            tweet.textContent = response.replacementText;
            mediaElements.forEach((el, index) => {
                el.src = response.replacementMediaUrls[index] || el.src;
            });
        });
    }

    function replaceTweetText(node) {
        if (node.nodeType === Node.ELEMENT_NODE) {
            const tweets = node.querySelectorAll('article div[data-testid="tweetText"]');
            tweets.forEach(tweet => {
                analyzeAndReplaceTweet(tweet);
            });
        }
    }

    // Initial replacement
    replaceTweetText(document.body);

    // Observer to replace in dynamically added content
    const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            mutation.addedNodes.forEach(node => replaceTweetText(node));
        });
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

removeLinks();
replaceTweetsWithExclamation();
