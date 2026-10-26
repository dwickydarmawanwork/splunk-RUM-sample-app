import TestErrorButton from "@/components/TestErrorButton";

export default function Home() {
  return (
    <>
      <h1>Welcome to the RUM Sample</h1>
      <p>
        A simple Next.js landing page instrumented with Splunk Real User
        Monitoring. Browse the menu to generate page views, then check Splunk
        Observability Cloud.
      </p>
      <TestErrorButton />
    </>
  );
}
