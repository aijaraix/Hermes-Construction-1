# HERMES Construction Deployment & Setup Guide

## Local / Cloud Run Setup
1. Clone the canonical repository:
   ```bash
   git clone https://github.com/aijaraix/Hermes-Construction.git
   cd Hermes-Construction
   ```

2. Copy environment file:
   ```bash
   cp .env.example .env
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Build production bundle:
   ```bash
   npm run build
   ```

5. Start persistent application server:
   ```bash
   npm start
   ```

The application runs on `http://0.0.0.0:3000` with continuous background heartbeat execution and durable disk persistence in `data/db/hermes_store.json`.
