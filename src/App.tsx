import { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { HomePage } from "./pages/HomePage";
import { QuotePage } from "./pages/QuotePage";
import { AboutPage } from "./pages/AboutPage";
import { ContactPage } from "./pages/ContactPage";
import { BlogPage } from "./pages/BlogPage";
import { AutoCoveragePage } from "./pages/AutoCoveragePage";
import { CoveragePage } from "./pages/CoveragePage";

// NEW: specific quote pages
import { AutoQuotePage } from "./pages/quotes/AutoQuotePage";
import { HomeownersQuotePage } from "./pages/quotes/HomeownersQuotePage";
import { UmbrellaQuotePage } from "./pages/quotes/UmbrellaQuotePage";
import { LifeQuotePage } from "./pages/quotes/LifeQuotePage";
import { CommercialBuildingQuotePage } from "./pages/quotes/CommercialBuildingQuotePage";
import { BopQuotePage } from "./pages/quotes/BopQuotePage";

function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };

    // Listen for popstate events (back/forward browser buttons)
    window.addEventListener("popstate", handleLocationChange);

    // Intercept link clicks
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest("a");
      
      if (link && link.href.startsWith(window.location.origin)) {
        e.preventDefault();
        const url = new URL(link.href);
        window.history.pushState({}, "", url.pathname);
        setCurrentPath(url.pathname);
        window.scrollTo(0, 0);
      }
    };

    document.addEventListener("click", handleClick);

    return () => {
      window.removeEventListener("popstate", handleLocationChange);
      document.removeEventListener("click", handleClick);
    };
  }, []);

  const renderPage = () => {
    // Homepage
    if (currentPath === "/" || currentPath === "") {
      return <HomePage />;
    }

    // Quote hub
    if (currentPath === "/quote") {
      return <QuotePage />;
    }

    // NEW: dedicated quote routes
    if (currentPath === "/quote/auto") return <AutoQuotePage />;
    if (currentPath === "/quote/homeowners") return <HomeownersQuotePage />;
    if (currentPath === "/quote/umbrella") return <UmbrellaQuotePage />;
    if (currentPath === "/quote/life") return <LifeQuotePage />;
    if (currentPath === "/quote/commercial-building") return <CommercialBuildingQuotePage />;
    if (currentPath === "/quote/bop") return <BopQuotePage />;

    // About page
    if (currentPath === "/about") {
      return <AboutPage />;
    }

    // Contact page
    if (currentPath === "/contact") {
      return <ContactPage />;
    }

    // Blog page
    if (currentPath === "/blog") {
      return <BlogPage />;
    }

    // Auto coverage
    if (currentPath === "/coverage/auto") {
      return <AutoCoveragePage />;
    }

    // Business coverage
    if (currentPath === "/coverage/business") {
      return (
        <CoveragePage
          title="Business Insurance"
          subtitle="Protect Your Business"
          description="Comprehensive business insurance solutions to protect your company, employees, and assets. Tailored coverage for businesses of all sizes."
          backgroundImage="https://images.unsplash.com/photo-1589979034086-5885b60c8f59?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMG9mZmljZSUyMHByb2Zlc3Npb25hbHxlbnwxfHx8fDE3NjIzMzI5ODB8MA&ixlib=rb-4.1.0&q=80&w=1080"
          features={[
            "General Liability Insurance",
            "Professional Liability",
            "Property Coverage",
            "Workers' Compensation",
            "Business Interruption Insurance",
            "Cyber Liability Coverage",
            "Equipment Breakdown Coverage",
            "Commercial Auto Coverage",
            "Employment Practices Liability",
            "Product Liability",
            "Data Breach Coverage",
            "Directors & Officers Insurance",
          ]}
          plans={[
            {
              name: "Startup",
              price: "$199",
              description: "Essential coverage for small businesses",
              features: [
                "General Liability Coverage",
                "Property Coverage up to $100K",
                "Business Interruption Coverage",
                "Basic Cyber Protection",
              ],
            },
            {
              name: "Growth",
              price: "$399",
              description: "Comprehensive coverage for growing businesses",
              features: [
                "Full General Liability",
                "Property Coverage up to $500K",
                "Workers' Compensation",
                "Professional Liability",
                "Enhanced Cyber Protection",
                "Equipment Coverage",
              ],
              recommended: true,
            },
            {
              name: "Enterprise",
              price: "$799",
              description: "Maximum protection for established businesses",
              features: [
                "Maximum Liability Limits",
                "Property Coverage up to $2M+",
                "Full Workers' Comp",
                "Complete Professional Liability",
                "Premium Cyber Protection",
                "D&O Insurance Included",
                "Multi-Location Coverage",
                "Dedicated Account Manager",
              ],
            },
          ]}
        />
      );
    }

    // Default/404
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="mb-4 text-6xl text-[#1a1a1a]">404</h1>
          <p className="mb-8 text-xl text-[#6c757d]">Page not found</p>
          <a
            href="/"
            className="inline-flex h-11 items-center justify-center rounded-md bg-gradient-to-r from-[#4f46e5] via-[#06b6d4] to-[#0ea5e9] px-8 text-sm text-white hover:opacity-90"
          >
            Back to Home
          </a>
        </div>
      </div>
    );
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{renderPage()}</main>
      <Footer />
    </div>
  );
}

export default App;