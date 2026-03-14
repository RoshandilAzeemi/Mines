/* ============================================================
   CONTROLLER — Event listeners & game loop
   Mines Game · CS 1XD3
   ============================================================ */

class Controller {
  constructor() {
    this.view   = new View();
    this.player = new Player();
    this.game   = null;
  }

  /* ===== BOOT ===== */

  init() {
    this._showSplash();
    this._bindGlobalEvents();
  }

  /* ---- Splash ---- */

  _showSplash() {
    this.view.showSplash();
    this.view.drawSplash();
    this.view.hideHistory();

    // Reveal Start button after 2 seconds
    setTimeout(() => {
      this.view.revealStartButton();
    }, 2000);
  }

  /* ---- Bind permanent listeners ---- */

  _bindGlobalEvents() {
    // Start button
    document.getElementById('btn-start').addEventListener('click', () => {
      this._showDifficultyPicker();
    });

    // Difficulty cards
    document.querySelectorAll('.diff-card').forEach(card => {
      card.addEventListener('click', () => {
        const diff = card.dataset.difficulty;
        this._startGame(diff);
      });
    });

    // Board — delegated click
    document.getElementById('board').addEventListener('click', (e) => {
      const tile = e.target.closest('.tile');
      if (!tile || tile.classList.contains('revealed')) return;
      this._onTileClick(parseInt(tile.dataset.index, 10));
    });

    // Help
    document.getElementById('btn-help').addEventListener('click', () => {
      this.view.showHelp();
    });
    document.getElementById('btn-close-help').addEventListener('click', () => {
      this.view.hideHelp();
    });

    // Result overlay buttons
    document.getElementById('btn-play-again').addEventListener('click', () => {
      this.view.hideResult();
      this._showDifficultyPicker();
    });
    document.getElementById('btn-quit').addEventListener('click', () => {
      this.view.hideResult();
      this.view.hideHistory();
      this._showSplash();
    });

    // Reset history
    document.getElementById('btn-reset-history').addEventListener('click', () => {
      this.player.reset();
      this.view.renderHistory(this.player);
    });
  }

  /* ---- Difficulty picker ---- */

  _showDifficultyPicker() {
    this.view.showDifficulty();
    this.view.hideHistory();
  }

  /* ---- Start round ---- */

  _startGame(difficulty) {
    this.game = new Game(difficulty);
    this.view.showGame();
    this.view.renderBoard(this.game);
    this.view.updateHUD(this.player, this.game);
    this.view.hideHistory();
  }

  /* ---- Tile click ---- */

  _onTileClick(index) {
    if (!this.game || this.game.gameOver) return;

    const type = this.game.reveal(index);
    this.view.revealTile(index, type);
    this.view.updateHUD(this.player, this.game);

    if (this.game.gameOver) {
      this._endRound();
    }
  }

  /* ---- End round ---- */

  _endRound() {
    const roundScore = this._calcRoundScore();
    this.player.addRound(this.game.difficulty, this.game.won, roundScore);

    // Reveal full board after a small delay
    setTimeout(() => {
      this.game.revealAll();
      this.view.revealAllTiles(this.game);
    }, 300);

    // Show result overlay
    setTimeout(() => {
      this.view.showResult(this.game.won, roundScore);
      this.view.renderHistory(this.player);
    }, 700);
  }

  _calcRoundScore() {
    const multipliers = { easy: 10, medium: 25, hard: 50 };
    const mult = multipliers[this.game.difficulty] || 10;
    return this.game.diamondsFound * mult;
  }
}


/* ===== BOOTSTRAP ===== */
window.addEventListener('load', () => {
  const app = new Controller();
  app.init();
});
