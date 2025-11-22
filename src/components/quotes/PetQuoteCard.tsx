import React from "react";
import { Dog } from "lucide-react";
import { CoverageCard } from "../CoverageCard";

export function PetQuoteCard({ className }: { className?: string }) {
	return (
		<CoverageCard
			title="Pet Insurance"
			description="Protect your pet with customizable accident & illness coverage for dogs, cats and other companion animals."
			icon={Dog}
			href="/quote/pet"
			image="https://images.unsplash.com/photo-1450778869180-41d0601e046e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
			className={className}
		/>
	);
}
