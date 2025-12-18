import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Car, Home, Key, Heart, Building2, Briefcase, PawPrint, Umbrella, ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import { SpecialtyTicker, type SpecialtyCoverage } from "./SpecialtyTicker";

const coverageOptions = [
	{ id: "auto", label: "Auto", icon: Car, path: "/quote/auto" },
	{ id: "home", label: "Home", icon: Home, path: "/quote/homeowners" },
	{ id: "renters", label: "Renters", icon: Key, path: "/quote/renters" },
	{ id: "life", label: "Life", icon: Heart, path: "/quote/life" },
	{ id: "commercial", label: "Commercial", icon: Building2, path: "/quote/commercial-building" },
	{ id: "bop", label: "BOP", icon: Briefcase, path: "/quote/bop" },
	{ id: "pet", label: "Pet", icon: PawPrint, path: "/quote/pet" },
	{ id: "umbrella", label: "Umbrella", icon: Umbrella, path: "/quote/umbrella" },
];

type QuoteStarterProps = {
	coverages?: SpecialtyCoverage[];
};

export function QuoteStarter({ coverages }: QuoteStarterProps) {
	const [selectedCoverage, setSelectedCoverage] = useState<string | null>(null);
	const navigate = useNavigate();

	const handleGetQuote = () => {
		if (!selectedCoverage) return;

		const selectedOption = coverageOptions.find((opt) => opt.id === selectedCoverage);
		if (selectedOption) {
			navigate(selectedOption.path);
		}
	};

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.6 }}
			className="w-full h-full"
		>
			<div className="rounded-2xl bg-white/95 backdrop-blur-xl border-4 border-black p-4 sm:p-6 md:p-8 shadow-2xl relative overflow-hidden h-full flex flex-col">
				{/* Gradient background overlay */}
				<div className="absolute inset-0 bg-gradient-to-br from-[#1B5A8E]/5 via-transparent to-[#FF6B61]/5 pointer-events-none" />

				{/* Decorative gradient accents */}
				<div className="absolute top-0 right-0 w-32 h-32 sm:w-40 sm:h-40 bg-gradient-to-br from-[#FF6B61]/15 to-transparent rounded-full blur-3xl" />
				<div className="absolute bottom-0 left-0 w-40 h-40 sm:w-48 sm:h-48 bg-gradient-to-tl from-[#1B5A8E]/15 to-transparent rounded-full blur-3xl" />

				<div className="relative z-10 flex flex-col h-full">
					<div className="mb-4 sm:mb-6">
						<h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-[#1B5A8E] to-[#2C7DB8] bg-clip-text text-transparent mb-2">
							Start Your Quote
						</h2>
						<p className="text-base sm:text-lg text-[#6c757d] font-medium">
							Select your coverage type to get started
						</p>
					</div>

					{/* Coverage Type Selection */}
					<div className="mb-4 sm:mb-6">
						<label className="block text-sm sm:text-base font-bold text-[#1B5A8E] mb-2 sm:mb-3">
							What would you like to insure?
						</label>
						<div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
							{coverageOptions.map((option) => (
								<button
									key={option.id}
									onClick={() => setSelectedCoverage(option.id)}
									className={`group flex flex-col items-center gap-1.5 sm:gap-2 p-3 sm:p-4 rounded-lg sm:rounded-xl border-[3px] border-black bg-white shadow-md transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/70 ${
										selectedCoverage === option.id
											? "bg-gradient-to-br from-[#1B5A8E] via-[#2C7DB8] to-[#1B5A8E] shadow-lg scale-105"
											: "hover:bg-gradient-to-br hover:from-[#FF6B61]/5 hover:to-[#FF6B61]/10 hover:shadow-lg"
									}`}
								>
									<div className="p-1.5 sm:p-2">
										<option.icon
											className={`h-6 w-6 sm:h-7 sm:w-7 transition-colors duration-300 ${
												selectedCoverage === option.id
													? "text-white"
													: "text-[#1B5A8E]/70 group-hover:text-[#1B5A8E]"
											}`}
										/>
									</div>
									<span
										className={`text-sm sm:text-base font-semibold ${
											selectedCoverage === option.id ? "text-white" : "text-gray-700"
										}`}
									>
										{option.label}
									</span>
								</button>
							))}
						</div>
					</div>

					{/* Get Quote Button */}
					<div className="mt-auto">
						{selectedCoverage ? (
							<Button
								onClick={handleGetQuote}
								className="w-full h-12 sm:h-14 text-lg sm:text-xl font-bold bg-gradient-to-r from-[#1B5A8E] to-[#2C7DB8] hover:from-[#144669] hover:to-[#1B5A8E] text-white shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
							>
								Get My Quote
								<ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
							</Button>
						) : (
							<Button
								disabled
								className="w-full h-12 sm:h-14 text-lg sm:text-xl font-bold bg-gray-300 text-gray-500 cursor-not-allowed opacity-60"
							>
								Get My Quote
								<ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
							</Button>
						)}

						{/* Compact Specialty Ticker to fill the remaining space */}
						{coverages && coverages.length > 0 ? (
							<div className="mt-4 rounded-xl border-4 border-black bg-white/70 overflow-hidden">
								<SpecialtyTicker coverages={coverages} variant="embedded" size="compact" />
							</div>
						) : (
							<div
								className="mt-4 relative h-20 sm:h-24 md:h-28 rounded-xl overflow-hidden border-2 border-black"
								aria-hidden="true"
							>
								<div
									className="absolute inset-0 bg-cover bg-center"
									style={{
										backgroundImage: "url(/images/insurance-3.jpg)",
										backgroundPosition: "center",
										backgroundSize: "cover",
										opacity: 0.22,
									}}
								/>
								<div className="absolute inset-0 bg-gradient-to-r from-[#1B5A8E]/10 via-transparent to-[#FF6B61]/10" />
							</div>
						)}
					</div>
				</div>
			</div>
		</motion.div>
	);
}
