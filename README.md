# PWA Audit Core

A modular, extensible CLI tool for automated testing of Progressive Web Apps. Combines **Lighthouse** (standardized PWA scores) with **Playwright** (custom behavioral tests) into a single command.

## Quick Start

### Prerequisites

- Node.js >= 20
- Google Chrome (for Lighthouse audits)
- Docker & Docker Compose (optional, for containerized usage)

### Installation

```bash
npm install
npm run build
```

### Usage

#### Initialize a config file

```bash
node dist/index.js init
```

This creates a `pwa-audit.config.js` template in the current directory.

#### Run an audit

```bash
node dist/index.js run --config config/example.config.js
```

This will:
1. Run Lighthouse PWA audits against configured URLs
2. Execute any custom Playwright tests
3. Save combined results as JSON in the configured `outputDir`

### Docker

```bash
# Copy and configure environment variables
cp .env.example .env

# Build and start core service
docker-compose up --build
```

The core service runs on port 3000 by default.

## Configuration

See `config/example.config.js` for a full example. Key options:

| Option | Description |
|---|---|
| `urls` | Array of URLs to audit |
| `thresholds` | Score thresholds (e.g., `{ pwa: 0.9 }`) |
| `customTests` | Array of Playwright test files to run |
| `outputDir` | Directory for JSON result output |
| `services` | URLs for optional external service endpoints |

Environment variables (from `.env`) override config file values where applicable.

## Optional Private Features

The core tool can optionally connect to external services for advanced features. To enable optional functionality:

1. Set the `EXTERNAL_SERVICE_URL` environment variable:
   ```bash
   # In .env
   EXTERNAL_SERVICE_URL=http://localhost:3001
   ```
2. Or when using Docker Compose, create a `docker-compose.override.yml` to add external services on the same network:
   ```yaml
   version: '3.8'
   services:
     core:
       environment:
         - EXTERNAL_SERVICE_URL=http://external-service:3001
       networks:
         - pwa-network
   networks:
     pwa-network:
       driver: bridge
   ```

If `EXTERNAL_SERVICE_URL` is not set, the core tool runs normally with standard features only.

## Project Structure

```
pwa-audit-core/
├── src/
│   ├── cli/          # CLI subcommands (run, init)
│   ├── config/       # Config loader + types
│   ├── audit/        # Lighthouse & Playwright runners
│   └── index.ts      # Entry point
├── config/           # Example config files
├── ui/               # Web UI placeholder (Phase 1)
├── Dockerfile
├── docker-compose.yml
├── package.json
└── tsconfig.json
```

## Development

```bash
# Build
npm run build

# Watch mode
npm run dev

# Run CLI
node dist/index.js --help
```

## License

MIT
