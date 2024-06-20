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
    result = is_triggering_text(tweet_data['text'], None)
    print(f"got the following message: {tweet_data['text']}\n result = {result}\n\n")
    return jsonify({'block': result})


if __name__ == '__main__':
    app.run(debug=True)
