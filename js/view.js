/* ============================================================
   view.js
   Roshan Azeemi
   March 2026
   VIEW — Handles all DOM rendering, the canvas splash screen,
   the game board display, HUD updates, overlays, and history.
   Mines Game - CS 1XD3
   ============================================================ */

/**
 * Manages all visual output for the Mines game.
 */
class View {
  /**
   * Cache references to all DOM elements used by the view.
   */
  constructor() {
    /* --- screen refs --- */
    this.splashScreen    = document.getElementById('splash-screen');
    this.diffScreen      = document.getElementById('difficulty-screen');
    this.gameScreen      = document.getElementById('game-screen');

    /* --- splash (may not exist on play.php) --- */
    this.canvas          = document.getElementById('splash-canvas');
    this.ctx             = this.canvas ? this.canvas.getContext('2d') : null;
    this.startArea       = document.getElementById('start-area');

    /* --- game --- */
    this.boardEl         = document.getElementById('board');
    this.hudScore        = document.getElementById('hud-score');
    this.hudDiamonds     = document.getElementById('hud-diamonds');
    this.hudDifficulty   = document.getElementById('hud-difficulty');

    /* --- overlays / modals --- */
    this.resultOverlay   = document.getElementById('result-overlay');
    this.resultIcon      = document.getElementById('result-icon');
    this.resultTitle     = document.getElementById('result-title');
    this.resultMsg       = document.getElementById('result-msg');
    this.helpModal       = document.getElementById('help-modal');

    /* --- progress bar --- */
    this.progressFill    = document.getElementById('progress-fill');
    this.progressLabel   = document.getElementById('progress-label');

    /* --- overlay history --- */
    this.overlayRounds    = document.getElementById('overlay-rounds');
    this.overlayHighScore = document.getElementById('overlay-highscore');
    this.overlayWinRate   = document.getElementById('overlay-winrate');
    this.overlayHistList  = document.getElementById('overlay-history-list');

    /* --- history --- */
    this.historyPanel    = document.getElementById('history-panel');
    this.historyList     = document.getElementById('history-list');
    this.statRounds      = document.getElementById('stat-rounds');
    this.statHighScore   = document.getElementById('stat-highscore');
    this.statWinRate     = document.getElementById('stat-winrate');
  }

  /* ===== SCREENS ===== */

  /**
   * Switch to the given screen element, hiding all others.
   * @param {HTMLElement} screen - the screen element to activate
   */
  _showScreen(screen) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    screen.classList.add('active');
  }

  /** Show the splash screen. */
  showSplash()      { if (this.splashScreen) this._showScreen(this.splashScreen); }
  /** Show the difficulty picker screen. */
  showDifficulty()  { this._showScreen(this.diffScreen); }
  /** Show the main game screen. */
  showGame()        { this._showScreen(this.gameScreen); }

  /* ===== CANVAS SPLASH ===== */

  /**
   * Draw the splash banner on the canvas using JS drawing commands.
   * Includes a gradient background, emoji icons, glowing line, and title.
   */
  drawSplash() {
    if (!this.canvas || !this.ctx) return;
    const c   = this.canvas;
    const dpr = window.devicePixelRatio || 1;
    const w   = Math.min(420, window.innerWidth - 32);
    const h   = w * 0.55;
    c.width   = w * dpr;
    c.height  = h * dpr;
    c.style.width  = w + 'px';
    c.style.height = h + 'px';
    const ctx = this.ctx;
    ctx.scale(dpr, dpr);

    // Background gradient
    const bg = ctx.createLinearGradient(0, 0, w, h);
    bg.addColorStop(0, '#1a1033');
    bg.addColorStop(1, '#0c0e16');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    // Decorative grid dots
    ctx.fillStyle = 'rgba(167,139,250,.08)';
    for (let x = 20; x < w; x += 30) {
      for (let y = 20; y < h; y += 30) {
        ctx.beginPath();
        ctx.arc(x, y, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Scattered emoji icons
    const icons = ['💎', '💣', '✨', '💎', '💣', '💎', '✨', '💣'];
    ctx.font = `${Math.round(w * 0.065)}px serif`;
    ctx.globalAlpha = 0.3;
    icons.forEach((icon, i) => {
      const ix = ((i * 53 + 17) % (w - 40)) + 20;
      const iy = ((i * 37 + 29) % (h - 40)) + 25;
      ctx.fillText(icon, ix, iy);
    });
    ctx.globalAlpha = 1;

    // Glowing accent line
    const grad = ctx.createLinearGradient(w * 0.15, h * 0.5, w * 0.85, h * 0.5);
    grad.addColorStop(0, 'rgba(167,139,250,0)');
    grad.addColorStop(0.5, 'rgba(167,139,250,.5)');
    grad.addColorStop(1, 'rgba(167,139,250,0)');
    ctx.strokeStyle = grad;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(w * 0.15, h * 0.62);
    ctx.lineTo(w * 0.85, h * 0.62);
    ctx.stroke();

    // Title
    ctx.fillStyle = '#fff';
    ctx.font = `800 ${Math.round(w * 0.11)}px 'Outfit', sans-serif`;
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(167,139,250,.6)';
    ctx.shadowBlur = 20;
    ctx.fillText('💎 MINES', w / 2, h * 0.42);
    ctx.shadowBlur = 0;

    // Subtitle
    ctx.fillStyle = '#8b8fa3';
    ctx.font = `600 ${Math.round(w * 0.042)}px 'Outfit', sans-serif`;
    ctx.fillText('Find the Diamonds · Dodge the Bombs', w / 2, h * 0.78);
  }

  /**
   * Fade in the Start Game button on the splash screen.
   */
  revealStartButton() {
    if (this.startArea) this.startArea.classList.add('visible');
  }

  /* ===== BOARD ===== */

  /**
   * Create and render the 5x5 tile grid from the game model.
   * @param {Game} game - the current Game instance
   */
  renderBoard(game) {
    this.boardEl.innerHTML = '';
    for (let i = 0; i < Game.BOARD_SIZE; i++) {
      const btn = document.createElement('button');
      btn.className = 'tile';
      btn.dataset.index = i;
      btn.setAttribute('aria-label', `Tile ${i + 1}`);

      if (game.revealed[i]) {
        this._applyReveal(btn, game.board[i]);
      }
      this.boardEl.appendChild(btn);
    }
  }

  /**
   * Reveal a single tile with the appropriate icon and style.
   * @param {number} index - tile position (0-24)
   * @param {string} type  - 'diamond' or 'bomb'
   */
  revealTile(index, type) {
    const tile = this.boardEl.children[index];
    if (!tile) return;
    this._applyReveal(tile, type);
  }

  /**
   * Reveal every tile on the board (called at end of round).
   * @param {Game} game - the current Game instance
   */
  revealAllTiles(game) {
    for (let i = 0; i < Game.BOARD_SIZE; i++) {
      const tile = this.boardEl.children[i];
      if (tile && !tile.classList.contains('revealed')) {
        this._applyReveal(tile, game.board[i]);
      }
    }
  }

  /**
   * Apply revealed styling and icon to a tile element.
   * @param {HTMLElement} tile - the tile button element
   * @param {string}      type - 'diamond' or 'bomb'
   */
  _applyReveal(tile, type) {
    tile.classList.add('revealed', type);
    tile.textContent = type === 'diamond' ? '💎' : '💣';
  }

  /* ===== HUD ===== */

  /**
   * Refresh the HUD stats and progress bar from the model.
   * @param {Player} player - the current Player instance
   * @param {Game}   game   - the current Game instance
   */
  updateHUD(player, game) {
    this.hudScore.textContent      = player.score + this._calcRoundScore(game);
    this.hudDiamonds.textContent   = `${game.diamondsFound}/${game.totalDiamonds}`;
    this.hudDifficulty.textContent = Game.DIFFICULTIES[game.difficulty].label;

    // Progress bar
    const pct = game.progress;
    this.progressFill.style.width  = pct + '%';
    this.progressLabel.textContent = pct + '%';
  }

  /**
   * Calculate the score earned so far in the current round.
   * @param {Game} game - the current Game instance
   * @returns {number} the round score
   */
  _calcRoundScore(game) {
    const multipliers = { easy: 10, medium: 25, hard: 50 };
    return game.diamondsFound * (multipliers[game.difficulty] || 10);
  }

  /* ===== RESULT OVERLAY ===== */

  /**
   * Display the win/loss result overlay with history.
   * @param {boolean} won        - whether the player won the round
   * @param {number}  roundScore - points earned this round
   * @param {Player}  player     - the Player instance for history display
   */
  showResult(won, roundScore, player) {
    this.resultIcon.textContent  = won ? '🏆' : '💣';
    this.resultTitle.textContent = won ? 'You Win!' : 'Boom!';
    this.resultMsg.textContent   = won
      ? `You cleared all diamonds! +${roundScore} points`
      : `You hit a bomb! +${roundScore} points`;

    // Populate overlay history
    this.overlayRounds.textContent    = player.roundsPlayed;
    this.overlayHighScore.textContent = player.getHighScore();
    this.overlayWinRate.textContent   = player.getWinRate() + '%';

    this.overlayHistList.innerHTML = '';
    const recent = player.history.slice(-5).reverse();
    recent.forEach(entry => {
      const row = document.createElement('div');
      row.className = 'history-entry';
      row.innerHTML = `
        <span class="diff-badge ${entry.difficulty}">${entry.difficulty}</span>
        <span class="result-badge ${entry.result}">${entry.result === 'win' ? '✅ Win' : '❌ Loss'}</span>
        <span>+${entry.score}</span>
      `;
      this.overlayHistList.appendChild(row);
    });

    this.resultOverlay.classList.add('active');
  }

  /** Hide the result overlay. */
  hideResult() {
    this.resultOverlay.classList.remove('active');
  }

  /* ===== HELP MODAL ===== */

  /** Show the help / how-to-play modal. */
  showHelp() { this.helpModal.classList.add('active'); }
  /** Hide the help modal. */
  hideHelp() { this.helpModal.classList.remove('active'); }

  /* ===== HISTORY ===== */

  /**
   * Render the player's game history panel with stats and
   * a scrollable list of recent rounds.
   * @param {Player} player - the Player instance
   */
  renderHistory(player) {
    this.statRounds.textContent    = player.roundsPlayed;
    this.statHighScore.textContent = player.getHighScore();
    this.statWinRate.textContent   = player.getWinRate() + '%';

    this.historyList.innerHTML = '';
    // Show last 20, newest first
    const recent = player.history.slice(-20).reverse();
    if (recent.length === 0) {
      this.historyList.innerHTML = '<div class="subtext" style="padding:8px">No rounds played yet.</div>';
      return;
    }

    recent.forEach(entry => {
      const row = document.createElement('div');
      row.className = 'history-entry';
      row.innerHTML = `
        <span class="diff-badge ${entry.difficulty}">${entry.difficulty}</span>
        <span class="result-badge ${entry.result}">${entry.result === 'win' ? '✅ Win' : '❌ Loss'}</span>
        <span>+${entry.score}</span>
      `;
      this.historyList.appendChild(row);
    });

    this.historyPanel.style.display = 'block';
  }

  /** Hide the history panel. */
  hideHistory() {
    this.historyPanel.style.display = 'none';
  }
}
