/* ============================================================
   validation.js
   Roshan Azeemi
   March 2026
   Validates the email field on index.php before form submission.
   Ensures the address has the format X@Y.Z where X, Y, Z
   contain at least one alphanumeric character.
   Mines Game - CS 1XD3
   ============================================================ */

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
