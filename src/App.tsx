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
import { Routes, Route } from "react-router-dom";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminQuoteDetailPage from "./pages/admin/AdminQuoteDetailPage"; // NEW
import AdminContactDetailPage from "./pages/admin/AdminContactDetailPage"; // NEW

function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/quote" element={<QuotePage />} />
          <Route path="/quote/auto" element={<AutoQuotePage />} />
          <Route path="/quote/homeowners" element={<HomeownersQuotePage />} />
          <Route path="/quote/umbrella" element={<UmbrellaQuotePage />} />
          <Route path="/quote/life" element={<LifeQuotePage />} />
          <Route path="/quote/commercial-building" element={<CommercialBuildingQuotePage />} />
          <Route path="/quote/bop" element={<BopQuotePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/coverage/auto" element={<AutoCoveragePage />} />
          <Route path="/coverage/business" element={
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
          } />
          <Route path="/admin" element={<AdminDashboard />} />
          {/* NEW: Admin quote detail route */}
          <Route path="/admin/quotes/:srcTable/:id" element={<AdminQuoteDetailPage />} />
          <Route path="/admin/contacts/:id" element={<AdminContactDetailPage />} /> {/* NEW */}
          {/* Default/404 route */}
          <Route
            path="*"
            element={
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
            }
          />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;