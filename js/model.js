/* ============================================================
   MODEL — Game & Player classes
   Mines Game · CS 1XD3
   ============================================================ */

/**
 * Represents a single game board.
 */
class Game {
  static DIFFICULTIES = {
    easy:   { label: 'Easy',   bombs: 3  },
    medium: { label: 'Medium', bombs: 6  },
    hard:   { label: 'Hard',   bombs: 9  },
  };

  static BOARD_SIZE = 25; // 5 × 5

  /**
   * @param {'easy'|'medium'|'hard'} difficulty
   */
  constructor(difficulty = 'easy') {
    this.difficulty  = difficulty;
    this.bombCount   = Game.DIFFICULTIES[difficulty].bombs;
    this.board       = [];     // 'diamond' | 'bomb'
    this.revealed    = [];     // boolean per tile
    this.diamondsFound = 0;
    this.totalDiamonds = Game.BOARD_SIZE - this.bombCount;
    this.gameOver    = false;
    this.won         = false;
    this._initBoard();
  }

  /* ---- private ---- */

  _initBoard() {
    // Fill with diamonds, then place bombs randomly
    this.board    = new Array(Game.BOARD_SIZE).fill('diamond');
    this.revealed = new Array(Game.BOARD_SIZE).fill(false);

    const bombIndices = new Set();
    while (bombIndices.size < this.bombCount) {
      bombIndices.add(Math.floor(Math.random() * Game.BOARD_SIZE));
    }
    bombIndices.forEach(i => { this.board[i] = 'bomb'; });
  }

  /* ---- public ---- */

  /**
   * Reveal a tile. Returns the tile type ('diamond' | 'bomb').
   * Throws if game is already over or tile already revealed.
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

  /** Reveal all tiles (used to show board at end of round). */
  revealAll() {
    this.revealed.fill(true);
  }

  /** Number of safe tiles remaining. */
  get diamondsRemaining() {
    return this.totalDiamonds - this.diamondsFound;
  }

  /** Percentage progress (0–100). */
  get progress() {
    return Math.round((this.diamondsFound / this.totalDiamonds) * 100);
  }
}


/**
 * Represents the player and their persistent history.
 */
class Player {
  static STORAGE_KEY = 'mines_player_data';

  constructor() {
    this.score        = 0;
    this.roundsPlayed = 0;
    this.history      = [];   // { difficulty, result, score, date }
    this._load();
  }

  /* ---- persistence ---- */

  _load() {
    try {
      const raw = localStorage.getItem(Player.STORAGE_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        this.score        = data.score        ?? 0;
        this.roundsPlayed = data.roundsPlayed ?? 0;
        this.history      = data.history      ?? [];
      }
    } catch { /* corrupted — start fresh */ }
  }

  _save() {
    localStorage.setItem(Player.STORAGE_KEY, JSON.stringify(this.toJSON()));
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

  /** Highest single-round score ever. */
  getHighScore() {
    if (this.history.length === 0) return 0;
    return Math.max(...this.history.map(h => h.score));
  }

  /** Win-rate percentage. */
  getWinRate() {
    if (this.history.length === 0) return 0;
    const wins = this.history.filter(h => h.result === 'win').length;
    return Math.round((wins / this.history.length) * 100);
  }

  /** Clear all history (settings reset). */
  reset() {
    this.score = 0;
    this.roundsPlayed = 0;
    this.history = [];
    this._save();
  }

  toJSON() {
    return {
      score:        this.score,
      roundsPlayed: this.roundsPlayed,
      history:      this.history,
    };
  }
}
