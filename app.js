/* ============================
   MusicFlow - app.js
   Full application logic
   ============================ */

'use strict';

// Supabase Auth (set these before deploying)
const SUPABASE_URL = 'https://fiblarscmuhhfotwsaib.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_CV7HHDtJD3iEUjChbRu8og_c--aXMnW';
const supabaseClient = (window.supabase && SUPABASE_URL && SUPABASE_ANON_KEY)
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

// ─── Sample Data ───────────────────────────────────────────────────────────────
const SAMPLE_TRACKS = [
  { id:'t1', title:'Get The Message', artist:'50 Cent', album:'Single', duration:213, genre:'Hip-Hop',
    cover:'https://picsum.photos/seed/t1/300/300', src:'audio/50 Cent - Get The Message(MP3_160K).mp3' },
  { id:'t2', title:'Blow a Bag', artist:'Unknown Artist', album:'Single', duration:187, genre:'Hip-Hop',
    cover:'https://picsum.photos/seed/t2/300/300', src:'audio/Blow a Bag(MP3_160K).mp3' },
  { id:'t3', title:'BROTHER STONE (FEAT. KODAK BLACK)', artist:'Don Toliver', album:'Single', duration:245, genre:'Hip-Hop',
    cover:'https://picsum.photos/seed/t3/300/300', src:'audio/Don Toliver - BROTHER STONE (FEAT. KODAK BLACK) [Official Music Video](MP3_160K).mp3' },
  { id:'t4', title:'Feds Did a Sweep', artist:'Unknown Artist', album:'Single', duration:198, genre:'Hip-Hop',
    cover:'https://picsum.photos/seed/t4/300/300', src:'audio/Feds Did a Sweep(MP3_160K).mp3' },
  { id:'t5', title:'Fly Shit Only', artist:'Unknown Artist', album:'Single', duration:223, genre:'Hip-Hop',
    cover:'https://picsum.photos/seed/t5/300/300', src:'audio/Fly Shit Only(MP3_160K).mp3' },
  { id:'t6', title:'Codeine Crazy', artist:'Future', album:'Single', duration:256, genre:'Hip-Hop',
    cover:'https://picsum.photos/seed/t6/300/300', src:'audio/Future - Codeine Crazy (Audio)(MP3_160K).mp3' },
  { id:'t7', title:'Crushed Up', artist:'Future', album:'Single', duration:201, genre:'Hip-Hop',
    cover:'https://picsum.photos/seed/t7/300/300', src:'audio/Future - Crushed Up (Audio)(MP3_160K).mp3' },
  { id:'t8', title:'Outer Space Bih', artist:'Future', album:'Single', duration:189, genre:'Hip-Hop',
    cover:'https://picsum.photos/seed/t8/300/300', src:'audio/Future - Outer Space Bih (Audio)(MP3_160K).mp3' },
  { id:'t9', title:'Please Tell Me', artist:'Future', album:'Single', duration:211, genre:'Hip-Hop',
    cover:'https://picsum.photos/seed/t9/300/300', src:'audio/Future - Please Tell Me (Audio)(MP3_160K).mp3' },
  { id:'t10', title:'PUFFIN ON ZOOTIEZ', artist:'Future', album:'Single', duration:234, genre:'Hip-Hop',
    cover:'https://picsum.photos/seed/t10/300/300', src:'audio/Future - PUFFIN ON ZOOTIEZ (Official Audio)(MP3_160K).mp3' },
  { id:'t11', title:'DOLLAZ ON MY HEAD (feat. Young Thug)', artist:'Gunna', album:'Single', duration:267, genre:'Hip-Hop',
    cover:'https://picsum.photos/seed/t11/300/300', src:'audio/Gunna - DOLLAZ ON MY HEAD (feat. Young Thug) [Official Video](MP3_160K).mp3' },
  { id:'t12', title:'Lil Haiti Baby', artist:'Unknown Artist', album:'Single', duration:195, genre:'Hip-Hop',
    cover:'https://picsum.photos/seed/t12/300/300', src:'audio/Lil Haiti Baby(MP3_160K).mp3' },
  { id:'t13', title:'Low Life', artist:'Unknown Artist', album:'Single', duration:208, genre:'Hip-Hop',
    cover:'https://picsum.photos/seed/t13/300/300', src:'audio/Low Life(MP3_160K).mp3' },
  { id:'t14', title:'Nights Like This', artist:'Unknown Artist', album:'Single', duration:202, genre:'Hip-Hop',
    cover:'https://picsum.photos/seed/t14/300/300', src:'audio/Nights Like This(MP3_160K).mp3' },
  { id:'t15', title:'TEFLON DON', artist:'Unknown Artist', album:'Single', duration:219, genre:'Hip-Hop',
    cover:'https://picsum.photos/seed/t15/300/300', src:'audio/TEFLON DON(MP3_160K).mp3' },
  { id:'t16', title:'Wicked', artist:'Unknown Artist', album:'Single', duration:207, genre:'Hip-Hop',
    cover:'https://picsum.photos/seed/t16/300/300', src:'audio/Wicked(MP3_160K).mp3' },
];

const GENRES = [
  { name:'Pop', count:124, color:'#f472b6', bg:'#1a0f15' },
  { name:'Rock', count:98, color:'#ef4444', bg:'#1a0a0a' },
  { name:'Hip-Hop', count:87, color:'#f59e0b', bg:'#1a1408' },
  { name:'Electronic', count:76, color:'#6EE7F7', bg:'#081a1c' },
  { name:'Indie', count:65, color:'#a78bfa', bg:'#0f0a1a' },
  { name:'Ambient', count:54, color:'#34d399', bg:'#081a12' },
  { name:'Jazz', count:43, color:'#fb923c', bg:'#1a0f08' },
  { name:'Classical', count:38, color:'#60a5fa', bg:'#080f1a' },
];

// ─── State ─────────────────────────────────────────────────────────────────────
let state = {
  user: null,
  currentTrack: null,
  queue: [],
  queueIndex: -1,
  isPlaying: false,
  isShuffle: false,
  repeatMode: 0, // 0=off, 1=all, 2=one
  volume: 0.8,
  isMuted: false,
  currentView: 'home',
  favorites: new Set(),
  playlists: [],
  localTracks: [],
  recentlyPlayed: [],
  downloads: [],
  allTracks: [...SAMPLE_TRACKS],
  queueTab: 'upnext',
  pendingAddTrack: null,
  guestDownloads: 0,
};

// ─── DOM refs ──────────────────────────────────────────────────────────────────
const $ = id => document.getElementById(id);
const $$ = sel => document.querySelectorAll(sel);

const audio = $('audio-player');

// ─── Utils ─────────────────────────────────────────────────────────────────────
function fmt(s) {
  const m = Math.floor(s / 60), sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2,'0')}`;
}

function save(key, val) {
  try { localStorage.setItem(`mf_${key}`, JSON.stringify(val)); } catch(e) {}
}
function load(key, def) {
  try {
    const v = localStorage.getItem(`mf_${key}`);
    return v !== null ? JSON.parse(v) : def;
  } catch(e) { return def; }
}

function getGuestDownloads() {
  return load('guest_downloads', 0);
}
function setGuestDownloads(count) {
  save('guest_downloads', count);
  state.guestDownloads = count;
}

function showToast(msg, duration=2500) {
  const t = $('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove('show'), duration);
}

function shuffle(arr) {
  const a = [...arr];
  for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}
  return a;
}

function resolveTrackSrc(track) {
  if(track.localSrc) return track.localSrc;
  return track.src ? encodeURI(track.src) : '';
}

async function cacheAudioForOffline(src) {
  if(!('caches' in window)) return;
  try {
    const url = new URL(src, window.location.href);
    if(url.origin !== window.location.origin) return;
    const cache = await caches.open('musicflow-audio-v1');
    const cached = await cache.match(url.href);
    if(cached) return;
    const res = await fetch(url.href);
    if(res.ok) await cache.put(url.href, res.clone());
  } catch(e) {}
}

function makeArtEl(track) {
  const el = document.createElement('div');
  el.className = 'track-thumb';
  if(track.cover && track.localSrc) {
    el.innerHTML = `<img src="${track.localSrc}" alt="">`;
  } else if(track.cover) {
    const img = document.createElement('img');
    img.src = track.cover;
    img.alt = '';
    el.appendChild(img);
  } else {
    el.innerHTML = `<span class="material-icons-round">music_note</span>`;
  }
  return el;
}

// ─── Auth ──────────────────────────────────────────────────────────────────────
function initAuth() {
  // Tabs
  $$('.auth-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      $$('.auth-tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const tab = btn.dataset.tab;
      $('signin-form').classList.toggle('hidden', tab !== 'signin');
      $('signup-form').classList.toggle('hidden', tab !== 'signup');
    });
  });

  const googleBtn = $('btn-google');
  if(googleBtn) {
    googleBtn.addEventListener('click', async () => {
      if(!supabaseClient) return showToast('Supabase is not configured');
      const redirectTo = window.location.origin + window.location.pathname;
      const { error } = await supabaseClient.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo }
      });
      if(error) showToast(error.message || 'Google sign-in failed');
    });
  }

  $('btn-signin').addEventListener('click', async () => {
    const email = $('signin-email').value.trim();
    const pass = $('signin-password').value;
    if(!email || !pass) return showToast('Please fill all fields');
    if(supabaseClient) {
      const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password: pass });
      if(error) return showToast(error.message || 'Sign in failed');
      if(data?.user) loginUser(formatSupabaseUser(data.user));
      return;
    }
    const users = load('users', {});
    if(!users[email] || users[email].password !== pass) return showToast('Invalid credentials');
    loginUser({ name: users[email].name, email });
  });

  $('btn-signup').addEventListener('click', async () => {
    const name = $('signup-name').value.trim();
    const email = $('signup-email').value.trim();
    const pass = $('signup-password').value;
    if(!name || !email || !pass) return showToast('Please fill all fields');
    if(pass.length < 6) return showToast('Password must be 6+ chars');
    if(supabaseClient) {
      const { data, error } = await supabaseClient.auth.signUp({
        email,
        password: pass,
        options: { data: { full_name: name } }
      });
      if(error) return showToast(error.message || 'Sign up failed');
      if(data?.user && data?.session) {
        loginUser(formatSupabaseUser(data.user));
      } else {
        showToast('Check your email to confirm your account');
      }
      return;
    }
    const users = load('users', {});
    if(users[email]) return showToast('Email already registered');
    users[email] = { name, password: pass };
    save('users', users);
    loginUser({ name, email });
  });

  $('btn-guest').addEventListener('click', () => {
    loginUser({ name: 'Guest', email: null, isGuest: true });
  });
}

function formatSupabaseUser(user) {
  const meta = user?.user_metadata || {};
  const name = meta.full_name || meta.name || (user?.email ? user.email.split('@')[0] : 'User');
  return { name, email: user?.email || null, isSupabase: true };
}

async function initSupabaseAuth() {
  if(!supabaseClient) return;
  const { data } = await supabaseClient.auth.getSession();
  if(data?.session?.user) {
    loginUser(formatSupabaseUser(data.session.user));
  }
  supabaseClient.auth.onAuthStateChange((event, session) => {
    if(event === 'SIGNED_IN' && session?.user) {
      loginUser(formatSupabaseUser(session.user));
    }
    if(event === 'SIGNED_OUT' && state.user?.isSupabase) {
      state = { ...state, user: null, currentTrack: null, isPlaying: false };
      audio.pause();
      audio.src = '';
      $('app-shell').classList.add('hidden');
      $('auth-screen').classList.remove('hidden');
      updatePlayerUI();
    }
  });
}

function loginUser(user) {
  state.user = user;
  save('currentUser', user);
  loadUserData();
  if(user?.isGuest) {
    state.guestDownloads = getGuestDownloads();
  } else {
    state.guestDownloads = 0;
  }
  $('auth-screen').classList.add('hidden');
  $('app-shell').classList.remove('hidden');
  initApp();
  applyHashNavigation();
  updateUserUI();
}

function loadUserData() {
  if(!state.user) return;
  const key = state.user.email || 'guest';
  state.favorites = new Set(load(`fav_${key}`, []));
  state.playlists = load(`pl_${key}`, []);
  state.recentlyPlayed = load(`recent_${key}`, []);
  state.localTracks = load(`local_${key}`, []);
  state.downloads = load(`dl_${key}`, []);
  state.allTracks = [...SAMPLE_TRACKS, ...state.localTracks];
}

function saveUserData() {
  if(!state.user) return;
  const key = state.user.email || 'guest';
  save(`fav_${key}`, [...state.favorites]);
  save(`pl_${key}`, state.playlists);
  save(`recent_${key}`, state.recentlyPlayed);
  save(`local_${key}`, state.localTracks);
  save(`dl_${key}`, state.downloads);
}

function updateUserUI() {
  const u = state.user;
  const initial = (u.name || 'G')[0].toUpperCase();
  $('sidebar-avatar').textContent = initial;
  $('sidebar-name').textContent = u.name || 'Guest';
}

$('btn-signout').addEventListener('click', async () => {
  saveUserData();
  if(supabaseClient && state.user?.isSupabase) {
    await supabaseClient.auth.signOut();
    return;
  }
  state = { ...state, user: null, currentTrack: null, isPlaying: false };
  audio.pause();
  audio.src = '';
  $('app-shell').classList.add('hidden');
  $('auth-screen').classList.remove('hidden');
  updatePlayerUI();
});

// ─── App Init ──────────────────────────────────────────────────────────────────
function initApp() {
  renderSidebarPlaylists();
  renderHome();
  renderDiscover();
  renderLibrary();
  renderPlaylists();
  renderFavorites();
  renderDownloads();
  renderLocalFiles();

  // Greet by time
  const h = new Date().getHours();
  const greeting = h < 12 ? 'Good morning!' : h < 18 ? 'Good afternoon!' : 'Good evening!';
  $('hero-greeting').textContent = `Welcome, ${state.user.name || 'Music Lover'}!`;
}

function applyHashNavigation() {
  const hash = (window.location.hash || '').replace('#', '').trim();
  if(!hash) return;
  const allowed = new Set(['home', 'discover', 'library', 'local', 'playlists', 'favorites', 'downloads', 'search']);
  if(allowed.has(hash)) {
    navigateTo(hash);
  }
}

// ─── Navigation ────────────────────────────────────────────────────────────────
function navigateTo(view) {
  $$('.view').forEach(v => v.classList.remove('active'));
  $$('.nav-item').forEach(n => n.classList.remove('active'));
  const viewEl = $(`${view}-view`);
  if(viewEl) {
    viewEl.classList.add('active');
    state.currentView = view;
  }
  const navEl = document.querySelector(`.nav-item[data-view="${view}"]`);
  if(navEl) navEl.classList.add('active');
  // close mobile sidebar
  $('sidebar').classList.remove('open');
  $('sidebar-overlay').classList.remove('open');
}

document.addEventListener('click', e => {
  const navItem = e.target.closest('[data-view]');
  if(navItem) {
    e.preventDefault();
    navigateTo(navItem.dataset.view);
  }
});

// Mobile sidebar toggle
$('btn-menu-toggle').addEventListener('click', () => {
  $('sidebar').classList.toggle('open');
  $('sidebar-overlay') && $('sidebar-overlay').classList.toggle('open');
});

// Create sidebar overlay
const overlay = document.createElement('div');
overlay.className = 'sidebar-overlay';
overlay.id = 'sidebar-overlay';
document.body.appendChild(overlay);
overlay.addEventListener('click', () => {
  $('sidebar').classList.remove('open');
  overlay.classList.remove('open');
});

// ─── Render Home ────────────────────────────────────────────────────────────────
function renderHome() {
  // Recently played
  const rp = $('recently-played');
  const rpTracks = state.recentlyPlayed.slice(0, 8).map(id => state.allTracks.find(t => t.id === id)).filter(Boolean);
  rp.innerHTML = '';
  if(rpTracks.length === 0) {
    const fallback = shuffle(SAMPLE_TRACKS).slice(0,6);
    fallback.forEach(t => rp.appendChild(makeCard(t)));
  } else {
    rpTracks.forEach(t => rp.appendChild(makeCard(t)));
  }

  // Trending
  const trending = $('trending-songs');
  trending.innerHTML = '';
  shuffle(SAMPLE_TRACKS).slice(0,6).forEach((t,i) => {
    trending.appendChild(makeTrackItem(t, i+1, SAMPLE_TRACKS));
  });

  // Made for you
  const mfy = $('made-for-you');
  mfy.innerHTML = '';
  const genres = ['Chill Vibes', 'Focus Flow', 'Workout Hits', 'Late Night', 'Feel Good'];
  genres.forEach((g,i) => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <div class="card-art" style="background:${GENRES[i%GENRES.length].bg}">
        <span class="material-icons-round">queue_music</span>
        <div class="card-play"><span class="material-icons-round">play_circle</span></div>
      </div>
      <div class="card-name">${g}</div>
      <div class="card-sub">Curated Mix</div>`;
    card.addEventListener('click', () => {
      const tracks = shuffle(SAMPLE_TRACKS).slice(0,8);
      playQueue(tracks, 0);
      showToast(`Playing ${g}`);
    });
    mfy.appendChild(card);
  });
}

function makeCard(track) {
  const card = document.createElement('div');
  card.className = 'card';
  card.innerHTML = `
    <div class="card-art">
      <img src="${track.cover || ''}" alt="" onerror="this.parentElement.innerHTML='<span class=\\'material-icons-round\\'>music_note</span>'">
      <div class="card-play"><span class="material-icons-round">play_circle</span></div>
    </div>
    <div class="card-name">${track.title}</div>
    <div class="card-sub">${track.artist}</div>`;
  card.addEventListener('click', () => playTrack(track));
  return card;
}

function makeTrackItem(track, num, context) {
  const isPlaying = state.currentTrack?.id === track.id && state.isPlaying;
  const isFav = state.favorites.has(track.id);
  const div = document.createElement('div');
  div.className = `track-item${isPlaying ? ' playing' : ''}`;
  div.dataset.id = track.id;

  if(isPlaying) {
    div.innerHTML = `
      <div class="track-num">
        <div class="eq-bars">
          <div class="eq-bar"></div><div class="eq-bar"></div><div class="eq-bar"></div>
        </div>
      </div>`;
  } else {
    div.innerHTML = `
      <div class="track-num">${num || ''}</div>
      <button class="track-play-btn"><span class="material-icons-round">play_arrow</span></button>`;
  }

  const thumb = makeArtEl(track);
  div.appendChild(thumb);

  const info = document.createElement('div');
  info.className = 'track-info';
  info.innerHTML = `<div class="track-name">${track.title}</div><div class="track-meta">${track.artist} - ${track.album || ''}</div>`;
  div.appendChild(info);

  div.innerHTML += `
    <span class="track-duration">${fmt(track.duration || 0)}</span>
    <div class="track-actions">
      <button class="btn-like-sm ${isFav ? 'liked' : ''}" data-id="${track.id}" title="${isFav ? 'Unlike' : 'Like'}">
        <span class="material-icons-round">${isFav ? 'favorite' : 'favorite_border'}</span>
      </button>
      <button class="btn-track-action" data-action="download" data-id="${track.id}" title="Download">
        <span class="material-icons-round">download</span>
      </button>
      <button class="btn-track-action" data-action="add-playlist" data-id="${track.id}" title="Add to playlist">
        <span class="material-icons-round">playlist_add</span>
      </button>
    </div>`;

  // Re-append info after thumb
  const existingInfo = div.querySelector('.track-info');
  if(!existingInfo) div.appendChild(info);

  div.addEventListener('click', (e) => {
    if(e.target.closest('.btn-like-sm, .btn-track-action')) return;
    if(context && context.length) {
      const idx = context.findIndex(t => t.id === track.id);
      playQueue(context, idx >= 0 ? idx : 0);
    } else {
      playTrack(track);
    }
  });

  div.querySelector('.btn-like-sm')?.addEventListener('click', e => {
    e.stopPropagation();
    toggleFavorite(track.id);
    renderFavorites();
    // update icon in place
    const btn = e.currentTarget;
    const isFavNow = state.favorites.has(track.id);
    btn.classList.toggle('liked', isFavNow);
    btn.querySelector('.material-icons-round').textContent = isFavNow ? 'favorite' : 'favorite_border';
  });

  div.querySelector('[data-action="download"]')?.addEventListener('click', e => {
    e.stopPropagation();
    downloadTrack(track);
  });

  div.querySelector('[data-action="add-playlist"]')?.addEventListener('click', e => {
    e.stopPropagation();
    openAddToPlaylist(track);
  });

  return div;
}

// ─── Render Discover ──────────────────────────────────────────────────────────
function renderDiscover() {
  const gg = $('genre-grid');
  gg.innerHTML = '';
  GENRES.forEach(g => {
    const card = document.createElement('div');
    card.className = 'genre-card';
    card.style.cssText = `background:${g.bg};border:1px solid ${g.color}33`;
    card.innerHTML = `
      <span class="genre-name" style="color:${g.color}">${g.name}</span>
      <span class="genre-count">${g.count} songs</span>`;
    card.addEventListener('click', () => {
      const tracks = SAMPLE_TRACKS.filter(t => t.genre === g.name);
      if(tracks.length) { playQueue(tracks, 0); showToast(`Playing ${g.name}`); }
      else showToast(`No ${g.name} tracks in demo`);
    });
    gg.appendChild(card);
  });

  // New Releases
  const nr = $('new-releases');
  nr.innerHTML = '';
  shuffle(SAMPLE_TRACKS).slice(0,6).forEach(t => nr.appendChild(makeCard(t)));

  // Popular Playlists
  const pp = $('popular-playlists');
  pp.innerHTML = '';
  ['Top Hits 2025','Chill Beats','Power Workout','Late Night Drive','Indie Gold','Deep Focus']
    .forEach((name,i) => {
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <div class="card-art" style="background:${GENRES[i%GENRES.length].bg}">
          <span class="material-icons-round">queue_music</span>
          <div class="card-play"><span class="material-icons-round">play_circle</span></div>
        </div>
        <div class="card-name">${name}</div>
        <div class="card-sub">Various Artists</div>`;
      card.addEventListener('click', () => { playQueue(shuffle(SAMPLE_TRACKS).slice(0,8), 0); showToast(`Playing ${name}`); });
      pp.appendChild(card);
    });
}

// ─── Render Library ───────────────────────────────────────────────────────────
function renderLibrary() {
  const list = $('library-list');
  list.innerHTML = '';
  const all = [...state.allTracks];
  all.forEach((t,i) => list.appendChild(makeTrackItem(t, i+1, all)));
}

// ─── Render Playlists ─────────────────────────────────────────────────────────
function renderPlaylists() {
  const grid = $('playlists-grid');
  grid.innerHTML = '';
  if(state.playlists.length === 0) {
    grid.innerHTML = `<div style="grid-column:1/-1;padding:40px;text-align:center;color:var(--text3)">
      <span class="material-icons-round" style="font-size:48px">library_music</span>
      <p style="margin-top:10px">No playlists yet. Create one!</p>
    </div>`;
    return;
  }
  state.playlists.forEach(pl => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <div class="card-art" style="background:var(--bg3)">
        <span class="material-icons-round">queue_music</span>
        <div class="card-play"><span class="material-icons-round">play_circle</span></div>
      </div>
      <div class="card-name">${pl.name}</div>
      <div class="card-sub">${pl.tracks.length} songs</div>`;
    card.addEventListener('click', () => {
      const tracks = pl.tracks.map(id => state.allTracks.find(t => t.id === id)).filter(Boolean);
      if(tracks.length) playQueue(tracks, 0);
      else showToast('Playlist is empty');
    });
    grid.appendChild(card);
  });
}

function renderSidebarPlaylists() {
  const el = $('sidebar-playlists');
  el.innerHTML = '';
  state.playlists.forEach(pl => {
    const div = document.createElement('div');
    div.className = 'pl-sidebar-item';
    div.innerHTML = `<span class="material-icons-round">queue_music</span><span>${pl.name}</span>`;
    div.addEventListener('click', () => navigateTo('playlists'));
    el.appendChild(div);
  });
}

// ─── Render Favorites ─────────────────────────────────────────────────────────
function renderFavorites() {
  const list = $('favorites-list');
  list.innerHTML = '';
  const favTracks = state.allTracks.filter(t => state.favorites.has(t.id));
  $('fav-count').textContent = `${favTracks.length} song${favTracks.length !== 1 ? 's' : ''}`;
  if(favTracks.length === 0) {
    list.innerHTML = `<div style="padding:40px;text-align:center;color:var(--text3)">
      <span class="material-icons-round" style="font-size:48px">favorite_border</span>
      <p style="margin-top:10px">Songs you like will appear here</p>
    </div>`;
    return;
  }
  favTracks.forEach((t,i) => list.appendChild(makeTrackItem(t, i+1, favTracks)));
}

function renderDownloads() {
  const list = $('downloads-list');
  const countEl = $('downloads-count');
  if(!list) return;
  list.innerHTML = '';

  const ids = state.downloads || [];
  const tracks = ids.map(id => state.allTracks.find(t => t.id === id)).filter(Boolean);
  if(countEl) countEl.textContent = `${tracks.length} track${tracks.length === 1 ? '' : 's'}`;

  if(!tracks.length) {
    list.innerHTML = `<div style="padding:40px;text-align:center;color:var(--text3)">No downloads yet</div>`;
    return;
  }
  tracks.forEach((t,i) => list.appendChild(makeTrackItem(t, i+1, tracks)));
}

// ─── Render Local Files ───────────────────────────────────────────────────────
function renderLocalFiles() {
  const localSection = $('local-section');
  const localList = $('local-list');
  localList.innerHTML = '';
  if(state.localTracks.length > 0) {
    localSection.style.display = 'block';
    $('local-count').textContent = state.localTracks.length;
    state.localTracks.forEach((t,i) => localList.appendChild(makeTrackItem(t, i+1, state.localTracks)));
  } else {
    localSection.style.display = 'none';
  }
}

// ─── Local File Upload ────────────────────────────────────────────────────────
const dropZone = $('drop-zone');
const fileInput = $('file-input');

dropZone.addEventListener('click', () => fileInput.click());
$('btn-browse').addEventListener('click', e => { e.stopPropagation(); fileInput.click(); });

dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('drag-over'); });
dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
dropZone.addEventListener('drop', e => {
  e.preventDefault();
  dropZone.classList.remove('drag-over');
  handleFiles(e.dataTransfer.files);
});

fileInput.addEventListener('change', () => handleFiles(fileInput.files));

function handleFiles(files) {
  let added = 0;
  Array.from(files).forEach(file => {
    if(!file.type.startsWith('audio/')) return;
    const url = URL.createObjectURL(file);
    const id = 'local_' + Date.now() + '_' + Math.random().toString(36).slice(2);
    const track = {
      id, title: file.name.replace(/\.[^.]+$/, ''), artist: 'Unknown Artist',
      album: 'Local', duration: 0, genre: 'Local',
      cover: '', src: '', localSrc: url, isLocal: true,
    };
    // Try to read duration
    const tmpAudio = new Audio(url);
    tmpAudio.addEventListener('loadedmetadata', () => {
      track.duration = tmpAudio.duration;
      renderLocalFiles();
    });
    state.localTracks.push(track);
    state.allTracks.push(track);
    added++;
  });
  if(added > 0) {
    saveUserData();
    renderLocalFiles();
    showToast(`Added ${added} file${added !== 1 ? 's' : ''}`);
  }
}

// ─── Playback ─────────────────────────────────────────────────────────────────
function playTrack(track) {
  const idx = state.queue.findIndex(t => t.id === track.id);
  if(idx === -1) {
    state.queue = [track];
    state.queueIndex = 0;
  } else {
    state.queueIndex = idx;
  }
  startTrack();
}

function playQueue(tracks, startIdx) {
  state.queue = [...tracks];
  state.queueIndex = startIdx;
  startTrack();
}

function startTrack() {
  const track = state.queue[state.queueIndex];
  if(!track) return;
  state.currentTrack = track;
  state.isPlaying = true;

  const src = resolveTrackSrc(track);
  if(src) {
    audio.src = src;
    audio.play().catch(() => {});
  } else {
    // Demo mode: no real audio source
    audio.src = '';
    state.isPlaying = true;
  }

  // Track recent
  state.recentlyPlayed = [track.id, ...state.recentlyPlayed.filter(id => id !== track.id)].slice(0,20);
  saveUserData();

  updatePlayerUI();
  updateFSP();
  renderQueuePanel();
  highlightPlayingTrack();
}

function togglePlay() {
  if(!state.currentTrack) {
    playQueue(shuffle(SAMPLE_TRACKS), 0);
    return;
  }
  if(audio.src) {
    if(state.isPlaying) { audio.pause(); state.isPlaying = false; }
    else { audio.play().catch(() => {}); state.isPlaying = true; }
  } else {
    state.isPlaying = !state.isPlaying;
  }
  updatePlayerUI();
  updateFSP();
}

function prevTrack() {
  if(audio.currentTime > 3) { audio.currentTime = 0; return; }
  if(state.isShuffle) { state.queueIndex = Math.floor(Math.random() * state.queue.length); }
  else { state.queueIndex = (state.queueIndex - 1 + state.queue.length) % state.queue.length; }
  startTrack();
}

function nextTrack() {
  if(state.repeatMode === 2) { audio.currentTime = 0; audio.play().catch(()=>{}); return; }
  if(state.isShuffle) { state.queueIndex = Math.floor(Math.random() * state.queue.length); }
  else { state.queueIndex = (state.queueIndex + 1) % state.queue.length; }
  if(state.queueIndex === 0 && state.repeatMode === 0 && !state.isShuffle) {
    state.isPlaying = false; updatePlayerUI(); return;
  }
  startTrack();
}

// Audio events
audio.addEventListener('ended', nextTrack);
audio.addEventListener('timeupdate', () => {
  if(!audio.duration) return;
  const pct = (audio.currentTime / audio.duration) * 100;
  $('progress-fill').style.width = `${pct}%`;
  $('progress-thumb').style.left = `${pct}%`;
  $('current-time').textContent = fmt(audio.currentTime);
  $('fsp-current').textContent = fmt(audio.currentTime);
  $('fsp-progress-fill').style.width = `${pct}%`;
});
audio.addEventListener('loadedmetadata', () => {
  $('total-duration').textContent = fmt(audio.duration);
  $('fsp-total').textContent = fmt(audio.duration);
});
audio.addEventListener('play', () => { state.isPlaying = true; updatePlayerUI(); updateFSP(); });
audio.addEventListener('pause', () => { state.isPlaying = false; updatePlayerUI(); updateFSP(); });

// Controls
$('btn-play-pause').addEventListener('click', togglePlay);
$('btn-prev').addEventListener('click', prevTrack);
$('btn-next').addEventListener('click', nextTrack);

$('btn-shuffle').addEventListener('click', () => {
  state.isShuffle = !state.isShuffle;
  $('btn-shuffle').classList.toggle('active', state.isShuffle);
  showToast(state.isShuffle ? 'Shuffle on' : 'Shuffle off');
});

$('btn-repeat').addEventListener('click', () => {
  state.repeatMode = (state.repeatMode + 1) % 3;
  const btn = $('btn-repeat');
  btn.classList.toggle('active', state.repeatMode > 0);
  btn.querySelector('.material-icons-round').textContent = state.repeatMode === 2 ? 'repeat_one' : 'repeat';
  showToast(['Repeat off','Repeat all','Repeat one'][state.repeatMode]);
});

// Progress seek
$('progress-bar').addEventListener('click', e => {
  const rect = $('progress-bar').getBoundingClientRect();
  const pct = (e.clientX - rect.left) / rect.width;
  if(audio.duration) { audio.currentTime = pct * audio.duration; }
});

// Volume
$('volume-slider').addEventListener('input', e => {
  state.volume = e.target.value / 100;
  audio.volume = state.volume;
  state.isMuted = state.volume === 0;
  updateVolumeIcon();
});
$('btn-volume').addEventListener('click', () => {
  state.isMuted = !state.isMuted;
  audio.volume = state.isMuted ? 0 : state.volume;
  updateVolumeIcon();
});
function updateVolumeIcon() {
  const icon = $('volume-icon');
  if(state.isMuted || state.volume === 0) icon.textContent = 'volume_off';
  else if(state.volume < 0.5) icon.textContent = 'volume_down';
  else icon.textContent = 'volume_up';
}

// Like from player
$('btn-like-player').addEventListener('click', () => {
  if(!state.currentTrack) return;
  toggleFavorite(state.currentTrack.id);
  updateLikeButtons();
  renderFavorites();
});

function toggleFavorite(id) {
  if(state.favorites.has(id)) { state.favorites.delete(id); showToast('Removed from Liked Songs'); }
  else { state.favorites.add(id); showToast('Added to Liked Songs ♥'); }
  saveUserData();
  updateLikeButtons();
}

function updateLikeButtons() {
  const id = state.currentTrack?.id;
  const liked = id && state.favorites.has(id);
  const playerIcon = $('like-icon-player');
  const fspIcon = $('like-icon-fsp');
  if(playerIcon) {
    playerIcon.textContent = liked ? 'favorite' : 'favorite_border';
    $('btn-like-player').classList.toggle('liked', liked);
  }
  if(fspIcon) {
    fspIcon.textContent = liked ? 'favorite' : 'favorite_border';
    $('btn-like-fsp').classList.toggle('liked', liked);
  }
}

function updatePlayerUI() {
  const t = state.currentTrack;
  $('player-title').textContent = t ? t.title : 'No track playing';
  $('player-artist').textContent = t ? t.artist : '-';

  const artEl = $('player-art');
  if(t && (t.cover || t.localSrc)) {
    artEl.innerHTML = `<img src="${t.localSrc || t.cover}" alt="" onerror="this.parentElement.innerHTML='<span class=\\'material-icons-round\\'>music_note</span>'">`;
  } else {
    artEl.innerHTML = `<span class="material-icons-round">music_note</span>`;
  }

  const playBtn = $('btn-play-pause');
  $('play-icon').textContent = state.isPlaying ? 'pause' : 'play_arrow';
  playBtn.classList.toggle('playing', state.isPlaying);

  updateLikeButtons();
}

function highlightPlayingTrack() {
  $$('.track-item').forEach(el => {
    el.classList.toggle('playing', el.dataset.id === state.currentTrack?.id);
  });
}

// ─── Fullscreen Player ────────────────────────────────────────────────────────
$('btn-expand').addEventListener('click', openFSP);
document.addEventListener('click', e => { if(e.target.closest('#btn-collapse')) closeFSP(); });

function openFSP() {
  $('fullscreen-player').classList.add('open');
  updateFSP();
}
function closeFSP() {
  $('fullscreen-player').classList.remove('open');
}

function updateFSP() {
  const t = state.currentTrack;
  $('fsp-title').textContent = t ? t.title : 'No track';
  $('fsp-artist').textContent = t ? t.artist : '-';
  const src = t ? (t.localSrc || t.cover || '') : '';
  $('fsp-art').src = src;
  $('fsp-bg').style.backgroundImage = src ? `url(${src})` : '';
  $('fsp-art-glow').style.background = src ? 'radial-gradient(circle, rgba(110,231,247,0.4), transparent 70%)' : '';
  $('fsp-play-icon').textContent = state.isPlaying ? 'pause' : 'play_arrow';
  updateLikeButtons();
}

$('btn-fsp-play').addEventListener('click', togglePlay);
$('btn-fsp-prev').addEventListener('click', prevTrack);
$('btn-fsp-next').addEventListener('click', nextTrack);
$('btn-fsp-shuffle').addEventListener('click', () => $('btn-shuffle').click());
$('btn-fsp-repeat').addEventListener('click', () => $('btn-repeat').click());
$('btn-like-fsp').addEventListener('click', () => $('btn-like-player').click());
$('btn-fsp-download').addEventListener('click', () => { if(state.currentTrack) downloadTrack(state.currentTrack); });
$('btn-fsp-addplaylist').addEventListener('click', () => { if(state.currentTrack) openAddToPlaylist(state.currentTrack); });
$('btn-fsp-queue').addEventListener('click', () => { closeFSP(); toggleQueue(); });

$('fsp-progress-bar').addEventListener('click', e => {
  const rect = $('fsp-progress-bar').getBoundingClientRect();
  const pct = (e.clientX - rect.left) / rect.width;
  if(audio.duration) audio.currentTime = pct * audio.duration;
});

$('btn-fsp-more').addEventListener('click', () => {
  if(state.currentTrack) showToast('Options coming soon!');
});

// Hero play
$('hero-play-btn').addEventListener('click', () => playQueue(shuffle(SAMPLE_TRACKS), 0));
$('btn-play-favorites').addEventListener('click', () => {
  const favTracks = state.allTracks.filter(t => state.favorites.has(t.id));
  if(favTracks.length) playQueue(favTracks, 0);
  else showToast('No favorites yet');
});

// ─── Queue Panel ───────────────────────────────────────────────────────────────
$('btn-queue').addEventListener('click', toggleQueue);
$('btn-close-queue').addEventListener('click', () => $('queue-panel').classList.remove('open'));

function toggleQueue() {
  $('queue-panel').classList.toggle('open');
  renderQueuePanel();
}

$$('.qtab').forEach(btn => {
  btn.addEventListener('click', () => {
    $$('.qtab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    state.queueTab = btn.dataset.qtab;
    renderQueuePanel();
  });
});

function renderQueuePanel() {
  const body = $('queue-body');
  body.innerHTML = '';
  let tracks = [];

  if(state.queueTab === 'upnext') {
    tracks = state.queue.slice(state.queueIndex + 1);
    if(!tracks.length) {
      body.innerHTML = `<div style="padding:32px;text-align:center;color:var(--text3)">Queue is empty</div>`;
      return;
    }
  } else {
    const ids = state.recentlyPlayed.slice(0,20);
    tracks = ids.map(id => state.allTracks.find(t => t.id === id)).filter(Boolean);
    if(!tracks.length) {
      body.innerHTML = `<div style="padding:32px;text-align:center;color:var(--text3)">Nothing played yet</div>`;
      return;
    }
  }

  tracks.forEach(t => {
    const item = document.createElement('div');
    const isPlaying = state.currentTrack?.id === t.id;
    item.className = `queue-item${isPlaying ? ' playing' : ''}`;
    item.innerHTML = `
      <div class="queue-thumb">
        <img src="${t.cover || ''}" alt="" onerror="this.innerHTML='<span class=\\'material-icons-round\\'>music_note</span>'">
      </div>
      <div class="queue-info">
        <div class="queue-name">${t.title}</div>
        <div class="queue-artist">${t.artist}</div>
      </div>`;
    item.addEventListener('click', () => {
      playTrack(t);
      $('queue-panel').classList.remove('open');
    });
    body.appendChild(item);
  });
}

// ─── Download ─────────────────────────────────────────────────────────────────
function downloadTrack(track) {
  if(state.user?.isGuest && state.guestDownloads >= 4) {
    showToast('Sign in to download more tracks');
    return;
  }
  const src = resolveTrackSrc(track);
  if(src) {
    const a = document.createElement('a');
    a.href = src;
    a.download = `${track.title}.mp3`;
    a.rel = 'noopener';
    a.click();
    showToast(`Downloading "${track.title}"`);
    if(!state.downloads.includes(track.id)) {
      state.downloads.unshift(track.id);
      saveUserData();
      renderDownloads();
    }
    cacheAudioForOffline(src);
    if(state.user?.isGuest) {
      setGuestDownloads(state.guestDownloads + 1);
      if(state.guestDownloads >= 4) {
        showToast('Guest download limit reached. Please sign in.');
      }
    }
    return;
  }

  // For demo tracks (no real audio), create a text file as placeholder
  // In a real app, this would download the actual audio file
  showToast(`⬇️ Saving "${track.title}" to your device…`);

  // Simulate download with track info
  const meta = `Title: ${track.title}\nArtist: ${track.artist}\nAlbum: ${track.album}\n\nNote: Connect to a real audio source to download.`;
  const blob = new Blob([meta], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${track.title} - ${track.artist}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

$('btn-download-player').addEventListener('click', () => {
  if(state.currentTrack) downloadTrack(state.currentTrack);
});

// ─── Playlists ─────────────────────────────────────────────────────────────────
$('btn-new-playlist').addEventListener('click', openPlaylistModal);
$('btn-create-playlist-header').addEventListener('click', openPlaylistModal);
$('btn-close-modal').addEventListener('click', closePlaylistModal);
$('btn-cancel-pl').addEventListener('click', closePlaylistModal);
$('modal-backdrop') && $('modal-backdrop').addEventListener('click', closePlaylistModal);

$('playlist-modal').querySelector('.modal-backdrop').addEventListener('click', closePlaylistModal);

$('btn-confirm-pl').addEventListener('click', () => {
  const name = $('pl-name').value.trim();
  if(!name) return showToast('Enter a playlist name');
  const pl = { id: 'pl_' + Date.now(), name, description: $('pl-desc').value.trim(), tracks: [] };
  state.playlists.push(pl);
  saveUserData();
  renderPlaylists();
  renderSidebarPlaylists();
  closePlaylistModal();
  showToast(`Playlist "${name}" created`);
});

function openPlaylistModal() {
  $('pl-name').value = '';
  $('pl-desc').value = '';
  $('playlist-modal').classList.add('open');
  setTimeout(() => $('pl-name').focus(), 100);
}
function closePlaylistModal() { $('playlist-modal').classList.remove('open'); }

// Add to playlist
$('btn-close-atp-modal').addEventListener('click', () => $('add-to-playlist-modal').classList.remove('open'));
$('add-to-playlist-modal').querySelector('.modal-backdrop').addEventListener('click', () => $('add-to-playlist-modal').classList.remove('open'));

function openAddToPlaylist(track) {
  state.pendingAddTrack = track;
  const list = $('atp-playlist-list');
  list.innerHTML = '';
  if(!state.playlists.length) {
    list.innerHTML = `<div style="padding:20px;text-align:center;color:var(--text3)">No playlists yet.<br><button onclick="openPlaylistModal()" style="color:var(--accent);background:none;border:none;cursor:pointer;margin-top:8px">Create one</button></div>`;
  } else {
    state.playlists.forEach(pl => {
      const item = document.createElement('div');
      item.className = 'atp-pl-item';
      const already = pl.tracks.includes(track.id);
      item.innerHTML = `
        <span class="material-icons-round">${already ? 'check_circle' : 'queue_music'}</span>
        <span class="atp-pl-name">${pl.name}</span>
        <span style="margin-left:auto;font-size:12px;color:var(--text3)">${pl.tracks.length} songs</span>`;
      item.addEventListener('click', () => {
        if(!pl.tracks.includes(track.id)) {
          pl.tracks.push(track.id);
          saveUserData();
          renderPlaylists();
          showToast(`Added to "${pl.name}"`);
        } else {
          showToast(`Already in "${pl.name}"`);
        }
        $('add-to-playlist-modal').classList.remove('open');
      });
      list.appendChild(item);
    });
  }
  $('add-to-playlist-modal').classList.add('open');
}

// ─── Search ───────────────────────────────────────────────────────────────────
const searchInput = $('search-input');
let searchTimer;
searchInput.addEventListener('input', () => {
  const q = searchInput.value.trim();
  $('btn-clear-search').style.display = q ? 'flex' : 'none';
  clearTimeout(searchTimer);
  if(q.length > 1) {
    searchTimer = setTimeout(() => performSearch(q), 200);
  } else if(!q) {
    navigateTo(state.currentView === 'search' ? 'home' : state.currentView);
  }
});

$('btn-clear-search').addEventListener('click', () => {
  searchInput.value = '';
  $('btn-clear-search').style.display = 'none';
  if(state.currentView === 'search') navigateTo('home');
});

function performSearch(query) {
  const q = query.toLowerCase();
  const results = state.allTracks.filter(t =>
    t.title.toLowerCase().includes(q) ||
    t.artist.toLowerCase().includes(q) ||
    (t.album || '').toLowerCase().includes(q)
  );
  const list = $('search-results');
  list.innerHTML = '';
  if(!results.length) {
    list.innerHTML = `<div style="padding:40px;text-align:center;color:var(--text3)">No results for "${query}"</div>`;
  } else {
    results.forEach((t,i) => list.appendChild(makeTrackItem(t, i+1, results)));
  }
  navigateTo('search');
}

// ─── Library Tabs ─────────────────────────────────────────────────────────────
$$('.lib-tab').forEach(btn => {
  btn.addEventListener('click', () => {
    $$('.lib-tab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const tab = btn.dataset.lib;
    const list = $('library-list');
    list.innerHTML = '';
    let tracks = state.allTracks;
    if(tab === 'albums') {
      const albums = [...new Set(tracks.map(t => t.album))].filter(Boolean);
      albums.forEach(al => {
        const alTracks = tracks.filter(t => t.album === al);
        const div = document.createElement('div');
        div.innerHTML = `<h3 style="font-family:'Syne',sans-serif;font-size:14px;font-weight:700;padding:12px 10px 6px;color:var(--text2)">${al}</h3>`;
        list.appendChild(div);
        alTracks.forEach((t,i) => list.appendChild(makeTrackItem(t, i+1, alTracks)));
      });
      return;
    }
    if(tab === 'artists') {
      const artists = [...new Set(tracks.map(t => t.artist))].filter(Boolean);
      artists.forEach(ar => {
        const arTracks = tracks.filter(t => t.artist === ar);
        const div = document.createElement('div');
        div.innerHTML = `<h3 style="font-family:'Syne',sans-serif;font-size:14px;font-weight:700;padding:12px 10px 6px;color:var(--text2)">${ar}</h3>`;
        list.appendChild(div);
        arTracks.forEach((t,i) => list.appendChild(makeTrackItem(t, i+1, arTracks)));
      });
      return;
    }
    tracks.forEach((t,i) => list.appendChild(makeTrackItem(t, i+1, tracks)));
  });
});

// ─── PWA / Service Worker ─────────────────────────────────────────────────────
if('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js', { scope: './' })
      .then(() => console.log('SW registered'))
      .catch(e => console.log('SW failed:', e));
  });
}

// ─── Boot ─────────────────────────────────────────────────────────────────────
(function boot() {
  initAuth();
  audio.volume = state.volume;

  // Check existing session
  if(supabaseClient) {
    initSupabaseAuth();
  } else {
    const saved = load('currentUser', null);
    if(saved) {
      loginUser(saved);
    }
  }
})();
