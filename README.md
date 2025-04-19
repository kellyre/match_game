# Matching Game

A simple memory matching card game implemented in both Python (desktop) and TypeScript/HTML5 (web).

## Overview

This project provides two implementations of the classic memory matching card game:

1. **Python Desktop Version**: A standalone desktop application built with Tkinter
2. **Web Version**: A browser-based implementation using TypeScript, HTML5, and CSS

Both versions feature similar gameplay where players must find matching pairs of cards by flipping them two at a time.

## Python Desktop Version

### Features
- Multiple grid size options (4x4, 6x6, 8x8)
- Colored character pairs for matching
- Timer and attempt counter
- Responsive UI with Tkinter

### Requirements
- Python 3.6+
- Tkinter (usually included with Python)

### Running the Python Version
```bash
python matching_game.py
```

## Web Version (TypeScript/HTML5)

### Features
- Responsive design for various screen sizes
- Multiple grid size options (4x4, 6x6, 8x8)
- Custom grid size option
- Timer and attempt counter
- Colorful card matching

### Requirements
- Node.js and npm (for development)
- Modern web browser (for playing)

### Development Setup
1. Install dependencies:
   ```bash
   npm install
   ```

2. Compile TypeScript:
   ```bash
   npm run build
   ```

3. Start development server:
   ```bash
   npm start
   ```

4. Open browser at `http://localhost:3000`

### Deployment
The web version can be deployed to any static web hosting service, including:
- GitHub Pages
- Azure Static Web Apps
- Netlify
- Vercel

#### Deploying to Azure Storage Static Website
1. Build the project:
   ```bash
   npm run build
   ```

2. Upload the following files to your Azure Storage static website:
   - `index.html`
   - `dist/app.js`
   - Any CSS files

## Game Rules

1. Click on any card to reveal its character and color
2. Click on a second card to try to find a match
3. If the cards match (same character and color), they remain face up
4. If they don't match, they flip back face down after a short delay
5. Continue until all pairs are matched
6. Try to complete the game with the fewest attempts and in the shortest time

## Project Structure

```
matching-game/
├── index.html              # Web version HTML
├── src/
│   └── app.ts              # TypeScript implementation
├── dist/                   # Compiled JavaScript
│   └── app.js
├── matching_game.py        # Python implementation
├── package.json            # Node.js dependencies
└── tsconfig.json           # TypeScript configuration
```

## License

MIT License

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

