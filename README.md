## GithubPortfolioCompare

This project compares the performance of GitHub users' portfolios by fetching repository data, persisting it through simple Mongo-style schemas, and exposing utilities for running comparisons via Node/Express helpers.

### Tech Stack
- Node.js runtime with Express-style routing
- MongoDB via lightweight schema definitions in `Schema.js`
- Client build hosted inside `client/`

### Getting Started
1. Install dependencies: `npm install`
2. Provide necessary environment variables in `.env` (see `.env` sample already present)
3. Start the server: `node index.js` (or `npm start` if defined)

### Available Scripts
- `npm start`: launches the comparison service
- `npm run client`: proxy command for the client-specific build (if configured inside `client/package.json`)

### Project Structure
- `index.js` – entry point that wires DB connections and orchestrates comparison jobs
- `Compare.js`, `PortfolioDataFetch.js` – portfolio fetching, normalization, and comparison logic
- `Schema.js`, `Db.js` – schema definition and database bootstrap
- `client/` – front-end assets/logic for visualizing portfolio comparisons

### Contributing
1. Fork and clone the repo
2. Create a feature branch
3. Add tests or sample data when possible
4. Submit a PR describing the motivation and how to reproduce results

### License
MIT-style. Feel free to reuse with attribution.

