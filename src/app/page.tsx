import LandingNav from "@/components/landing/LandingNav";
import HeroSection from "@/components/landing/HeroSection";
import ChaosSection from "@/components/landing/ChaosSection";
import ConnectedSection from "@/components/landing/ConnectedSection";
import AISection from "@/components/landing/AISection";
import ModulesSection from "@/components/landing/ModulesSection";
import CompareSection from "@/components/landing/CompareSection";
import CTASection from "@/components/landing/CTASection";
import LandingFooter from "@/components/landing/LandingFooter";

export default function LandingPage() {
  return (
    <div className="landing-root">
      <LandingNav />
      <HeroSection />
      <ChaosSection />
      <ConnectedSection />
      <AISection />
      <ModulesSection />
      <CompareSection />
      <CTASection />
      <LandingFooter />
    </div>
  );
}
