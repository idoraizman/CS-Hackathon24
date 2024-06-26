### video detection

from myKey import key
from openai import OpenAI

import moviepy.editor as mp
import base64
from PIL import Image
from io import BytesIO

client = OpenAI(api_key=key)

def is_triggering_video(video, triggers):
    # video should be mp4
    try:
        video = mp.VideoFileClip(video)
    except Exception as e:
        print(f"Error loading video: {e}")

    base64Frames = []
    frame_count = 0
    frame_interval = 10

    for frame in video.iter_frames():
        if frame_count % frame_interval == 0:
            # Convert the NumPy array frame to a PIL Image object
            img = Image.fromarray(frame)
            # Create a BytesIO buffer to hold the image data
            buffer = BytesIO()
            # Save the Image object to the buffer in JPEG format
            img.save(buffer, format="JPEG")
            # Encode the buffer's contents to base64 and add to the list
            base64Frames.append(base64.b64encode(buffer.getvalue()).decode("utf-8"))
        frame_count += 1

    print(len(base64Frames), "frames read.")

    PROMPT_MESSAGES = [
        {
            "role": "user",
            "content": [
                "will the following frames be highly disturbing for someone who suffers from ptsd from war? Answer in yes or no:",
                *map(lambda x: {"image": x, "resize": 768}, base64Frames[0::50]),
            ],
        },
    ]
    params = {
        "model": "gpt-4o",
        "messages": PROMPT_MESSAGES,
        "max_tokens": 200,
    }

    response = client.chat.completions.create(**params)
    return "yes" in response.choices[0].message.content.lower()





if __name__ == '__main__':
    # Load the video file
    video = mp.VideoFileClip("/Users/IDORAIZMAN/Downloads/21st%20centurie%20Tommy%20gun-2.mp4")
    twitter_url = 'https://x.com/GoreClipps/status/1802519832166023302'
    # get_twitter_video(twitter_url)