/**
 * Spotify Elite - Real Cloud Music Distribution System (v5.0)
 * Backend: Firebase (Real-time DB + Cloud Storage)
 */

// --- REAL CLOUD CONFIGURATION ---
// USER: Replace this placeholder config with your actual Firebase project settings!
const FIREBASE_CONFIG = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};

const DEFAULT_CATALOG = [
    { id: 'c1', title: "Unakaga", artist: "Hiphop Tamizha", url: "https://res.cloudinary.com/dbti5mn9s/video/upload/v1778167774/Unakaga-MassTamilan.io_wjkdim.mp3", img: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=400" },
    { id: 'c2', title: "Oorum Blood", artist: "Vijay Antony", url: "https://res.cloudinary.com/dbti5mn9s/video/upload/v1778167772/Oorum_Blood_siljcw.mp3", img: "https://images.unsplash.com/photo-1493225255756-d9584f8606e9?w=400" },
    { id: 'c3', title: "Pavazha Malli", artist: "Sean Roldan", url: "https://res.cloudinary.com/dbti5mn9s/video/upload/v1778167770/Pavazha_Malli_hmefj1.mp3", img: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400" },
    { id: 'c4', title: "Yumabaibesa", artist: "Sid Sriram", url: "https://res.cloudinary.com/dbti5mn9s/video/upload/v1778167769/Yumabaibesa_xnnluj.mp3", img: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400" },
    { id: 'c5', title: "Blud Is On His Way", artist: "Trend Boys", url: "https://res.cloudinary.com/dbti5mn9s/video/upload/v1778167769/Blud_Is_On_His_Way_zleano.mp3", img: "https://images.unsplash.com/photo-1459749411177-042180ce673f?w=400" }
];

class FirebaseBackend {
    constructor() {
        this.db = null;
        this.storage = null;
        this.active = false;
        this.onLibraryUpdate = null;
    }

    async init() {
        try {
            if (FIREBASE_CONFIG.apiKey === "YOUR_API_KEY") {
                console.warn("Firebase config missing. Running in Simulation Mode.");
                return false;
            }
            firebase.initializeApp(FIREBASE_CONFIG);
            this.db = firebase.firestore();
            this.storage = firebase.storage();
            this.active = true;
            this.listenToLibrary();
            return true;
        } catch (e) {
            console.error("Firebase Init Failed:", e);
            return false;
        }
    }

    listenToLibrary() {
        if (!this.active) return;
        this.db.collection('songs').orderBy('timestamp', 'desc')
            .onSnapshot(snap => {
                const songs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                if (this.onLibraryUpdate) this.onLibraryUpdate(songs);
            }, err => console.error("Snapshot Error:", err));
    }

    async uploadToCloud(file, metadata, onProgress) {
        if (!this.active) return null;
        
        const ref = this.storage.ref(`songs/${Date.now()}_${file.name}`);
        const task = ref.put(file);
        
        return new Promise((resolve, reject) => {
            task.on('state_changed', 
                (s) => onProgress(Math.round((s.bytesTransferred / s.totalBytes) * 100)),
                (e) => reject(e),
                async () => {
                    const downloadURL = await task.snapshot.ref.getDownloadURL();
                    const doc = await this.db.collection('songs').add({
                        title: metadata.title,
                        artist: metadata.artist,
                        url: downloadURL,
                        img: metadata.img,
                        duration: metadata.duration,
                        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                        uploadedBy: "Global Streaming User"
                    });
                    resolve(doc.id);
                }
            );
        });
    }
}

class SpotifyCloudPlayer {
    constructor() {
        this.cloud = new FirebaseBackend();
        this.catalog = [...DEFAULT_CATALOG];
        this.userCollection = [];
        this.isPlaying = false;
        
        this.init();
    }

    async init() {
        this.state = this.loadPersistentState();
        this.audio = document.getElementById('main-audio');
        
        const isCloudReady = await this.cloud.init();
        const statusEl = document.getElementById('cloud-status');
        if (statusEl) {
            statusEl.classList.toggle('active', isCloudReady);
            statusEl.querySelector('span').innerText = isCloudReady ? "Global Sync Active" : "Local Dev Mode";
        }

        this.cloud.onLibraryUpdate = (songs) => {
            this.userCollection = songs;
            this.syncAndRender();
            this.showToast("⚡ Global Library Synced");
        };

        this.setupListeners();
        this.syncAndRender();
        this.applyState();
        
        setTimeout(() => this.hideLoader(), 1500);
    }

    loadPersistentState() {
        const s = localStorage.getItem('spotify_cloud_v5');
        return s ? JSON.parse(s) : { trackId: 'c1', vol: 0.7, likes: [] };
    }

    saveState() {
        localStorage.setItem('spotify_cloud_v5', JSON.stringify(this.state));
    }

    hideLoader() {
        const l = document.getElementById('loader');
        if (l) { l.style.opacity = '0'; setTimeout(() => l.remove(), 500); }
    }

    syncAndRender() {
        this.catalog = [...DEFAULT_CATALOG, ...this.userCollection];
        this.render();
    }

    setupListeners() {
        const bind = (id, fn) => document.getElementById(id)?.addEventListener('click', fn);
        
        bind('btn-play-pause', () => this.toggle());
        bind('btn-next', () => this.next());
        bind('btn-prev', () => this.prev());
        bind('btn-like-track', () => this.toggleLike(this.state.trackId));
        bind('btn-add-local-songs', () => document.getElementById('local-file-input')?.click());

        document.getElementById('local-file-input')?.addEventListener('change', (e) => this.handleUpload(e.target.files));
        document.getElementById('global-search')?.addEventListener('input', (e) => this.search(e.target.value));
        document.getElementById('seek-bar')?.addEventListener('click', (e) => this.seek(e));
        document.getElementById('volume-bar')?.addEventListener('click', (e) => this.setVol(e));

        document.querySelectorAll('.nav-item').forEach(btn => {
            btn.onclick = (e) => {
                e.preventDefault();
                this.nav(btn.dataset.view);
                document.querySelector('.nav-item.active')?.classList.remove('active');
                btn.classList.add('active');
            };
        });

        this.audio.onplay = () => this.onPlayerSync(true);
        this.audio.onpause = () => this.onPlayerSync(false);
        this.audio.ontimeupdate = () => this.updateTapes();
        this.audio.onended = () => this.next();
        
        window.onclick = () => this.unlockAudio();
    }

    async handleUpload(files) {
        if (!files.length) return;
        
        if (!this.cloud.active) {
            this.showToast("⚠️ Cloud Unconfigured! Local simulation only.");
            this.simulateLocalUpload(files);
            return;
        }

        for (const file of files) {
            if (!file.type.startsWith('audio/')) continue;
            
            const metadata = {
                title: file.name.replace(/\.[^/.]+$/, ""),
                artist: "Cloud Sync Artist",
                img: `https://images.unsplash.com/photo-${Math.floor(Math.random()*1000)}?w=400&music=true`,
                duration: 0
            };

            try {
                this.showToast("🚀 Uploading to Global Cloud...");
                await this.cloud.uploadToCloud(file, metadata, (progress) => {
                    if (progress % 10 === 0) this.showToast(`Syncing: ${progress}%`);
                });
            } catch (err) {
                this.showToast("❌ Cloud Storage Error");
            }
        }
    }

    simulateLocalUpload(files) {
        for(const f of files) {
            const newItem = { 
                id: `loc_${Date.now()}_${Math.random()}`, 
                title: f.name, 
                artist: 'Offline Track', 
                img: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400', 
                url: '#' 
            };
            this.userCollection.push(newItem);
        }
        this.syncAndRender();
        this.showToast("✅ Cached Locally (Offline)");
    }

    async play(id, auto = true) {
        const song = this.catalog.find(s => s.id == id) || this.catalog[0];
        if (!song) return;

        this.state.trackId = song.id;
        this.showToast("🛰️ Connecting Stream...");
        this.audio.src = song.url;
        
        if (auto) this.audio.play().catch(() => this.showToast("🔇 Browser blocked autoplay"));
        this.updatePlayerUI(song);
        this.saveState();
    }

    toggle() {
        if (!this.audio.src) this.play(this.state.trackId);
        this.audio.paused ? this.audio.play() : this.audio.pause();
    }

    next() {
        const i = this.catalog.findIndex(s => s.id == this.state.trackId);
        this.play(this.catalog[(i + 1) % this.catalog.length].id);
    }

    prev() {
        if (this.audio.currentTime > 5) { this.audio.currentTime = 0; return; }
        const i = this.catalog.findIndex(s => s.id == this.state.trackId);
        const pIdx = (i - 1 + this.catalog.length) % this.catalog.length;
        this.play(this.catalog[pIdx].id);
    }

    render() {
        this.renderGrid('recents-grid', this.catalog.slice(0, 6), 'small');
        this.renderGrid('recommendations-grid', [...this.catalog].sort(() => 0.5 - Math.random()), 'card');
        this.renderGrid('recently-played-grid', [...this.catalog].reverse(), 'card');
        
        const count = document.getElementById('collection-count');
        if (count) count.innerText = this.userCollection.length;
        
        this.renderListView('collection-list', this.userCollection);
        this.renderListView('liked-songs-list', this.catalog.filter(s => this.state.likes.includes(s.id)));
    }

    renderGrid(id, data, type) {
        const el = document.getElementById(id);
        if (!el) return;
        el.innerHTML = (data || []).map(s => `
            <div class="${type === 'small' ? 'recent-item' : 'card'} ${s.id == this.state.trackId ? 'playing' : ''}" data-id="${s.id}" onclick="elite.play('${s.id}')">
                <img src="${s.img}" loading="lazy">
                <div class="${type === 'small' ? 'play-btn-sm' : 'play-btn-circle'}"><i class="fas fa-play"></i></div>
                ${type === 'small' ? `<span>${s.title}</span>` : `<h4>${s.title}</h4><p>${s.artist}</p>`}
            </div>
        `).join('');
    }

    renderListView(id, data) {
        const el = document.getElementById(id);
        if (!el) return;
        if (!data.length) { 
            el.innerHTML = '<div class="empty-state"><p>No songs found in this collection.</p></div>'; 
            return; 
        }
        el.innerHTML = data.map((s, i) => `
            <div class="row ${s.id == this.state.trackId ? 'playing' : ''}" onclick="elite.play('${s.id}')">
                <span class="num">${i+1}</span>
                <img src="${s.img}" class="row-img">
                <div class="row-info">
                    <div class="row-name">${s.title}</div>
                    <div class="row-artist">${s.artist}</div>
                </div>
                <span class="row-like"><i class="fas fa-heart" ${this.state.likes.includes(s.id) ? 'style="color:var(--primary-color)"' : 'style="color:transparent"'}></i></span>
            </div>
        `).join('');
    }

    nav(view) {
        document.querySelectorAll('.view-section').forEach(s => s.style.display = 'none');
        const t = document.getElementById(`${view}-view`) || document.getElementById('home-view');
        t.style.display = 'block';
        
        const bar = document.getElementById('top-search-bar');
        if (bar) {
            bar.style.visibility = (view === 'search' ? 'visible' : 'hidden');
            bar.style.opacity = (view === 'search' ? '1' : '0');
            if (view === 'search') document.getElementById('global-search')?.focus();
        }
    }

    search(q) {
        if (!q.trim()) { this.nav('home'); return; }
        const res = this.catalog.filter(s => s.title.toLowerCase().includes(q.toLowerCase()) || s.artist.toLowerCase().includes(q.toLowerCase()));
        this.nav('search');
        this.renderGrid('search-grid', res, 'card');
    }

    onPlayerSync(playing) {
        this.isPlaying = playing;
        const btn = document.querySelector('#btn-play-pause i');
        if (btn) btn.className = playing ? 'fas fa-pause' : 'fas fa-play';
        document.querySelectorAll('.card, .row, .recent-item').forEach(el => {
            el.classList.toggle('playing', el.dataset.id == this.state.trackId);
        });
    }

    updatePlayerUI(s) {
        if (!s) return;
        document.getElementById('track-art').src = s.img;
        document.getElementById('track-title').innerText = s.title;
        document.getElementById('track-artist').innerText = s.artist;
        document.title = `${this.isPlaying ? '▶' : ''} ${s.title} • Elite Cloud`;
    }

    updateTapes() {
        if (!this.audio.duration) return;
        const p = (this.audio.currentTime / this.audio.duration) * 100;
        document.getElementById('seek-fill').style.width = `${p}%`;
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
        document.getElementById('volume-fill').style.width = `${this.state.vol * 100}%`;
        this.saveState();
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
        t.className = 'toast';
        t.innerText = m;
        c.appendChild(t);
        setTimeout(() => {
            t.style.opacity = '0';
            setTimeout(() => t.remove(), 500);
        }, 3000);
    }

    toggleLike(id) {
        const idx = this.state.likes.indexOf(id);
        if (idx > -1) this.state.likes.splice(idx, 1);
        else this.state.likes.push(id);
        this.render();
        this.saveState();
    }

    applyState() {
        const fill = document.getElementById('volume-fill');
        if (fill) fill.style.width = `${this.state.vol * 100}%`;
        this.audio.volume = this.state.vol;
        this.updatePlayerUI(this.catalog.find(s => s.id == this.state.trackId));
    }

    unlockAudio() {
        if (!this.ctx) {
            try { this.ctx = new AudioContext(); } catch(e) {}
        }
    }
}

window.addEventListener('load', () => { window.elite = new SpotifyCloudPlayer(); });
