import random

from flask import Flask, request, jsonify
from trigger_detection import is_triggering_text, is_triggering_image
from classify import classify


app = Flask(__name__)


@app.route('/classify', methods=['POST'])
def classify_tweet():
    data = request.json
    user_data = data.get('userData')
    tweet_data = data.get('tweetData')
    shouldBlock = False
    for url in tweet_data['media']:
        print(f"got to loop with url: {url}")
        shouldBlock = shouldBlock or is_triggering_image(url, None)
    # result = is_triggering_text(tweet_data['text'], None)
    print(f"tweet data: {tweet_data}")
    print(f"result = {shouldBlock}\n\n")
    return jsonify({'block': shouldBlock})


if __name__ == '__main__':
    app.run(debug=True)
