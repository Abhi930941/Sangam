# 🎵Sangam - Indian Music Streaming Platform

Sangam is a full-stack music streaming and discovery platform built for Indian music lovers.  
It intelligently curates Bollywood and regional music using **mood-based recommendations** by integrating **YouTube & Spotify APIs**.

## Overview

**Project Type:** Full Stack Web Application

**Problem Statement:** Music enthusiasts struggle to discover curated Indian music across fragmented platforms. Existing services lack mood-based recommendations tailored specifically for Bollywood and regional Indian music.

**Solution:** Sangam aggregates music from multiple platforms and provides personalized, mood-based discovery with a clean, intuitive interface.

---

## Tech Stack

**Frontend:**
- HTML5, CSS3, JavaScript 
- Bootstrap 5 for responsive design
- Font Awesome for icons

**Backend:**
- Python 3.x
- Flask (Web Framework)
- Flask-CORS for API handling

**APIs & Integration:**
- YouTube Data API v3
- Spotify Web API

---

## Key Features

- **Artist Search:** Real-time search across YouTube and Spotify with instant results
- **Mood-Based Discovery:** 8 curated categories (Happy, Sad, Romantic, Motivation, Party, Chill, Devotional, Classical)
- **Multi-Platform Integration:** Unified interface for YouTube and Spotify content
- **Embedded Playback:** Built-in music player with controls
- **Responsive Design:** Mobile-first approach, works on all devices
- **Smart Search:** Auto-suggestions with keyboard shortcuts (1-8 for moods)
- **Clean UI/UX:** Modern gradient design with smooth animations

---

## System Architecture
```
User Interface (HTML/CSS/JS)
         ↓
    HTTP Request
         ↓
Flask Backend (Python)
         ↓
API Integration Layer
    ↙         ↘
YouTube API   Spotify API
    ↓             ↓
JSON Response ← Merged
         ↓
Display to User
```

**Flow:**
1. User searches artist or selects mood
2. Frontend sends request to Flask backend
3. Backend queries YouTube/Spotify APIs
4. APIs return music metadata
5. Backend processes and formats data
6. Frontend renders song cards
7. User plays music via embedded player

---

## Project Structure
```
sangam-music-web/
├── frontend/
├        ├──index.html              # Main application interface
├        ├──assets/
├             ├──style.css              # Styling and animations
├             ├──main.js                # Frontend logic and API calls
├
├── backend/
├        ├──app.py                 # Flask backend server
├── .env                  # API credentials (not in repo)
├── requirements.txt      # Python dependencies
└── README.md             # Documentation
```


---

## Demo & Links

**Live Demo:** https://sangam-music.onrender.com

**GitHub Repository:** [Add repo link]



---

## Why This Project Matters

Sangam is built around a real and commonly experienced problem—Indian music discovery
is fragmented across platforms, and users often struggle to find music that matches
their mood rather than just an artist or playlist.

This project goes beyond basic music streaming by introducing **mood-based discovery**
tailored specifically for Indian listeners, covering Bollywood and regional genres.
By integrating YouTube and Spotify into a single interface, Sangam simplifies the
user experience while preserving content diversity.

From a technical standpoint, Sangam demonstrates end-to-end full-stack development,
including secure OAuth authentication, third-party API integration, backend data
aggregation, and efficient frontend rendering.

Overall, this project reflects strong problem-solving ability, product-oriented thinking,
and the capability to design and build a scalable, real-world web application.


---

## Contact

**Developer:** Abhishek Sahani

**LinkedIn:** [linkedin.com/in/abhishek-sahani-447851341](https://www.linkedin.com/in/abhishek-sahani-447851341)

**Email:** abhishek242443@gmail.com

---

## Acknowledgments

- YouTube Data API v3 documentation for music data access
- Spotify Web API for streaming metadata and authentication
- Bootstrap for responsive UI components
- Font Awesome for icon support
- Indian music community for inspiration


---

Built with a focus on user experience and Indian music discovery.
