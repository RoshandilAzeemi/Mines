<?php
/*
 * login.php
 * Roshan Azeemi
 * March 2026
 * Handles authentication — checks email/birth_date combo against
 * the database. Three outcomes: welcome back, new user, or wrong password.
 * Mines Game - CS 1XD3
 */

require_once 'db_connect.php';

// ---- Receive & validate parameters ----
$email      = filter_input(INPUT_GET, 'email', FILTER_VALIDATE_EMAIL);
$birth_date = filter_input(INPUT_GET, 'birth_date', FILTER_DEFAULT);

// Validate birth_date format (YYYY-MM-DD)
$date_valid = false;
if ($birth_date) {
    $d = DateTime::createFromFormat('Y-m-d', $birth_date);
    $date_valid = $d && $d->format('Y-m-d') === $birth_date;
}

// Determine the status to display
$status  = '';   // 'welcome_back' | 'new_user' | 'wrong_password' | 'error'
$message = '';

if (!$email) {
    $status  = 'error';
    $message = 'Invalid or missing email address. Please go back and try again.';
} elseif (!$date_valid) {
    $status  = 'error';
    $message = 'Invalid or missing birth date. Please go back and try again.';
} else {
    // Look up the email in the database
    $stmt = $pdo->prepare('SELECT birth_date FROM players WHERE email = :email');
    $stmt->execute([':email' => $email]);
    $row = $stmt->fetch();

    if ($row) {
        // Email exists — check birth date
        if ($row['birth_date'] === $birth_date) {
            $status  = 'welcome_back';
            $message = 'Welcome back! We remember you. Ready to play again?';
        } else {
            $status  = 'wrong_password';
            $message = 'That email is already taken. Please go back and try a different one.';
        }
    } else {
        // New user — insert into database
        $ins = $pdo->prepare('INSERT INTO players (email, birth_date) VALUES (:email, :bd)');
        $ins->execute([':email' => $email, ':bd' => $birth_date]);
        $status  = 'new_user';
        $message = 'Welcome to Mines! Your account has been created. Let\'s play!';
    }
}
?>
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <meta name="description" content="Mines — Login result." />
  <title>💎 Mines — <?php echo $status === 'welcome_back' ? 'Welcome Back' : ($status === 'new_user' ? 'Welcome' : 'Error'); ?></title>
  <link rel="stylesheet" href="css/style.css" />
</head>

<body>
  <div id="app">

    <div class="message-card">
      <?php if ($status === 'welcome_back'): ?>
        <div class="msg-icon">👋</div>
        <h1 class="heading">Welcome Back!</h1>
        <p class="subtext"><?php echo htmlspecialchars($message); ?></p>
        <a href="play.php?email=<?php echo urlencode($email); ?>" class="btn btn-green btn-full">Play Mines</a>

      <?php elseif ($status === 'new_user'): ?>
        <div class="msg-icon">🎉</div>
        <h1 class="heading">Welcome!</h1>
        <p class="subtext"><?php echo htmlspecialchars($message); ?></p>
        <a href="play.php?email=<?php echo urlencode($email); ?>" class="btn btn-green btn-full">Play Mines</a>

      <?php elseif ($status === 'wrong_password'): ?>
        <div class="msg-icon">🔒</div>
        <h1 class="heading">Email Taken</h1>
        <p class="subtext"><?php echo htmlspecialchars($message); ?></p>
        <a href="index.php" class="btn btn-primary btn-full">Try Again</a>

      <?php else: ?>
        <div class="msg-icon">⚠️</div>
        <h1 class="heading">Oops</h1>
        <p class="subtext"><?php echo htmlspecialchars($message); ?></p>
        <a href="index.php" class="btn btn-primary btn-full">Go Back</a>
      <?php endif; ?>
    </div>

  </div>
</body>

</html>
