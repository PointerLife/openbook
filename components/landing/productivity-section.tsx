"use client"

import { motion } from "framer-motion"
import LottieAnimation from "@/components/ui/lottie-animation"
import { cn } from "@/lib/utils"
import SectionHeading from "./section-heading"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { ArrowRight, Sparkles, Send } from "lucide-react"

// --- Component: BentoCard ---
interface BentoCardProps {
    title: string
    description: string
    className?: string
    children?: React.ReactNode
    delay?: number
}

function BentoCard({ title, description, className = "", children, delay = 0 }: BentoCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay }}
            viewport={{ once: true }}
            className={cn(
                "group relative overflow-hidden rounded-3xl bg-card/50 border border-border/40 backdrop-blur-sm hover:bg-card/80 transition-all duration-500 flex flex-col",
                className
            )}
        >
            <div className="p-6 md:p-8 flex flex-col h-full z-10">
                <h3 className="text-xl md:text-2xl font-bold mb-3">{title}</h3>
                <p className="text-muted-foreground leading-relaxed mb-6 max-w-[90%]">{description}</p>
                <div className="mt-auto w-full flex-grow flex items-center justify-center relative min-h-[150px]">
                    {children}
                </div>
            </div>

            {/* Subtle Gradient Background Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
        </motion.div>
    )
}

// --- Specific Feature Visuals ---

// 1. Spaced Repetition Visual
function SpacedRepetitionVisual() {
    return (
        <div className="w-full h-full flex items-center justify-center relative bg-background/30 rounded-xl border border-border/20 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5" />
            <LottieAnimation placeholderText="Clock / Repetition" className="w-32 h-32 opacity-80" />
        </div>
    )
}

// 2. Active Recall Visual
function ActiveRecallVisual() {
    return (
        <div className="w-full h-full flex items-center justify-center relative bg-background/30 rounded-xl border border-border/20 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-500/5" />
            <LottieAnimation placeholderText="Spark / Brain" className="w-32 h-32 opacity-80" />
        </div>
    )
}

// 3. Concept Mapping Visual
function ConceptMappingVisual() {
    return (
        <div className="w-full h-full flex items-center justify-center relative bg-background/30 rounded-xl border border-border/20 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5" />
            <LottieAnimation placeholderText="Network / Graph" className="w-32 h-32 opacity-80" />
        </div>
    )
}

// 4. Knowledge Synthesis Visual
function KnowledgeSynthesisVisual() {
    return (
        <div className="w-full h-full flex items-center justify-center relative bg-background/30 rounded-xl border border-border/20 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5" />
            <LottieAnimation placeholderText="Magic / Alchemy" className="w-32 h-32 opacity-80" />
        </div>
    )
}

// --- Chat Input Component ---
function ChatInputArea() {
    const router = useRouter()
    const [input, setInput] = useState("")
    const [isFocused, setIsFocused] = useState(false)

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!input.trim()) return
        router.push(`/chat?q=${encodeURIComponent(input)}`)
    }

    return (
        <div className="w-full max-w-2xl mx-auto relative z-20">
            <div className="text-center mb-6">
                <h3 className="text-2xl font-semibold mb-2 flex items-center justify-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    <span>Talk to your notebook</span>
                </h3>
                <p className="text-muted-foreground">
                    Ask questions, summarize notes, or brainstorm ideas instantly.
                </p>
            </div>

            <motion.form
                onSubmit={handleSubmit}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className={cn(
                    "relative flex items-center w-full p-2 bg-background/80 backdrop-blur-md border rounded-2xl shadow-lg transition-all duration-300",
                    isFocused ? "border-primary/50 shadow-primary/10 ring-2 ring-primary/10" : "border-border/60 hover:border-border"
                )}
            >
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder="What would you like to learn today?"
                    className="flex-1 px-4 py-3 bg-transparent border-none outline-none text-base sm:text-lg placeholder:text-muted-foreground/60 w-full"
                />
                <button
                    type="submit"
                    className={cn(
                        "p-3 rounded-xl flex items-center justify-center transition-all duration-200",
                        input.trim()
                            ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
                            : "bg-muted text-muted-foreground cursor-not-allowed"
                    )}
                    disabled={!input.trim()}
                >
                    {input.trim() ? <Send className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}
                </button>
            </motion.form>

            {/* Decorative hints */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-4 text-xs text-muted-foreground">
                <span className="px-2 py-1 bg-muted/40 rounded-full border border-border/30">Summarize this page</span>
                <span className="px-2 py-1 bg-muted/40 rounded-full border border-border/30">Create a quiz</span>
                <span className="px-2 py-1 bg-muted/40 rounded-full border border-border/30">Explain quantum physics</span>
            </div>
        </div>
    )
}

export function ProductivitySection() {
    return (
        <section className="py-24 relative overflow-hidden">
            <div className="container mx-auto px-4 md:px-6 relative z-10">
                <div className="mb-16 md:mb-24">
                    <SectionHeading
                        title="Learn smarter, not harder"
                        description="Unlock your potential with tools designed to optimize how your brain processes and retains information."
                    />
                </div>

                {/* Bento Grid Layout */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(280px,auto)]">

                    {/* Row 1 */}
                    <BentoCard
                        title="Spaced Repetition"
                        description="Optimize review times to maximize retention with smart scheduling."
                        className="md:col-span-2"
                        delay={0.1}
                    >
                        <SpacedRepetitionVisual />
                    </BentoCard>

                    <BentoCard
                        title="Active Recall"
                        description="Test yourself actively to strengthen neural pathways."
                        className="md:col-span-1"
                        delay={0.2}
                    >
                        <ActiveRecallVisual />
                    </BentoCard>

                    {/* Row 2 */}
                    <BentoCard
                        title="Concept Mapping"
                        description="Visualize connections between complex ideas."
                        className="md:col-span-1"
                        delay={0.3}
                    >
                        <ConceptMappingVisual />
                    </BentoCard>

                    <BentoCard
                        title="Knowledge Synthesis"
                        description="Combine sources to create unique insights and summaries."
                        className="md:col-span-2"
                        delay={0.4}
                    >
                        <KnowledgeSynthesisVisual />
                    </BentoCard>
                </div>

                {/* Chat Input Area - Below Grid */}
                <div className="mt-20 md:mt-32">
                    <ChatInputArea />
                </div>
            </div>
        </section>
    )
}
