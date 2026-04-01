<?php
/*
 * leaderboard.php
 * Roshan Azeemi
 * March 2026
 * Receives game result parameters, stores the result in the database,
 * then displays user stats and the top-5 leaderboard.
 * Mines Game - CS 1XD3
 */

require_once 'db_connect.php';

// ---- Receive & validate parameters ----
$email      = filter_input(INPUT_GET, 'email',      FILTER_VALIDATE_EMAIL);
$score      = filter_input(INPUT_GET, 'score',      FILTER_VALIDATE_INT);
$difficulty = filter_input(INPUT_GET, 'difficulty',  FILTER_DEFAULT);
$result     = filter_input(INPUT_GET, 'result',      FILTER_DEFAULT);

// Validate difficulty
$valid_diffs = ['easy', 'medium', 'hard'];
if ($difficulty && !in_array($difficulty, $valid_diffs, true)) {
    $difficulty = null;
}

// Validate result
if ($result && !in_array($result, ['win', 'loss'], true)) {
    $result = null;
}

$has_email = ($email !== false && $email !== null);
$has_game  = ($score !== false && $score !== null && $difficulty && $result);

// ---- Store result if we have all game parameters ----
if ($has_email && $has_game) {
    $ins = $pdo->prepare(
        'INSERT INTO results (email, difficulty, result, score, played_date, played_time)
         VALUES (:email, :diff, :result, :score, CURDATE(), CURTIME())'
    );
    $ins->execute([
        ':email'  => $email,
        ':diff'   => $difficulty,
        ':result' => $result,
        ':score'  => $score,
    ]);
}

// ---- Fetch user stats ----
$user_stats = null;
if ($has_email) {
    $stmt = $pdo->prepare(
        "SELECT
            COUNT(*)                              AS rounds,
            COALESCE(SUM(score), 0)               AS total_score,
            COALESCE(MAX(score), 0)               AS high_score,
            SUM(CASE WHEN result = 'win' THEN 1 ELSE 0 END)  AS wins,
            SUM(CASE WHEN result = 'loss' THEN 1 ELSE 0 END) AS losses
         FROM results
         WHERE email = :email"
    );
    $stmt->execute([':email' => $email]);
    $user_stats = $stmt->fetch();
}

// ---- Fetch top 5 users by total score ----
$top5 = $pdo->query(
    "SELECT
        email,
        COUNT(*)                              AS rounds,
        SUM(score)                            AS total_score,
        MAX(score)                            AS high_score,
        SUM(CASE WHEN result = 'win' THEN 1 ELSE 0 END)  AS wins,
        ROUND(SUM(CASE WHEN result = 'win' THEN 1 ELSE 0 END) / COUNT(*) * 100) AS win_rate
     FROM results
     GROUP BY email
     ORDER BY total_score DESC
     LIMIT 5"
)->fetchAll();
?>
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <meta name="description" content="Mines — Leaderboard and player statistics." />
  <title>💎 Mines — Leaderboard</title>
  <link rel="stylesheet" href="css/style.css" />
</head>

<body>
  <div id="app">

    <?php if (!$has_email): ?>
      <!-- No email — error -->
      <div class="message-card">
        <div class="msg-icon">⚠️</div>
        <h1 class="heading">No Data</h1>
        <p class="subtext">No player email was provided. Please log in and play a round first.</p>
        <a href="index.php" class="btn btn-primary btn-full">Go to Login</a>
      </div>
    <?php else: ?>

      <!-- User bar -->
      <div class="user-bar">
        <span class="user-email">👤 <?php echo htmlspecialchars($email); ?></span>
        <a href="index.php" class="btn btn-outline btn-sm">Log Out</a>
      </div>

      <!-- ========== YOUR STATS ========== -->
      <div class="leaderboard-section">
        <h2 class="heading">📊 Your Stats</h2>

        <?php if ($user_stats && $user_stats['rounds'] > 0):
          $win_rate = $user_stats['rounds'] > 0
            ? round($user_stats['wins'] / $user_stats['rounds'] * 100)
            : 0;
        ?>
          <div class="stats-row stats-row-lg">
            <div class="stat-box">
              <div class="val"><?php echo $user_stats['total_score']; ?></div>
              <div class="lbl">Total Score</div>
            </div>
            <div class="stat-box">
              <div class="val"><?php echo $user_stats['high_score']; ?></div>
              <div class="lbl">High Score</div>
            </div>
            <div class="stat-box">
              <div class="val"><?php echo $user_stats['rounds']; ?></div>
              <div class="lbl">Rounds</div>
            </div>
          </div>
          <div class="stats-row stats-row-lg">
            <div class="stat-box">
              <div class="val stat-green"><?php echo $user_stats['wins']; ?></div>
              <div class="lbl">Wins</div>
            </div>
            <div class="stat-box">
              <div class="val stat-red"><?php echo $user_stats['losses']; ?></div>
              <div class="lbl">Losses</div>
            </div>
            <div class="stat-box">
              <div class="val"><?php echo $win_rate; ?>%</div>
              <div class="lbl">Win Rate</div>
            </div>
          </div>
        <?php else: ?>
          <p class="subtext">No games played yet. Go play a round!</p>
        <?php endif; ?>
      </div>

      <!-- ========== TOP 5 LEADERBOARD ========== -->
      <div class="leaderboard-section">
        <h2 class="heading">🏆 Top 5 Players</h2>

        <?php if (count($top5) > 0): ?>
          <div class="leaderboard-table-wrapper">
            <table class="leaderboard-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Player</th>
                  <th>Score</th>
                  <th>Rounds</th>
                  <th>Win %</th>
                </tr>
              </thead>
              <tbody>
                <?php foreach ($top5 as $i => $row): ?>
                  <tr<?php echo ($row['email'] === $email) ? ' class="highlight-row"' : ''; ?>>
                    <td class="rank-cell">
                      <?php
                        $medals = ['🥇', '🥈', '🥉'];
                        echo isset($medals[$i]) ? $medals[$i] : ($i + 1);
                      ?>
                    </td>
                    <td class="player-cell"><?php echo htmlspecialchars($row['email']); ?></td>
                    <td><?php echo $row['total_score']; ?></td>
                    <td><?php echo $row['rounds']; ?></td>
                    <td><?php echo $row['win_rate']; ?>%</td>
                  </tr>
                <?php endforeach; ?>
              </tbody>
            </table>
          </div>
        <?php else: ?>
          <p class="subtext">No results yet. Be the first to play!</p>
        <?php endif; ?>
      </div>

      <!-- Action buttons -->
      <div class="lb-actions">
        <a href="play.php?email=<?php echo urlencode($email); ?>" class="btn btn-green">Play Again</a>
        <a href="index.php" class="btn btn-outline">Log Out</a>
      </div>

    <?php endif; ?>

  </div>
</body>

</html>
