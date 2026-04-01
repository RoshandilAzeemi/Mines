<?php
/*
 * index.php
 * Roshan Azeemi
 * March 2026
 * Landing page — login / registration form with email and birth date.
 * JavaScript validates the email format before allowing submission.
 * Mines Game - CS 1XD3
 */
?>
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <meta name="description" content="Mines — Log in or sign up to play. Find the Diamonds, Dodge the Bombs." />
  <title>💎 Mines — Login</title>
  <link rel="stylesheet" href="css/style.css" />
</head>

<body>
  <div id="app">

    <!-- ========== LOGIN CARD ========== -->
    <div class="login-card">
      <div class="login-header">
        <span class="login-icon">💎</span>
        <h1 class="heading">MINES</h1>
        <p class="subtext">Find the Diamonds · Dodge the Bombs</p>
      </div>

      <form id="login-form" action="login.php" method="get">
        <div class="form-group">
          <label for="email" class="form-label">Email Address</label>
          <input
            type="email"
            id="email"
            name="email"
            class="form-input"
            placeholder="you@example.com"
            required
            maxlength="255"
            autocomplete="email"
          />
          <div id="email-error" class="form-error"></div>
        </div>

        <div class="form-group">
          <label for="birth_date" class="form-label">Birth Date</label>
          <input
            type="date"
            id="birth_date"
            name="birth_date"
            class="form-input"
            required
            max="2026-03-31"
          />
          <div id="date-error" class="form-error"></div>
        </div>

        <button type="submit" class="btn btn-primary btn-full">Enter Game</button>
      </form>
    </div>

  </div>

  <!-- Email validation script (external for separation of concerns) -->
  <script src="js/validation.js"></script>
</body>

</html>
