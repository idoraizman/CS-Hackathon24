import requests
from bs4 import BeautifulSoup

def get_twitter_video(twitter_url):
    ssstwitter_url = 'https://ssstwitter.com'
    params = {
        'url': twitter_url
    }

    # Get the page content
    response = requests.get(ssstwitter_url, params=params)
    if response.status_code != 200:
        print(f"Failed to fetch the page: {response.status_code}")
        return None

    # Parse the HTML content
    soup = BeautifulSoup(response.content, 'html.parser')

    # Find the video download link
    video_link = None
    for link in soup.find_all('a', href=True):
        print(link)
        if '.mp4' in link['href']:
            video_link = link['href']
            break

    if not video_link:
        print("Failed to find the video download link.")
        return None

    # Download the video
    video_response = requests.get(video_link)
    if video_response.status_code == 200:
        filename = "twitter_video.mp4"
        with open(filename, 'wb') as f:
            f.write(video_response.content)
        print(f"Video downloaded successfully: {filename}")
        return filename
    else:
        print(f"Failed to download the video: {video_response.status_code}")
        return None

if __name__ == '__main__':
    twitter_url = 'https://x.com/GoreClipps/status/1802519832166023302'
    get_twitter_video(twitter_url)