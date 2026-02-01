# 🚀 Quick Start Guide - REPO BRAIN HOSPITAL v2.2.0

## Complete Application Setup

This guide shows how to run the fully functional Repo Brain Hospital application based on the MERMEDA v2.2.0 specification.

## Prerequisites

- Node.js v20 or higher
- npm or yarn
- Git
- (Optional) Hardhat/Foundry for Web3 repos

## Installation

### 1. Install Dependencies

```bash
npm install --legacy-peer-deps
```

### 2. Build the Application

```bash
npm run build
```

## Running the Application

### Option 1: Full Stack (Recommended)

Run both the frontend dashboard and backend API:

```bash
# Terminal 1: Start the backend API server
npm run server

# Terminal 2: Start the frontend dashboard
npm run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- API Server: http://localhost:3001

### Option 2: Frontend Only (Demo Mode)

If you only want to run the UI without backend integration:

```bash
npm run dev
```

The UI will fall back to mock data when the API is not available.

### Option 3: CLI Mode

Run brain operations directly from command line:

```bash
# Run the full 18-phase pipeline
bash brain.run.sh

# Or use the brainctl CLI
bash brainctl.sh run
bash brainctl.sh doctor
bash brainctl.sh vitals
```

## Application Features

### 1. Dashboard Interface

The main dashboard provides:
- **Fleet Overview**: Real-time status of all repositories
- **Health Distribution Chart**: Visual breakdown of repo health
- **Mission Control**: Quick access to all brain modules
- **Repository Cards**: Detailed status for each repo

### 2. 18-Phase MERMEDA Pipeline

The application implements the complete MERMEDA v2.2.0 workflow:

1. **Detection** (Phase 1-3): Language and framework detection
2. **Scanning** (Phase 4-7): CI/CD and workflow analysis
3. **Normalization** (Phase 8): Configuration standardization
4. **Diagnosis** (Phase 9): Health status determination
5. **Auto-Repair** (Phase 10): Safe automated fixes
6. **Verification** (Phase 11): Build and test validation
7. **AI Guard** (Phase 12): Security scanning
8. **Greenlock** (Phase 13): Integrity locking
9. **Neural Bridge** (Phase 14): GitHub token authentication repair ✨ NEW
10. **Motor Function** (Phase 15): Hardhat/Web3 compilation check ✨ NEW
11. **Guard** (Phase 16): Copilot instructions generation
12. **Fleet Sync** (Phase 17): Multi-repo synchronization
13. **Vitals** (Phase 18): Metrics collection

### 3. Backend API

The API server provides REST endpoints for:

- `POST /api/brain/run` - Execute full pipeline
- `POST /api/brain/scan` - Scan a repository
- `GET /api/brain/diagnosis` - Get current diagnosis
- `GET /api/brain/logs` - Retrieve execution logs
- `POST /api/brain/repair-pr` - Create repair PR
- And more...

See `server.ts` for complete API documentation.

### 4. Repository Scanning

Use the Admission Portal in the UI to:
1. Enter a repository path or leave blank for current repo
2. Click "Scan Repo" to initiate 18-phase analysis
3. View real-time logs in the terminal overlay
4. Review diagnosis and health score

### 5. Automated Repairs

For repositories with AUTO_FIXABLE status:
1. Click "Wire PR Repair" on the repo card
2. Brain generates and submits a repair PR
3. Review the PR with detailed change explanation
4. Merge to bring repo to GREEN status

## Canonical Workflows

The application includes GitHub Actions workflows in `.repo-brain/github-actions/`:

- **brain-ci.yml**: Standard CI pipeline with detection, build, security scan
- **brain-auto-repair.yml**: Automated daily repair workflow

These workflows are automatically synchronized to repositories during normalization.

## Architecture

```
repo-brain-hospital/
├── App.tsx                    # Main dashboard UI
├── server.ts                  # Backend API server ✨ NEW
├── services/
│   ├── brainService.ts       # Backend brain execution ✨ NEW
│   ├── brainApiService.ts    # Frontend API client ✨ NEW
│   └── geminiService.ts      # AI integration
├── components/               # UI components
├── brain.*.sh                # 27 brain shell scripts
├── brain.run.sh              # 18-phase orchestrator
├── brain.neural.bridge.sh    # Phase 14 ✨ NEW
├── brain.motor.function.sh   # Phase 15 ✨ NEW
└── .repo-brain/
    └── github-actions/       # Canonical workflows ✨ NEW
```

## Environment Variables

Create a `.env.local` file for optional configuration:

```env
# Gemini AI (for Oracle Audit feature)
GEMINI_API_KEY=your_api_key_here

# API Server Port (default: 3001)
PORT=3001

# GitHub Token (for PR creation)
GITHUB_TOKEN=your_token_here
```

## Testing

Run the brain test suite:

```bash
bash brain.test.sh
```

Or via brainctl:

```bash
bash brainctl.sh test
```

## Production Deployment

### Deploy to Vercel

```bash
npm run deploy:vercel
```

### Build Standalone Executable (Windows)

```bash
npm run pack:win
# Generates brain.exe
```

## Troubleshooting

### API Server Not Starting

If the API server fails to start:
1. Check that port 3001 is available
2. Ensure all dependencies are installed
3. Check Node.js version (requires v20+)

### UI Falls Back to Mock Data

This is normal behavior when the API server is not running. To use real brain execution:
1. Start the API server: `npm run server`
2. Verify health check: `curl http://localhost:3001/api/health`
3. Refresh the browser

### Brain Scripts Not Executing

Ensure scripts are executable:
```bash
chmod +x brain.*.sh
chmod +x brainctl.sh
```

## Documentation

- **MERMEDA Spec**: See `docs/MERMEDA.md` for complete specification
- **User Guide**: See `docs/USER_GUIDE.md` for detailed usage
- **Technical Specs**: See `docs/SPECS.md` for architecture details

## Support

For issues or questions:
- Review the documentation in `docs/`
- Check `.repo-brain/brain.health.md` for system status
- Visit www.CyberAi.network for support

---

**Built with ❤️ by CyberAI Oracle Network**  
MERMEDA v2.2.0 Protocol Implementation
