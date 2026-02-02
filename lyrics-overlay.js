// Lyric Miniplayer - Spicetify Extension
// Creates a floating Picture-in-Picture lyrics window that stays on top of all apps

(async function LyricsOverlay() {
    // Wait for Spicetify to be fully loaded
    while (!Spicetify?.Player?.data || !Spicetify?.Platform || !Spicetify?.CosmosAsync) {
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    // ==================== CONFIG ====================
    const CONFIG = {
        pipWidth: 280,
        pipHeight: 360,
        updateInterval: 100,
        defaultFontSize: 14,
        maxFontSize: 28,
        minFontSize: 10,
    };

    // ==================== THEMES ====================
    const THEMES = {
        spotify: {
            name: 'Spotify',
            emoji: '💚',
            bg: 'linear-gradient(160deg, #0a0a0a 0%, #1a1a2e 40%, #0f0f23 100%)',
            accent: '#1ed760',
            accentHover: '#1fdf64',
            headerBg: 'rgba(0, 0, 0, 0.5)',
            controlsBg: 'rgba(0, 0, 0, 0.35)',
            footerBg: 'rgba(0, 0, 0, 0.45)',
            textGlow: 'rgba(30, 215, 96, 0.3)',
        },
        pink: {
            name: 'Pink Pop',
            emoji: '💖',
            bg: 'linear-gradient(160deg, #1a0a14 0%, #2d1f2b 40%, #1f0f1a 100%)',
            accent: '#ff69b4',
            accentHover: '#ff85c2',
            headerBg: 'rgba(40, 10, 30, 0.6)',
            controlsBg: 'rgba(40, 10, 30, 0.4)',
            footerBg: 'rgba(40, 10, 30, 0.5)',
            textGlow: 'rgba(255, 105, 180, 0.4)',
        },
        kawaii: {
            name: 'Kawaii',
            emoji: '🌸',
            bg: 'linear-gradient(160deg, #2d1f2f 0%, #1f1a2e 40%, #2a1f35 100%)',
            accent: '#ffb7dd',
            accentHover: '#ffc9e5',
            headerBg: 'rgba(50, 30, 50, 0.6)',
            controlsBg: 'rgba(50, 30, 50, 0.4)',
            footerBg: 'rgba(50, 30, 50, 0.5)',
            textGlow: 'rgba(255, 183, 221, 0.4)',
        },
        ocean: {
            name: 'Ocean Blue',
            emoji: '🌊',
            bg: 'linear-gradient(160deg, #0a1628 0%, #0d253f 40%, #0a1a30 100%)',
            accent: '#00bfff',
            accentHover: '#33ccff',
            headerBg: 'rgba(10, 30, 50, 0.6)',
            controlsBg: 'rgba(10, 30, 50, 0.4)',
            footerBg: 'rgba(10, 30, 50, 0.5)',
            textGlow: 'rgba(0, 191, 255, 0.4)',
        },
        racing: {
            name: 'Racing Red',
            emoji: '🏎️',
            bg: 'linear-gradient(160deg, #0a0a0a 0%, #1a0a0a 40%, #150505 100%)',
            accent: '#ff3333',
            accentHover: '#ff5555',
            headerBg: 'rgba(30, 5, 5, 0.7)',
            controlsBg: 'rgba(30, 5, 5, 0.5)',
            footerBg: 'rgba(30, 5, 5, 0.6)',
            textGlow: 'rgba(255, 51, 51, 0.4)',
        },
        sunset: {
            name: 'Sunset',
            emoji: '🌅',
            bg: 'linear-gradient(160deg, #1a0f0a 0%, #2d1a0f 40%, #1f1408 100%)',
            accent: '#ff6b35',
            accentHover: '#ff8555',
            headerBg: 'rgba(40, 20, 10, 0.6)',
            controlsBg: 'rgba(40, 20, 10, 0.4)',
            footerBg: 'rgba(40, 20, 10, 0.5)',
            textGlow: 'rgba(255, 107, 53, 0.4)',
        },
        purple: {
            name: 'Galaxy',
            emoji: '🔮',
            bg: 'linear-gradient(160deg, #0f0a1a 0%, #1a1030 40%, #150d25 100%)',
            accent: '#a855f7',
            accentHover: '#b975f9',
            headerBg: 'rgba(25, 15, 40, 0.6)',
            controlsBg: 'rgba(25, 15, 40, 0.4)',
            footerBg: 'rgba(25, 15, 40, 0.5)',
            textGlow: 'rgba(168, 85, 247, 0.4)',
        },
        mint: {
            name: 'Mint Fresh',
            emoji: '🍃',
            bg: 'linear-gradient(160deg, #0a1a14 0%, #0f2a20 40%, #081810 100%)',
            accent: '#2dd4bf',
            accentHover: '#4ee0cd',
            headerBg: 'rgba(10, 35, 28, 0.6)',
            controlsBg: 'rgba(10, 35, 28, 0.4)',
            footerBg: 'rgba(10, 35, 28, 0.5)',
            textGlow: 'rgba(45, 212, 191, 0.4)',
        },
        gold: {
            name: 'Luxury Gold',
            emoji: '👑',
            bg: 'linear-gradient(160deg, #0f0d08 0%, #1a1508 40%, #12100a 100%)',
            accent: '#fbbf24',
            accentHover: '#fcd34d',
            headerBg: 'rgba(30, 25, 15, 0.6)',
            controlsBg: 'rgba(30, 25, 15, 0.4)',
            footerBg: 'rgba(30, 25, 15, 0.5)',
            textGlow: 'rgba(251, 191, 36, 0.4)',
        },
        cyberpunk: {
            name: 'Cyberpunk',
            emoji: '🤖',
            bg: 'linear-gradient(160deg, #0a0a12 0%, #12081f 40%, #0f0a18 100%)',
            accent: '#f0f',
            accentHover: '#ff44ff',
            headerBg: 'rgba(20, 10, 35, 0.7)',
            controlsBg: 'rgba(20, 10, 35, 0.5)',
            footerBg: 'rgba(20, 10, 35, 0.6)',
            textGlow: 'rgba(255, 0, 255, 0.5)',
        },
        snow: {
            name: 'Frost',
            emoji: '❄️',
            bg: 'linear-gradient(160deg, #0d1520 0%, #1a2535 40%, #0f1825 100%)',
            accent: '#7dd3fc',
            accentHover: '#a5e1fd',
            headerBg: 'rgba(15, 25, 40, 0.6)',
            controlsBg: 'rgba(15, 25, 40, 0.4)',
            footerBg: 'rgba(15, 25, 40, 0.5)',
            textGlow: 'rgba(125, 211, 252, 0.4)',
        },
        rose: {
            name: 'Rose Gold',
            emoji: '🌹',
            bg: 'linear-gradient(160deg, #1a1015 0%, #251820 40%, #1d1318 100%)',
            accent: '#f43f5e',
            accentHover: '#fb7185',
            headerBg: 'rgba(35, 20, 25, 0.6)',
            controlsBg: 'rgba(35, 20, 25, 0.4)',
            footerBg: 'rgba(35, 20, 25, 0.5)',
            textGlow: 'rgba(244, 63, 94, 0.4)',
        },
    };

    // ==================== STATE ====================
    let pipWindow = null;
    let currentLyrics = null;
    let currentTrackUri = null;
    let updateIntervalId = null;
    let fontSize = CONFIG.defaultFontSize;
    let showFontSlider = true;
    let showVolumeSlider = true;
    let showLyrics = true;
    let showShuffleBtn = true;
    let showLikeBtn = true;
    let showCloseBtn = true;
    let centerLyrics = true;
    let currentTheme = 'spotify';

    // Load saved settings
    try {
        const savedSize = localStorage.getItem('lyrics-overlay-fontsize');
        if (savedSize) fontSize = parseInt(savedSize);
        const savedShowFont = localStorage.getItem('lyrics-overlay-showfont');
        if (savedShowFont !== null) showFontSlider = savedShowFont === 'true';
        const savedShowVol = localStorage.getItem('lyrics-overlay-showvol');
        if (savedShowVol !== null) showVolumeSlider = savedShowVol === 'true';
        const savedShowLyrics = localStorage.getItem('lyrics-overlay-showlyrics');
        if (savedShowLyrics !== null) showLyrics = savedShowLyrics === 'true';
        const savedShowShuffle = localStorage.getItem('lyrics-overlay-showshuffle');
        if (savedShowShuffle !== null) showShuffleBtn = savedShowShuffle === 'true';
        const savedShowLike = localStorage.getItem('lyrics-overlay-showlike');
        if (savedShowLike !== null) showLikeBtn = savedShowLike === 'true';
        const savedShowClose = localStorage.getItem('lyrics-overlay-showclose');
        if (savedShowClose !== null) showCloseBtn = savedShowClose === 'true';
        const savedCenterLyrics = localStorage.getItem('lyrics-overlay-centerlyrics');
        if (savedCenterLyrics !== null) centerLyrics = savedCenterLyrics === 'true';
        const savedTheme = localStorage.getItem('lyrics-overlay-theme');
        if (savedTheme && THEMES[savedTheme]) currentTheme = savedTheme;
    } catch (e) {}

    // ==================== GENERATE CSS WITH THEME ====================
    function generateStyles(theme) {
        const t = THEMES[theme] || THEMES.spotify;
        return `
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&display=swap');
        
        :root {
            --accent: ${t.accent};
            --accent-hover: ${t.accentHover};
            --text-glow: ${t.textGlow};
        }
        
        *, *::before, *::after {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        html, body {
            height: 100%;
            overflow: hidden;
        }

        body {
            font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: ${t.bg};
            color: #ffffff;
            display: flex;
            flex-direction: column;
        }

        /* Resize Handle at Top - Subtle */
        .resize-handle {
            height: 4px;
            cursor: ns-resize;
            flex-shrink: 0;
        }

        .resize-handle:hover {
            background: rgba(255, 255, 255, 0.05);
        }

        /* Header - Draggable */
        .header {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 10px 12px;
            background: ${t.headerBg};
            backdrop-filter: blur(10px);
            border-bottom: 1px solid rgba(255, 255, 255, 0.06);
            flex-shrink: 0;
            cursor: grab;
            user-select: none;
            -webkit-app-region: drag;
            app-region: drag;
        }

        .header:active {
            cursor: grabbing;
        }

        .album-art {
            width: 40px;
            height: 40px;
            border-radius: 6px;
            object-fit: cover;
            box-shadow: 0 3px 10px rgba(0, 0, 0, 0.5);
            flex-shrink: 0;
            -webkit-app-region: no-drag;
            app-region: no-drag;
        }

        .track-info {
            flex: 1;
            min-width: 0;
        }

        .track-title {
            font-size: 12px;
            font-weight: 600;
            color: #fff;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            margin-bottom: 1px;
        }

        .track-artist {
            font-size: 10px;
            font-weight: 400;
            color: rgba(255, 255, 255, 0.55);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        /* Header Buttons */
        .header-btns {
            display: flex;
            align-items: center;
            gap: 2px;
            -webkit-app-region: no-drag;
            app-region: no-drag;
        }

        .menu-btn {
            display: flex;
            flex-direction: column;
            gap: 2px;
            padding: 6px 4px;
            cursor: pointer;
            opacity: 0.4;
            transition: opacity 0.15s;
            background: none;
            border: none;
        }

        .menu-btn:hover {
            opacity: 0.8;
        }

        .menu-row {
            display: flex;
            gap: 2px;
        }

        .menu-dot {
            width: 2px;
            height: 2px;
            background: #fff;
            border-radius: 50%;
        }

        .close-btn {
            background: none;
            border: none;
            color: rgba(255, 255, 255, 0.4);
            font-size: 18px;
            cursor: pointer;
            padding: 4px 6px;
            transition: all 0.15s;
            line-height: 1;
        }

        .close-btn:hover {
            color: #ff5f5f;
        }

        .close-btn.hidden {
            display: none;
        }

        /* Settings Panel - Full Overlay */
        .settings-panel {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(10, 10, 15, 0.98);
            z-index: 1000;
            display: none;
            flex-direction: column;
            -webkit-app-region: no-drag;
            app-region: no-drag;
            overflow-y: auto;
        }

        .settings-panel.open {
            display: flex;
            animation: panelSlide 0.2s ease;
        }

        @keyframes panelSlide {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }

        .settings-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 16px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.08);
            flex-shrink: 0;
        }

        .settings-title {
            font-size: 16px;
            font-weight: 600;
            color: #fff;
        }

        .settings-close {
            background: rgba(255, 255, 255, 0.1);
            border: none;
            color: #fff;
            width: 32px;
            height: 32px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 18px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: background 0.15s;
        }

        .settings-close:hover {
            background: rgba(255, 255, 255, 0.2);
        }

        .settings-content {
            flex: 1;
            padding: 16px;
            overflow-y: auto;
        }

        .menu-section-title {
            font-size: 11px;
            font-weight: 600;
            color: rgba(255, 255, 255, 0.4);
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 12px;
            margin-top: 8px;
        }

        .menu-section-title:first-child {
            margin-top: 0;
        }

        .menu-item {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 12px 14px;
            cursor: pointer;
            transition: background 0.1s;
            background: rgba(255, 255, 255, 0.03);
            border-radius: 10px;
            margin-bottom: 8px;
        }

        .menu-item:hover {
            background: rgba(255, 255, 255, 0.08);
        }

        .menu-item-label {
            font-size: 14px;
            color: rgba(255, 255, 255, 0.85);
        }

        .menu-toggle {
            width: 44px;
            height: 24px;
            background: rgba(255, 255, 255, 0.15);
            border-radius: 12px;
            position: relative;
            transition: background 0.2s;
        }

        .menu-toggle.on {
            background: var(--accent);
        }

        .menu-toggle::after {
            content: '';
            position: absolute;
            top: 3px;
            left: 3px;
            width: 18px;
            height: 18px;
            background: #fff;
            border-radius: 50%;
            transition: transform 0.2s;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
        }

        .menu-toggle.on::after {
            transform: translateX(20px);
        }

        .menu-divider {
            height: 1px;
            background: rgba(255, 255, 255, 0.08);
            margin: 16px 0;
        }

        /* Theme Button */
        .theme-btn {
            display: flex;
            align-items: center;
            gap: 12px;
            width: 100%;
            padding: 12px 14px;
            background: rgba(255, 255, 255, 0.03);
            border: none;
            border-radius: 10px;
            cursor: pointer;
            transition: background 0.15s;
        }

        .theme-btn:hover {
            background: rgba(255, 255, 255, 0.08);
        }

        .theme-btn-preview {
            font-size: 20px;
        }

        .theme-btn-info {
            flex: 1;
            text-align: left;
        }

        .theme-btn-label {
            font-size: 10px;
            color: rgba(255, 255, 255, 0.4);
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .theme-btn-name {
            font-size: 13px;
            font-weight: 500;
            color: #fff;
        }

        .theme-btn-arrow {
            color: rgba(255, 255, 255, 0.4);
            font-size: 18px;
        }

        /* Theme Picker Panel */
        .theme-picker {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(8, 8, 12, 0.98);
            z-index: 1001;
            display: none;
            flex-direction: column;
        }

        .theme-picker.open {
            display: flex;
            animation: panelSlide 0.2s ease;
        }

        .theme-picker-header {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 12px 14px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.08);
            flex-shrink: 0;
        }

        .theme-picker-back {
            background: rgba(255, 255, 255, 0.1);
            border: none;
            color: #fff;
            width: 28px;
            height: 28px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: background 0.15s;
        }

        .theme-picker-back:hover {
            background: rgba(255, 255, 255, 0.2);
        }

        .theme-picker-title {
            font-size: 14px;
            font-weight: 600;
            color: #fff;
        }

        .theme-grid {
            flex: 1;
            overflow-y: auto;
            padding: 10px;
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 8px;
            align-content: start;
        }

        .theme-grid::-webkit-scrollbar { width: 4px; }
        .theme-grid::-webkit-scrollbar-thumb { 
            background: rgba(255, 255, 255, 0.15); 
            border-radius: 2px; 
        }

        .theme-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 4px;
            padding: 10px 4px;
            cursor: pointer;
            transition: all 0.15s;
            font-size: 10px;
            color: rgba(255, 255, 255, 0.6);
            border-radius: 8px;
            background: rgba(255, 255, 255, 0.03);
            border: 2px solid transparent;
        }

        .theme-item:hover {
            background: rgba(255, 255, 255, 0.08);
            color: #fff;
        }

        .theme-item.active {
            background: rgba(255, 255, 255, 0.1);
            border-color: var(--accent);
            color: #fff;
        }

        .theme-emoji { font-size: 20px; }
        .theme-name { 
            font-weight: 500; 
            text-align: center;
            line-height: 1.2;
        }



        /* Controls */
        .controls {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 4px;
            padding: 8px;
            background: ${t.controlsBg};
            flex-shrink: 0;
            -webkit-app-region: no-drag;
            app-region: no-drag;
        }

        .ctrl-btn {
            background: rgba(255, 255, 255, 0.08);
            border: none;
            color: #fff;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.15s ease;
        }

        .ctrl-btn:hover {
            background: rgba(255, 255, 255, 0.15);
            transform: scale(1.05);
        }

        .ctrl-btn:active {
            transform: scale(0.95);
        }

        .ctrl-btn svg {
            width: 14px;
            height: 14px;
            fill: currentColor;
        }

        .ctrl-btn.play-btn {
            width: 38px;
            height: 38px;
            background: var(--accent);
            color: #000;
        }

        .ctrl-btn.play-btn:hover {
            background: var(--accent-hover);
            transform: scale(1.06);
        }

        .ctrl-btn.play-btn svg {
            width: 16px;
            height: 16px;
        }

        .ctrl-btn.shuffle-on {
            color: var(--accent);
        }

        .ctrl-btn.liked {
            color: #1ed760;
        }

        .ctrl-btn.liked svg {
            fill: #1ed760;
        }

        .ctrl-btn.hidden {
            display: none;
        }

        /* Lyrics Container */
        .lyrics-wrap {
            flex: 1 1 auto;
            overflow-y: auto;
            overflow-x: hidden;
            padding: 12px;
            scroll-behavior: smooth;
            -webkit-app-region: no-drag;
            app-region: no-drag;
            min-height: 0;
        }

        .lyrics-wrap.centered {
            text-align: center;
        }

        .lyrics-wrap.centered .lyric {
            transform-origin: center center;
        }

        .lyrics-wrap.collapsed {
            display: none;
        }

        .lyrics-wrap::-webkit-scrollbar {
            width: 4px;
        }

        .lyrics-wrap::-webkit-scrollbar-track {
            background: transparent;
        }

        .lyrics-wrap::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.12);
            border-radius: 2px;
        }

        .lyric {
            padding: 5px 0;
            opacity: 0.3;
            transition: all 0.2s ease;
            cursor: pointer;
            line-height: 1.35;
            transform-origin: left center;
        }

        .lyric:hover {
            opacity: 0.5;
        }

        .lyric.active {
            opacity: 1;
            color: var(--accent);
            font-weight: 500;
            transform: scale(1.02);
            text-shadow: 0 0 20px var(--text-glow);
        }

        .lyric.past {
            opacity: 0.4;
        }

        /* No Lyrics / Loading */
        .status-msg {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100%;
            text-align: center;
            padding: 20px;
            opacity: 0.6;
        }

        .status-msg .icon {
            font-size: 40px;
            margin-bottom: 12px;
        }

        .status-msg .text {
            font-size: 15px;
            font-weight: 500;
        }

        .status-msg .subtext {
            font-size: 12px;
            opacity: 0.6;
            margin-top: 4px;
        }

        .spinner {
            width: 32px;
            height: 32px;
            border: 3px solid rgba(255, 255, 255, 0.1);
            border-top-color: var(--accent);
            border-radius: 50%;
            animation: spin 0.7s linear infinite;
        }

        @keyframes spin {
            to { transform: rotate(360deg); }
        }

        /* Footer */
        .footer {
            background: ${t.footerBg};
            border-top: 1px solid rgba(255, 255, 255, 0.05);
            flex-shrink: 0;
            padding: 8px 10px;
            -webkit-app-region: no-drag;
            app-region: no-drag;
        }

        .footer-row {
            display: flex;
            align-items: center;
            gap: 6px;
            transition: all 0.2s ease;
        }

        .footer-row.collapsed {
            display: none;
        }

        .footer-row + .footer-row:not(.collapsed) {
            margin-top: 6px;
            padding-top: 6px;
            border-top: 1px solid rgba(255, 255, 255, 0.06);
        }

        .control-label {
            font-size: 9px;
            color: rgba(255, 255, 255, 0.4);
            text-transform: uppercase;
            letter-spacing: 0.5px;
            min-width: 24px;
        }

        .slider {
            -webkit-appearance: none;
            flex: 1;
            height: 3px;
            background: rgba(255, 255, 255, 0.15);
            border-radius: 2px;
            outline: none;
        }

        .slider::-webkit-slider-thumb {
            -webkit-appearance: none;
            width: 10px;
            height: 10px;
            background: var(--accent);
            border-radius: 50%;
            cursor: pointer;
            transition: transform 0.1s;
        }

        .slider::-webkit-slider-thumb:hover {
            transform: scale(1.2);
        }

        .volume-icon {
            width: 14px;
            height: 14px;
            fill: rgba(255, 255, 255, 0.5);
            flex-shrink: 0;
            cursor: pointer;
            transition: fill 0.15s;
        }

        .volume-icon:hover {
            fill: #fff;
        }

        .value-display {
            font-size: 10px;
            color: rgba(255, 255, 255, 0.5);
            min-width: 28px;
            text-align: right;
        }
    `;
    }

    // ==================== LYRICS FETCHING ====================
    async function fetchLyrics(trackUri) {
        try {
            const trackId = trackUri.split(':').pop();
            
            // Method 1: Color Lyrics API
            try {
                const response = await Spicetify.CosmosAsync.get(
                    `https://spclient.wg.spotify.com/color-lyrics/v2/track/${trackId}?format=json&market=from_token`
                );
                if (response?.lyrics?.lines) {
                    return {
                        synced: response.lyrics.syncType === 'LINE_SYNCED',
                        lines: response.lyrics.lines.map(line => ({
                            startTime: parseInt(line.startTimeMs),
                            text: line.words || ''
                        }))
                    };
                }
            } catch (e) {}

            // Method 2: Platform Lyrics API
            if (Spicetify.Platform?.Lyrics) {
                try {
                    const lyrics = await Spicetify.Platform.Lyrics.getLyrics(trackUri);
                    if (lyrics?.lines) {
                        return {
                            synced: true,
                            lines: lyrics.lines.map(line => ({
                                startTime: line.startTimeMs || 0,
                                text: line.words || line.text || ''
                            }))
                        };
                    }
                } catch (e) {}
            }

            // Method 3: Legacy endpoint
            try {
                const altResponse = await Spicetify.CosmosAsync.get(
                    `wg://lyrics/v1/track/${trackId}?format=json&market=from_token`
                );
                if (altResponse?.lines) {
                    return {
                        synced: true,
                        lines: altResponse.lines.map(line => ({
                            startTime: parseInt(line.startTimeMs || line.time || 0),
                            text: line.words || line.text || ''
                        }))
                    };
                }
            } catch (e) {}

            return null;
        } catch (error) {
            console.error('[Lyric Miniplayer] Error fetching lyrics:', error);
            return null;
        }
    }

    // ==================== PIP WINDOW CREATION ====================
    async function openPictureInPicture() {
        // Close existing PiP window if open
        if (pipWindow && !pipWindow.closed) {
            pipWindow.close();
            pipWindow = null;
            return;
        }

        // Reset track URI to force fresh lyrics load
        currentTrackUri = null;

        // Check for Document Picture-in-Picture API (Chrome 116+)
        if ('documentPictureInPicture' in window) {
            try {
                pipWindow = await window.documentPictureInPicture.requestWindow({
                    width: CONFIG.pipWidth,
                    height: CONFIG.pipHeight,
                });

                setupPipWindow(pipWindow);
                return;
            } catch (err) {
                console.log('[Lyric Miniplayer] Document PiP failed, trying fallback:', err);
            }
        }

        // Fallback: Regular popup window
        try {
            const left = window.screen.width - CONFIG.pipWidth - 30;
            const top = 30;

            pipWindow = window.open(
                'about:blank',
                'LyricsOverlayPiP',
                `width=${CONFIG.pipWidth},height=${CONFIG.pipHeight},left=${left},top=${top},resizable=yes,scrollbars=no,toolbar=no,menubar=no,location=no,status=no`
            );

            if (pipWindow) {
                setupPipWindow(pipWindow);
            } else {
                Spicetify.showNotification('Could not open lyrics window.', true);
            }
        } catch (err) {
            console.error('[Lyric Miniplayer] Fallback popup failed:', err);
            Spicetify.showNotification('Could not open lyrics window', true);
        }
    }

    function getVolumeIconSvg(volume) {
        if (volume === 0) {
            return `<svg viewBox="0 0 16 16" class="volume-icon" id="volumeIcon">
                <path d="M13.86 5.47a.75.75 0 0 0-1.061 0l-1.47 1.47-1.47-1.47A.75.75 0 0 0 8.8 6.53L10.269 8l-1.47 1.47a.75.75 0 1 0 1.06 1.06l1.47-1.47 1.47 1.47a.75.75 0 0 0 1.06-1.06L12.39 8l1.47-1.47a.75.75 0 0 0 0-1.06z"/>
                <path d="M10.116 1.5A.75.75 0 0 0 8.991.85l-6.925 4a3.642 3.642 0 0 0-1.33 4.967 3.639 3.639 0 0 0 1.33 1.332l6.925 4a.75.75 0 0 0 1.125-.649v-1.906a4.73 4.73 0 0 1-1.5-.694v1.3L2.817 9.852a2.141 2.141 0 0 1-.781-2.92c.187-.324.456-.594.78-.782l5.8-3.35v1.3c.45-.313.956-.55 1.5-.694V1.5z"/>
            </svg>`;
        } else if (volume < 50) {
            return `<svg viewBox="0 0 16 16" class="volume-icon" id="volumeIcon">
                <path d="M9.741.85a.75.75 0 0 1 .375.65v13a.75.75 0 0 1-1.125.65l-6.925-4a3.642 3.642 0 0 1-1.33-4.967 3.639 3.639 0 0 1 1.33-1.332l6.925-4a.75.75 0 0 1 .75 0zm-6.924 5.3a2.139 2.139 0 0 0 0 3.7l5.8 3.35V2.8l-5.8 3.35zm8.683 4.29V5.56a2.75 2.75 0 0 1 0 4.88z"/>
            </svg>`;
        } else {
            return `<svg viewBox="0 0 16 16" class="volume-icon" id="volumeIcon">
                <path d="M9.741.85a.75.75 0 0 1 .375.65v13a.75.75 0 0 1-1.125.65l-6.925-4a3.642 3.642 0 0 1-1.33-4.967 3.639 3.639 0 0 1 1.33-1.332l6.925-4a.75.75 0 0 1 .75 0zm-6.924 5.3a2.139 2.139 0 0 0 0 3.7l5.8 3.35V2.8l-5.8 3.35zm8.683 6.087a4.502 4.502 0 0 0 0-8.474v1.65a2.999 2.999 0 0 1 0 5.175v1.649z"/>
            </svg>`;
        }
    }

    function generateThemeMenuItems() {
        return Object.entries(THEMES).map(([key, theme]) => 
            `<div class="theme-item ${key === currentTheme ? 'active' : ''}" data-theme="${key}">
                <span class="theme-emoji">${theme.emoji}</span>
                <span class="theme-name">${theme.name}</span>
            </div>`
        ).join('');
    }

    function setupPipWindow(win) {
        const doc = win.document;
        const currentVolume = Math.round((Spicetify.Player.getVolume() || 0) * 100);

        // Build the HTML
        doc.write(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>♫ Lyrics</title>
    <style id="themeStyles">${generateStyles(currentTheme)}</style>
</head>
<body>
    <div class="resize-handle" id="resizeHandle" title="Drag to resize"></div>
    <div class="header" id="dragHeader" title="Drag to move window">
        <img class="album-art" id="albumArt" src="" alt="">
        <div class="track-info">
            <div class="track-title" id="trackTitle">Loading...</div>
            <div class="track-artist" id="trackArtist">-</div>
        </div>
        <div class="header-btns">
            <button class="menu-btn" id="menuBtn" title="Settings">
                <div class="menu-row">
                    <div class="menu-dot"></div>
                    <div class="menu-dot"></div>
                </div>
                <div class="menu-row">
                    <div class="menu-dot"></div>
                    <div class="menu-dot"></div>
                </div>
                <div class="menu-row">
                    <div class="menu-dot"></div>
                    <div class="menu-dot"></div>
                </div>
            </button>
            <button class="close-btn ${showCloseBtn ? '' : 'hidden'}" id="closeBtn" title="Close">×</button>
        </div>
    </div>

    <!-- Settings Panel - Full Screen -->
    <div class="settings-panel" id="settingsPanel">
        <div class="settings-header">
            <span class="settings-title">⚙️ Settings</span>
            <button class="settings-close" id="settingsClose">✕</button>
        </div>
        <div class="settings-content">
            <button class="theme-btn" id="openThemePicker">
                <span class="theme-btn-preview" id="currentThemeEmoji">${THEMES[currentTheme].emoji}</span>
                <div class="theme-btn-info">
                    <div class="theme-btn-label">Theme</div>
                    <div class="theme-btn-name" id="currentThemeName">${THEMES[currentTheme].name}</div>
                </div>
                <span class="theme-btn-arrow">›</span>
            </button>
            
            <div class="menu-divider"></div>
            
            <div class="menu-section-title">📺 Display</div>
            <div class="menu-item" id="toggleLyricsItem">
                <span class="menu-item-label">Show Lyrics</span>
                <div class="menu-toggle ${showLyrics ? 'on' : ''}" id="toggleLyrics"></div>
            </div>
            <div class="menu-item" id="toggleCenterItem">
                <span class="menu-item-label">Center Lyrics</span>
                <div class="menu-toggle ${centerLyrics ? 'on' : ''}" id="toggleCenter"></div>
            </div>
            <div class="menu-item" id="toggleShuffleItem">
                <span class="menu-item-label">Shuffle Button</span>
                <div class="menu-toggle ${showShuffleBtn ? 'on' : ''}" id="toggleShuffle"></div>
            </div>
            <div class="menu-item" id="toggleLikeItem">
                <span class="menu-item-label">Like Button</span>
                <div class="menu-toggle ${showLikeBtn ? 'on' : ''}" id="toggleLike"></div>
            </div>
            <div class="menu-item" id="toggleCloseItem">
                <span class="menu-item-label">Close Button</span>
                <div class="menu-toggle ${showCloseBtn ? 'on' : ''}" id="toggleClose"></div>
            </div>
            <div class="menu-item" id="toggleFontItem">
                <span class="menu-item-label">Font Size Slider</span>
                <div class="menu-toggle ${showFontSlider ? 'on' : ''}" id="toggleFont"></div>
            </div>
            <div class="menu-item" id="toggleVolItem">
                <span class="menu-item-label">Volume Slider</span>
                <div class="menu-toggle ${showVolumeSlider ? 'on' : ''}" id="toggleVol"></div>
            </div>
        </div>
    </div>

    <!-- Theme Picker Panel -->
    <div class="theme-picker" id="themePicker">
        <div class="theme-picker-header">
            <button class="theme-picker-back" id="themePickerBack">‹</button>
            <span class="theme-picker-title">Choose Theme</span>
        </div>
        <div class="theme-grid" id="themeGrid">
            ${generateThemeMenuItems()}
        </div>
    </div>

    <div class="controls">
        <button class="ctrl-btn" id="prevBtn" title="Previous">
            <svg viewBox="0 0 16 16"><path d="M3.3 1a.7.7 0 0 1 .7.7v5.15l9.95-5.744a.7.7 0 0 1 1.05.606v12.575a.7.7 0 0 1-1.05.607L4 9.149V14.3a.7.7 0 0 1-.7.7H1.7a.7.7 0 0 1-.7-.7V1.7a.7.7 0 0 1 .7-.7h1.6z"/></svg>
        </button>
        <button class="ctrl-btn play-btn" id="playBtn" title="Play/Pause">
            <svg viewBox="0 0 16 16" id="playIcon"><path d="M3 1.713a.7.7 0 0 1 1.05-.607l10.89 6.288a.7.7 0 0 1 0 1.212L4.05 14.894A.7.7 0 0 1 3 14.288V1.713z"/></svg>
        </button>
        <button class="ctrl-btn" id="nextBtn" title="Next">
            <svg viewBox="0 0 16 16"><path d="M12.7 1a.7.7 0 0 0-.7.7v5.15L2.05 1.107A.7.7 0 0 0 1 1.712v12.575a.7.7 0 0 0 1.05.607L12 9.149V14.3a.7.7 0 0 0 .7.7h1.6a.7.7 0 0 0 .7-.7V1.7a.7.7 0 0 0-.7-.7h-1.6z"/></svg>
        </button>
        <button class="ctrl-btn ${showShuffleBtn ? '' : 'hidden'}" id="shuffleBtn" title="Shuffle">
            <svg viewBox="0 0 16 16" id="shuffleIcon"><path d="M13.151.922a.75.75 0 1 0-1.06 1.06L13.109 3H11.16a3.75 3.75 0 0 0-2.873 1.34l-6.173 7.356A2.25 2.25 0 0 1 .39 12.5H0V14h.391a3.75 3.75 0 0 0 2.873-1.34l6.173-7.356a2.25 2.25 0 0 1 1.724-.804h1.947l-1.017 1.018a.75.75 0 0 0 1.06 1.06l2.306-2.306a.75.75 0 0 0 0-1.06L13.15.922zM.391 3.5H0V2h.391c1.109 0 2.16.49 2.873 1.34L4.89 5.277l-.979 1.167-1.796-2.14A2.25 2.25 0 0 0 .39 3.5z"/><path d="m7.5 10.723.98-1.167 1.796 2.14a2.25 2.25 0 0 0 1.724.804h1.947l-1.017-1.018a.75.75 0 1 1 1.06-1.06l2.306 2.306a.75.75 0 0 1 0 1.06l-2.306 2.306a.75.75 0 1 1-1.06-1.06L14.109 14H12.16a3.75 3.75 0 0 1-2.873-1.34l-1.787-2.14z"/></svg>
        </button>
        <button class="ctrl-btn ${showLikeBtn ? '' : 'hidden'}" id="likeBtn" title="Save to Liked Songs">
            <svg viewBox="0 0 16 16" id="likeIcon"><path d="M1.69 2A4.582 4.582 0 0 1 8 2.023 4.583 4.583 0 0 1 11.88.817h.002a4.618 4.618 0 0 1 3.782 3.65v.003a4.543 4.543 0 0 1-1.011 3.84L9.35 14.629a1.765 1.765 0 0 1-2.093.464 1.762 1.762 0 0 1-.605-.463L1.348 8.309A4.582 4.582 0 0 1 1.689 2zm3.158.252A3.082 3.082 0 0 0 2.49 7.337l.005.005L7.8 13.664a.264.264 0 0 0 .311.069.262.262 0 0 0 .09-.069l5.312-6.33a3.043 3.043 0 0 0 .68-2.573 3.118 3.118 0 0 0-2.551-2.463 3.079 3.079 0 0 0-2.612.816l-.007.007a1.501 1.501 0 0 1-2.045 0l-.009-.008a3.082 3.082 0 0 0-2.121-.861z"/></svg>
        </button>
    </div>
    
    <div class="lyrics-wrap ${showLyrics ? '' : 'collapsed'} ${centerLyrics ? 'centered' : ''}" id="lyricsContainer">
        <div class="status-msg">
            <div class="spinner"></div>
        </div>
    </div>
    
    <div class="footer" id="footer">
        <div class="footer-row ${showFontSlider ? '' : 'collapsed'}" id="fontRow">
            <span class="control-label">Size</span>
            <input type="range" class="slider" id="fontSlider" min="${CONFIG.minFontSize}" max="${CONFIG.maxFontSize}" value="${fontSize}">
            <span class="value-display" id="fontValue">${fontSize}px</span>
        </div>
        <div class="footer-row ${showVolumeSlider ? '' : 'collapsed'}" id="volumeRow">
            <div id="volumeIconWrap">
                ${getVolumeIconSvg(currentVolume)}
            </div>
            <input type="range" class="slider" id="volumeSlider" min="0" max="100" value="${currentVolume}">
            <span class="value-display" id="volumePercent">${currentVolume}%</span>
        </div>
    </div>
</body>
</html>`);
        doc.close();

        // Get elements
        const menuBtn = doc.getElementById('menuBtn');
        const settingsPanel = doc.getElementById('settingsPanel');
        const settingsClose = doc.getElementById('settingsClose');
        const prevBtn = doc.getElementById('prevBtn');
        const playBtn = doc.getElementById('playBtn');
        const nextBtn = doc.getElementById('nextBtn');
        const shuffleBtn = doc.getElementById('shuffleBtn');
        const likeBtn = doc.getElementById('likeBtn');
        const fontSlider = doc.getElementById('fontSlider');
        const fontValue = doc.getElementById('fontValue');
        const fontRow = doc.getElementById('fontRow');
        const volumeRow = doc.getElementById('volumeRow');
        const volumeSlider = doc.getElementById('volumeSlider');
        const volumePercent = doc.getElementById('volumePercent');
        const volumeIconWrap = doc.getElementById('volumeIconWrap');
        const lyricsContainer = doc.getElementById('lyricsContainer');
        const toggleLyricsItem = doc.getElementById('toggleLyricsItem');
        const toggleLyrics = doc.getElementById('toggleLyrics');
        const toggleCenterItem = doc.getElementById('toggleCenterItem');
        const toggleCenter = doc.getElementById('toggleCenter');
        const toggleShuffleItem = doc.getElementById('toggleShuffleItem');
        const toggleShuffle = doc.getElementById('toggleShuffle');
        const toggleLikeItem = doc.getElementById('toggleLikeItem');
        const toggleLike = doc.getElementById('toggleLike');
        const toggleCloseItem = doc.getElementById('toggleCloseItem');
        const toggleClose = doc.getElementById('toggleClose');
        const toggleFontItem = doc.getElementById('toggleFontItem');
        const toggleFont = doc.getElementById('toggleFont');
        const toggleVolItem = doc.getElementById('toggleVolItem');
        const toggleVol = doc.getElementById('toggleVol');
        const themeStyles = doc.getElementById('themeStyles');
        const openThemePickerBtn = doc.getElementById('openThemePicker');
        const currentThemeEmoji = doc.getElementById('currentThemeEmoji');
        const currentThemeName = doc.getElementById('currentThemeName');
        const themePicker = doc.getElementById('themePicker');
        const themePickerBack = doc.getElementById('themePickerBack');
        const themeGrid = doc.getElementById('themeGrid');
        const closeBtn = doc.getElementById('closeBtn');

        // Close miniplayer
        closeBtn.onclick = () => {
            win.close();
        };

        // Settings panel toggle
        menuBtn.onclick = (e) => {
            e.stopPropagation();
            settingsPanel.classList.add('open');
        };

        // Close settings panel
        settingsClose.onclick = () => {
            settingsPanel.classList.remove('open');
        };

        // Open theme picker panel
        openThemePickerBtn.onclick = () => {
            themePicker.classList.add('open');
        };

        // Close theme picker (back to settings)
        themePickerBack.onclick = () => {
            themePicker.classList.remove('open');
        };

        // Theme selection
        themeGrid.onclick = (e) => {
            const themeItem = e.target.closest('.theme-item');
            if (themeItem) {
                const newTheme = themeItem.dataset.theme;
                if (newTheme && THEMES[newTheme]) {
                    currentTheme = newTheme;
                    localStorage.setItem('lyrics-overlay-theme', currentTheme);
                    
                    // Update styles
                    themeStyles.textContent = generateStyles(currentTheme);
                    
                    // Update theme button
                    currentThemeEmoji.textContent = THEMES[currentTheme].emoji;
                    currentThemeName.textContent = THEMES[currentTheme].name;
                    
                    // Update active state
                    doc.querySelectorAll('.theme-item').forEach(item => {
                        item.classList.toggle('active', item.dataset.theme === currentTheme);
                    });
                    
                    // Close picker after selection
                    themePicker.classList.remove('open');
                }
            }
        };


        // Toggle handlers
        toggleLyricsItem.onclick = () => {
            showLyrics = !showLyrics;
            toggleLyrics.classList.toggle('on', showLyrics);
            lyricsContainer.classList.toggle('collapsed', !showLyrics);
            localStorage.setItem('lyrics-overlay-showlyrics', showLyrics);
        };

        toggleCenterItem.onclick = () => {
            centerLyrics = !centerLyrics;
            toggleCenter.classList.toggle('on', centerLyrics);
            lyricsContainer.classList.toggle('centered', centerLyrics);
            localStorage.setItem('lyrics-overlay-centerlyrics', centerLyrics);
        };

        toggleShuffleItem.onclick = () => {
            showShuffleBtn = !showShuffleBtn;
            toggleShuffle.classList.toggle('on', showShuffleBtn);
            shuffleBtn.classList.toggle('hidden', !showShuffleBtn);
            localStorage.setItem('lyrics-overlay-showshuffle', showShuffleBtn);
        };

        toggleLikeItem.onclick = () => {
            showLikeBtn = !showLikeBtn;
            toggleLike.classList.toggle('on', showLikeBtn);
            likeBtn.classList.toggle('hidden', !showLikeBtn);
            localStorage.setItem('lyrics-overlay-showlike', showLikeBtn);
        };

        toggleCloseItem.onclick = () => {
            showCloseBtn = !showCloseBtn;
            toggleClose.classList.toggle('on', showCloseBtn);
            closeBtn.classList.toggle('hidden', !showCloseBtn);
            localStorage.setItem('lyrics-overlay-showclose', showCloseBtn);
        };

        toggleFontItem.onclick = () => {
            showFontSlider = !showFontSlider;
            toggleFont.classList.toggle('on', showFontSlider);
            fontRow.classList.toggle('collapsed', !showFontSlider);
            localStorage.setItem('lyrics-overlay-showfont', showFontSlider);
        };

        toggleVolItem.onclick = () => {
            showVolumeSlider = !showVolumeSlider;
            toggleVol.classList.toggle('on', showVolumeSlider);
            volumeRow.classList.toggle('collapsed', !showVolumeSlider);
            localStorage.setItem('lyrics-overlay-showvol', showVolumeSlider);
        };

        // Control handlers
        prevBtn.onclick = () => Spicetify.Player.back();
        playBtn.onclick = () => Spicetify.Player.togglePlay();
        nextBtn.onclick = () => Spicetify.Player.next();
        shuffleBtn.onclick = () => {
            Spicetify.Player.toggleShuffle();
            updateShuffleState();
        };

        likeBtn.onclick = () => {
            Spicetify.Player.toggleHeart();
        };

        // Update shuffle button state
        function updateShuffleState() {
            const isShuffled = Spicetify.Player.getShuffle();
            shuffleBtn.classList.toggle('shuffle-on', isShuffled);
        }
        updateShuffleState();

        // Update like icon (filled vs outline)
        function updateLikeIcon(isLiked) {
            const likeIcon = doc.getElementById('likeIcon');
            if (!likeIcon) return;
            
            likeBtn.classList.toggle('liked', isLiked);
            
            if (isLiked) {
                // Filled heart
                likeIcon.innerHTML = '<path d="M15.724 4.22A4.313 4.313 0 0 0 12.192.814a4.269 4.269 0 0 0-3.622 1.13.837.837 0 0 1-1.14 0 4.272 4.272 0 0 0-6.21 5.855l5.916 7.05a1.128 1.128 0 0 0 1.727 0l5.916-7.05a4.228 4.228 0 0 0 .945-3.577z"/>';
            } else {
                // Outline heart
                likeIcon.innerHTML = '<path d="M1.69 2A4.582 4.582 0 0 1 8 2.023 4.583 4.583 0 0 1 11.88.817h.002a4.618 4.618 0 0 1 3.782 3.65v.003a4.543 4.543 0 0 1-1.011 3.84L9.35 14.629a1.765 1.765 0 0 1-2.093.464 1.762 1.762 0 0 1-.605-.463L1.348 8.309A4.582 4.582 0 0 1 1.689 2zm3.158.252A3.082 3.082 0 0 0 2.49 7.337l.005.005L7.8 13.664a.264.264 0 0 0 .311.069.262.262 0 0 0 .09-.069l5.312-6.33a3.043 3.043 0 0 0 .68-2.573 3.118 3.118 0 0 0-2.551-2.463 3.079 3.079 0 0 0-2.612.816l-.007.007a1.501 1.501 0 0 1-2.045 0l-.009-.008a3.082 3.082 0 0 0-2.121-.861z"/>';
            }
        }

        // Check and update like state
        function updateLikeState() {
            const isLiked = Spicetify.Player.getHeart();
            updateLikeIcon(isLiked);
        }
        
        // Initial update
        updateLikeState();

        // Font size handler
        fontSlider.oninput = (e) => {
            fontSize = parseInt(e.target.value);
            fontValue.textContent = `${fontSize}px`;
            localStorage.setItem('lyrics-overlay-fontsize', fontSize);
            updatePipFontSize();
        };

        // Volume handlers
        volumeSlider.oninput = (e) => {
            const vol = parseInt(e.target.value);
            Spicetify.Player.setVolume(vol / 100);
            volumePercent.textContent = `${vol}%`;
            volumeIconWrap.innerHTML = getVolumeIconSvg(vol);
        };

        // Click volume icon to mute/unmute
        volumeIconWrap.onclick = () => {
            const currentVol = Math.round((Spicetify.Player.getVolume() || 0) * 100);
            if (currentVol > 0) {
                volumeSlider.dataset.prevVolume = currentVol;
                Spicetify.Player.setVolume(0);
                volumeSlider.value = 0;
                volumePercent.textContent = '0%';
                volumeIconWrap.innerHTML = getVolumeIconSvg(0);
            } else {
                const prevVol = parseInt(volumeSlider.dataset.prevVolume) || 50;
                Spicetify.Player.setVolume(prevVol / 100);
                volumeSlider.value = prevVol;
                volumePercent.textContent = `${prevVol}%`;
                volumeIconWrap.innerHTML = getVolumeIconSvg(prevVol);
            }
        };

        // Lyrics click to seek
        lyricsContainer.onclick = (e) => {
            if (e.target.classList.contains('lyric')) {
                const time = e.target.dataset.time;
                if (time) Spicetify.Player.seek(parseInt(time));
            }
        };

        // Handle window close
        win.addEventListener('pagehide', () => {
            pipWindow = null;
        });

        // Initial update - force load lyrics for current track
        async function initialLoad() {
            const track = Spicetify.Player.data?.item;
            if (track?.uri) {
                currentTrackUri = track.uri;
                await loadLyrics(track.uri);
                updatePipLikeState();
            } else {
                // Retry after a short delay if track data not ready
                setTimeout(initialLoad, 200);
            }
        }
        
        updatePipContent();
        initialLoad();
        startUpdateLoop();
    }

    // ==================== PIP CONTENT UPDATES ====================
    function updatePipContent() {
        if (!pipWindow || pipWindow.closed) return;

        const doc = pipWindow.document;
        const data = Spicetify.Player.data;
        
        if (!data?.item) return;

        const track = data.item;

        // Update track info
        const titleEl = doc.getElementById('trackTitle');
        const artistEl = doc.getElementById('trackArtist');
        const albumArtEl = doc.getElementById('albumArt');

        if (titleEl) titleEl.textContent = track.name || 'Unknown';
        if (artistEl) artistEl.textContent = track.artists?.map(a => a.name).join(', ') || 'Unknown';
        if (albumArtEl) {
            const imgUrl = track.album?.images?.[0]?.url || track.metadata?.image_url || '';
            albumArtEl.src = imgUrl;
        }

        // Update play button
        updatePipPlayButton();

        // Update volume
        updatePipVolume();

        // Check if track changed
        if (track.uri !== currentTrackUri) {
            currentTrackUri = track.uri;
            loadLyrics(track.uri);
            updatePipLikeState();
        }
    }

    function updatePipLikeState() {
        if (!pipWindow || pipWindow.closed) return;
        
        const doc = pipWindow.document;
        const likeBtn = doc.getElementById('likeBtn');
        const likeIcon = doc.getElementById('likeIcon');
        if (!likeBtn || !likeIcon) return;
        
        const isLiked = Spicetify.Player.getHeart();
        
        likeBtn.classList.toggle('liked', isLiked);
        if (isLiked) {
            likeIcon.innerHTML = '<path d="M15.724 4.22A4.313 4.313 0 0 0 12.192.814a4.269 4.269 0 0 0-3.622 1.13.837.837 0 0 1-1.14 0 4.272 4.272 0 0 0-6.21 5.855l5.916 7.05a1.128 1.128 0 0 0 1.727 0l5.916-7.05a4.228 4.228 0 0 0 .945-3.577z"/>';
        } else {
            likeIcon.innerHTML = '<path d="M1.69 2A4.582 4.582 0 0 1 8 2.023 4.583 4.583 0 0 1 11.88.817h.002a4.618 4.618 0 0 1 3.782 3.65v.003a4.543 4.543 0 0 1-1.011 3.84L9.35 14.629a1.765 1.765 0 0 1-2.093.464 1.762 1.762 0 0 1-.605-.463L1.348 8.309A4.582 4.582 0 0 1 1.689 2zm3.158.252A3.082 3.082 0 0 0 2.49 7.337l.005.005L7.8 13.664a.264.264 0 0 0 .311.069.262.262 0 0 0 .09-.069l5.312-6.33a3.043 3.043 0 0 0 .68-2.573 3.118 3.118 0 0 0-2.551-2.463 3.079 3.079 0 0 0-2.612.816l-.007.007a1.501 1.501 0 0 1-2.045 0l-.009-.008a3.082 3.082 0 0 0-2.121-.861z"/>';
        }
    }

    function updatePipPlayButton() {
        if (!pipWindow || pipWindow.closed) return;

        const playIcon = pipWindow.document.getElementById('playIcon');
        if (!playIcon) return;

        const isPlaying = Spicetify.Player.isPlaying();
        playIcon.innerHTML = isPlaying
            ? '<path d="M2.7 1a.7.7 0 0 0-.7.7v12.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V1.7a.7.7 0 0 0-.7-.7H2.7zm8 0a.7.7 0 0 0-.7.7v12.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V1.7a.7.7 0 0 0-.7-.7h-2.6z"/>'
            : '<path d="M3 1.713a.7.7 0 0 1 1.05-.607l10.89 6.288a.7.7 0 0 1 0 1.212L4.05 14.894A.7.7 0 0 1 3 14.288V1.713z"/>';
    }

    function updatePipVolume() {
        if (!pipWindow || pipWindow.closed) return;

        const doc = pipWindow.document;
        const volumeSlider = doc.getElementById('volumeSlider');
        const volumePercent = doc.getElementById('volumePercent');
        const volumeIconWrap = doc.getElementById('volumeIconWrap');
        
        if (!volumeSlider || !volumePercent || !volumeIconWrap) return;

        // Only update if slider is not being dragged
        if (doc.activeElement !== volumeSlider) {
            const vol = Math.round((Spicetify.Player.getVolume() || 0) * 100);
            volumeSlider.value = vol;
            volumePercent.textContent = `${vol}%`;
            volumeIconWrap.innerHTML = getVolumeIconSvg(vol);
        }
    }

    async function loadLyrics(uri) {
        if (!pipWindow || pipWindow.closed) return;

        const container = pipWindow.document.getElementById('lyricsContainer');
        if (!container) return;

        // Show loading
        container.innerHTML = '<div class="status-msg"><div class="spinner"></div></div>';

        // Fetch lyrics
        currentLyrics = await fetchLyrics(uri);

        if (!currentLyrics || !currentLyrics.lines?.length) {
            container.innerHTML = `
                <div class="status-msg">
                    <div class="icon">🎵</div>
                    <div class="text">No lyrics available</div>
                    <div class="subtext">Lyrics not found for this track</div>
                </div>
            `;
            return;
        }

        // Render lyrics
        const lyricsHtml = currentLyrics.lines
            .filter(line => line.text && line.text.trim())
            .map((line, idx) => 
                `<div class="lyric" data-time="${line.startTime}" data-idx="${idx}" style="font-size:${fontSize}px">${escapeHtml(line.text)}</div>`
            ).join('');

        container.innerHTML = lyricsHtml || `
            <div class="status-msg">
                <div class="icon">🎶</div>
                <div class="text">Instrumental</div>
            </div>
        `;
    }

    function updateCurrentLyric() {
        if (!pipWindow || pipWindow.closed || !currentLyrics?.synced) return;

        const doc = pipWindow.document;
        const currentTime = Spicetify.Player.getProgress();
        
        // Find active line
        let activeIdx = -1;
        const filteredLines = currentLyrics.lines.filter(l => l.text && l.text.trim());
        
        for (let i = filteredLines.length - 1; i >= 0; i--) {
            if (currentTime >= filteredLines[i].startTime) {
                activeIdx = i;
                break;
            }
        }

        // Update classes
        const lyrics = doc.querySelectorAll('.lyric');
        lyrics.forEach((el, idx) => {
            el.classList.remove('active', 'past');
            
            if (idx === activeIdx) {
                el.classList.add('active');
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            } else if (idx < activeIdx) {
                el.classList.add('past');
            }
        });
    }

    function updatePipFontSize() {
        if (!pipWindow || pipWindow.closed) return;

        const lyrics = pipWindow.document.querySelectorAll('.lyric');
        lyrics.forEach(el => {
            el.style.fontSize = `${fontSize}px`;
        });
    }

    function startUpdateLoop() {
        if (updateIntervalId) clearInterval(updateIntervalId);
        
        updateIntervalId = setInterval(() => {
            if (!pipWindow || pipWindow.closed) {
                clearInterval(updateIntervalId);
                updateIntervalId = null;
                return;
            }
            
            updateCurrentLyric();
            updatePipPlayButton();
            updatePipLikeState();
        }, CONFIG.updateInterval);
    }

    // ==================== UTILITIES ====================
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // ==================== TOPBAR BUTTON ====================
    function createButton() {
        if (Spicetify.Topbar?.Button) {
            new Spicetify.Topbar.Button(
                'Lyric Miniplayer',
                `<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                    <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                    <path d="M19 3h-2v2h2v2h2V5h-2V3z" opacity="0.6"/>
                </svg>`,
                openPictureInPicture,
                false
            );
        }

    }

    // ==================== EVENT LISTENERS ====================
    Spicetify.Player.addEventListener('songchange', () => {
        updatePipContent();
    });

    Spicetify.Player.addEventListener('onplaypause', () => {
        updatePipPlayButton();
    });

    // ==================== INIT ====================
    createButton();
    
    console.log('[Lyric Miniplayer] Ready!');

})();
