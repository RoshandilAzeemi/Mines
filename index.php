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

  <!-- ========== EMAIL VALIDATION SCRIPT ========== -->
  <script>
    /*
     * index-validation.js (inline)
     * Roshan Azeemi
     * March 2026
     * Validates the email field before form submission.
     * Ensures the address has the format X@Y.Z where X, Y, Z
     * contain at least one alphanumeric character.
     * Mines Game - CS 1XD3
     */
    (function () {
      const form       = document.getElementById('login-form');
      const emailInput = document.getElementById('email');
      const dateInput  = document.getElementById('birth_date');
      const emailErr   = document.getElementById('email-error');
      const dateErr    = document.getElementById('date-error');

      /**
       * Check that the email has at least the format a@b.c
       * where each section contains alphanumeric characters
       * and a dot appears after the @ symbol separating them.
       * @param {string} email - the email string to validate
       * @returns {string} an error message, or empty string if valid
       */
      function validateEmail(email) {
        email = email.trim();
        if (email.length === 0) {
          return 'Email is required.';
        }

        // Must contain exactly one @
        const atParts = email.split('@');
        if (atParts.length !== 2) {
          return 'Email must contain exactly one @ symbol.';
        }

        const local  = atParts[0];
        const domain = atParts[1];

        // Local part must have at least one alphanumeric character
        if (!/[a-zA-Z0-9]/.test(local)) {
          return 'The part before @ must contain at least one letter or number.';
        }

        // Domain must contain a dot
        if (!domain.includes('.')) {
          return 'The domain must contain a dot (e.g. example.com).';
        }

        // Split domain by dot — each part must have alphanumeric content
        const domainParts = domain.split('.');
        for (let i = 0; i < domainParts.length; i++) {
          if (!/[a-zA-Z0-9]/.test(domainParts[i])) {
            return 'Each part of the domain must contain at least one letter or number.';
          }
        }

        return ''; // valid
      }

      // Live feedback as user types
      emailInput.addEventListener('input', function () {
        const msg = validateEmail(emailInput.value);
        emailErr.textContent = msg;
        emailInput.classList.toggle('input-error', msg.length > 0);
      });

      // Form submission gate
      form.addEventListener('submit', function (e) {
        let hasError = false;

        // Validate email
        const emailMsg = validateEmail(emailInput.value);
        emailErr.textContent = emailMsg;
        emailInput.classList.toggle('input-error', emailMsg.length > 0);
        if (emailMsg) hasError = true;

        // Validate date
        if (!dateInput.value) {
          dateErr.textContent = 'Birth date is required.';
          dateInput.classList.add('input-error');
          hasError = true;
        } else {
          dateErr.textContent = '';
          dateInput.classList.remove('input-error');
        }

        if (hasError) {
          e.preventDefault();
        }
      });
    })();
  </script>
</body>

</html>
