// Lyric Miniplayer - Spicetify Extension
// Creates a floating Picture-in-Picture lyrics window that stays on top of all apps

(async function LyricsOverlay() {
    // Wait for Spicetify to be fully loaded
    while (!Spicetify?.Player?.data || !Spicetify?.Platform || !Spicetify?.CosmosAsync) {
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    // ==================== CONFIG ====================
    const CONFIG = {
        pipWidth: 400,
        pipHeight: 500,
        updateInterval: 100,
        defaultFontSize: 20,
        maxFontSize: 36,
        minFontSize: 12,
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
    } catch (e) {}

    // ==================== STYLES FOR PIP WINDOW ====================
    const PIP_STYLES = `
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&display=swap');
        
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
            background: linear-gradient(160deg, #0a0a0a 0%, #1a1a2e 40%, #0f0f23 100%);
            color: #ffffff;
            display: flex;
            flex-direction: column;
        }

        /* Header - Draggable */
        .header {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 14px 16px;
            background: rgba(0, 0, 0, 0.5);
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
            width: 48px;
            height: 48px;
            border-radius: 8px;
            object-fit: cover;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
            flex-shrink: 0;
            -webkit-app-region: no-drag;
            app-region: no-drag;
        }

        .track-info {
            flex: 1;
            min-width: 0;
        }

        .track-title {
            font-size: 14px;
            font-weight: 600;
            color: #fff;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            margin-bottom: 2px;
        }

        .track-artist {
            font-size: 12px;
            font-weight: 400;
            color: rgba(255, 255, 255, 0.55);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        /* Menu Button */
        .menu-btn {
            display: flex;
            flex-direction: column;
            gap: 3px;
            padding: 8px 6px;
            cursor: pointer;
            opacity: 0.4;
            transition: opacity 0.15s;
            -webkit-app-region: no-drag;
            app-region: no-drag;
            background: none;
            border: none;
        }

        .menu-btn:hover {
            opacity: 0.8;
        }

        .menu-row {
            display: flex;
            gap: 3px;
        }

        .menu-dot {
            width: 3px;
            height: 3px;
            background: #fff;
            border-radius: 50%;
        }

        /* Settings Menu */
        .settings-menu {
            position: absolute;
            top: 70px;
            right: 12px;
            background: rgba(30, 30, 40, 0.98);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 10px;
            padding: 8px 0;
            min-width: 160px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
            z-index: 1000;
            display: none;
            -webkit-app-region: no-drag;
            app-region: no-drag;
        }

        .settings-menu.open {
            display: block;
            animation: menuFade 0.15s ease;
        }

        @keyframes menuFade {
            from { opacity: 0; transform: translateY(-8px); }
            to { opacity: 1; transform: translateY(0); }
        }

        .menu-item {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 10px 14px;
            cursor: pointer;
            transition: background 0.1s;
        }

        .menu-item:hover {
            background: rgba(255, 255, 255, 0.08);
        }

        .menu-item-label {
            font-size: 13px;
            color: rgba(255, 255, 255, 0.85);
        }

        .menu-toggle {
            width: 36px;
            height: 20px;
            background: rgba(255, 255, 255, 0.15);
            border-radius: 10px;
            position: relative;
            transition: background 0.2s;
        }

        .menu-toggle.on {
            background: #1ed760;
        }

        .menu-toggle::after {
            content: '';
            position: absolute;
            top: 2px;
            left: 2px;
            width: 16px;
            height: 16px;
            background: #fff;
            border-radius: 50%;
            transition: transform 0.2s;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
        }

        .menu-toggle.on::after {
            transform: translateX(16px);
        }

        .menu-divider {
            height: 1px;
            background: rgba(255, 255, 255, 0.08);
            margin: 6px 0;
        }

        /* Controls */
        .controls {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            padding: 10px;
            background: rgba(0, 0, 0, 0.35);
            flex-shrink: 0;
            -webkit-app-region: no-drag;
            app-region: no-drag;
        }

        .ctrl-btn {
            background: rgba(255, 255, 255, 0.08);
            border: none;
            color: #fff;
            width: 38px;
            height: 38px;
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
            width: 16px;
            height: 16px;
            fill: currentColor;
        }

        .ctrl-btn.play-btn {
            width: 46px;
            height: 46px;
            background: #1ed760;
            color: #000;
        }

        .ctrl-btn.play-btn:hover {
            background: #1fdf64;
            transform: scale(1.06);
        }

        .ctrl-btn.play-btn svg {
            width: 20px;
            height: 20px;
        }

        /* Lyrics Container */
        .lyrics-wrap {
            flex: 1 1 auto;
            overflow-y: auto;
            overflow-x: hidden;
            padding: 20px 16px;
            scroll-behavior: smooth;
            -webkit-app-region: no-drag;
            app-region: no-drag;
            min-height: 0;
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
            padding: 8px 0;
            opacity: 0.3;
            transition: all 0.2s ease;
            cursor: pointer;
            line-height: 1.4;
            transform-origin: left center;
        }

        .lyric:hover {
            opacity: 0.5;
        }

        .lyric.active {
            opacity: 1;
            color: #1ed760;
            font-weight: 500;
            transform: scale(1.02);
            text-shadow: 0 0 20px rgba(30, 215, 96, 0.3);
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
            border-top-color: #1ed760;
            border-radius: 50%;
            animation: spin 0.7s linear infinite;
        }

        @keyframes spin {
            to { transform: rotate(360deg); }
        }

        /* Footer */
        .footer {
            background: rgba(0, 0, 0, 0.45);
            border-top: 1px solid rgba(255, 255, 255, 0.05);
            flex-shrink: 0;
            padding: 10px 14px;
            -webkit-app-region: no-drag;
            app-region: no-drag;
        }

        .footer:empty {
            display: none;
        }

        .footer-row {
            display: flex;
            align-items: center;
            gap: 8px;
            transition: all 0.2s ease;
        }

        .footer-row.collapsed {
            display: none;
        }

        .footer-row + .footer-row:not(.collapsed) {
            margin-top: 8px;
            padding-top: 8px;
            border-top: 1px solid rgba(255, 255, 255, 0.06);
        }

        .control-label {
            font-size: 10px;
            color: rgba(255, 255, 255, 0.4);
            text-transform: uppercase;
            letter-spacing: 0.5px;
            min-width: 28px;
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
            width: 12px;
            height: 12px;
            background: #1ed760;
            border-radius: 50%;
            cursor: pointer;
            transition: transform 0.1s;
        }

        .slider::-webkit-slider-thumb:hover {
            transform: scale(1.2);
        }

        .volume-icon {
            width: 16px;
            height: 16px;
            fill: rgba(255, 255, 255, 0.5);
            flex-shrink: 0;
            cursor: pointer;
            transition: fill 0.15s;
        }

        .volume-icon:hover {
            fill: #fff;
        }

        .value-display {
            font-size: 11px;
            color: rgba(255, 255, 255, 0.5);
            min-width: 28px;
            text-align: right;
        }
    `;

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
    <style>${PIP_STYLES}</style>
</head>
<body>
    <div class="header" id="dragHeader" title="Drag to move window">
        <img class="album-art" id="albumArt" src="" alt="">
        <div class="track-info">
            <div class="track-title" id="trackTitle">Loading...</div>
            <div class="track-artist" id="trackArtist">-</div>
        </div>
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
    </div>

    <!-- Settings Menu -->
    <div class="settings-menu" id="settingsMenu">
        <div class="menu-item" id="toggleLyricsItem">
            <span class="menu-item-label">Show Lyrics</span>
            <div class="menu-toggle ${showLyrics ? 'on' : ''}" id="toggleLyrics"></div>
        </div>
        <div class="menu-divider"></div>
        <div class="menu-item" id="toggleFontItem">
            <span class="menu-item-label">Font Size</span>
            <div class="menu-toggle ${showFontSlider ? 'on' : ''}" id="toggleFont"></div>
        </div>
        <div class="menu-item" id="toggleVolItem">
            <span class="menu-item-label">Volume</span>
            <div class="menu-toggle ${showVolumeSlider ? 'on' : ''}" id="toggleVol"></div>
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
    </div>
    
    <div class="lyrics-wrap ${showLyrics ? '' : 'collapsed'}" id="lyricsContainer">
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
        const settingsMenu = doc.getElementById('settingsMenu');
        const prevBtn = doc.getElementById('prevBtn');
        const playBtn = doc.getElementById('playBtn');
        const nextBtn = doc.getElementById('nextBtn');
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
        const toggleFontItem = doc.getElementById('toggleFontItem');
        const toggleFont = doc.getElementById('toggleFont');
        const toggleVolItem = doc.getElementById('toggleVolItem');
        const toggleVol = doc.getElementById('toggleVol');

        // Menu toggle
        menuBtn.onclick = (e) => {
            e.stopPropagation();
            settingsMenu.classList.toggle('open');
        };

        // Close menu when clicking outside
        doc.body.onclick = () => {
            settingsMenu.classList.remove('open');
        };

        settingsMenu.onclick = (e) => {
            e.stopPropagation();
        };

        // Toggle handlers
        toggleLyricsItem.onclick = () => {
            showLyrics = !showLyrics;
            toggleLyrics.classList.toggle('on', showLyrics);
            lyricsContainer.classList.toggle('collapsed', !showLyrics);
            localStorage.setItem('lyrics-overlay-showlyrics', showLyrics);
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

        // Initial update
        updatePipContent();
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

        // Keyboard shortcut: Ctrl+Shift+L
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'l') {
                e.preventDefault();
                openPictureInPicture();
            }
        });
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
    
    console.log('[Lyric Miniplayer] Ready! Click the button or press Ctrl+Shift+L');
    Spicetify.showNotification('🎵 Lyric Miniplayer: Press Ctrl+Shift+L or click the button!');

})();
