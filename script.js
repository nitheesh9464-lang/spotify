/**
 * Spotify Clone - Senior Engineering Implementation
 * Architecture: Modular Object-Oriented JavaScript
 */

const CONFIG = {
    DEFAULT_VOLUME: 0.7,
    STORAGE_KEY: 'spotify_clone_state',
    SONGS: [
        { id: 1, title: "Unakaga", artist: "MassTamilan", url: "https://res.cloudinary.com/dbti5mn9s/video/upload/v1778167774/Unakaga-MassTamilan.io_wjkdim.mp3", img: "https://images.unsplash.com/photo-1614680376593-902f74cf0d41?w=400" },
        { id: 2, title: "Oorum Blood", artist: "Vijay Antony", url: "https://res.cloudinary.com/dbti5mn9s/video/upload/v1778167772/Oorum_Blood_siljcw.mp3", img: "https://images.unsplash.com/photo-1493225255756-d9584f8606e9?w=400" },
        { id: 3, title: "Pavazha Malli", artist: "Sean Roldan", url: "https://res.cloudinary.com/dbti5mn9s/video/upload/v1778167770/Pavazha_Malli_hmefj1.mp3", img: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400" },
        { id: 4, title: "Yumabaibesa", artist: "Sid Sriram", url: "https://res.cloudinary.com/dbti5mn9s/video/upload/v1778167769/Yumabaibesa_xnnluj.mp3", img: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400" },
        { id: 5, title: "Blud Is On His Way", artist: "Rap King", url: "https://res.cloudinary.com/dbti5mn9s/video/upload/v1778167769/Blud_Is_On_His_Way_zleano.mp3", img: "https://images.unsplash.com/photo-1459749411177-042180ce673f?w=400" },
        { id: 6, title: "Oorum Blood (Unplugged)", artist: "Vijay Antony", url: "https://res.cloudinary.com/dbti5mn9s/video/upload/v1778167768/Oorum_Blood_Unplugged_nathjg.mp3", img: "https://images.unsplash.com/photo-1514525253361-bee8d48700df?w=400" },
        { id: 7, title: "Singari", artist: "Trendsetter", url: "https://res.cloudinary.com/dbti5mn9s/video/upload/v1778167766/Singari_ih0uhr.mp3", img: "https://images.unsplash.com/photo-1420161900862-9a86fa1f5c79?w=400" },
        { id: 8, title: "Hey Minnale", artist: "Harris Jayaraj", url: "https://res.cloudinary.com/dbti5mn9s/video/upload/v1778167765/Hey_Minnale_ryppvz.mp3", img: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=400" },
        { id: 9, title: "Idhayam Idhayam", artist: "Love Beats", url: "https://res.cloudinary.com/dbti5mn9s/video/upload/v1778167765/Idhayam-Idhayam_du6f5s.mp3", img: "https://images.unsplash.com/photo-1453090927415-5f45085b65c0?w=400" },
        { id: 10, title: "Naan Konjam Karuppu", artist: "Hiphop Tamizha", url: "https://res.cloudinary.com/dbti5mn9s/video/upload/v1778167764/Naan-Konjam-Karuppu_gbxnc1.mp3", img: "https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=400" },
        { id: 11, title: "Meesaya Murukku", artist: "Hiphop Tamizha", url: "https://res.cloudinary.com/dbti5mn9s/video/upload/v1778167764/Meesaya-Murukku-MassTamilan.com_c7sppc.mp3", img: "https://images.unsplash.com/photo-1501612722-7941650a719d?w=400" },
        { id: 12, title: "Adiye Sakkarakatti", artist: "Soul Stir", url: "https://res.cloudinary.com/dbti5mn9s/video/upload/v1778167760/Adiye-Sakkarakatti-MassTamilan.com_o2i2ut.mp3", img: "https://images.unsplash.com/photo-1510915369134-14a44a0312d3?w=400" },
        { id: 13, title: "Kerala Song", artist: "Folk Vibez", url: "https://res.cloudinary.com/dbti5mn9s/video/upload/v1778167754/Kerala-Song-MassTamilan.org_hgutre.mp3", img: "https://images.unsplash.com/photo-1459233313842-cd392ee2c388?w=400" },
        { id: 14, title: "Vaadi Nee Vaadi", artist: "Rhythm Boys", url: "https://res.cloudinary.com/dbti5mn9s/video/upload/v1778167758/Vaadi-Nee-Vaadi-MassTamilan.com_sveccq.mp3", img: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400" },
        { id: 15, title: "Aura 10/10", artist: "Pure Magic", url: "https://res.cloudinary.com/dbti5mn9s/video/upload/v1778167758/Aura_10-10_bsknta.mp3", img: "https://images.unsplash.com/photo-1471478331149-c75395e3391c?w=400" },
        { id: 16, title: "Vengamavan", artist: "Hiphop Tamizha", url: "https://res.cloudinary.com/dbti5mn9s/video/upload/v1778167752/Vengamavan-MassTamilan.org_qno7nl.mp3", img: "https://images.unsplash.com/photo-1514320298574-dd556059a018?w=400" },
        { id: 17, title: "Enna Nadanthalum", artist: "Strong Heart", url: "https://res.cloudinary.com/dbti5mn9s/video/upload/v1778167751/Enna-Nadanthalum-MassTamilan.com_ngain6.mp3", img: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=400" },
        { id: 18, title: "Kadhal Cricket", artist: "Sporty Love", url: "https://res.cloudinary.com/dbti5mn9s/video/upload/v1778167750/Kadhal-Cricket_amh97w.mp3", img: "https://images.unsplash.com/photo-1433606805111-da3bc6c4060b?w=400" },
        { id: 19, title: "Maattikkichey", artist: "Funny Beats", url: "https://res.cloudinary.com/dbti5mn9s/video/upload/v1778167749/Maattikkichey-Maattikkichey-MassTamilan.com_tbjfel.mp3", img: "https://images.unsplash.com/photo-1506157786151-b8491531f063?w=400" }
    ]
};

class SpotifyApp {
    constructor() {
        this.state = this.loadState();
        this.audio = document.getElementById('main-audio');
        this.isPlaying = false;
        this.queue = [...CONFIG.SONGS];
        this.history = [];
        
        this.initEventListeners();
        this.renderAll();
        this.applyState();
    }

    loadState() {
        const saved = localStorage.getItem(CONFIG.STORAGE_KEY);
        return saved ? JSON.parse(saved) : {
            currentSongId: 1,
            volume: CONFIG.DEFAULT_VOLUME,
            isShuffle: false,
            isRepeat: 0, // 0: off, 1: repeat all, 2: repeat one
            likedSongs: [],
            playlists: []
        };
    }

    saveState() {
        localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(this.state));
    }

    initEventListeners() {
        // Player Controls
        document.getElementById('btn-play-pause').onclick = () => this.togglePlay();
        document.getElementById('btn-next').onclick = () => this.nextTrack();
        document.getElementById('btn-prev').onclick = () => this.prevTrack();
        document.getElementById('btn-shuffle').onclick = (e) => this.toggleShuffle(e.currentTarget);
        document.getElementById('btn-repeat').onclick = (e) => this.toggleRepeat(e.currentTarget);
        
        // Progress Bars
        const seekBar = document.getElementById('seek-bar');
        seekBar.onclick = (e) => this.seek(e);
        
        const volBar = document.getElementById('volume-bar');
        volBar.onclick = (e) => this.adjustVolume(e);

        // UI Events
        document.getElementById('btn-create-playlist').onclick = () => this.createPlaylist();

        // Sidebar Navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.onclick = (e) => {
                e.preventDefault();
                this.switchView(item.dataset.view);
                document.querySelector('.nav-item.active').classList.remove('active');
                item.classList.add('active');
            };
        });

        // Search
        const searchInput = document.getElementById('global-search');
        searchInput.oninput = (e) => this.handleSearch(e.target.value);

        // Audio Events
        this.audio.ontimeupdate = () => this.updateUIProgress();
        this.audio.onended = () => this.handleTrackEnd();
        this.audio.onplay = () => this.setPlayerState(true);
        this.audio.onpause = () => this.setPlayerState(false);

        // Keyboard Shortcuts
        window.addEventListener('keydown', (e) => {
            if (e.target.tagName === 'INPUT') return;
            switch(e.code) {
                case 'Space': e.preventDefault(); this.togglePlay(); break;
                case 'ArrowRight': this.audio.currentTime += 10; break;
                case 'ArrowLeft': this.audio.currentTime -= 10; break;
                case 'KeyL': this.toggleLike(this.state.currentSongId); break;
            }
        });

        // UI Extras
        document.getElementById('nav-back').onclick = () => history.back();
        document.getElementById('btn-lyrics').onclick = () => this.toggleLyrics();
    }

    // --- Core Logic ---

    applyState() {
        this.audio.volume = this.state.volume;
        this.updateVolumeUI();
        this.loadTrack(this.state.currentSongId, false);
        this.renderPlaylists();
        
        // Apply shuffle/repeat UI
        if (this.state.isShuffle) document.getElementById('btn-shuffle').classList.add('active');
        this.updateRepeatUI();
    }

    loadTrack(id, autoPlay = true) {
        const song = CONFIG.SONGS.find(s => s.id === id);
        if (!song) return;

        this.state.currentSongId = id;
        this.audio.src = song.url;
        this.audio.load();

        if (autoPlay) {
            this.audio.play().catch(() => {
                this.showToast("Playback restricted by browser. Click play to start.");
            });
        }

        this.updateTrackUI(song);
        this.saveState();
    }

    togglePlay() {
        if (this.audio.paused) {
            this.audio.play();
        } else {
            this.audio.pause();
        }
    }

    setPlayerState(isPlaying) {
        this.isPlaying = isPlaying;
        const icon = document.querySelector('#btn-play-pause i');
        icon.className = isPlaying ? 'fas fa-pause' : 'fas fa-play';
        
        const eq = document.getElementById('mini-equalizer');
        eq.classList.toggle('active', isPlaying);
    }

    nextTrack() {
        let nextIndex;
        if (this.state.isShuffle) {
            nextIndex = Math.floor(Math.random() * CONFIG.SONGS.length);
        } else {
            const currentIdx = CONFIG.SONGS.findIndex(s => s.id === this.state.currentSongId);
            nextIndex = (currentIdx + 1) % CONFIG.SONGS.length;
        }
        this.loadTrack(CONFIG.SONGS[nextIndex].id);
    }

    prevTrack() {
        if (this.audio.currentTime > 3) {
            this.audio.currentTime = 0;
            return;
        }
        const currentIdx = CONFIG.SONGS.findIndex(s => s.id === this.state.currentSongId);
        let prevIndex = (currentIdx - 1 + CONFIG.SONGS.length) % CONFIG.SONGS.length;
        this.loadTrack(CONFIG.SONGS[prevIndex].id);
    }

    handleTrackEnd() {
        if (this.state.isRepeat === 2) {
            this.audio.currentTime = 0;
            this.audio.play();
        } else {
            this.nextTrack();
        }
    }

    // --- UI/UX Rendering ---

    renderAll() {
        this.renderGrid('recents-grid', CONFIG.SONGS.slice(0, 6), 'recent');
        this.renderGrid('recommendations-grid', [...CONFIG.SONGS].sort(() => 0.5 - Math.random()), 'card');
        this.renderGrid('recently-played-grid', [...CONFIG.SONGS].reverse(), 'card');
    }

    renderGrid(containerId, items, type) {
        const container = document.getElementById(containerId);
        container.innerHTML = items.map(song => {
            if (type === 'recent') {
                return `
                    <div class="recent-item" onclick="app.loadTrack(${song.id})">
                        <img src="${song.img}" alt="${song.title}">
                        <span>${song.title}</span>
                        <div class="play-btn-sm"><i class="fas fa-play"></i></div>
                    </div>
                `;
            }
            return `
                <div class="card" onclick="app.loadTrack(${song.id})">
                    <div class="card-img-container">
                        <img src="${song.img}" alt="${song.title}">
                        <div class="play-btn-circle"><i class="fas fa-play"></i></div>
                    </div>
                    <h4>${song.title}</h4>
                    <p>${song.artist} • Album</p>
                </div>
            `;
        }).join('');
    }

    updateTrackUI(song) {
        document.getElementById('track-art').src = song.img;
        document.getElementById('track-title').innerText = song.title;
        document.getElementById('track-artist').innerText = song.artist;
        
        // Update Like Button
        const likeBtn = document.querySelector('#btn-like-track i');
        const isLiked = this.state.likedSongs.includes(song.id);
        likeBtn.className = isLiked ? 'fas fa-heart' : 'far fa-heart';
        likeBtn.parentElement.style.color = isLiked ? 'var(--primary-color)' : '';

        // Dynamic Document Title
        document.title = `${song.title} • ${song.artist}`;
    }

    updateUIProgress() {
        if (isNaN(this.audio.duration)) return;
        
        const progress = (this.audio.currentTime / this.audio.duration) * 100;
        document.getElementById('seek-fill').style.width = `${progress}%`;
        
        document.getElementById('current-time').innerText = this.formatTime(this.audio.currentTime);
        document.getElementById('total-time').innerText = this.formatTime(this.audio.duration);
    }

    seek(e) {
        const bar = e.currentTarget;
        const rect = bar.getBoundingClientRect();
        const pos = (e.clientX - rect.left) / rect.width;
        this.audio.currentTime = pos * this.audio.duration;
    }

    adjustVolume(e) {
        const bar = e.currentTarget;
        const rect = bar.getBoundingClientRect();
        const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        this.audio.volume = pos;
        this.state.volume = pos;
        this.updateVolumeUI();
        this.saveState();
    }

    updateVolumeUI() {
        const fill = document.getElementById('volume-fill');
        const icon = document.querySelector('#btn-volume-toggle i');
        fill.style.width = `${this.state.volume * 100}%`;
        
        if (this.state.volume === 0) icon.className = 'fas fa-volume-mute';
        else if (this.state.volume < 0.5) icon.className = 'fas fa-volume-down';
        else icon.className = 'fas fa-volume-up';
    }

    // --- State Handlers ---

    createPlaylist() {
        const name = prompt("Enter playlist name:", `My Playlist #${this.state.playlists.length + 1}`);
        if (!name) return;

        const newPlaylist = {
            id: Date.now(),
            name: name,
            songs: []
        };

        this.state.playlists.push(newPlaylist);
        this.saveState();
        this.renderPlaylists();
        this.showToast(`Playlist "${name}" created!`);
    }

    renderPlaylists() {
        const list = document.getElementById('sidebar-playlists');
        list.innerHTML = this.state.playlists.map(pl => `
            <li class="playlist-item" onclick="app.showPlaylist(${pl.id})">${pl.name}</li>
        `).join('') + `
            <li class="playlist-item" style="color: var(--primary-color); font-weight:700" onclick="app.createPlaylist()">+ New Playlist</li>
        `;
    }

    showPlaylist(id) {
        const playlist = this.state.playlists.find(p => p.id === id);
        if (!playlist) return;
        this.showToast(`Loading playlist: ${playlist.name}`);
        // Render playlist logic would go here
    }

    toggleShuffle(btn) {
        this.state.isShuffle = !this.state.isShuffle;
        btn.classList.toggle('active', this.state.isShuffle);
        this.showToast(this.state.isShuffle ? "Shuffle On" : "Shuffle Off");
        this.saveState();
    }

    toggleRepeat(btn) {
        this.state.isRepeat = (this.state.isRepeat + 1) % 3;
        this.updateRepeatUI();
        const labels = ["Repeat Off", "Repeat All", "Repeat One"];
        this.showToast(labels[this.state.isRepeat]);
        this.saveState();
    }

    updateRepeatUI() {
        const btn = document.getElementById('btn-repeat');
        const icon = btn.querySelector('i');
        btn.classList.toggle('active', this.state.isRepeat > 0);
        icon.className = this.state.isRepeat === 2 ? 'fas fa-redo-alt' : 'fas fa-redo';
    }

    toggleLike(id) {
        const index = this.state.likedSongs.indexOf(id);
        if (index > -1) {
            this.state.likedSongs.splice(index, 1);
            this.showToast("Removed from Liked Songs");
        } else {
            this.state.likedSongs.push(id);
            this.showToast("Added to Liked Songs");
        }
        this.updateTrackUI(CONFIG.SONGS.find(s => s.id === id));
        this.saveState();
    }

    handleSearch(query) {
        const searchView = document.getElementById('search-results-view');
        const homeView = document.getElementById('home-view');
        const searchGrid = document.getElementById('search-grid');
        
        if (!query.trim()) {
            searchView.style.display = 'none';
            homeView.style.display = 'block';
            return;
        }

        const filtered = CONFIG.SONGS.filter(s => 
            s.title.toLowerCase().includes(query.toLowerCase()) || 
            s.artist.toLowerCase().includes(query.toLowerCase())
        );

        homeView.style.display = 'none';
        searchView.style.display = 'block';
        
        if (filtered.length === 0) {
            searchGrid.innerHTML = `<p class="text-sub">No results for "${query}"</p>`;
        } else {
            this.renderGrid('search-grid', filtered, 'card');
        }
    }

    switchView(view) {
        const searchBar = document.getElementById('top-search-bar');
        searchBar.style.display = view === 'search' ? 'block' : 'none';
        // Generic routing logic would go here
    }

    toggleLyrics() {
        const overlay = document.getElementById('lyrics-container');
        overlay.classList.toggle('active');
        if (overlay.classList.contains('active')) {
            const song = CONFIG.SONGS.find(s => s.id === this.state.currentSongId);
            document.getElementById('lyrics-text').innerText = `Lyrics for ${song.title} coming soon...\nEnjoy the vibez by ${song.artist}!`;
        }
    }

    // --- Utilities ---

    formatTime(seconds) {
        if (!seconds) return "0:00";
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    }

    showToast(message) {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerText = message;
        container.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }
}

// Initialize Global App Instance
window.app = new SpotifyApp();
export default window.app;
