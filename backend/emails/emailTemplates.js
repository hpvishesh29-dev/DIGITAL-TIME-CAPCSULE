export const welcomeEmailTemplate = (userName) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #070B14; color: #E2E8F0; margin: 0; padding: 40px 20px; }
    .container { max-width: 600px; margin: 0 auto; background: rgba(15, 23, 42, 0.85); border: 1px solid rgba(255,255,255,0.15); border-radius: 24px; padding: 40px; text-align: center; }
    .logo { font-size: 28px; font-weight: 800; background: linear-gradient(135deg, #06B6D4, #6366F1, #A855F7); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .title { font-size: 22px; margin-top: 20px; color: #FFFFFF; }
    .text { color: #94A3B8; font-size: 15px; line-height: 1.6; margin: 20px 0; }
    .btn { display: inline-block; padding: 14px 28px; background: linear-gradient(135deg, #6366F1, #06B6D4); color: #FFFFFF; text-decoration: none; font-weight: 600; border-radius: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">CHRONA</div>
    <div class="title">Welcome to Your AI Digital Time Capsule</div>
    <p class="text">Hello ${userName || 'Time Keeper'},<br/>Welcome to Chrona. You now have access to a futuristic spatial memory vault powered by AI. Preserve your life moments, voice notes, media, and reflections for future generations.</p>
    <a href="https://chrona-app.com" class="btn">Explore Your Spatial Vault</a>
  </div>
</body>
</html>
`;

export const passwordResetTemplate = (resetUrl) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #070B14; color: #E2E8F0; margin: 0; padding: 40px 20px; }
    .container { max-width: 600px; margin: 0 auto; background: rgba(15, 23, 42, 0.85); border: 1px solid rgba(255,255,255,0.15); border-radius: 24px; padding: 40px; text-align: center; }
    .logo { font-size: 28px; font-weight: 800; color: #6366F1; }
    .title { font-size: 20px; margin-top: 20px; color: #FFFFFF; }
    .text { color: #94A3B8; font-size: 14px; line-height: 1.6; margin: 20px 0; }
    .btn { display: inline-block; padding: 12px 24px; background: #6366F1; color: #FFFFFF; text-decoration: none; font-weight: 600; border-radius: 10px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">CHRONA</div>
    <div class="title">Reset Your Access Credentials</div>
    <p class="text">We received a request to reset your password. Click the button below to establish a new password.</p>
    <a href="${resetUrl}" class="btn">Reset Password</a>
  </div>
</body>
</html>
`;

export const timeCapsuleUnlockTemplate = (userName, memoryTitle, unlockDate, appUrl = 'http://localhost:5173') => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>🔓 Your Chrona Time Capsule has been unlocked!</title>
  <style>
    body {
      font-family: 'Segoe UI', system-ui, -apple-system, BlinkMacSystemFont, Roboto, sans-serif;
      background-color: #070b14;
      color: #e2e8f0;
      margin: 0;
      padding: 32px 16px;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      max-width: 580px;
      margin: 0 auto;
      background: #0f172a;
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 24px;
      overflow: hidden;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6);
    }
    .header {
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.25), rgba(6, 182, 212, 0.25));
      padding: 36px 24px 28px;
      text-align: center;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }
    .logo {
      font-size: 28px;
      font-weight: 900;
      letter-spacing: 4px;
      color: #38bdf8;
      margin-bottom: 10px;
    }
    .badge {
      display: inline-block;
      padding: 6px 16px;
      border-radius: 9999px;
      background: rgba(6, 182, 212, 0.15);
      border: 1px solid rgba(6, 182, 212, 0.35);
      color: #38bdf8;
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .body {
      padding: 32px 28px;
      text-align: center;
    }
    .greeting {
      font-size: 20px;
      font-weight: 700;
      color: #ffffff;
      margin-bottom: 12px;
    }
    .message {
      color: #94a3b8;
      font-size: 15px;
      line-height: 1.65;
      margin-bottom: 24px;
    }
    .card {
      background: rgba(15, 23, 42, 0.7);
      border: 1px solid rgba(56, 189, 248, 0.35);
      border-radius: 18px;
      padding: 22px;
      margin-bottom: 28px;
      text-align: left;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
    }
    .card-title {
      font-size: 18px;
      font-weight: 800;
      color: #38bdf8;
      margin-bottom: 8px;
    }
    .card-meta {
      font-size: 13px;
      color: #a7f3d0;
      font-weight: 600;
    }
    .btn {
      display: inline-block;
      padding: 14px 36px;
      background: linear-gradient(135deg, #6366f1, #06b6d4);
      color: #ffffff !important;
      text-decoration: none;
      font-weight: 700;
      font-size: 15px;
      border-radius: 14px;
      box-shadow: 0 6px 24px rgba(99, 102, 241, 0.45);
    }
    .footer {
      padding: 20px 24px;
      background: #070a12;
      text-align: center;
      font-size: 12px;
      color: #64748b;
      border-top: 1px solid rgba(255, 255, 255, 0.05);
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <div class="logo">CHRONA</div>
      <div class="badge">🔓 Time Capsule Unlocked</div>
    </div>
    <div class="body">
      <div class="greeting">Hello ${userName || 'Time Traveler'},</div>
      <p class="message">
        Your digital time capsule has unlocked! The preserved memory you sealed is now unlocked and available in your spatial vault.
      </p>
      <div class="card">
        <div class="card-title">✨ ${memoryTitle || 'Untitled Memory'}</div>
        <div class="card-meta">Unlocked on: ${unlockDate || 'Today'}</div>
      </div>
      <a href="${appUrl}" class="btn">Open Chrona</a>
    </div>
    <div class="footer">
      Created with Chrona Digital Time Capsule
    </div>
  </div>
</body>
</html>
`;
export const pushNotificationEmailTemplate = (userName, subject, message) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #070B14; color: #E2E8F0; margin: 0; padding: 40px 20px; }
    .container { max-width: 600px; margin: 0 auto; background: rgba(15, 23, 42, 0.85); border: 1px solid rgba(255,255,255,0.15); border-radius: 24px; padding: 40px; text-align: center; }
    .logo { font-size: 28px; font-weight: 800; background: linear-gradient(135deg, #06B6D4, #6366F1, #A855F7); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .title { font-size: 22px; margin-top: 20px; color: #FFFFFF; font-weight: bold; }
    .text { color: #94A3B8; font-size: 15px; line-height: 1.6; margin: 20px 0; }
    .box { background: rgba(99, 102, 241, 0.1); border: 1px solid rgba(99, 102, 241, 0.3); border-radius: 16px; padding: 20px; margin: 24px 0; text-align: left; }
    .box-title { color: #06B6D4; font-weight: bold; font-size: 16px; mb-2; }
    .box-content { color: #E2E8F0; font-size: 14px; line-height: 1.5; }
    .btn { display: inline-block; padding: 14px 28px; background: linear-gradient(135deg, #6366F1, #06B6D4); color: #FFFFFF; text-decoration: none; font-weight: 600; border-radius: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">CHRONA VAULT</div>
    <div class="title">🔔 ${subject || 'Notification Alert'}</div>
    <p class="text">Hello <strong>${userName || 'Time Keeper'}</strong>,<br/>You have a new update pushed directly from your Chrona Spatial Vault session.</p>
    <div class="box">
      <div class="box-title">Message Details:</div>
      <div class="box-content">${message || 'Your spatial vault status is optimal and synchronized.'}</div>
    </div>
    <a href="https://chrona-app.com" class="btn">Open Chrona Vault</a>
  </div>
</body>
</html>
`;

export const vaultSummaryEmailTemplate = (userName, stats = {}) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #070B14; color: #E2E8F0; margin: 0; padding: 40px 20px; }
    .container { max-width: 600px; margin: 0 auto; background: rgba(15, 23, 42, 0.85); border: 1px solid rgba(255,255,255,0.15); border-radius: 24px; padding: 40px; text-align: center; }
    .logo { font-size: 28px; font-weight: 800; background: linear-gradient(135deg, #06B6D4, #6366F1, #A855F7); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .title { font-size: 22px; margin-top: 20px; color: #FFFFFF; font-weight: bold; }
    .text { color: #94A3B8; font-size: 15px; line-height: 1.6; margin: 15px 0; }
    .stat-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 24px 0; text-align: center; }
    .stat-card { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); padding: 16px; border-radius: 16px; }
    .stat-num { font-size: 24px; font-weight: 800; color: #06B6D4; }
    .stat-label { font-size: 12px; color: #94A3B8; margin-top: 4px; }
    .btn { display: inline-block; padding: 14px 28px; background: linear-gradient(135deg, #6366F1, #06B6D4); color: #FFFFFF; text-decoration: none; font-weight: 600; border-radius: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">CHRONA VAULT</div>
    <div class="title">📊 Your Spatial Vault Summary</div>
    <p class="text">Hello <strong>${userName || 'Time Keeper'}</strong>,<br/>Here is your personal memory vault backup and summary snapshot.</p>
    <div class="stat-grid">
      <div class="stat-card">
        <div class="stat-num">${stats.totalMemories || 5}</div>
        <div class="stat-label">Total Memories</div>
      </div>
      <div class="stat-card">
        <div class="stat-num">${stats.totalCapsules || 2}</div>
        <div class="stat-label">Locked Capsules</div>
      </div>
    </div>
    <a href="https://chrona-app.com" class="btn">View Vault on 3D Earth</a>
  </div>
</body>
</html>
`;
