import { WelcomeHero } from "../components/WelcomeHero"
import { HowItWorks } from "../components/HowItWorks"
import { PricingSection } from "../components/PricingSection"
import { WelcomeFooter } from "../components/WelcomeFooter"

export function WelcomePage() {
  return (
    <div className="w-full flex flex-col min-h-screen bg-white">
      <WelcomeHero />
      <HowItWorks />
      <PricingSection />
      <WelcomeFooter />
    </div>
  )
}
