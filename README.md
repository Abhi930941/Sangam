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
    ↙               ↘
YouTube API       Spotify API
    ↓                ↓
JSON Response   ←  Merged
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

## Demo & Screenshots

**Live Demo:** https://sangam-music.onrender.com

**GitHub Repository:** https://github.com/Abhi930941/Sangam

**Screenshots:**
<table>
  <tr>
    <td><img src="screenshots/Screenshot 2026-02-18 234433.png" alt="Home Page" /></td>
    <td><img src="screenshots/Screenshot 2026-02-18 234614.png" alt="Music Page" /></td>
    <td><img src="screenshots/Screenshot 2026-02-20 005624.png" alt="Music Preview Page" /></td>
  </tr>
  <tr>
    <td align="center"><b>Home Page</b></td>
    <td align="center"><b>Music Page</b></td>
    <td align="center"><b>Music Preview Page</b></td>
  </tr>
</table>

---

## Why This Project Matters

Sangam addresses the problem of fragmented Indian music discovery by enabling mood-based search across Bollywood and regional songs.

By integrating YouTube and Spotify into a single platform, it provides a seamless and unified listening experience.

Technically, the project demonstrates full-stack development, secure OAuth authentication, API integration, backend data aggregation, and scalable web application design.

---

## Contact

**Developer:** Abhishek Sahani

**LinkedIn:** [linkedin.com/in/abhishek-sahani-447851341](https://www.linkedin.com/in/abhishek-sahani-447851341)

**Email:** abhishek242443@gmail.com

**Portfolio:** https://abhi930941.github.io/Portfolio/

---

## Acknowledgments

- YouTube Data API v3 documentation for music data access
- Spotify Web API for streaming metadata and authentication
- Bootstrap for responsive UI components
- Font Awesome for icon support
- Indian music community for inspiration


---

Built with a focus on user experience and Indian music discovery.
