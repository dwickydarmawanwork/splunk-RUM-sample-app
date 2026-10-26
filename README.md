# Splunk RUM Sample App

A Next.js (App Router) sample app instrumented with [Splunk Real User Monitoring (RUM)](https://docs.splunk.com/observability/en/rum/intro-to-rum.html) for browser performance, errors, and Session Replay.

## Quick Start

```bash
npm install
cp .env.example .env.local   # PowerShell: Copy-Item .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), then edit `.env.local` with your Splunk values.

## How to Implement Splunk RUM in a Next.js App

### 1. Prerequisites

- A Splunk Observability Cloud account.
- A **RUM access token** (Settings > Access Tokens, authorization scope: `RUM`).
- Your **realm** (for example `us0`, `eu0`, `au0`), shown on your Splunk profile page.

### 2. Install the packages

```bash
npm install @splunk/otel-web @splunk/otel-web-session-recorder
```

- `@splunk/otel-web` - core RUM agent (page loads, resources, XHR/fetch, route changes, errors, Web Vitals).
- `@splunk/otel-web-session-recorder` - optional Session Replay.

### 3. Configure environment variables

Create `.env.local` (gitignored; use `.env.example` as a template):

```env
NEXT_PUBLIC_SPLUNK_RUM_REALM=au0
NEXT_PUBLIC_SPLUNK_RUM_TOKEN=your-rum-access-token
NEXT_PUBLIC_SPLUNK_APP_NAME=landing-page-rum
NEXT_PUBLIC_SPLUNK_ENV=dev
```

| Variable                       | Description                                       |
| ------------------------------ | ------------------------------------------------- |
| `NEXT_PUBLIC_SPLUNK_RUM_REALM` | Splunk Observability realm                        |
| `NEXT_PUBLIC_SPLUNK_RUM_TOKEN` | RUM access token                                  |
| `NEXT_PUBLIC_SPLUNK_APP_NAME`  | Application name shown in Splunk RUM              |
| `NEXT_PUBLIC_SPLUNK_ENV`       | Deployment environment (`dev`, `staging`, `prod`) |

> The `NEXT_PUBLIC_` prefix exposes values to the browser. RUM tokens are designed to be public, but keep them scoped to `RUM` only. Restart `npm run dev` after changing env values.

### 4. Create a client-side init component

The RUM agent needs browser APIs, so it must run in a Client Component, only once. See [src/components/SplunkRumInit.tsx](src/components/SplunkRumInit.tsx):

```tsx
"use client";

import { useEffect } from "react";
import SplunkRum from "@splunk/otel-web";

let initialized = false;

export default function SplunkRumInit() {
  useEffect(() => {
    if (initialized) return;

    const realm = process.env.NEXT_PUBLIC_SPLUNK_RUM_REALM;
    const rumAccessToken = process.env.NEXT_PUBLIC_SPLUNK_RUM_TOKEN;
    if (!realm || !rumAccessToken) return;

    SplunkRum.init({
      realm,
      rumAccessToken,
      applicationName: process.env.NEXT_PUBLIC_SPLUNK_APP_NAME ?? "rum-sample",
      deploymentEnvironment: process.env.NEXT_PUBLIC_SPLUNK_ENV ?? "dev",
    });
    initialized = true;

    // Session Replay (optional): load dynamically, browser-only.
    import("@splunk/otel-web-session-recorder").then(
      ({ default: SplunkSessionRecorder }) => {
        SplunkSessionRecorder.init({ realm, rumAccessToken });
      },
    );
  }, []);

  return null;
}
```

Why this shape:

- `"use client"` + `useEffect` keeps initialization out of server rendering.
- The module-level `initialized` flag prevents double init (React Strict Mode runs effects twice in development).
- The recorder is imported dynamically so it never loads on the server.

### 5. Mount it in the root layout

Add the component once in [src/app/layout.tsx](src/app/layout.tsx) so it runs on every page:

```tsx
import SplunkRumInit from "@/components/SplunkRumInit";

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>
        <SplunkRumInit />
        {children}
      </body>
    </html>
  );
}
```

### 6. Verify

1. Run `npm run dev` and browse between the pages (Home, About, Services, Contact).
2. Click **Trigger test error** ([src/components/TestErrorButton.tsx](src/components/TestErrorButton.tsx)) to generate a sample JavaScript error.
3. In Splunk Observability Cloud, open **RUM** and select your application (`NEXT_PUBLIC_SPLUNK_APP_NAME`) and environment. Data typically appears within a minute.
4. If the realm or token is missing, the browser console shows `Splunk RUM disabled: ...`.

### Optional configuration

`SplunkRum.init()` also supports options such as `version`, `globalAttributes`, `cookieDomain`, `ignoreUrls`, and `instrumentations` (toggle `interactions`, `webvitals`, `errors`, ...). See the [Splunk browser RUM configuration reference](https://docs.splunk.com/observability/en/rum/rum-instrumentation/instrument-browser/browser-rum-configuration-settings.html) for the full list.

## Deploying

Set the same `NEXT_PUBLIC_SPLUNK_*` variables in your hosting provider's environment settings (for example Vercel) **before building**, because `NEXT_PUBLIC_` values are inlined at build time. Use a different `NEXT_PUBLIC_SPLUNK_ENV` per environment.

## Learn More

- [Splunk RUM documentation](https://docs.splunk.com/observability/en/rum/intro-to-rum.html)
- [Next.js Documentation](https://nextjs.org/docs)
