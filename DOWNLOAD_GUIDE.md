# 📥 How to Download & Run on Your Flash Drive

## Quick Start (3 Steps)

### Step 1: Install Node.js
Download and install from https://nodejs.org/ (LTS version)

### Step 2: Download This Project
```bash
# Option A: Using Git
git clone https://github.com/ghettosignal51-creator/Ghetto-signal-weekend-lottery.git
cd Ghetto-signal-weekend-lottery

# Option B: Download ZIP from GitHub and extract
```

### Step 3: Install & Run
```bash
npm install
npm run dev
```

Game opens at `http://localhost:8080` 🎮

---

## For Flash Drive (Recommended)

### Setup (First Time)
1. Download project (see Step 2 above)
2. Run `npm install`
3. Delete `node_modules` folder (saves 500MB)
4. Copy entire `Ghetto-signal-weekend-lottery` folder to flash drive

### Running on Any Computer
```bash
cd Ghetto-signal-weekend-lottery
npm install
npm run dev
```

---

## Production Build (No Dev Server Needed)

```bash
npm run build
```

Creates `dist/` folder with all compiled files.

---

## Available Scripts

- `npm run dev` - Development server with hot reload
- `npm run build` - Production build
- `npm run watch` - Watch mode (compile on change)
- `npm start` - Alias for dev

---

## Troubleshooting

**"npm not found"** → Install Node.js first

**"Port 8080 in use"** → Change port: `npm run dev -- --port 3000`

**Game won't load** → Make sure you're in the project folder

**Flash drive full** → Don't copy `node_modules`, reinstall with `npm install`

---

**Enjoy your lottery game! 🎮💰**
