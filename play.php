<?php
/*
 * play.php
 * Roshan Azeemi
 * March 2026
 * Game page — wraps the existing Mines JS game with PHP.
 * Receives the email parameter and passes it to the leaderboard
 * when the user finishes a round.
 * Mines Game - CS 1XD3
 */

// ---- Receive & validate email ----
$email = filter_input(INPUT_GET, 'email', FILTER_VALIDATE_EMAIL);
$has_email = ($email !== false && $email !== null);
?>
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <meta name="description"
    content="Mines — Find the Diamonds, Dodge the Bombs. A mobile-first strategy game for CS 1XD3." />
  <title>💎 Mines — Play</title>
  <link rel="stylesheet" href="css/style.css" />
</head>

<body>
  <div id="app">

    <?php if (!$has_email): ?>
      <!-- ========== ERROR: no email ========== -->
      <div class="message-card">
        <div class="msg-icon">⚠️</div>
        <h1 class="heading">Access Denied</h1>
        <p class="subtext">No email address was provided. Please log in first.</p>
        <a href="index.php" class="btn btn-primary btn-full">Go to Login</a>
      </div>
    <?php else: ?>

      <!-- User bar -->
      <div class="user-bar">
        <span class="user-email">👤 <?php echo htmlspecialchars($email); ?></span>
        <a href="index.php" class="btn btn-outline btn-sm">Log Out</a>
      </div>

      <!-- ========== DIFFICULTY PICKER ========== -->
      <div id="difficulty-screen" class="screen active">
        <h1 class="heading">Choose Difficulty</h1>
        <p class="subtext">More bombs = higher risk, bigger reward</p>
        <div class="difficulty-picker">
          <div class="diff-card" data-difficulty="easy" tabindex="0">
            <span class="emoji">😊</span>
            <span class="label">Easy</span>
            <span class="sub">1 Bomb</span>
          </div>
          <div class="diff-card" data-difficulty="medium" tabindex="0">
            <span class="emoji">😰</span>
            <span class="label">Medium</span>
            <span class="sub">3 Bombs</span>
          </div>
          <div class="diff-card" data-difficulty="hard" tabindex="0">
            <span class="emoji">💀</span>
            <span class="label">Hard</span>
            <span class="sub">5 Bombs</span>
          </div>
        </div>
      </div>

      <!-- ========== GAME SCREEN ========== -->
      <div id="game-screen" class="screen">
        <div class="toolbar">
          <button id="btn-help" class="btn btn-outline btn-sm">Help</button>
        </div>

        <!-- HUD -->
        <div class="hud">
          <div class="hud-item">
            <div class="value" id="hud-score">0</div>
            <div class="label">Score</div>
          </div>
          <div class="hud-item">
            <div class="value" id="hud-diamonds">0/0</div>
            <div class="label">Diamonds</div>
          </div>
          <div class="hud-item">
            <div class="value" id="hud-difficulty">—</div>
            <div class="label">Difficulty</div>
          </div>
        </div>

        <!-- Progress Bar -->
        <div class="progress-bar-container">
          <div class="progress-bar-track">
            <div class="progress-bar-fill" id="progress-fill"></div>
          </div>
          <div class="progress-label" id="progress-label">0%</div>
        </div>

        <!-- Board -->
        <div id="board" class="board"></div>

        <!-- History (shown after each round) -->
        <div id="history-panel" class="history-panel" style="display:none;">
          <h3>📊 Game History</h3>
          <div class="stats-row">
            <div class="stat-box">
              <div class="val" id="stat-rounds">0</div>
              <div class="lbl">Rounds</div>
            </div>
            <div class="stat-box">
              <div class="val" id="stat-highscore">0</div>
              <div class="lbl">High Score</div>
            </div>
            <div class="stat-box">
              <div class="val" id="stat-winrate">0%</div>
              <div class="lbl">Win Rate</div>
            </div>
          </div>
          <div id="history-list" class="history-list"></div>
        </div>
      </div>

      <!-- ========== RESULT OVERLAY ========== -->
      <div id="result-overlay" class="overlay">
        <div class="overlay-card">
          <div id="result-icon" class="result-icon">🏆</div>
          <h2 id="result-title">You Win!</h2>
          <p id="result-msg" class="result-msg"></p>

          <!-- History inside result overlay -->
          <div class="overlay-history">
            <h3>📊 Your History</h3>
            <div class="stats-row">
              <div class="stat-box">
                <div class="val" id="overlay-rounds">0</div>
                <div class="lbl">Rounds</div>
              </div>
              <div class="stat-box">
                <div class="val" id="overlay-highscore">0</div>
                <div class="lbl">High Score</div>
              </div>
              <div class="stat-box">
                <div class="val" id="overlay-winrate">0%</div>
                <div class="lbl">Win Rate</div>
              </div>
            </div>
            <div id="overlay-history-list" class="history-list"></div>
          </div>

          <button id="btn-quit" class="btn btn-green btn-full">View Leaderboard</button>
        </div>
      </div>

      <!-- ========== HELP MODAL ========== -->
      <div id="help-modal" class="modal">
        <div class="modal-card">
          <h2>📖 How to Play</h2>
          <ul>
            <li><strong>Goal:</strong> Tap tiles to uncover 💎 Diamonds and earn points. Avoid 💣 Bombs!</li>
            <li><strong>Winning:</strong> Find all diamonds on the board to win the round.</li>
            <li><strong>Losing:</strong> Hit a bomb and the round ends immediately.</li>
            <li><strong>Scoring:</strong> Each diamond found earns points. Harder difficulties give more points per
              diamond (Easy: 10 · Medium: 25 · Hard: 50).</li>
            <li><strong>Difficulty:</strong> Easy has 1 bomb, Medium has 3, Hard has 5 — out of 25 tiles.</li>
            <li><strong>Leaderboard:</strong> When you quit, your scores are saved and you can see the top players!</li>
          </ul>
          <button id="btn-close-help" class="btn btn-primary close-modal">Got It</button>
        </div>
      </div>

      <!-- Hidden form for leaderboard submission -->
      <form id="leaderboard-form" action="leaderboard.php" method="get" style="display:none;">
        <input type="hidden" name="email"      id="lb-email"      value="<?php echo htmlspecialchars($email); ?>" />
        <input type="hidden" name="score"      id="lb-score"      value="0" />
        <input type="hidden" name="difficulty"  id="lb-difficulty" value="" />
        <input type="hidden" name="result"      id="lb-result"     value="" />
      </form>

      <!-- Scripts — loaded in MVC order -->
      <script src="js/model.js"></script>
      <script src="js/view.js"></script>
      <script src="js/controller.js"></script>
    <?php endif; ?>

  </div>
</body>

</html>
