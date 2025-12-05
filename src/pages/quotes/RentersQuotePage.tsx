import { RentersInsuranceForm } from "../../components/quotes/RentersInsuranceForm";
import { Card, CardContent } from "../../components/ui/card";
import { Home } from "lucide-react";
import { useEffect } from "react";

export function RentersQuotePage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header Section with Background Image */}
      <section className="relative py-24 overflow-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              'url(https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1920)',
          }}
        >
          {/* Dark overlay for better text contrast */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#1B5A8E]/70 via-[#2C7DB8]/60 to-[#1B5A8E]/70" />
        </div>

        {/* Content */}
        <div className="mx-auto max-w-7xl px-4 lg:px-8 relative z-10">
          <div className="mx-auto max-w-3xl">
            {/* Frosted Glass Container */}
            <div className="rounded-2xl bg-white/10 backdrop-blur-xl border border-white/30 p-8 shadow-2xl text-center">
              <div className="mb-4 flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm border border-white/40">
                  <Home className="h-8 w-8 text-white" />
                </div>
              </div>
              <h1 className="mb-4 text-4xl font-bold text-white sm:text-5xl drop-shadow-lg">
                Renters Insurance Quote
              </h1>
              <p className="text-lg text-white/90 drop-shadow-md">
                Protect your belongings and liability with comprehensive renters
                insurance coverage
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-12">
        <div className="mx-auto max-w-4xl px-4 lg:px-8">
          <RentersInsuranceForm />

          {/* Info Cards */}
          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
            <Card className="border-gray-200">
              <CardContent className="p-6 text-center">
                <h3 className="mb-2 text-lg font-semibold text-[#1B5A8E]">
                  Property Protection
                </h3>
                <p className="text-sm text-[#6c757d]">
                  Coverage for your personal belongings against theft, fire, and
                  damage
                </p>
              </CardContent>
            </Card>

            <Card className="border-gray-200">
              <CardContent className="p-6 text-center">
                <h3 className="mb-2 text-lg font-semibold text-[#1B5A8E]">
                  Liability Coverage
                </h3>
                <p className="text-sm text-[#6c757d]">
                  Protection against lawsuits for accidents that occur in your
                  rental
                </p>
              </CardContent>
            </Card>

            <Card className="border-gray-200">
              <CardContent className="p-6 text-center">
                <h3 className="mb-2 text-lg font-semibold text-[#1B5A8E]">
                  Additional Living Expenses
                </h3>
                <p className="text-sm text-[#6c757d]">
                  Coverage for temporary housing if your rental becomes
                  uninhabitable
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
