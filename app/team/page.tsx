"use client"

import { CombinedFooter, Header, LandingBackground } from "@/components/landing"
import { TeamHero } from "@/components/team/team-hero"

export default function TeamPage() {
    return (
        <div className="min-h-screen text-foreground overflow-x-hidden selection:bg-primary/20">
            <LandingBackground />
            <Header />

            <main>
                <TeamHero />
            </main>

            <CombinedFooter />
        </div>
    )
}