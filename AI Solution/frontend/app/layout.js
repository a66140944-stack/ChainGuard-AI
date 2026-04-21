import "../styles/globals.css";
import "leaflet/dist/leaflet.css";
import { ShipmentContextProvider } from "../context/ShipmentContext.jsx";
import HyperBackdrop from "../components/HyperBackdrop.jsx";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "ChainGuard - Supply Chain Management",
  description:
    "ChainGuard dashboard for shipment tracking, AI predictions, and IoT visibility."
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-full bg-background text-foreground`}>
        <HyperBackdrop />
        <ShipmentContextProvider>{children}</ShipmentContextProvider>
      </body>
    </html>
  );
}
