/* ============================================================
   controller.js
   Roshan Azeemi
   March 2026
   CONTROLLER — Binds all event listeners, manages the game
   loop, and coordinates between the Model and View layers.
   Modified for server-side integration (play.php / leaderboard).
   Mines Game - CS 1XD3
   ============================================================ */

/**
 * Coordinates user interaction between the Model and View.
 */
class Controller {
  /**
   * Create the Controller and instantiate the View and Player.
   */
  constructor() {
    this.view = new View();
    this.player = new Player();
    this.game = null;
  }

  /* ===== BOOT ===== */

  /**
   * Initialize the app — show the difficulty picker and bind events.
   * (Splash screen is skipped in play.php since the user is already logged in.)
   */
  init() {
    this.view.showDifficulty();
    this.view.hideHistory();
    this._bindGlobalEvents();
  }

  /* ---- Bind permanent listeners ---- */

  /**
   * Attach all permanent event listeners using addEventListener.
   * Covers difficulty selection, tile clicks, help, result buttons,
   * and the leaderboard form submission.
   */
  _bindGlobalEvents() {
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

    // Leaderboard button — submit leaderboard form with game results
    document.getElementById('btn-quit').addEventListener('click', () => {
      const lbForm = document.getElementById('leaderboard-form');
      if (lbForm) lbForm.submit();
    });
  }

  /* ---- Start round ---- */

  /**
   * Create a new Game and render the board.
   * @param {'easy'|'medium'|'hard'} difficulty - chosen level
   */
  _startGame(difficulty) {
    this.game = new Game(difficulty);
    this.view.showGame();
    this.view.renderBoard(this.game);
    this.view.updateHUD(this.player, this.game);
    this.view.hideHistory();
  }

  /* ---- Tile click ---- */

  /**
   * Handle a tile click — reveal the tile and check for game over.
   * @param {number} index - the tile index that was clicked
   */
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

  /**
   * Finalize the round — record the result, reveal the full
   * board, show the result overlay, display history, and
   * populate the hidden leaderboard form fields.
   */
  _endRound() {
    const roundScore = this._calcRoundScore();
    this.player.addRound(this.game.difficulty, this.game.won, roundScore);

    // Populate hidden leaderboard form (only exists on play.php)
    const lbScore = document.getElementById('lb-score');
    const lbDiff  = document.getElementById('lb-difficulty');
    const lbRes   = document.getElementById('lb-result');
    if (lbScore) lbScore.value = roundScore;
    if (lbDiff)  lbDiff.value  = this.game.difficulty;
    if (lbRes)   lbRes.value   = this.game.won ? 'win' : 'loss';

    // Reveal full board after a small delay
    setTimeout(() => {
      this.game.revealAll();
      this.view.revealAllTiles(this.game);
    }, 300);

    // Show result overlay with history
    setTimeout(() => {
      this.view.showResult(this.game.won, roundScore, this.player);
    }, 700);
  }

  /**
   * Calculate the score for the current round based on
   * difficulty multiplier and diamonds found.
   * @returns {number} the round score
   */
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
