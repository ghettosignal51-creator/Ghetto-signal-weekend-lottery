<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="Quick Odds Uganda - Mobile lottery game" />
    <meta name="theme-color" content="#000000" />
    <title>Quick Odds Uganda 🎮</title>
    <style>
      * { box-sizing: border-box; }

      html, body {
        margin: 0;
        width: 100%;
        height: 100%;
        overflow: hidden;
        font-family: Arial, sans-serif;
        background: #05070d;
      }

      body {
        position: relative;
      }

      #game {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
      }

      canvas {
        display: block;
        margin: auto;
        max-width: 100%;
        max-height: 100%;
      }

      #authOverlay {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(5, 7, 13, 0.7);
        backdrop-filter: blur(6px);
        z-index: 10;
      }

      #authPanel {
        width: min(420px, calc(100vw - 32px));
        background: rgba(14, 21, 32, 0.96);
        border: 1px solid rgba(116, 144, 201, 0.5);
        border-radius: 18px;
        padding: 24px 20px 18px;
        box-shadow: 0 24px 70px rgba(0, 0, 0, 0.45);
      }

      #authPanel h1 {
        color: #f5f7ff;
        font-size: 1.8rem;
        text-align: center;
        margin-bottom: 8px;
      }

      #authPanel p {
        color: #b7bfd6;
        text-align: center;
        margin-bottom: 18px;
        font-size: 0.95rem;
      }

      .auth-toggle {
        display: flex;
        gap: 8px;
        background: rgba(255,255,255,0.04);
        border: 1px solid rgba(255,255,255,0.08);
        border-radius: 12px;
        padding: 4px;
        margin-bottom: 16px;
      }

      .auth-toggle button {
        flex: 1;
        background: transparent;
        color: #dfe9ff;
        border: 0;
        border-radius: 10px;
        padding: 10px 12px;
        cursor: pointer;
        font-weight: 700;
      }

      .auth-toggle button.active {
        background: linear-gradient(135deg, #54a0ff, #2ecc71);
        color: #05121c;
      }

      .form-group {
        display: flex;
        flex-direction: column;
        gap: 6px;
        margin-bottom: 14px;
      }

      .form-group label {
        color: #dfe9ff;
        font-size: 0.85rem;
        font-weight: 600;
      }

      .form-group input {
        width: 100%;
        padding: 12px 14px;
        border-radius: 10px;
        border: 1px solid rgba(159, 171, 200, 0.34);
        background: rgba(255,255,255,0.02);
        color: #f4f7fb;
        font-size: 1rem;
      }

      .form-group input:focus {
        outline: 2px solid rgba(84, 160, 255, 0.45);
        border-color: rgba(84, 160, 255, 0.7);
      }

      .submit-btn {
        width: 100%;
        border: 0;
        border-radius: 12px;
        background: linear-gradient(135deg, #54a0ff, #2ecc71);
        color: #06131d;
        font-size: 1rem;
        font-weight: 800;
        padding: 13px 14px;
        cursor: pointer;
        margin-top: 6px;
      }

      .status {
        min-height: 22px;
        margin-top: 12px;
        font-size: 0.9rem;
        color: #ffd166;
        text-align: center;
      }
    </style>
  </head>
  <body>
    <div id="game"></div>

    <div id="authOverlay">
      <div id="authPanel">
        <h1>Quick Odds</h1>
        <p>Sign in to start playing</p>

        <div class="auth-toggle" aria-label="Authentication mode">
          <button type="button" class="active" data-mode="login">Login</button>
          <button type="button" data-mode="signup">Sign up</button>
        </div>

        <form id="authForm">
          <div class="form-group" id="usernameGroup" style="display:none;">
            <label for="username">Username</label>
            <input id="username" name="username" type="text" placeholder="Enter username" />
          </div>

          <div class="form-group">
            <label for="phone">Phone</label>
            <input id="phone" name="phone" type="tel" placeholder="e.g. +256700000000" required />
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <input id="password" name="password" type="password" placeholder="Enter password" required />
          </div>

          <button type="submit" class="submit-btn">Login</button>
        </form>

        <div id="authStatus" class="status" aria-live="polite"></div>
      </div>
    </div>

    <script src="./app.js"></script>
  </body>
</html>
