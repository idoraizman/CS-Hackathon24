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

function analyzeAndReplaceTweet(tweet) {
    const tweetText = tweet.textContent;
    const mediaElements = tweet.querySelectorAll('img, video');
    const mediaUrls = Array.from(mediaElements).map(el => el.src);

    const tweetData = {
        text: tweetText,
        mediaUrls: mediaUrls
    };

    const userData = {
        // כאן תוכל להוסיף נתונים על המשתמש אם יש לך
    };

    chrome.runtime.sendMessage({
        type: 'classifyTweet',
        userData: userData,
        tweetData: tweetData
    }, response => {
        if (response.block) {
            tweet.textContent = "!!!";
            mediaElements.forEach(el => el.src = '');
        }
        // אם response.block הוא false, לא נבצע שום שינוי בציוץ
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

function replaceTweetsWithExclamation() {
    // Initial replacement for tweets already in the DOM
    replaceTweetText(document.body);

    // Observer to replace tweets in dynamically added content
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
