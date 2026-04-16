# 📚 Repo-Doctor Documentation - Table of Contents

## 🚀 Quick Start
- [README](../README.md) - Project overview and introduction
- [QUICKSTART](../QUICKSTART.md) - Get started in 5 minutes
- [USER_GUIDE](USER_GUIDE.md) - Step-by-step user guide

## 🏗️ Architecture & Specifications
- [MERMEDA](MERMEDA.md) - Core 18-phase orchestration specification
- [SPECS](SPECS.md) - Technical specifications and architecture
- [IMPLEMENTATION_SUMMARY](../IMPLEMENTATION_SUMMARY.md) - Implementation details

## 🔄 Synchronization & Automation
- [SYNC_API](SYNC_API.md) - Advanced synchronization strategy API
- [SYNC_IMPLEMENTATION](../SYNC_IMPLEMENTATION.md) - Sync service implementation details
- [AUTO_FEATURES](AUTO_FEATURES.md) - **NEW**: Auto Sync, Auto Test, Auto Analysis, Auto Fix

## 🚀 Deployment
- [VERCEL_DEPLOYMENT](VERCEL_DEPLOYMENT.md) - Deploy to Vercel with serverless functions

## 📝 Release Notes
- [UPDATES_V2.2](UPDATES_V2.2.md) - Version 2.2.0 updates and new features

## 📖 Feature Documentation

### Core Brain Features
| Feature | Description | Documentation |
|---------|-------------|---------------|
| **18-Phase Pipeline** | Complete autonomous governance workflow | [MERMEDA.md](MERMEDA.md) |
| **Health Scoring** | Real-time repository health metrics (1-100) | [USER_GUIDE.md](USER_GUIDE.md) |
| **AI Guard** | Security scanning and vulnerability detection | [SPECS.md](SPECS.md) |
| **Fleet Sync** | Multi-repository synchronization | [SYNC_API.md](SYNC_API.md) |

### Automation Features
| Feature | Description | API Endpoint | Documentation |
|---------|-------------|--------------|---------------|
| **Auto Sync** | Automatic repository synchronization with configurable strategies | `POST /api/sync/execute/:id` | [AUTO_FEATURES.md](AUTO_FEATURES.md#auto-sync) |
| **Auto Test** | Automated testing and validation | `Phase 18` via brain.test.sh | [AUTO_FEATURES.md](AUTO_FEATURES.md#auto-test) |
| **Auto Analysis** | Intelligent codebase analysis and diagnosis | `POST /api/brain/scan` | [AUTO_FEATURES.md](AUTO_FEATURES.md#auto-analysis) |
| **Auto Fix** | Automated issue detection and repair | `POST /api/brain/auto-fix` | [AUTO_FEATURES.md](AUTO_FEATURES.md#auto-fix) |

### API Endpoints

#### Brain Operations
- `GET /api/health` - Health check endpoint
- `POST /api/brain/run` - Execute full 18-phase pipeline
- `POST /api/brain/phase/:phaseName` - Execute specific phase
- `POST /api/brain/scan` - Scan repository
- `GET /api/brain/diagnosis` - Get diagnosis results
- `GET /api/brain/detection` - Get detection results
- `GET /api/brain/logs` - Get execution logs
- `POST /api/brain/autopsy` - Run autopsy analysis
- `POST /api/brain/doctor` - Run health check
- `POST /api/brain/repair-pr` - Create repair PR
- `POST /api/brain/normalize` - Normalize repository structure
- `POST /api/brain/auto-fix` - **Auto fix with full pipeline**

#### Sync Operations
- `POST /api/sync/strategy` - Register sync strategy
- `GET /api/sync/strategies` - List all strategies
- `PUT /api/sync/strategy/:id` - Update strategy
- `DELETE /api/sync/strategy/:id` - Delete strategy
- `POST /api/sync/execute/:id` - Execute sync
- `POST /api/sync/schedule/start/:id` - Start scheduled sync
- `POST /api/sync/schedule/stop/:id` - Stop scheduled sync
- `GET /api/sync/monitor/:id` - Get sync monitor status
- `GET /api/sync/monitors` - Get all monitors
- `POST /api/sync/config/load` - Load configuration
- `POST /api/sync/config/save` - Save configuration

#### Public API
- `GET /api/public/config` - Public sync configuration (read-only)
- `GET /api/public/status` - Public system health and metrics

## 🛠️ Scripts & CLI

### Brain Scripts (Shell)
Located in project root:
- `brain.run.sh` - Master orchestration script
- `brain.detect.sh` - Environment detection
- `brain.scan-actions.sh` - GitHub Actions scanner
- `brain.frameworks.sh` - Framework detection
- `brain.diagnose.sh` - Health diagnosis
- `brain.doctor.sh` - Health check
- `brain.surgeon.sh` - Auto-repair
- `brain.test.sh` - **Auto Test** validation suite
- `brain.auto-pr.sh` - **Auto PR** generation
- `brain.autopsy.sh` - Failure analysis
- `brain.fix.safe.sh` - Safe fixes
- `brain.verify.sh` - Verification
- `brain.guard.sh` - Security guard
- `brain.ai.guard.sh` - AI-powered security scanning
- `brain.fleet.sh` - Fleet management
- `brain.normalize.sh` - Normalization
- `brain.vitals.sh` - Vitals tracking

### CLI Tools
- `brainctl.sh` - Brain control CLI
- `fleet-sync.sh` - Fleet synchronization
- `fleet-bootstrap.sh` - Fleet bootstrapping

### Test Scripts
- `test-sync-strategy.sh` - Sync strategy integration tests
- `test-new-endpoints.sh` - New endpoint tests

## 🔐 Security

### Security Features
- **Command Injection Prevention**: Using `execFile()` instead of `exec()`
- **Path Traversal Protection**: Target path validation and sanitization
- **File Access Restrictions**: Config operations restricted to `.repo-brain/`
- **Memory Management**: Log size limits (1000 lines) to prevent memory exhaustion
- **Execution Locking**: Prevents overlapping sync executions
- **Type Safety**: Full TypeScript coverage with proper error handling
- **AI Guard**: Detects unsafe patterns, exposed secrets, and vulnerabilities

Documentation: [SYNC_API.md - Security Section](SYNC_API.md#security)

## 🏛️ Architecture Concepts

### MERMEDA Protocol
The 18-phase autonomous governance protocol that powers Repo-Doctor:
1. **Detection** (Phases 1-3): Environment and stack detection
2. **Language Mapping** (Phases 4-7): Framework and tooling detection
3. **Normalization** (Phase 8): Configuration standardization
4. **Diagnosis** (Phase 9): Health assessment
5. **Auto-Fixable** (Phase 10): Safe automated repairs
6. **Verification** (Phase 11): Validation and testing
7. **AI Guard** (Phase 12): Security scanning
8. **Autopsy** (Phase 13): Failure analysis
9. **Immunizer** (Phase 14): Preventive measures
10. **Surgeon** (Phase 15): Advanced repairs
11. **Neural Bridge** (Phase 16): GitHub integration
12. **Auto PR** (Phase 17): PR generation
13. **Test Suite** (Phase 18): Self-validation

### Synchronization Strategy Service
Advanced fleet synchronization with:
- **Modes**: Realtime, Scheduled, Manual, On-Demand
- **Retry Logic**: Exponential backoff with configurable parameters
- **Monitoring**: Real-time status tracking
- **Error Handling**: Comprehensive error recovery
- **Filtering**: Target-specific sync operations

## 📊 Monitoring & Observability

### Health Metrics
- Repository Health Score (1-100)
- CI/CD Status
- Framework Detection
- Security Posture
- Build Efficiency

### Sync Monitoring
- Strategy Status (idle, syncing, success, failed, retrying)
- Progress Tracking (current/total items)
- Log History (last 1000 lines)
- Execution Statistics

## 🔧 Configuration

### Config Files
- `.repo-brain/` - Brain configuration directory
- `sync-config.example.json` - Sync strategy configuration template
- `vercel.json` - Vercel deployment configuration
- `package.json` - Node.js dependencies and scripts

### Environment Variables
- `NODE_ENV` - Environment mode (production/development)
- `PORT` / `API_PORT` - Server port (default: 3001)
- `FLEET_ROOT` - Fleet root directory

## 🤝 Contributing

### Development Setup
1. Clone the repository
2. Install dependencies: `npm install`
3. Run development server: `npm run server:dev`
4. Run tests: `bash brain.test.sh`

### Code Standards
- TypeScript with strict type checking
- ESLint for code quality
- Security-first development
- Comprehensive error handling
- Integration test coverage

## 📞 Support & Resources

### Links
- GitHub Repository: [SolanaRemix/Repo-Doctor](https://github.com/SolanaRemix/Repo-Doctor)
- Issues: Report bugs and request features
- Pull Requests: Contribute improvements

### Getting Help
- Read the [USER_GUIDE](USER_GUIDE.md) for common tasks
- Check [AUTO_FEATURES](AUTO_FEATURES.md) for automation capabilities
- Review [SYNC_API](SYNC_API.md) for API integration
- Consult [SPECS](SPECS.md) for technical details

---

**Version**: 2.2.0  
**Last Updated**: February 2026  
**License**: See LICENSE file
