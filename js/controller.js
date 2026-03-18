/* ============================================================
   controller.js
   Roshan Azeemi
   March 2026
   CONTROLLER — Binds all event listeners, manages the game
   loop, and coordinates between the Model and View layers.
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
   * Initialize the app — show the splash screen and bind events.
   */
  init() {
    this._showSplash();
    this._bindGlobalEvents();
  }

  /* ---- Splash ---- */

  /**
   * Display the splash screen with the canvas banner and
   * reveal the Start button after a 2-second delay.
   */
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

  /**
   * Attach all permanent event listeners using addEventListener.
   * Covers start, difficulty selection, tile clicks, help,
   * result buttons, and history reset.
   */
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

  /**
   * Transition to the difficulty picker screen.
   */
  _showDifficultyPicker() {
    this.view.showDifficulty();
    this.view.hideHistory();
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
   * board, show the result overlay, and display history.
   */
  _endRound() {
    const roundScore = this._calcRoundScore();
    this.player.addRound(this.game.difficulty, this.game.won, roundScore);

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
