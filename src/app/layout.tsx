import type { Metadata } from "next";
import "./globals.css";
import Nav from "@/components/Nav";
import SplunkRumInit from "@/components/SplunkRumInit";

export const metadata: Metadata = {
  title: "RUM Sample",
  description: "Sample Next.js app monitored by Splunk RUM",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>
        <SplunkRumInit />
        <Nav />
        <main>{children}</main>
      </body>
    </html>
  );
}
