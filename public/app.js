(() => {
  const apiBase = (window.QUICK_ODDS_API_URL || '').replace(/\/$/, '');
  const overlay = document.getElementById('authOverlay');
  const form = document.getElementById('authForm');
  const usernameGroup = document.getElementById('usernameGroup');
  const usernameInput = document.getElementById('username');
  const phoneInput = document.getElementById('phone');
  const passwordInput = document.getElementById('password');
  const status = document.getElementById('authStatus');
  const submit = form.querySelector('.submit-btn');
  const modeButtons = [...document.querySelectorAll('[data-mode]')];
  let mode = 'login';

  const setStatus = (message, isError = false) => {
    status.textContent = message;
    status.classList.toggle('error', isError);
  };

  const setMode = (nextMode) => {
    mode = nextMode;
    const signup = mode === 'signup';
    usernameGroup.hidden = !signup;
    usernameInput.required = signup;
    passwordInput.autocomplete = signup ? 'new-password' : 'current-password';
    submit.textContent = signup ? 'Create account' : 'Login';
    document.getElementById('authSubtitle').textContent = signup ? 'Create an account to start playing' : 'Sign in to start playing';
    modeButtons.forEach((button) => button.classList.toggle('active', button.dataset.mode === mode));
    setStatus('');
  };

  modeButtons.forEach((button) => button.addEventListener('click', () => setMode(button.dataset.mode)));

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    setStatus('Please wait...');
    submit.disabled = true;
    const body = { phone: phoneInput.value.trim(), password: passwordInput.value };
    if (mode === 'signup') body.username = usernameInput.value.trim();

    try {
      const response = await fetch(`${apiBase}/api/auth/${mode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || 'Authentication failed.');
      localStorage.setItem('quickOddsToken', data.token);
      overlay.hidden = true;
      if (typeof window.startGame === 'function') window.startGame();
    } catch (error) {
      setStatus(error.message || 'Could not connect to the server.', true);
    } finally {
      submit.disabled = false;
    }
  });
})();
