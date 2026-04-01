/* ============================================================
   model.js
   Roshan Azeemi
   March 2026
   MODEL — Contains the Game and Player classes that track all
   game state (board, score, history). No DOM access here.
   Mines Game - CS 1XD3
   ============================================================ */

/**
 * Represents a single game board.
 */
class Game {
  static DIFFICULTIES = {
    easy: { label: 'Easy', bombs: 1 },
    medium: { label: 'Medium', bombs: 3 },
    hard: { label: 'Hard', bombs: 5 },
  };

  static BOARD_SIZE = 25; // 5 × 5

  /**
   * Create a new Game instance.
   * @param {'easy'|'medium'|'hard'} difficulty - the chosen difficulty level
   */
  constructor(difficulty = 'easy') {
    this.difficulty = difficulty;
    this.bombCount = Game.DIFFICULTIES[difficulty].bombs;
    this.board = [];     // 'diamond' | 'bomb'
    this.revealed = [];     // boolean per tile
    this.diamondsFound = 0;
    this.totalDiamonds = Game.BOARD_SIZE - this.bombCount;
    this.gameOver = false;
    this.won = false;
    this._initBoard();
  }

  /* ---- private ---- */

  /**
   * Build the board array by filling it with diamonds and then
   * placing bombs at random positions.
   */
  _initBoard() {
    // Fill with diamonds, then place bombs randomly
    this.board = new Array(Game.BOARD_SIZE).fill('diamond');
    this.revealed = new Array(Game.BOARD_SIZE).fill(false);

    const bombIndices = new Set();
    while (bombIndices.size < this.bombCount) {
      bombIndices.add(Math.floor(Math.random() * Game.BOARD_SIZE));
    }
    bombIndices.forEach(i => { this.board[i] = 'bomb'; });
  }

  /* ---- public ---- */

  /**
   * Reveal a tile and return its type.
   * @param {number} index - the tile index (0 to BOARD_SIZE - 1)
   * @returns {string} 'diamond' or 'bomb'
   */
  reveal(index) {
    if (this.gameOver) throw new Error('Game is already over');
    if (index < 0 || index >= Game.BOARD_SIZE) throw new RangeError('Invalid tile index');
    if (this.revealed[index]) return this.board[index]; // already revealed

    this.revealed[index] = true;

    if (this.board[index] === 'bomb') {
      this.gameOver = true;
      this.won = false;
      return 'bomb';
    }

    // Diamond found
    this.diamondsFound++;
    if (this.diamondsFound >= this.totalDiamonds) {
      this.gameOver = true;
      this.won = true;
    }
    return 'diamond';
  }

  /**
   * Reveal all tiles (used to show the full board at end of round).
   */
  revealAll() {
    this.revealed.fill(true);
  }

  /**
   * Number of safe tiles remaining.
   * @returns {number} diamonds left to find
   */
  get diamondsRemaining() {
    return this.totalDiamonds - this.diamondsFound;
  }

  /**
   * Percentage progress through the round.
   * @returns {number} integer from 0 to 100
   */
  get progress() {
    return Math.round((this.diamondsFound / this.totalDiamonds) * 100);
  }
}


/**
 * Represents the player and their persistent history.
 */
class Player {

  constructor() {
    this.score = 0;
    this.roundsPlayed = 0;
    this.history = [];   // { difficulty, result, score, date }
    this._load();
  }

  /* ---- persistence ---- */

  /**
   * No-op — persistence is now handled by the PHP/MySQL backend.
   * Player data is tracked in-memory for the current session only.
   */
  _load() {
    // Server-side persistence replaces localStorage
  }

  /**
   * No-op — persistence is now handled by the PHP/MySQL backend.
   */
  _save() {
    // Server-side persistence replaces localStorage
  }

  /* ---- public ---- */

  /**
   * Record a completed round.
   * @param {'easy'|'medium'|'hard'} difficulty
   * @param {boolean} won
   * @param {number}  roundScore — points earned this round
   */
  addRound(difficulty, won, roundScore) {
    this.roundsPlayed++;
    this.score += roundScore;
    this.history.push({
      difficulty,
      result: won ? 'win' : 'loss',
      score: roundScore,
      total: this.score,
      date: new Date().toISOString(),
    });
    this._save();
  }

  /**
   * Return the highest single-round score ever recorded.
   * @returns {number} the high score, or 0 if no rounds played
   */
  getHighScore() {
    if (this.history.length === 0) return 0;
    return Math.max(...this.history.map(h => h.score));
  }

  /**
   * Calculate the player's overall win rate.
   * @returns {number} integer percentage 0-100, or 0 if no rounds played
   */
  getWinRate() {
    if (this.history.length === 0) return 0;
    const wins = this.history.filter(h => h.result === 'win').length;
    return Math.round((wins / this.history.length) * 100);
  }

  /**
   * Clear all history and reset the score to zero.
   */
  reset() {
    this.score = 0;
    this.roundsPlayed = 0;
    this.history = [];
    this._save();
  }

  /**
   * Return a plain object for JSON serialization.
   * @returns {Object} player data suitable for localStorage
   */
  toJSON() {
    return {
      score: this.score,
      roundsPlayed: this.roundsPlayed,
      history: this.history,
    };
  }
}
