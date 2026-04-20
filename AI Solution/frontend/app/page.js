import Footer from "../components/Footer.jsx";
import Navbar from "../components/Navbar.jsx";
import HeroSection from "../components/home/HeroSection.jsx";
import FeaturesGrid from "../components/home/FeaturesGrid.jsx";
import StatsSection from "../components/home/StatsSection.jsx";
import ProductSections from "../components/home/ProductSections.jsx";
import TestimonialsSection from "../components/home/TestimonialsSection.jsx";
import FinalCTA from "../components/home/FinalCTA.jsx";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <HeroSection />
        <FeaturesGrid />
        <StatsSection />
        <ProductSections />
        <TestimonialsSection />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}
