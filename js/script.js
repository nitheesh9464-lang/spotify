/**
 * Spotify Elite - Cloud Streaming Architecture Simulation
 * Version: 4.0 Pro
 */

const CLOUD_CONFIG = {
    DB_NAME: 'MusicCloudData',
    STORE_NAME: 'cloud_library',
    VOL: 0.7,
    CATALOG: [
        { id: 'c1', title: "Unakaga", artist: "Hiphop Tamizha", url: "https://res.cloudinary.com/dbti5mn9s/video/upload/v1778167774/Unakaga-MassTamilan.io_wjkdim.mp3", img: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=400", genre: 'Pop' },
        { id: 'c2', title: "Oorum Blood", artist: "Vijay Antony", url: "https://res.cloudinary.com/dbti5mn9s/video/upload/v1778167772/Oorum_Blood_siljcw.mp3", img: "https://images.unsplash.com/photo-1493225255756-d9584f8606e9?w=400", genre: 'Rock' },
        { id: 'c3', title: "Pavazha Malli", artist: "Sean Roldan", url: "https://res.cloudinary.com/dbti5mn9s/video/upload/v1778167770/Pavazha_Malli_hmefj1.mp3", img: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400", genre: 'Acoustic' },
        { id: 'c4', title: "Yumabaibesa", artist: "Sid Sriram", url: "https://res.cloudinary.com/dbti5mn9s/video/upload/v1778167769/Yumabaibesa_xnnluj.mp3", img: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400", genre: 'Soul' },
        { id: 'c5', title: "Naan Konjam Karuppu", artist: "Hiphop Tamizha", url: "https://res.cloudinary.com/dbti5mn9s/video/upload/v1778167764/Naan-Konjam-Karuppu_gbxnc1.mp3", img: "https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=400", genre: 'Hip-Hop' }
    ]
};

// --- MusicLibraryAPI (Fake Backend) ---
const cloudLibraryAPI = {
    db: null,
    async connect() {
        return new Promise((resolve) => {
            const req = indexedDB.open(CLOUD_CONFIG.DB_NAME, 1);
            req.onupgradeneeded = (e) => e.target.result.createObjectStore(CLOUD_CONFIG.STORE_NAME, { keyPath: 'id' });
            req.onsuccess = (e) => { this.db = e.target.result; resolve(); };
        });
    },
    async syncTrack(track) {
        if (!this.db) return;
        const tx = this.db.transaction(CLOUD_CONFIG.STORE_NAME, 'readwrite');
        await tx.objectStore(CLOUD_CONFIG.STORE_NAME).put(track);
    },
    async fetchAll() {
        if (!this.db) return [];
        return new Promise((resolve) => {
            const req = this.db.transaction(CLOUD_CONFIG.STORE_NAME, 'readonly').objectStore(CLOUD_CONFIG.STORE_NAME).getAll();
            req.onsuccess = () => resolve(req.result || []);
        });
    },
    async getStream(id) {
        if (!this.db) return null;
        return new Promise((resolve) => {
            const req = this.db.transaction(CLOUD_CONFIG.STORE_NAME, 'readonly').objectStore(CLOUD_CONFIG.STORE_NAME).get(id);
            req.onsuccess = () => resolve(req.result?.blob);
        });
    }
};

class SpotifyWebPlayer {
    constructor() {
        this.fullCatalog = [...CLOUD_CONFIG.CATALOG];
        this.userCollection = [];
        this.isPlaying = false;
        this.isBuffering = false;
        
        this.init();
        setTimeout(() => this.hideLoader(), 2500);
    }

    async init() {
        try {
            this.state = this.restoreState();
            await cloudLibraryAPI.connect();
            await this.refreshUserCollection();
            
            this.audio = document.getElementById('main-audio');
            this.initEventListeners();
            this.render();
            this.syncState();
            
            setTimeout(() => this.hideLoader(), 800);
        } catch (e) {
            console.error("Cloud System Error:", e);
            this.hideLoader();
        }
    }

    restoreState() {
        const s = localStorage.getItem('spotify_pro_v4');
        return s ? JSON.parse(s) : { trackId: 'c1', vol: 0.7, likes: [], shuffle: false, repeat: 0 };
    }

    save() {
        localStorage.setItem('spotify_pro_v4', JSON.stringify(this.state));
    }

    async refreshUserCollection() {
        const cloudTracks = await cloudLibraryAPI.fetchAll();
        this.userCollection = cloudTracks.map(t => ({
            id: t.id, title: t.title, artist: t.artist, duration: t.duration,
            img: t.img || `https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=400&sig=${t.id}`,
            isCloud: true
        }));
        this.fullCatalog = [...CLOUD_CONFIG.CATALOG, ...this.userCollection];
    }

    hideLoader() {
        const l = document.getElementById('loader');
        if (l) { l.style.opacity = '0'; setTimeout(() => l.remove(), 500); }
    }

    // --- Search Engine Fixed ---
    handleSearch(q) {
        const searchInput = document.getElementById('global-search');
        if (searchInput) searchInput.focus();

        if (!q || !q.trim()) {
            this.navTo('home');
            return;
        }

        const results = this.fullCatalog.filter(s => 
            s.title.toLowerCase().includes(q.toLowerCase()) || 
            s.artist.toLowerCase().includes(q.toLowerCase())
        );

        this.navTo('search');
        this.renderGrid('search-grid', results, 'standard');
    }

    initEventListeners() {
        const bind = (id, fn) => document.getElementById(id)?.addEventListener('click', fn);
        
        bind('btn-play-pause', () => this.toggle());
        bind('btn-next', () => this.next());
        bind('btn-prev', () => this.prev());
        bind('btn-shuffle', (e) => this.toggleShuffle(e.currentTarget));
        bind('btn-repeat', (e) => this.toggleRepeat(e.currentTarget));
        bind('btn-like-track', () => this.toggleLike(this.state.trackId));
        bind('btn-add-local-songs', () => document.getElementById('local-file-input')?.click());

        document.getElementById('local-file-input')?.addEventListener('change', (e) => this.upload(e.target.files));
        document.getElementById('global-search')?.addEventListener('input', (e) => this.handleSearch(e.target.value));
        document.getElementById('seek-bar')?.addEventListener('click', (e) => this.seek(e));
        document.getElementById('volume-bar')?.addEventListener('click', (e) => this.setVol(e));

        document.querySelectorAll('.nav-item').forEach(item => {
            item.onclick = (e) => {
                e.preventDefault();
                const view = item.dataset.view;
                this.navTo(view);
                document.querySelector('.nav-item.active')?.classList.remove('active');
                item.classList.add('active');
            };
        });

        this.audio.onplay = () => this.onPlayerToggle(true);
        this.audio.onpause = () => this.onPlayerToggle(false);
        this.audio.ontimeupdate = () => this.updateTape();
        this.audio.onended = () => this.autoNext();
        
        window.onclick = () => this.initEQ();
    }

    async upload(files) {
        if (!files.length) return;
        this.showToast("☁️ Syncing your library to cloud...");

        for (const file of files) {
            if (!file.type.startsWith('audio/')) continue;
            const trackId = `cloud_res_${Math.random().toString(36).substr(2, 5)}`;
            const track = {
                id: trackId,
                title: file.name.replace(/\.[^/.]+$/, ""),
                artist: "Cloud Artist",
                blob: file,
                img: `https://images.unsplash.com/photo-${Math.floor(Math.random()*1000)}?w=400&music=true`
            };
            await cloudLibraryAPI.syncTrack(track);
        }

        await this.refreshUserCollection();
        this.render();
        this.showToast("✅ Library Synced successfully!");
    }

    async play(id, auto = true) {
        const song = this.fullCatalog.find(s => s.id == id) || this.fullCatalog[0];
        if (!song) return;

        this.state.trackId = song.id;
        this.isBuffering = true;
        this.showToast("🛰️ Fetching stream...");

        // Fake Cloud Latency
        await new Promise(r => setTimeout(r, 400));

        if (song.isCloud) {
            const blob = await cloudLibraryAPI.getStream(id);
            if (this.streamUrl) URL.revokeObjectURL(this.streamUrl);
            this.streamUrl = URL.createObjectURL(blob);
            this.audio.src = this.streamUrl;
        } else {
            this.audio.src = song.url;
        }

        this.isBuffering = false;
        if (auto) this.audio.play().catch(() => {});
        this.updateUI(song);
        this.save();
    }

    toggle() {
        if (!this.audio.src) this.play(this.state.trackId);
        this.audio.paused ? this.audio.play() : this.audio.pause();
    }

    next() {
        const i = this.fullCatalog.findIndex(s => s.id == this.state.trackId);
        const nextIdx = this.state.shuffle ? Math.floor(Math.random() * this.fullCatalog.length) : (i + 1) % this.fullCatalog.length;
        this.play(this.fullCatalog[nextIdx].id);
    }

    prev() {
        if (this.audio.currentTime > 5) { this.audio.currentTime = 0; return; }
        const i = this.fullCatalog.findIndex(s => s.id == this.state.trackId);
        const pIdx = (i - 1 + this.fullCatalog.length) % this.fullCatalog.length;
        this.play(this.fullCatalog[pIdx].id);
    }

    autoNext() {
        if (this.state.repeat === 2) { this.audio.currentTime = 0; this.audio.play(); }
        else this.next();
    }

    // --- Render System ---
    render() {
        this.renderGrid('recents-grid', this.fullCatalog.slice(0, 6), 'small');
        this.renderGrid('recommendations-grid', [...this.fullCatalog].sort(() => 0.5 - Math.random()).slice(0, 8), 'standard');
        this.renderGrid('recently-played-grid', [...this.fullCatalog].reverse().slice(0, 8), 'standard');
        
        const countEl = document.getElementById('collection-count');
        if (countEl) countEl.innerText = this.userCollection.length;
        
        this.renderCollectionView();
        this.renderLikes();
    }

    renderGrid(id, data, type) {
        const el = document.getElementById(id);
        if (!el) return;
        el.innerHTML = (data || []).map(s => `
            <div class="${type === 'small' ? 'recent-item' : 'card'} ${s.id == this.state.trackId ? 'playing' : ''}" data-id="${s.id}" onclick="window.elite.play('${s.id}')">
                <img src="${s.img}" loading="lazy">
                <div class="${type === 'small' ? 'play-btn-sm' : 'play-btn-circle'}"><i class="fas fa-play"></i></div>
                ${type === 'small' ? `<span>${s.title}</span>` : `<h4>${s.title}</h4><p>${s.artist}</p>`}
            </div>
        `).join('');
    }

    renderCollectionView() {
        const el = document.getElementById('collection-list');
        if (!el) return;
        if (!this.userCollection.length) {
            el.innerHTML = `<div class="empty-state"><i class="fas fa-cloud-upload-alt"></i><p>Your library is empty. Sync some music!</p></div>`;
            return;
        }
        el.innerHTML = this.userCollection.map((s, i) => this.rowHTML(s, i)).join('');
    }

    renderLikes() {
        const el = document.getElementById('liked-songs-list');
        const songs = this.fullCatalog.filter(s => this.state.likes.includes(s.id));
        const count = document.getElementById('liked-count');
        if (count) count.innerText = songs.length;
        if (!el) return;
        el.innerHTML = songs.map((s, i) => this.rowHTML(s, i, true)).join('');
    }

    rowHTML(s, i, isLiked = false) {
        return `
            <div class="row ${s.id == this.state.trackId ? 'playing' : ''}" onclick="window.elite.play('${s.id}')">
                <span class="num">${i+1}</span>
                <img src="${s.img}" class="row-img">
                <div class="row-info">
                    <div class="row-name">${s.title}</div>
                    <div class="row-artist">${s.artist}</div>
                </div>
                <span class="row-like"><i class="fas fa-heart" style="color: ${isLiked || this.state.likes.includes(s.id) ? 'var(--primary-color)' : 'transparent'}"></i></span>
            </div>
        `;
    }

    navTo(v) {
        document.querySelectorAll('.view-section').forEach(s => s.style.display = 'none');
        const target = document.getElementById(`${v}-view`) || document.getElementById('home-view');
        target.style.display = 'block';
        
        const sb = document.getElementById('top-search-bar');
        if (sb) {
            sb.style.visibility = (v === 'search' ? 'visible' : 'hidden');
            sb.style.opacity = (v === 'search' ? '1' : '0');
            if (v === 'search') document.getElementById('global-search')?.focus();
        }
    }

    // --- UX Sync ---
    onPlayerToggle(playing) {
        this.isPlaying = playing;
        const icon = document.querySelector('#btn-play-pause i');
        if (icon) icon.className = playing ? 'fas fa-pause' : 'fas fa-play';
        document.getElementById('mini-equalizer')?.classList.toggle('active', playing);
        
        document.querySelectorAll('.card, .recent-item, .row').forEach(el => {
            el.classList.toggle('playing', el.dataset.id == this.state.trackId);
        });
    }

    updateUI(s) {
        if (!s) return;
        document.getElementById('track-art').src = s.img;
        document.getElementById('track-title').innerText = s.title;
        document.getElementById('track-artist').innerText = s.artist;
        document.title = `${this.isPlaying ? '▶' : ''} ${s.title} • ${s.artist}`;
        
        const isLiked = this.state.likes.includes(s.id);
        const icon = document.querySelector('#btn-like-track i');
        if (icon) {
            icon.className = isLiked ? 'fas fa-heart' : 'far fa-heart';
            icon.style.color = isLiked ? '#1DB954' : 'white';
        }
    }

    updateTape() {
        if (!this.audio.duration) return;
        const p = (this.audio.currentTime / this.audio.duration) * 100;
        const fill = document.getElementById('seek-fill');
        if (fill) fill.style.width = `${p}%`;
        document.getElementById('current-time').innerText = this.fmt(this.audio.currentTime);
        document.getElementById('total-time').innerText = this.fmt(this.audio.duration);
    }

    seek(e) {
        const r = document.getElementById('seek-bar').getBoundingClientRect();
        this.audio.currentTime = ((e.clientX - r.left) / r.width) * this.audio.duration;
    }

    setVol(e) {
        const r = document.getElementById('volume-bar').getBoundingClientRect();
        this.state.vol = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));
        this.audio.volume = this.state.vol;
        const fill = document.getElementById('volume-fill');
        if (fill) fill.style.width = `${this.state.vol * 100}%`;
        this.save();
    }

    fmt(s) {
        const m = Math.floor(s/60);
        const r = Math.floor(s%60);
        return `${m}:${r < 10 ? '0' : ''}${r}`;
    }

    showToast(m) {
        const c = document.getElementById('toast-container');
        if (!c) return;
        const t = document.createElement('div');
        t.className = `toast`;
        t.innerText = m;
        c.appendChild(t);
        setTimeout(() => { t.style.opacity = '0'; setTimeout(() => t.remove(), 500); }, 3000);
    }

    syncState() {
        const fill = document.getElementById('volume-fill');
        if (fill) fill.style.width = `${this.state.vol * 100}%`;
        this.audio.volume = this.state.vol;
        if (this.state.shuffle) document.getElementById('btn-shuffle')?.classList.add('active');
        if (this.state.repeat > 0) this.toggleRepeat(document.getElementById('btn-repeat'), true);
        this.updateUI(this.fullCatalog.find(s => s.id == this.state.trackId));
    }

    toggleShuffle(btn) {
        this.state.shuffle = !this.state.shuffle;
        btn?.classList.toggle('active', this.state.shuffle);
        this.save();
    }

    toggleRepeat(btn, skipInc = false) {
        if (!skipInc) this.state.repeat = (this.state.repeat + 1) % 3;
        if (!btn) return;
        btn.classList.toggle('active', this.state.repeat > 0);
        const icon = btn.querySelector('i');
        if (icon) icon.className = (this.state.repeat === 2) ? 'fas fa-redo-alt' : 'fas fa-redo';
        this.save();
    }

    toggleLike(id) {
        const idx = this.state.likes.indexOf(id);
        if (idx > -1) this.state.likes.splice(idx, 1);
        else this.state.likes.push(id);
        this.renderLikes();
        this.updateUI(this.fullCatalog.find(s => s.id == id));
        this.save();
    }

    initEQ() {
        if (this.ctx) return;
        try {
            this.ctx = new AudioContext();
            this.an = this.ctx.createAnalyser();
            const s = this.ctx.createMediaElementSource(this.audio);
            s.connect(this.an);
            this.an.connect(this.ctx.destination);
            this.draw();
        } catch (e) {}
    }

    draw() {
        const c = document.getElementById('mini-viz');
        if (!c) return;
        const ctx = c.getContext('2d');
        const d = new Uint8Array(this.an.frequencyBinCount);
        const run = () => {
            requestAnimationFrame(run);
            this.an.getByteFrequencyData(d);
            ctx.clearRect(0,0,c.width,c.height);
            for(let i=0; i<30; i++) {
                const v = d[i * 3] || 0;
                const h = (v/255)*c.height;
                ctx.fillStyle = '#1DB954';
                ctx.fillRect(i*(c.width/30), c.height-h, (c.width/30)-1, h);
            }
        };
        run();
    }
}

window.addEventListener('load', () => {
    window.elite = new SpotifyWebPlayer();
});
