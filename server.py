from flask import Flask, request, jsonify
from classify import classify


app = Flask(__name__)


@app.route('/classify', methods=['POST'])
def classify_tweet():
    data = request.json
    user_data = data.get('userData')
    tweet_data = data.get('tweetData')

    # Assuming classify function takes two JSON objects and returns a boolean
    result = classify(user_data, tweet_data)

    return jsonify({'block': result})


if __name__ == '__main__':
    app.run(debug=True)
