# server.py

from flask import Flask, request, jsonify
from classify import classify

app = Flask(__name__)


@app.route('/classify', methods=['POST'])
def classify_tweet():
    data = request.json
    user_data = data.get('userData')
    tweet_data = data.get('tweetData')
    block_offensive_content = user_data.get('blockOffensiveContent', True)  # Default to True
    free_speech = user_data.get('freeSpeech', '')  # Default to empty string

    # ניתן להוסיף כאן את הלוגיקה המתאימה לשימוש ב-free_speech וב-block_offensive_content
    shouldBlock = classify(user_data, tweet_data) if block_offensive_content else False

    return jsonify({'block': shouldBlock})


if __name__ == '__main__':
    app.run(debug=True)
