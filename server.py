import random

from flask import Flask, request, jsonify
from classify import classify


app = Flask(__name__)


@app.route('/classify', methods=['POST'])
def classify_tweet():
    # print("got a request")
    data = request.json
    user_data = data.get('userData')
    tweet_data = data.get('tweetData')
    print(tweet_data)

    # Assuming classify function takes two JSON objects and returns a boolean
    result = classify(user_data, tweet_data)
    return jsonify({'block': random.randint(0, 3) > 1.5})


if __name__ == '__main__':
    app.run(debug=True)
