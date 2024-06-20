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
    const tweetText = tweet.innerText;

    // סלקטורים שונים למציאת מדיה
    const mediaElements = tweet.querySelectorAll('img, video, picture source, div[role="group"] div[role="img"], div[aria-label="Image"], div[aria-label="Video"]');
    const mediaUrls = Array.from(mediaElements).map(el => {
        if (el.tagName.toLowerCase() === 'img' || el.tagName.toLowerCase() === 'video') {
            return el.src;
        } else if (el.tagName.toLowerCase() === 'source') {
            return el.srcset.split(' ')[0];
        } else if (el.style.backgroundImage) {
            return el.style.backgroundImage.slice(5, -2);
        } else {
            return null;
        }
    }).filter(url => url !== null);

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
            tweet.innerText = "!!!";
            mediaElements.forEach(el => {
                if (el.tagName.toLowerCase() === 'img' || el.tagName.toLowerCase() === 'video') {
                    el.src = '';
                } else if (el.tagName.toLowerCase() === 'source') {
                    el.srcset = '';
                } else {
                    el.style.backgroundImage = 'none';
                }
            });
        }
        // אם response.block הוא false, לא נבצע שום שינוי בציוץ
    });
}

function replaceTweetText(node) {
    if (node.nodeType === Node.ELEMENT_NODE) {
        const tweets = node.querySelectorAll('article div[data-testid="tweet"]');
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
