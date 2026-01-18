
  # Modern Insurance Web App

  This is a code bundle for Modern Insurance Web App. The original project is available at https://www.figma.com/design/ghBgISKkauJ0Adk8F7wCa5/Modern-Insurance-Web-App.

  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.

    ## Running the real API locally (FullEnrich)

    The production `/api/*` endpoints are implemented as Vercel Serverless Functions (see `api/enrich.ts` and `api/impact-map.ts`).
    For local development without the Vercel CLI, this repo includes a tiny Node dev API that proxies to FullEnrich.

    1) Create `.env.local` and set:
      - `FULLENRICH_API_KEY=...`

      2) Start the local dev API:
          - `npm run dev:api`

    3) In another terminal, run the frontend:
      - `npm run dev`

      If you prefer a single command that runs both the API and the frontend:
        - `npm run dev:all`

      Vite runs on `http://localhost:5173` and proxies `/api/*` to `http://localhost:8787` during development.
  