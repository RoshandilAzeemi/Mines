/* ============================================================
   VIEW — DOM rendering & Canvas splash
   Mines Game · CS 1XD3
   ============================================================ */

class View {
  constructor() {
    /* --- screen refs --- */
    this.splashScreen    = document.getElementById('splash-screen');
    this.diffScreen      = document.getElementById('difficulty-screen');
    this.gameScreen      = document.getElementById('game-screen');

    /* --- splash --- */
    this.canvas          = document.getElementById('splash-canvas');
    this.ctx             = this.canvas.getContext('2d');
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

    /* --- history --- */
    this.historyPanel    = document.getElementById('history-panel');
    this.historyList     = document.getElementById('history-list');
    this.statRounds      = document.getElementById('stat-rounds');
    this.statHighScore   = document.getElementById('stat-highscore');
    this.statWinRate     = document.getElementById('stat-winrate');
  }

  /* ===== SCREENS ===== */

  _showScreen(screen) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    screen.classList.add('active');
  }

  showSplash()      { this._showScreen(this.splashScreen); }
  showDifficulty()  { this._showScreen(this.diffScreen); }
  showGame()        { this._showScreen(this.gameScreen); }

  /* ===== CANVAS SPLASH ===== */

  drawSplash() {
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

  /** Show "Start" button after delay. */
  revealStartButton() {
    this.startArea.classList.add('visible');
  }

  /* ===== BOARD ===== */

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

  revealTile(index, type) {
    const tile = this.boardEl.children[index];
    if (!tile) return;
    this._applyReveal(tile, type);
  }

  revealAllTiles(game) {
    for (let i = 0; i < Game.BOARD_SIZE; i++) {
      const tile = this.boardEl.children[i];
      if (tile && !tile.classList.contains('revealed')) {
        this._applyReveal(tile, game.board[i]);
      }
    }
  }

  _applyReveal(tile, type) {
    tile.classList.add('revealed', type);
    tile.textContent = type === 'diamond' ? '💎' : '💣';
  }

  /* ===== HUD ===== */

  updateHUD(player, game) {
    this.hudScore.textContent      = player.score + this._calcRoundScore(game);
    this.hudDiamonds.textContent   = `${game.diamondsFound}/${game.totalDiamonds}`;
    this.hudDifficulty.textContent = Game.DIFFICULTIES[game.difficulty].label;
  }

  _calcRoundScore(game) {
    const multipliers = { easy: 10, medium: 25, hard: 50 };
    return game.diamondsFound * (multipliers[game.difficulty] || 10);
  }

  /* ===== RESULT OVERLAY ===== */

  showResult(won, roundScore) {
    this.resultIcon.textContent  = won ? '🏆' : '💣';
    this.resultTitle.textContent = won ? 'You Win!' : 'Boom!';
    this.resultMsg.textContent   = won
      ? `You cleared all diamonds! +${roundScore} points`
      : `You hit a bomb! +${roundScore} points`;
    this.resultOverlay.classList.add('active');
  }

  hideResult() {
    this.resultOverlay.classList.remove('active');
  }

  /* ===== HELP MODAL ===== */

  showHelp() { this.helpModal.classList.add('active'); }
  hideHelp() { this.helpModal.classList.remove('active'); }

  /* ===== HISTORY ===== */

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

  hideHistory() {
    this.historyPanel.style.display = 'none';
  }
}
