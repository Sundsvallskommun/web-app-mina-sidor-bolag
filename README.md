# Mina sidor Bolag
Mina sidor för privat- och företagskunder hos kommunala bolag.

## APIer som används

Dessa APIer används i projektet, applikationsanvändaren i WSO2 måste prenumerera på dessa.

| API                 | Version |
|---------------------|--------:|
| ContactSettings     |     2.0 |
| Citizen             |     3.0 |
| Disturbances        |     5.0 |
| Invoices            |     9.5 |
| SimulatorServer     |     2.0 |
| Customer            |     4.0 |
| Installedbase       |     3.2 |
| Agreement           |     4.1 |
| MeasurementData     |     3.3 |
| MyRepresentatives   |     4.4 |
| LegalEntity         |     2.0 |
| Eventlog            |     2.3 |
| BFUS                |   1.0.0 |
| SelfServiceAI       |     2.1 |
| Eneo-Sundsvall      |     2.0 |
| DataWarehouseReader |    5.10 |

Appen använder dessutom CGI GRP för att signera med BankID. Se [https://cgiverify.atlassian.net/wiki/spaces/oversikt/pages/2818051/API](https://cgiverify.atlassian.net/wiki/spaces/oversikt/pages/2818051/API)

## Utveckling

### Krav

- Node >= 20 LTS
- Yarn

### Steg för steg

1. Klona ner repot.

```
git clone https://github.com/Sundsvallskommun/web-app-mina-sidor-bolag.git
```

2. Installera dependencies för både `backend` och `frontend`

```
cd frontend
yarn install

cd backend
yarn install
```

3. Skapa .env-fil för `frontend`

```
cd frontend
cp .env.example .env
```

Redigera `.env` för behov, för utveckling bör exempelvärdet fungera.

4. Skapa .env-filer för `backend`

```
cd backend
cp .env.example.local .env.development.local
cp .env.example.local .env.test.local
```

redigera `.env.development.local` för behov. URLer, nycklar och cert behöver fyllas i korrekt.

- `CLIENT_KEY` och `CLIENT_SECRET` måste fyllas i för att APIerna ska fungera, du måste ha en applikation från WSO2-portalen
- `SAML_ENTRY_SSO` behöver pekas till en SAML IDP
- `SAML_IDP_PUBLIC_CERT` ska stämma överens med IDPens cert
- `SAML_PRIVATE_KEY` och `SAML_PUBLIC_KEY` behöver bara fyllas i korrekt om man kör mot en riktig IDP

### Hantera organisationer

För att lägga till en organisation måste du ange dess id i listan i `frontend/src/utils/app-organizations.ts`.  
Sen måste en logotyp i format svg för lightmode och darkmode placeras i `frontend/public/logotypes` med filnamn `<orgnummer>-lightmode.svg` respektive `<orgnummer>-darkmode.svg`.  
Alt-text för logotyperna läggs i `frontend/locales/<lang>/organization.json`

### Synca datamodeller för api:er

Se till att README och `/backend/src/config/api-config.ts` matchar och justera utefter de api:er som önskas användas.

**För backend**, i `/backend` kör `yarn generate:contracts` för att få ned de senaste datamodellerna för samtliga api:er -- Justera om så behövs utifrån de uppdaterade modellerna

**För frontend**, se till att backend är igång (`yarn dev`), i `/frontend` kör `yarn generate:contracts` för att synca backend med frontend -- Justera om så behövs utifrån de uppdaterade modellerna

### Session-hantering och Redis

Backend använder `express-session` för sessionshantering. Redis aktiveras genom att sätta `REDIS_HOST`.

| Konfiguration                               | Session store                        | Rekommenderad miljö   |
| ------------------------------------------- | ------------------------------------ | --------------------- |
| `REDIS_HOST` satt                           | Redis                                | OpenShift / multi-pod |
| `REDIS_HOST` ej satt                        | Filbaserad store (`./data/sessions`) | Lokal utveckling      |
| `REDIS_HOST` ej satt, `SESSION_MEMORY=true` | In-memory store                      | Lokal utveckling      |

Med Redis blir backend stateless så att flera poddar kan köras. OAuth-token mot API-gatewayn delas då också mellan poddarna via Redis, och ett lås ser till att bara en podd hämtar ny token åt gången (`src/services/api-token.service.ts`). Utan Redis cachas token i minnet per instans.

Följande miljövariabler sätts via Deployment / Helm / ArgoCD:

```
REDIS_HOST=<redis-hostname>
REDIS_PORT=6379            # valfri, default 6379
REDIS_PASSWORD=<secret>
REDIS_KEY_PREFIX=<prefix>  # valfri, default web-app-mina-sidor-bolag
```

Alla Redis-nycklar namnges med `REDIS_KEY_PREFIX`: sessioner sparas under `<prefix>:session:<id>` och gateway-token under `<prefix>:wso2:access_token`. Delar flera appar samma Redis måste prefixet vara unikt per app, annars kan de läsa varandras token.

Om `REDIS_HOST` är satt måste Redis gå att nå vid start, annars startar inte applikationen. Sätts `REDIS_PORT` eller `REDIS_PASSWORD` utan `REDIS_HOST` stoppas applikationen också vid start. När Redis är konfigurerat men inte redo svarar `/health/up` med 503. Vid SIGTERM stängs HTTP-servern och Redis-anslutningen ner kontrollerat.

Lokal utveckling kräver ingen Redis, samma kodbas används i alla miljöer.

### Liveness-routes

Backend svarar på `GET /health` (utan `BASE_URL_PREFIX`) och frontend på `GET /api/health` med `{ "status": "OK" }` utan att anropa några beroenden. Dessa används som liveness-probes i OpenShift. `GET /api/health/up` i frontend anropar backend via `INTERNAL_API_URL` och kontrollerar hela kedjan.

`INTERNAL_API_URL` används bara server-side och ska peka direkt på backend-servicen i namespacet (t.ex. `http://<app>-backend:3000/api`), inte på den publika routen i `NEXT_PUBLIC_API_URL`. Timeout för anropet styrs med `HEALTH_REQUEST_TIMEOUT_MS` (default 3000).

### Miljövariabler i frontend-imagen

Frontend-imagen byggs en gång och används i alla miljöer. `NEXT_PUBLIC_*` bakas in vid build, så imagen byggs med platshållare från `frontend/.env-cicd` som `frontend/entrypoint.sh` ersätter med containerns miljövariabler vid start. En variabel som inte är satt ersätts med en tom sträng.

- En ny `NEXT_PUBLIC_*`-variabel måste läggas till i både `.env-cicd` och `entrypoint.sh`.
- Jämförelser på värdena (t.ex. feature-flaggor) ska göras via `src/utils/runtime-env.ts`. Skrivs `process.env.NEXT_PUBLIC_X === 'true'` direkt utvärderas jämförelsen mot platshållaren redan vid build och flaggan går inte att slå på i drift.
- `NEXT_PUBLIC_BASE_PATH` bakas in i routingen vid build och kan inte ersättas vid start.

## Git Hooks

Behöver man skippa Git hooks (Husky) så kan man följa: https://typicode.github.io/husky/#/?id=bypass-hooks
