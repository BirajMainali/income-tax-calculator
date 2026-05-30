# Nepal Income Tax Calculator

FY 2082/83 (2025/26) income tax calculator with a light card-based UI matching the reference design.

## Run

```bash
npm install
npm run dev
```

## Test

```bash
npm test
```

## Features

- **Income** — edit monthly salary or annual gross (synced × 12)
- **Tax savers** — edit monthly or annual contributions (synced × 12), capped at `min(⅓ gross, रु 5,00,000)`
- **Single tax path** — progressive FY 2082/83 slabs on `taxable = gross − allowable deduction`
- **Yearly / monthly take-home** summary cards and stacked breakdown bar
