# Mina sidor Bolag

## APIer som används

Dessa APIer används i projektet, applikationsanvändaren i WSO2 måste prenumerera på dessa.

| API               | Version |
| ----------------- | ------: |
| ContactSettings   |     2.0 |
| Citizen           |     3.0 |
| Disturbances      |     5.0 |
| Invoices          |     9.0 |
| SimulatorServer   |     2.0 |
| Customer          |     4.0 |
| Installedbase     |     3.1 |
| Agreement         |     4.1 |
| MeasurementData   |     3.0 |
| MyRepresentatives |     4.2 |
| LegalEntity       |     2.0 |
| Eventlog          |     2.1 |
| SelfServiceAI     |     1.0 |
| Eneo-Sundsvall    |     1.1 |

Appen använder dessutom CGI GRP för att signera med BankID. Se [https://cgiverify.atlassian.net/wiki/spaces/oversikt/pages/2818051/API](https://cgiverify.atlassian.net/wiki/spaces/oversikt/pages/2818051/API)

## Utveckling

### Krav

- Node >= 20 LTS
- Yarn

### Steg för steg

1. Klona ner repot.

```
git clone git@github.com:Sundsvallskommun/web-app-mina-sidor-bolag.git
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

5. Initiera eventuell databas för backend

```
cd backend
yarn prisma:generate
yarn prisma:migrate
```

### Hantera organisationer

För att lägga till en organisation måste du ange dess id i listan i `frontend/src/utils/app-organizations.ts`.  
Sen måste en logotyp i format svg för lightmode och darkmode placeras i `frontend/public/logotypes` med filnamn `<orgnummer>-lightmode.svg` respektive `<orgnummer>-darkmode.svg`.  
Alt-text för logotyperna läggs i `frontend/locales/<lang>/organization.json`

## Git Hooks

Behöver man skippa Git hooks (Husky) så kan man följa: https://typicode.github.io/husky/#/?id=bypass-hooks
