# backend/app.py
from flask import Flask, jsonify, request, send_from_directory, abort
from flask_cors import CORS
import requests
import os
from dotenv import load_dotenv
import logging
import time
import base64

# Load environment variables from .env if present
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# Configuration
class Config:
    # API Keys (set these in your .env file)
    YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY")
    SPOTIFY_CLIENT_ID = os.getenv("SPOTIFY_CLIENT_ID")
    SPOTIFY_CLIENT_SECRET = os.getenv("SPOTIFY_CLIENT_SECRET")

    # URLs
    YOUTUBE_SEARCH_URL = "https://www.googleapis.com/youtube/v3/search"
    YOUTUBE_VIDEO_URL = "https://www.googleapis.com/youtube/v3/videos"
    SPOTIFY_AUTH_URL = "https://accounts.spotify.com/api/token"
    SPOTIFY_SEARCH_URL = "https://api.spotify.com/v1/search"

    DEBUG = os.getenv("FLASK_DEBUG", "True").lower() == "true"
    try:
        PORT = int(os.getenv("PORT", 5000))
    except Exception:
        PORT = 5000

config = Config()

# -------------------------
# Enhanced Music API Service
# -------------------------
class MusicAPIService:
    def __init__(self):
        self.spotify_token = None
        self.spotify_token_expires = 0

    def get_spotify_token(self):
        current_time = time.time()
        if self.spotify_token and current_time < self.spotify_token_expires:
            return self.spotify_token

        if not config.SPOTIFY_CLIENT_ID or not config.SPOTIFY_CLIENT_SECRET:
            logger.info("Spotify credentials missing -> skipping Spotify auth")
            return None

        try:
            # Create base64 encoded credentials
            credentials = f"{config.SPOTIFY_CLIENT_ID}:{config.SPOTIFY_CLIENT_SECRET}"
            credentials_b64 = base64.b64encode(credentials.encode()).decode()
            
            resp = requests.post(
                config.SPOTIFY_AUTH_URL,
                data={"grant_type": "client_credentials"},
                headers={
                    "Authorization": f"Basic {credentials_b64}",
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                timeout=10,
            )
            if resp.status_code == 200:
                token_data = resp.json()
                self.spotify_token = token_data.get("access_token")
                expires_in = int(token_data.get("expires_in", 3600))
                self.spotify_token_expires = current_time + expires_in - 60
                logger.info("Spotify token obtained successfully")
                return self.spotify_token
            else:
                logger.warning("Spotify auth failed: %s %s", resp.status_code, resp.text)
        except Exception as e:
            logger.error("Spotify auth error: %s", e)
        return None

    def format_duration(self, ms):
        try:
            seconds = int(ms // 1000)
            minutes = seconds // 60
            return f"{minutes}:{str(seconds % 60).zfill(2)}"
        except Exception:
            return "4:20"

    def clean_title(self, title):
        # Remove common video-specific text
        remove_terms = [
            "Official Video", "Official Music Video", "Official Audio", 
            "Video Song", "Full Video", "HD Video", "Lyrical Video",
            "Official Lyric Video", "Music Video", "[Official Video]",
            "| Official Video", "- Official Video"
        ]
        cleaned = title
        for term in remove_terms:
            cleaned = cleaned.replace(term, "").strip()
        return cleaned

    def search_youtube_songs(self, artist, max_results=10):
        if not config.YOUTUBE_API_KEY:
            logger.warning("YouTube API key not provided")
            return []
        try:
            # Search for videos
            search_resp = requests.get(
                config.YOUTUBE_SEARCH_URL,
                params={
                    "key": config.YOUTUBE_API_KEY,
                    "q": f"{artist} hindi bollywood songs",
                    "part": "snippet",
                    "maxResults": max_results,
                    "type": "video",
                    "regionCode": "IN",
                    "videoCategoryId": "10",  # Music category
                },
                timeout=12,
            )
            
            if search_resp.status_code != 200:
                logger.error("YouTube search failed: %s", search_resp.text)
                return []
                
            search_data = search_resp.json()
            video_ids = [item["id"]["videoId"] for item in search_data.get("items", [])]
            
            if not video_ids:
                return []
            
            # Get detailed video information
            video_resp = requests.get(
                config.YOUTUBE_VIDEO_URL,
                params={
                    "key": config.YOUTUBE_API_KEY,
                    "id": ",".join(video_ids),
                    "part": "snippet,contentDetails,statistics"
                },
                timeout=12,
            )
            
            if video_resp.status_code != 200:
                logger.error("YouTube video details failed: %s", video_resp.text)
                return []
            
            video_data = video_resp.json()
            songs = []
            
            for item in video_data.get("items", []):
                snippet = item.get("snippet", {})
                content_details = item.get("contentDetails", {})
                video_id = item.get("id")
                
                # Parse duration
                duration_iso = content_details.get("duration", "PT4M20S")
                duration = self.parse_youtube_duration(duration_iso)
                
                # Get best thumbnail
                thumbnails = snippet.get("thumbnails", {})
                thumbnail_url = (
                    thumbnails.get("maxres", {}).get("url") or
                    thumbnails.get("high", {}).get("url") or
                    thumbnails.get("medium", {}).get("url") or
                    thumbnails.get("default", {}).get("url")
                )
                
                songs.append({
                    "title": self.clean_title(snippet.get("title", "Unknown")),
                    "artist": artist,
                    "youtube_id": video_id,
                    "thumbnail": thumbnail_url,
                    "year": snippet.get("publishedAt", "")[:4],
                    "duration": duration,
                    "source": "youtube",
                    "play_url": f"https://www.youtube.com/watch?v={video_id}",
                    "embed_url": f"https://www.youtube.com/embed/{video_id}?autoplay=1"
                })
            
            logger.info(f"Found {len(songs)} YouTube songs for {artist}")
            return songs
            
        except Exception as e:
            logger.error("YouTube search error: %s", e)
        return []

    def parse_youtube_duration(self, duration_iso):
        """Parse ISO 8601 duration format (PT4M20S) to MM:SS"""
        try:
            import re
            match = re.match(r'PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?', duration_iso)
            if match:
                hours = int(match.group(1) or 0)
                minutes = int(match.group(2) or 0)
                seconds = int(match.group(3) or 0)
                
                total_minutes = hours * 60 + minutes
                return f"{total_minutes}:{str(seconds).zfill(2)}"
        except Exception:
            pass
        return "4:20"

    def search_spotify_songs(self, artist, max_results=10):
        token = self.get_spotify_token()
        if not token:
            logger.warning("Spotify token not available")
            return []
        try:
            resp = requests.get(
                config.SPOTIFY_SEARCH_URL,
                headers={"Authorization": f"Bearer {token}"},
                params={
                    "q": f'artist:"{artist}" genre:bollywood OR genre:hindi OR genre:indian',
                    "type": "track", 
                    "limit": max_results,
                    "market": "IN"
                },
                timeout=12,
            )
            
            if resp.status_code != 200:
                logger.error("Spotify search failed: %s", resp.text)
                return []
                
            tracks = resp.json().get("tracks", {}).get("items", [])
            songs = []
            
            for track in tracks:
                # Get best thumbnail
                images = track.get("album", {}).get("images", [])
                thumbnail_url = images[0]["url"] if images else None
                
                # Get artist names
                artists = [artist.get("name") for artist in track.get("artists", [])]
                
                songs.append({
                    "title": track.get("name"),
                    "artist": ", ".join(artists),
                    "album": track.get("album", {}).get("name"),
                    "spotify_id": track.get("id"),
                    "preview_url": track.get("preview_url"),
                    "thumbnail": thumbnail_url,
                    "duration": self.format_duration(track.get("duration_ms", 0)),
                    "year": track.get("album", {}).get("release_date", "")[:4],
                    "source": "spotify",
                    "play_url": track.get("external_urls", {}).get("spotify"),
                    "embed_url": f"https://open.spotify.com/embed/track/{track.get('id')}"
                })
            
            logger.info(f"Found {len(songs)} Spotify songs for {artist}")
            return songs
            
        except Exception as e:
            logger.error("Spotify search error: %s", e)
        return []

music_service = MusicAPIService()

# -------------------------
# Serve frontend static files
# -------------------------
FRONTEND_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "frontend")

@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_frontend(path):
    if not os.path.exists(FRONTEND_PATH):
        return "Frontend directory not found", 404
    
    if path == "" or path == "index.html":
        index_path = os.path.join(FRONTEND_PATH, "index.html")
        if os.path.exists(index_path):
            return send_from_directory(FRONTEND_PATH, "index.html")
        else:
            return "index.html not found", 404
    
    file_path = os.path.join(FRONTEND_PATH, path)
    if os.path.exists(file_path) and os.path.isfile(file_path):
        return send_from_directory(FRONTEND_PATH, path)
    
    # Default to index.html for SPA routing
    index_path = os.path.join(FRONTEND_PATH, "index.html")
    if os.path.exists(index_path):
        return send_from_directory(FRONTEND_PATH, "index.html")
    
    return "File not found", 404

# -------------------------
# API Endpoints
# -------------------------
@app.route("/api/health", methods=["GET"])
def api_health():
    # Check API availability
    youtube_available = bool(config.YOUTUBE_API_KEY)
    spotify_available = bool(config.SPOTIFY_CLIENT_ID and config.SPOTIFY_CLIENT_SECRET)
    
    return jsonify({
        "success": True, 
        "message": "API is running",
        "apis": {
            "youtube": youtube_available,
            "spotify": spotify_available
        }
    }), 200

@app.route("/api/search/<artist>", methods=["GET"])
def api_search(artist):
    try:
        limit = int(request.args.get("limit", 10))
    except Exception:
        limit = 10

    all_songs = []
    
    # Try YouTube first (better for Indian music)
    youtube_songs = music_service.search_youtube_songs(artist, limit)
    all_songs.extend(youtube_songs)
    
    # If not enough songs, try Spotify
    if len(all_songs) < limit:
        remaining = limit - len(all_songs)
        spotify_songs = music_service.search_spotify_songs(artist, remaining)
        all_songs.extend(spotify_songs)
    
    # Fallback to sample data if no results
    if not all_songs:
        all_songs = [
            {
                "title": f"{artist} Song {i+1}", 
                "artist": artist, 
                "year": f"202{i % 5}", 
                "duration": f"{3 + i % 3}:{20 + i * 15 % 60:02d}", 
                "source": "sample",
                "play_url": f"#sample-{i}",
                "thumbnail": "https://via.placeholder.com/300x300/667eea/ffffff?text=🎵"
            }
            for i in range(limit)
        ]

    logger.info(f"Returning {len(all_songs)} songs for artist: {artist}")
    return jsonify({"success": True, "songs": all_songs[:limit]}), 200

@app.route("/api/mood/<mood>", methods=["GET"])
def api_mood(mood):
    # Enhanced mood mapping with Indian artists
    mood_queries = {
        "happy": "bollywood happy songs dance",
        "sad": "bollywood sad songs emotional arijit singh",
        "romantic": "bollywood love songs romantic",
        "motivation": "bollywood motivational songs inspirational",
        "party": "bollywood party songs dance",
        "chill": "bollywood chill relaxing songs",
        "devotional": "hindi devotional bhajan songs",
        "classical": "indian classical music raag"
    }
    
    query = mood_queries.get(mood.lower(), "bollywood songs")
    
    try:
        # Search YouTube for mood-based songs
        if config.YOUTUBE_API_KEY:
            resp = requests.get(
                config.YOUTUBE_SEARCH_URL,
                params={
                    "key": config.YOUTUBE_API_KEY,
                    "q": query,
                    "part": "snippet",
                    "maxResults": 8,
                    "type": "video",
                    "regionCode": "IN",
                    "videoCategoryId": "10",
                },
                timeout=12,
            )
            
            if resp.status_code == 200:
                items = resp.json().get("items", [])
                songs = []
                for item in items:
                    snippet = item.get("snippet", {})
                    video_id = item.get("id", {}).get("videoId")
                    thumbnail = snippet.get("thumbnails", {}).get("medium", {}).get("url")
                    
                    songs.append({
                        "title": music_service.clean_title(snippet.get("title", "Unknown")),
                        "artist": snippet.get("channelTitle", "Unknown Artist"),
                        "youtube_id": video_id,
                        "thumbnail": thumbnail,
                        "year": snippet.get("publishedAt", "")[:4],
                        "duration": "4:30",
                        "source": "youtube",
                        "play_url": f"https://www.youtube.com/watch?v={video_id}",
                        "embed_url": f"https://www.youtube.com/embed/{video_id}?autoplay=1"
                    })
                
                if songs:
                    logger.info(f"Found {len(songs)} YouTube songs for mood: {mood}")
                    return jsonify({"success": True, "songs": songs}), 200
        
        # Fallback to predefined mood songs
        mood_fallback = {
            "happy": [
                {"title": "Kal Ho Naa Ho", "artist": "Sonu Nigam", "year": "2003", "duration": "5:08"},
                {"title": "Gallan Goodiyaan", "artist": "Yashita Sharma", "year": "2014", "duration": "4:15"},
                {"title": "London Thumakda", "artist": "Neha Kakkar", "year": "2014", "duration": "3:45"},
            ],
            "sad": [
                {"title": "Tum Hi Ho", "artist": "Arijit Singh", "year": "2013", "duration": "4:22"},
                {"title": "Channa Mereya", "artist": "Arijit Singh", "year": "2016", "duration": "4:49"},
                {"title": "Ae Dil Hai Mushkil", "artist": "Arijit Singh", "year": "2016", "duration": "4:37"},
            ],
            "romantic": [
                {"title": "Raataan Lambiyan", "artist": "Tanishk Bagchi", "year": "2021", "duration": "3:28"},
                {"title": "Pehla Nasha", "artist": "Udit Narayan", "year": "2000", "duration": "6:12"},
                {"title": "Tere Bina", "artist": "A.R. Rahman", "year": "2007", "duration": "5:45"},
            ],
            "motivation": [
                {"title": "Zinda", "artist": "Shankar Mahadevan", "year": "2006", "duration": "5:30"},
                {"title": "Chak De India", "artist": "Sukhwinder Singh", "year": "2007", "duration": "4:10"},
                {"title": "Jai Ho", "artist": "A.R. Rahman", "year": "2008", "duration": "5:09"},
            ],
            "party": [
                {"title": "Nagada Sang Dhol", "artist": "Osman Mir", "year": "2013", "duration": "4:32"},
                {"title": "Tattad Tattad", "artist": "Arijit Singh", "year": "2013", "duration": "4:16"},
                {"title": "Malhari", "artist": "Vishal Dadlani", "year": "2015", "duration": "4:32"},
            ],
            "chill": [
                {"title": "Kun Faya Kun", "artist": "A.R. Rahman", "year": "2011", "duration": "7:50"},
                {"title": "Ilahi", "artist": "Arijit Singh", "year": "2014", "duration": "5:02"},
                {"title": "Mast Magan", "artist": "Arijit Singh", "year": "2014", "duration": "4:32"},
            ],
            "devotional": [
                {"title": "Shri Hanuman Chalisa", "artist": "Hariharan", "year": "2008", "duration": "8:15"},
                {"title": "Om Jai Jagdish Hare", "artist": "Anuradha Paudwal", "year": "1995", "duration": "6:30"},
                {"title": "Gayatri Mantra", "artist": "Anuradha Paudwal", "year": "2000", "duration": "3:45"},
            ],
            "classical": [
                {"title": "Raag Yaman", "artist": "Pandit Ravi Shankar", "year": "1960", "duration": "15:30"},
                {"title": "Raag Bhairav", "artist": "Ustad Ali Akbar Khan", "year": "1965", "duration": "18:45"},
                {"title": "Raag Malkauns", "artist": "Pandit Jasraj", "year": "1970", "duration": "22:15"},
            ]
        }
        
        songs = mood_fallback.get(mood.lower(), mood_fallback["happy"])
        # Add sample data format
        for song in songs:
            song.update({
                "source": "sample",
                "play_url": f"#sample-{mood}",
                "thumbnail": "https://via.placeholder.com/300x300/667eea/ffffff?text=🎵"
            })
        
        return jsonify({"success": True, "songs": songs}), 200
        
    except Exception as e:
        logger.error("Mood search error: %s", e)
        return jsonify({"success": False, "error": str(e)}), 500

@app.route("/api/play/<song_id>", methods=["GET"])
def api_play(song_id):
    """Get playback URL for a song"""
    source = request.args.get("source", "youtube")
    
    try:
        if source == "youtube":
            # Return YouTube URLs
            return jsonify({
                "success": True,
                "play_url": f"https://www.youtube.com/watch?v={song_id}",
                "embed_url": f"https://www.youtube.com/embed/{song_id}?autoplay=1",
                "source": "youtube"
            }), 200
        elif source == "spotify":
            # Return Spotify URLs
            return jsonify({
                "success": True,
                "play_url": f"https://open.spotify.com/track/{song_id}",
                "embed_url": f"https://open.spotify.com/embed/track/{song_id}",
                "source": "spotify"
            }), 200
        else:
            return jsonify({
                "success": False,
                "error": "Unsupported source"
            }), 400
            
    except Exception as e:
        logger.error("Play error: %s", e)
        return jsonify({"success": False, "error": str(e)}), 500

# -------------------------
# Run app
# -------------------------
if __name__ == "__main__":
    logger.info("Starting Sangam backend...")
    logger.info(f"YouTube API: {'Available' if config.YOUTUBE_API_KEY else 'Not configured'}")
    logger.info(f"Spotify API: {'Available' if config.SPOTIFY_CLIENT_ID else 'Not configured'}")
    logger.info(f"Frontend path: {FRONTEND_PATH}")
    
    app.run(host="0.0.0.0", port=config.PORT, debug=config.DEBUG)