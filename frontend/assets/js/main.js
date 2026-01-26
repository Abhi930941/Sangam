// Configuration
const CONFIG = {
    API_BASE_URL: '/api',
    ANIMATION_DURATION: 300,
    NOTIFICATION_DURATION: 5000,
    PARTICLE_COUNT: 20
};

// Global Variables
let currentAudio = null;
let currentPlayer = null;
let isAPIAvailable = false;
let currentPlayingData = null;

// Initialize Application
document.addEventListener('DOMContentLoaded', async function() {
    try {
        await checkAPIHealth();
        initializeEventListeners();
        createParticleEffect();
        showPage('home');
        showNotification('Welcome to Sangam!', 'Discover amazing Indian music');
    } catch (error) {
        console.error('Initialization error:', error);
    }
});

// API Health Checking
async function checkAPIHealth() {
    try {
        const response = await fetch(`${CONFIG.API_BASE_URL}/health`, {
            timeout: 5000
        });
        
        if (response.ok) {
            const data = await response.json();
            isAPIAvailable = true;
            console.log('Backend API is running:', data);
            showAPIStatus(true, data.apis);
        } else {
            throw new Error('API not responding');
        }
    } catch (error) {
        isAPIAvailable = false;
        console.log('Backend API not available, using offline mode:', error);
        showAPIStatus(false);
    }
}

// Initialize Event Listeners
function initializeEventListeners() {
    const searchInput = document.getElementById('artistSearch');
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchArtist();
            }
        });
        
        let searchTimeout;
        searchInput.addEventListener('input', function(e) {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                if (e.target.value.trim().length > 2) {
                    searchArtist();
                }
            }, 1000);
        });
    }
    
    // Initialize default mood songs
    playMoodSongs('happy');
}

// Navigation Functions
function showPage(pageId) {
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => {
        page.classList.remove('active');
    });
    
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.add('active');
    }
    
    if (pageId === 'music') {
        const songsContainer = document.getElementById('songsContainer');
        if (songsContainer && songsContainer.innerHTML.trim() === '') {
            playMoodSongs('happy');
        }
    }
}

// Search Artist Function
async function searchArtist() {
    const artistName = document.getElementById('artistSearch').value.trim();
    
    if (!artistName) {
        showNotification('Search Error', 'Please enter an artist name');
        return;
    }
    
    showLoading(true);
    
    try {
        if (isAPIAvailable) {
            const response = await fetch(`${CONFIG.API_BASE_URL}/search/${encodeURIComponent(artistName)}?limit=10`);
            
            if (response.ok) {
                const data = await response.json();
                if (data.success && data.songs.length > 0) {
                    displaySongs(data.songs, `Songs by ${artistName}`);
                    showNotification('Search Complete', `Found ${data.songs.length} songs`);
                    return;
                }
            }
        }
        
        const sampleSongs = generateSampleArtistSongs(artistName);
        displaySongs(sampleSongs, `Songs by ${artistName}`);
        showNotification('Demo Mode', `Showing sample songs for ${artistName}`);
        
    } catch (error) {
        console.error('Search error:', error);
        const sampleSongs = generateSampleArtistSongs(artistName);
        displaySongs(sampleSongs, `Songs by ${artistName}`);
        showNotification('Offline Mode', 'Showing sample data');
    } finally {
        showLoading(false);
    }
}

// Working Sample Songs with Valid YouTube IDs
function generateSampleArtistSongs(artistName) {
    // These are actual working YouTube video IDs that are publicly available and embeddable
    const workingVideoIds = [
        'z9D71pQaTnc', // Despacito (most viewed, definitely works)
        'kJQP7kiw5Fk', // Luis Fonsi (popular song)
        'CevxZvSJLk8', // Katy Perry
        'JGwWNGJdvx8', // Ed Sheeran
        'fJ9rUzIMcZQ'  // Queen
    ];
    
    const songTitles = [
        `${artistName} - Hit Song 1`,
        `${artistName} - Popular Track`,
        `${artistName} - Best of Collection`,
        `${artistName} - Latest Release`,
        `${artistName} - Fan Favorite`
    ];
    
    return songTitles.map((title, index) => ({
        title: title,
        artist: artistName,
        year: (2020 + index).toString(),
        duration: `4:${(20 + index * 10).toString().padStart(2, '0')}`,
        source: 'youtube',
        youtube_id: workingVideoIds[index % workingVideoIds.length],
        thumbnail: `https://img.youtube.com/vi/${workingVideoIds[index % workingVideoIds.length]}/hqdefault.jpg`,
        play_url: `https://www.youtube.com/watch?v=${workingVideoIds[index % workingVideoIds.length]}`
    }));
}

// Play Mood Songs with Working Video IDs
async function playMoodSongs(mood) {
    showLoading(true);
    
    try {
        if (isAPIAvailable) {
            const response = await fetch(`${CONFIG.API_BASE_URL}/mood/${mood}`);
            
            if (response.ok) {
                const data = await response.json();
                if (data.success && data.songs.length > 0) {
                    displaySongs(data.songs, `${capitalizeFirst(mood)} Songs`);
                    showNotification('Mood Selection', `Loaded ${mood} songs`);
                    return;
                }
            }
        }
        
        const songs = getLocalMoodSongs(mood);
        displaySongs(songs, `${capitalizeFirst(mood)} Songs`);
        showNotification('Demo Mode', `${capitalizeFirst(mood)} songs loaded`);
        
    } catch (error) {
        console.error('Mood songs error:', error);
        const songs = getLocalMoodSongs(mood);
        displaySongs(songs, `${capitalizeFirst(mood)} Songs`);
        showNotification('Offline Mode', 'Showing local songs');
    } finally {
        showLoading(false);
    }
}

// Updated mood songs with working video IDs
function getLocalMoodSongs(mood) {
    // Using proven working YouTube video IDs
    const workingIds = {
        'despacito': 'z9D71pQaTnc',
        'shape_of_you': 'JGwWNGJdvx8', 
        'uptown_funk': 'OPf0YbXqDm0',
        'gangnam_style': '9bZkp7q19f0',
        'see_you_again': 'RgKAFK5djSk'
    };
    
    const MOOD_SONGS = {
        happy: [
            { 
                title: "Happy Bollywood Dance", 
                artist: "Various Artists", 
                year: "2023", 
                duration: "4:20",
                youtube_id: workingIds.despacito,
                thumbnail: `https://img.youtube.com/vi/${workingIds.despacito}/hqdefault.jpg`
            },
            { 
                title: "Celebration Songs", 
                artist: "Bollywood Hits", 
                year: "2022", 
                duration: "3:45",
                youtube_id: workingIds.uptown_funk,
                thumbnail: `https://img.youtube.com/vi/${workingIds.uptown_funk}/hqdefault.jpg`
            },
            { 
                title: "Joyful Melodies", 
                artist: "Happy Music", 
                year: "2023", 
                duration: "4:15",
                youtube_id: workingIds.gangnam_style,
                thumbnail: `https://img.youtube.com/vi/${workingIds.gangnam_style}/hqdefault.jpg`
            }
        ],
        sad: [
            { 
                title: "Emotional Ballads", 
                artist: "Arijit Singh Style", 
                year: "2023", 
                duration: "5:10",
                youtube_id: workingIds.see_you_again,
                thumbnail: `https://img.youtube.com/vi/${workingIds.see_you_again}/hqdefault.jpg`
            },
            { 
                title: "Heart Touching Songs", 
                artist: "Sad Collection", 
                year: "2022", 
                duration: "4:30",
                youtube_id: workingIds.shape_of_you,
                thumbnail: `https://img.youtube.com/vi/${workingIds.shape_of_you}/hqdefault.jpg`
            }
        ],
        romantic: [
            { 
                title: "Love Songs Collection", 
                artist: "Romantic Hits", 
                year: "2023", 
                duration: "4:45",
                youtube_id: workingIds.shape_of_you,
                thumbnail: `https://img.youtube.com/vi/${workingIds.shape_of_you}/hqdefault.jpg`
            },
            { 
                title: "Bollywood Romance", 
                artist: "Love Ballads", 
                year: "2022", 
                duration: "5:20",
                youtube_id: workingIds.despacito,
                thumbnail: `https://img.youtube.com/vi/${workingIds.despacito}/hqdefault.jpg`
            }
        ],
        motivation: [
            { 
                title: "Inspirational Tracks", 
                artist: "Motivational Music", 
                year: "2023", 
                duration: "4:00",
                youtube_id: workingIds.uptown_funk,
                thumbnail: `https://img.youtube.com/vi/${workingIds.uptown_funk}/hqdefault.jpg`
            }
        ],
        party: [
            { 
                title: "Party Anthems", 
                artist: "Dance Hits", 
                year: "2023", 
                duration: "3:55",
                youtube_id: workingIds.gangnam_style,
                thumbnail: `https://img.youtube.com/vi/${workingIds.gangnam_style}/hqdefault.jpg`
            },
            { 
                title: "Club Bangers", 
                artist: "Party Music", 
                year: "2023", 
                duration: "4:10",
                youtube_id: workingIds.uptown_funk,
                thumbnail: `https://img.youtube.com/vi/${workingIds.uptown_funk}/hqdefault.jpg`
            }
        ],
        chill: [
            { 
                title: "Relaxing Vibes", 
                artist: "Chill Collection", 
                year: "2023", 
                duration: "5:30",
                youtube_id: workingIds.shape_of_you,
                thumbnail: `https://img.youtube.com/vi/${workingIds.shape_of_you}/hqdefault.jpg`
            }
        ],
        devotional: [
            { 
                title: "Spiritual Songs", 
                artist: "Devotional Music", 
                year: "2023", 
                duration: "6:00",
                youtube_id: workingIds.see_you_again,
                thumbnail: `https://img.youtube.com/vi/${workingIds.see_you_again}/hqdefault.jpg`
            }
        ],
        classical: [
            { 
                title: "Classical Fusion", 
                artist: "Traditional Artists", 
                year: "2023", 
                duration: "8:15",
                youtube_id: workingIds.despacito,
                thumbnail: `https://img.youtube.com/vi/${workingIds.despacito}/hqdefault.jpg`
            }
        ]
    };
    
    const moodSongs = MOOD_SONGS[mood] || MOOD_SONGS.happy;
    return moodSongs.map(song => ({
        ...song,
        source: 'youtube',
        play_url: `https://www.youtube.com/watch?v=${song.youtube_id}`
    }));
}

// Display Songs Function
function displaySongs(songs, title) {
    const container = document.getElementById('songsContainer');
    
    if (!container) return;
    
    if (!songs || songs.length === 0) {
        container.innerHTML = `
            <div class="text-center">
                <div class="feature-card">
                    <h5>No songs found</h5>
                    <p>Try searching for a different artist or check your connection.</p>
                </div>
            </div>
        `;
        return;
    }
    
    let html = `
        <div class="songs-section">
            <h4 class="text-center mb-4">${escapeHtml(title)}</h4>
            <div class="row g-3">
    `;
    
    songs.forEach((song, index) => {
        const thumbnail = song.thumbnail || 'https://via.placeholder.com/300x300/667eea/ffffff?text=🎵';
        const sourceIcon = getSourceIcon(song.source || 'sample');
        const songData = JSON.stringify(song).replace(/"/g, '&quot;');
        
        html += `
            <div class="col-lg-6 col-md-6 col-12">
                <div class="song-card">
                    <div class="song-info">
                        <img src="${thumbnail}" alt="${escapeHtml(song.title)}" class="song-thumbnail" 
                             onerror="this.src='https://via.placeholder.com/60x60/667eea/ffffff?text=🎵'">
                        <div class="song-details">
                            <div class="song-title">${escapeHtml(song.title)}</div>
                            <div class="song-artist">${escapeHtml(song.artist)} • ${song.year || 'Unknown'}</div>
                            ${song.album ? `<div class="song-artist">Album: ${escapeHtml(song.album)}</div>` : ''}
                        </div>
                        <button class="play-btn" onclick='playSong(${songData})'>
                            <i class="fas fa-play"></i>
                        </button>
                        <div class="song-duration">${song.duration || '4:20'}</div>
                        <div class="ms-2">${sourceIcon}</div>
                    </div>
                </div>
            </div>
        `;
    });
    
    html += `
            </div>
        </div>
    `;
    
    container.innerHTML = html;
    
    // player containers
    if (!document.getElementById('audioPlayerContainer')) {
        container.innerHTML += `
            <!-- Audio Player Container -->
            <div id="audioPlayerContainer" style="display: none;" class="mt-4">
                <div class="feature-card text-center">
                    <h5 id="nowPlayingTitle">Now Playing</h5>
                    <p id="nowPlayingArtist">Artist</p>
                    <audio id="audioPlayer" controls style="width: 100%; max-width: 500px;">
                        Your browser does not support the audio element.
                    </audio>
                    <div class="mt-2">
                        <button class="btn btn-secondary btn-sm" onclick="stopCurrentAudio()">Stop</button>
                    </div>
                </div>
            </div>
            
            <!-- Video Player Container -->
            <div id="embedPlayerContainer" style="display: none;" class="mt-4">
                <div class="feature-card text-center">
                    <h5 id="embedPlayingTitle">Now Playing</h5>
                    <p id="embedPlayingArtist">Artist</p>
                    <div id="embedPlayer"></div>
                    <div class="mt-3">
                        <button class="btn btn-secondary btn-sm" onclick="stopEmbedPlayer()">Stop</button>
                        <button class="btn btn-primary btn-sm ms-2" onclick="openInNewTab()">Open YouTube</button>
                    </div>
                </div>
            </div>
        `;
    }
}

// Play Song with Modern UI Options
function playSong(songData) {
    try {
        currentPlayingData = songData;
        
        // Stop any current playback
        stopCurrentAudio();
        stopEmbedPlayer();
        
        console.log('Playing song:', songData);
        
        // Show modern playback options instead of direct embed
        showPlaybackOptions(songData);
        
    } catch (error) {
        console.error('Play song error:', error);
        showNotification('Playback Error', 'Unable to play song', 'error');
    }
}

// Modern Playback Options UI
function showPlaybackOptions(songData) {
    const container = document.getElementById('embedPlayerContainer');
    const titleEl = document.getElementById('embedPlayingTitle');
    const artistEl = document.getElementById('embedPlayingArtist');
    const playerEl = document.getElementById('embedPlayer');
    
    if (!container || !playerEl) return;
    
    const { title, artist, youtube_id, spotify_id, preview_url, play_url } = songData;
    
    titleEl.textContent = title;
    artistEl.textContent = `by ${artist}`;
    
    let optionsHtml = `
        <div class="modern-player-container">
            <!-- Header Section -->
            <div class="player-header text-center mb-4">
                <div class="music-icon-container mb-3">
                    <i class="fas fa-music music-icon"></i>
                </div>
                <h4 class="player-title">Choose Playback Option</h4>
                <p class="player-subtitle">Select your preferred way to listen</p>
            </div>
            
            <!-- Options Grid -->
            <div class="options-grid">
    `;
    
    // YouTube Options
    if (youtube_id) {
        optionsHtml += `
                <!-- YouTube Section -->
                <div class="option-section youtube-section">
                    <div class="option-header">
                        <i class="fab fa-youtube platform-icon youtube-icon"></i>
                        <span class="platform-name">YouTube</span>
                    </div>
                    
                    <div class="option-buttons">
                        <button class="option-btn primary-option" onclick="directYouTubeOpen('${youtube_id}')">
                            <div class="btn-content">
                                <i class="fas fa-external-link-alt btn-icon"></i>
                                <div class="btn-text">
                                    <div class="btn-title">Open YouTube</div>
                                    <div class="btn-subtitle">Recommended • Always works</div>
                                </div>
                            </div>
                        </button>
                        
                        <button class="option-btn secondary-option" onclick="showVideoThumbnail('${youtube_id}', '${escapeHtml(title)}', '${escapeHtml(artist)}')">
                            <div class="btn-content">
                                <i class="fas fa-image btn-icon"></i>
                                <div class="btn-text">
                                    <div class="btn-title">Preview Video</div>
                                    <div class="btn-subtitle">See thumbnail first</div>
                                </div>
                            </div>
                        </button>
                        
                        <button class="option-btn tertiary-option" onclick="embedYouTubeVideo('${youtube_id}', '${escapeHtml(title)}', '${escapeHtml(artist)}')">
                            <div class="btn-content">
                                <i class="fas fa-play btn-icon"></i>
                                <div class="btn-text">
                                    <div class="btn-title">Try Embed</div>
                                    <div class="btn-subtitle">May have restrictions</div>
                                </div>
                            </div>
                        </button>
                    </div>
                </div>
        `;
    }
    
    // Spotify Options
    if (spotify_id || preview_url) {
        optionsHtml += `
                <!-- Spotify Section -->
                <div class="option-section spotify-section">
                    <div class="option-header">
                        <i class="fab fa-spotify platform-icon spotify-icon"></i>
                        <span class="platform-name">Spotify</span>
                    </div>
                    
                    <div class="option-buttons">
        `;
        
        if (preview_url) {
            optionsHtml += `
                        <button class="option-btn primary-option" onclick="playAudioPreview('${escapeHtml(title)}', '${escapeHtml(artist)}', '${preview_url}')">
                            <div class="btn-content">
                                <i class="fas fa-headphones btn-icon"></i>
                                <div class="btn-text">
                                    <div class="btn-title">Play Preview</div>
                                    <div class="btn-subtitle">30 seconds • Instant play</div>
                                </div>
                            </div>
                        </button>
            `;
        }
        
        if (spotify_id) {
            optionsHtml += `
                        <button class="option-btn secondary-option" onclick="directSpotifyOpen('${spotify_id}')">
                            <div class="btn-content">
                                <i class="fas fa-external-link-alt btn-icon"></i>
                                <div class="btn-text">
                                    <div class="btn-title">Open Spotify</div>
                                    <div class="btn-subtitle">Full song in app</div>
                                </div>
                            </div>
                        </button>
            `;
        }
        
        optionsHtml += `
                    </div>
                </div>
        `;
    }
    
    // Demo or Search Options
    if (!youtube_id && !spotify_id && !preview_url) {
        optionsHtml += `
                <!-- Demo Section -->
                <div class="option-section demo-section">
                    <div class="option-header">
                        <i class="fas fa-info-circle platform-icon demo-icon"></i>
                        <span class="platform-name">Demo Mode</span>
                    </div>
                    
                    <div class="demo-message">
                        <p>This is sample data. Add API keys for real music!</p>
                    </div>
                    
                    <div class="option-buttons">
                        <button class="option-btn primary-option" onclick="searchOnYouTube('${escapeHtml(title)} ${escapeHtml(artist)}')">
                            <div class="btn-content">
                                <i class="fab fa-youtube btn-icon"></i>
                                <div class="btn-text">
                                    <div class="btn-title">Search YouTube</div>
                                    <div class="btn-subtitle">Find this song</div>
                                </div>
                            </div>
                        </button>
                        
                        <button class="option-btn secondary-option" onclick="showDemoInfo('${escapeHtml(title)}', '${escapeHtml(artist)}')">
                            <div class="btn-content">
                                <i class="fas fa-question-circle btn-icon"></i>
                                <div class="btn-text">
                                    <div class="btn-title">Learn More</div>
                                    <div class="btn-subtitle">Setup guide</div>
                                </div>
                            </div>
                        </button>
                    </div>
                </div>
        `;
    }
    
    optionsHtml += `
            </div>
            
            <!-- Footer -->
            <div class="player-footer text-center mt-4">
                <button class="cancel-btn" onclick="stopEmbedPlayer()">
                    <i class="fas fa-times me-2"></i>Cancel
                </button>
            </div>
        </div>
    `;
    
    playerEl.innerHTML = optionsHtml;
    container.style.display = 'block';
    
    // Smooth scroll to options
    setTimeout(() => {
        container.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 300);
    
    showNotification('Playback Options', `Choose how to play "${title}"`, 'music');
}

// Direct YouTube Open ( this is Always Works)
function directYouTubeOpen(videoId) {
    const url = `https://www.youtube.com/watch?v=${videoId}`;
    window.open(url, '_blank');
    showNotification('Opening YouTube', 'Song opened in new tab - This always works!', 'success');
    stopEmbedPlayer();
}

// Direct Spotify Open
function directSpotifyOpen(trackId) {
    const url = `https://open.spotify.com/track/${trackId}`;
    window.open(url, '_blank');
    showNotification('Opening Spotify', 'Song opened in Spotify', 'success');
    stopEmbedPlayer();
}

// Search on YouTube
function searchOnYouTube(query) {
    const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
    window.open(url, '_blank');
    showNotification('YouTube Search', 'Search opened in new tab', 'info');
    stopEmbedPlayer();
}

// Show Demo Info
function showDemoInfo(title, artist) {
    showNotification(
        'Demo Mode Active', 
        `"${title}" by ${artist} - Add YouTube/Spotify API keys for real music playback!`, 
        'info'
    );
    
    setTimeout(() => {
        showNotification(
            'Setup Guide',
            'Check "How to Use" page for complete API setup instructions',
            'warning'
        );
    }, 2000);
}

// Show Video Thumbnail with better UI
function showVideoThumbnail(videoId, title, artist) {
    const playerEl = document.getElementById('embedPlayer');
    if (!playerEl) return;
    
    const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    
    playerEl.innerHTML = `
        <div class="video-preview-container">
            <!-- Video Preview Header -->
            <div class="preview-header text-center mb-4">
                <h4 class="preview-title">Video Preview</h4>
                <p class="preview-subtitle">Take a look before playing</p>
            </div>
            
            <!-- Thumbnail Display -->
            <div class="thumbnail-display">
                <div class="thumbnail-wrapper">
                    <img src="${thumbnailUrl}" 
                         alt="Video Thumbnail" 
                         class="video-thumbnail"
                         onerror="this.src='https://img.youtube.com/vi/${videoId}/hqdefault.jpg'">
                    
                    <div class="play-overlay-modern" onclick="embedYouTubeVideo('${videoId}', '${escapeHtml(title)}', '${escapeHtml(artist)}')">
                        <div class="play-button-modern">
                            <i class="fas fa-play"></i>
                        </div>
                        <div class="play-text">Click to play</div>
                    </div>
                </div>
            </div>
            
            <!-- Video Info -->
            <div class="video-info text-center mb-4">
                <h5 class="info-title">${title}</h5>
                <p class="info-artist">${artist}</p>
                <small class="video-id">Video ID: ${videoId}</small>
            </div>
            
            <!-- Action Buttons -->
            <div class="preview-actions">
                <button class="preview-btn primary-preview-btn" onclick="embedYouTubeVideo('${videoId}', '${escapeHtml(title)}', '${escapeHtml(artist)}')">
                    <i class="fas fa-play me-2"></i>Play Embedded
                </button>
                
                <button class="preview-btn secondary-preview-btn" onclick="directYouTubeOpen('${videoId}')">
                    <i class="fab fa-youtube me-2"></i>Open YouTube
                </button>
                
                <button class="preview-btn cancel-preview-btn" onclick="showPlaybackOptions(${JSON.stringify(currentPlayingData).replace(/"/g, '&quot;')})">
                    <i class="fas fa-arrow-left me-2"></i>Back to Options
                </button>
            </div>
        </div>
    `;
}

// YouTube Video with better UI
function embedYouTubeVideo(videoId, title, artist, unmuted = false) {
    const playerEl = document.getElementById('embedPlayer');
    if (!playerEl) return;
    
    showNotification('Loading Video', 'Embedding video player...', 'info');
    
    const muteParam = unmuted ? '' : '&mute=1';
    
    playerEl.innerHTML = `
        <div class="video-embed-container">
            <!-- Embed Info Bar -->
            <div class="embed-info-bar">
                <div class="embed-status">
                    <i class="fas fa-play-circle status-icon"></i>
                    <span>Now Playing: ${title}</span>
                </div>
                <div class="embed-controls">
                    <button class="control-btn" onclick="directYouTubeOpen('${videoId}')" title="Open in YouTube">
                        <i class="fab fa-youtube"></i>
                    </button>
                    <button class="control-btn" onclick="stopEmbedPlayer()" title="Stop">
                        <i class="fas fa-stop"></i>
                    </button>
                </div>
            </div>
            
            <!-- Video Player -->
            <div class="video-player-wrapper">
                <iframe class="video-iframe"
                    src="https://www.youtube.com/embed/${videoId}?autoplay=0${muteParam}&rel=0&modestbranding=1" 
                    frameborder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                    allowfullscreen
                    onload="handleVideoLoadSuccess()"
                    onerror="handleVideoLoadError('${videoId}')">
                </iframe>
            </div>
            
            <!-- Video Controls -->
            <div class="video-controls-modern">
                ${!unmuted ? `
                <button class="video-control-btn sound-btn" onclick="embedYouTubeVideo('${videoId}', '${title}', '${artist}', true)">
                    <i class="fas fa-volume-up"></i>
                    <span>Enable Sound</span>
                </button>
                ` : ''}
                
                <button class="video-control-btn youtube-btn" onclick="directYouTubeOpen('${videoId}')">
                    <i class="fab fa-youtube"></i>
                    <span>Open YouTube</span>
                </button>
                
                <button class="video-control-btn stop-btn" onclick="stopEmbedPlayer()">
                    <i class="fas fa-stop"></i>
                    <span>Stop</span>
                </button>
            </div>
            
            <!-- Help Text -->
            <div class="video-help-text">
                <i class="fas fa-info-circle"></i>
                If video shows "unavailable", click "Open YouTube" button above
            </div>
        </div>
    `;
}

// Handle Video Load Success
function handleVideoLoadSuccess() {
    console.log('Video loaded successfully');
    showNotification('Video Loaded', 'Video is playing! If muted, click Enable Sound button.', 'success');
}

// Handle Video Load Error
function handleVideoLoadError(videoId) {
    console.error('Video failed to load:', videoId);
    setTimeout(() => {
        showNotification('Video Issue', 'Click "Open YouTube" for best experience', 'warning');
    }, 1000);
}

// Play Audio Preview (Spotify)
function playAudioPreview(title, artist, previewUrl) {
    const audioPlayer = document.getElementById('audioPlayer');
    const container = document.getElementById('audioPlayerContainer');
    const titleEl = document.getElementById('nowPlayingTitle');
    const artistEl = document.getElementById('nowPlayingArtist');
    
    if (!audioPlayer || !container) return;
    
    // Hide video player, show audio player
    stopEmbedPlayer();
    
    audioPlayer.src = previewUrl;
    titleEl.textContent = `Now Playing: ${title}`;
    artistEl.textContent = `${artist} (30 Second Preview)`;
    container.style.display = 'block';
    
    // Auto play
    audioPlayer.play().then(() => {
        currentAudio = audioPlayer;
        showNotification('Now Playing', `${title} - ${artist} (Preview)`, 'music');
        
        // Scroll to player
        setTimeout(() => {
            container.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 300);
    }).catch(error => {
        console.error('Audio play failed:', error);
        showNotification('Click Play', 'Please click the play button on the audio player', 'info');
    });
    
    // Auto-hide when ended
    audioPlayer.onended = () => {
        container.style.display = 'none';
        currentAudio = null;
        showNotification('Preview Ended', 'Try the full song on Spotify!', 'info');
    };
}

// Stop Current Audio
function stopCurrentAudio() {
    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
        currentAudio = null;
    }
    
    const container = document.getElementById('audioPlayerContainer');
    if (container) {
        container.style.display = 'none';
    }
}

// Stop Embedded Player
function stopEmbedPlayer() {
    const container = document.getElementById('embedPlayerContainer');
    const playerEl = document.getElementById('embedPlayer');
    
    if (container) {
        container.style.display = 'none';
    }
    
    if (playerEl) {
        playerEl.innerHTML = '';
    }
    
    currentPlayer = null;
}

// Open in New Tab
function openInNewTab() {
    if (currentPlayingData) {
        const { youtube_id, spotify_id, play_url, source } = currentPlayingData;
        
        let url = '';
        if ((source === 'youtube' || source === 'sample') && youtube_id) {
            url = `https://www.youtube.com/watch?v=${youtube_id}`;
        } else if (source === 'spotify' && spotify_id) {
            url = `https://open.spotify.com/track/${spotify_id}`;
        } else if (play_url && play_url !== '#sample') {
            url = play_url;
        }
        
        if (url) {
            window.open(url, '_blank');
            showNotification('Opened in New Tab', 'Song opened in external app', 'success');
        }
    }
}

// Stop All Playback
function stopAllPlayback() {
    stopCurrentAudio();
    stopEmbedPlayer();
    showNotification('Stopped', 'All playback stopped', 'info');
}

// Toggle Play or Pause
function togglePlayPause() {
    if (currentAudio) {
        if (currentAudio.paused) {
            currentAudio.play();
            document.getElementById('playPauseIcon').className = 'fas fa-pause';
        } else {
            currentAudio.pause();
            document.getElementById('playPauseIcon').className = 'fas fa-play';
        }
    }
}

// Utility Functions
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function getSourceIcon(source) {
    const icons = {
        'youtube': '<i class="fab fa-youtube text-danger" title="YouTube"></i>',
        'spotify': '<i class="fab fa-spotify text-success" title="Spotify"></i>',
        'sample': '<i class="fas fa-music text-secondary" title="Demo"></i>'
    };
    return icons[source] || icons.sample;
}

// Loading Functions
function showLoading(show) {
    const loadingIndicator = document.getElementById('loadingIndicator');
    if (loadingIndicator) {
        loadingIndicator.style.display = show ? 'block' : 'none';
    }
}

// Notification System
function showNotification(title, message, icon = 'info') {
    const iconMap = {
        'info': 'fas fa-info-circle text-info',
        'success': 'fas fa-check-circle text-success',
        'error': 'fas fa-exclamation-circle text-danger',
        'warning': 'fas fa-exclamation-triangle text-warning',
        'music': 'fas fa-music text-primary'
    };
    
    const notification = document.createElement('div');
    notification.className = 'notification fade-in';
    notification.innerHTML = `
        <div class="d-flex align-items-center">
            <i class="${iconMap[icon]} me-3"></i>
            <div class="flex-grow-1">
                <div class="notification-title">${escapeHtml(title)}</div>
                <div class="notification-message">${escapeHtml(message)}</div>
            </div>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, CONFIG.NOTIFICATION_DURATION);
}

// API Status Indicator
function showAPIStatus(isOnline, apis = {}) {
    const statusDiv = document.createElement('div');
    statusDiv.className = 'notification';
    statusDiv.style.bottom = '20px';
    statusDiv.style.top = 'auto';
    
    let apiStatus = '';
    if (isOnline) {
        apiStatus = `YouTube: ${apis.youtube ? '✓' : '✗'} | Spotify: ${apis.spotify ? '✓' : '✗'}`;
    }
    
    statusDiv.innerHTML = `
        <div class="d-flex align-items-center">
            <i class="fas fa-circle ${isOnline ? 'text-success' : 'text-warning'} me-2"></i>
            <div class="notification-message">
                ${isOnline ? `APIs Connected - ${apiStatus}` : 'Demo Mode - Add API keys for real music'}
            </div>
        </div>
    `;
    
    document.body.appendChild(statusDiv);
    
    setTimeout(() => {
        statusDiv.remove();
    }, 5000);
}

// Particle Effect
function createParticleEffect() {
    function createParticle() {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * window.innerWidth + 'px';
        particle.style.animationDuration = (Math.random() * 3 + 2) + 's';
        
        document.body.appendChild(particle);
        
        setTimeout(() => {
            if (particle.parentElement) {
                particle.remove();
            }
        }, 5000);
    }
    
    setInterval(createParticle, 500);
}

// Keyboard Shortcuts
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        const notifications = document.querySelectorAll('.notification');
        notifications.forEach(notification => notification.remove());
    }
    
    // Space for play or pause
    if (e.key === ' ' && (currentAudio || currentPlayer)) {
        e.preventDefault();
        togglePlayPause();
    }
    
    // Number keys for moods
    const moodKeys = {
        '1': 'happy', '2': 'sad', '3': 'romantic', '4': 'motivation',
        '5': 'party', '6': 'chill', '7': 'devotional', '8': 'classical'
    };
    
    if (moodKeys[e.key] && document.getElementById('music').classList.contains('active')) {
        playMoodSongs(moodKeys[e.key]);
    }
});

// Export functions for global access
window.showPage = showPage;
window.searchArtist = searchArtist;
window.playMoodSongs = playMoodSongs;
window.playSong = playSong;
window.stopCurrentAudio = stopCurrentAudio;
window.stopEmbedPlayer = stopEmbedPlayer;
window.openInNewTab = openInNewTab;
window.stopAllPlayback = stopAllPlayback;
window.togglePlayPause = togglePlayPause;
window.directYouTubeOpen = directYouTubeOpen;
window.directSpotifyOpen = directSpotifyOpen;
window.searchOnYouTube = searchOnYouTube;
window.showDemoInfo = showDemoInfo;
window.embedYouTubeVideo = embedYouTubeVideo;
window.showVideoThumbnail = showVideoThumbnail;
window.showPlaybackOptions = showPlaybackOptions;
window.playAudioPreview = playAudioPreview;
window.handleVideoLoadSuccess = handleVideoLoadSuccess;
window.handleVideoLoadError = handleVideoLoadError;