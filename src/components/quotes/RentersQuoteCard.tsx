import React from "react";
import { Home } from "lucide-react";
import { CoverageCard } from "../CoverageCard";

export function RentersQuoteCard({ className }: { className?: string }) {
	return (
		<CoverageCard
			title="Renters Insurance"
			description="Protect your personal belongings and liability with affordable renters insurance coverage."
			icon={Home}
			href="/quote/renters"
			image="https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
			className={className}
		/>
	);
}
