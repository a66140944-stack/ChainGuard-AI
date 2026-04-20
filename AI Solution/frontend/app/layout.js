import "../styles/globals.css";
import { ShipmentContextProvider } from "../context/ShipmentContext.jsx";

export const metadata = {
  title: "ChainGuard - Supply Chain Management",
  description:
    "ChainGuard dashboard for shipment tracking, AI predictions, and IoT visibility."
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-full bg-background text-foreground">
        <ShipmentContextProvider>{children}</ShipmentContextProvider>
      </body>
    </html>
  );
}
