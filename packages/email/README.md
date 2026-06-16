# @countdown/email

Shared React Email templates and Resend send helpers for Countdown.

## Environment variables

- `RESEND_API_KEY` — Resend API key
- `RESEND_FROM_EMAIL` — sender address
- `APP_URL` — base URL for links (defaults to `http://localhost:3000` in development)

## Usage

```ts
import { sendWelcomeEmail, buildSetPasswordUrl } from "@countdown/email";
```

Daglig e-mail requires event props from the app layer (database lookup):

```ts
import { sendDagligEmail, type DagligEmailSendInput } from "@countdown/email";
```
