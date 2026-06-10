import "./globals.css";
import Providers from "@/lib/Providers";
import LayoutShell from "@/lib/LayoutShell";

export const metadata = {
  title: "Proposal Maker | Humantek",
  description:
    "AI-powered proposal creation tool for agents and admins — live transcription, PDF generation, and business intelligence.",
  icons: {
    icon: "/download.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <LayoutShell>{children}</LayoutShell>
        </Providers>
      </body>

    </html>
  );
}
