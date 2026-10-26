"use client";

import { useEffect } from "react";
import SplunkRum from "@splunk/otel-web";

let initialized = false;

export default function SplunkRumInit() {
  useEffect(() => {
    if (initialized) return;

    const realm = process.env.NEXT_PUBLIC_SPLUNK_RUM_REALM;
    const rumAccessToken = process.env.NEXT_PUBLIC_SPLUNK_RUM_TOKEN;

    if (!realm || !rumAccessToken) {
      console.warn(
        "Splunk RUM disabled: set NEXT_PUBLIC_SPLUNK_RUM_REALM and NEXT_PUBLIC_SPLUNK_RUM_TOKEN",
      );
      return;
    }

    SplunkRum.init({
      realm,
      rumAccessToken,
      applicationName: process.env.NEXT_PUBLIC_SPLUNK_APP_NAME ?? "rum-sample",
      deploymentEnvironment: process.env.NEXT_PUBLIC_SPLUNK_ENV ?? "dev",
    });
    initialized = true;

    // Session Replay: browser-only, so load it dynamically after RUM starts.
    import("@splunk/otel-web-session-recorder").then(
      ({ default: SplunkSessionRecorder }) => {
        // maskAllText defaults to true in the recorder, which renders text as blocks in replay.
        SplunkSessionRecorder.init({
          realm,
          rumAccessToken,
          maskAllText: false,
        });
      },
    );
  }, []);

  return null;
}
