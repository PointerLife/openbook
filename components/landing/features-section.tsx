"use client"

import { Brain, Search, KeyRound, Lightbulb, Zap, Share2 } from "lucide-react"
import AnimateInView from "./animate-in-view"
import SectionHeading from "./section-heading"
import Image from "next/image"
import { motion } from "framer-motion"

// Simplified Feature Card
function SimpleFeature({ icon: Icon, title, description, delay }: { icon: any, title: string, description: string, delay: number }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      viewport={{ once: true }}
      className="p-6 rounded-2xl bg-card/50 border border-border/40 backdrop-blur-sm hover:bg-card/80 transition-colors"
    >
      <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 text-primary">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </motion.div>
  )
}

export function FeaturesSection() {
  return (
    <section className="py-24 relative">
      <div className="container mx-auto px-4 md:px-6">
        
        {/* Main Graph Feature */}
        <div className="mb-32">
          <SectionHeading
            title="Speed Is Everything"
            description="Designed for students and lifelong learners who value their time"
          />
          
          <AnimateInView>
            <div className="relative mt-12 rounded-2xl overflow-hidden border border-border/40 shadow-2xl bg-background/50 backdrop-blur-sm group">
              <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent z-10 pointer-events-none" />
              <div className="dark:hidden">
                  <Image
                      src="/screenshots/white.png"
                      alt="OpenBook Graph Interface Light"
                      width={1200}
                      height={675}
                      className="w-full h-auto transition-transform duration-700 group-hover:scale-[1.02]"
                  />
              </div>
              <div className="hidden dark:block">
                  <Image
                      src="/screenshots/graph.png"
                      alt="OpenBook Graph Interface Dark"
                      width={1200}
                      height={675}
                      className="w-full h-auto transition-transform duration-700 group-hover:scale-[1.02]"
                  />
              </div>
            </div>
          </AnimateInView>
        </div>

        {/* Grid Features */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <SimpleFeature 
            icon={KeyRound}
            title="Lightning-Fast Interface"
            description="Navigate your entire notebook using just your keyboard. Process and organize information in seconds."
            delay={0.1}
          />
          <SimpleFeature 
            icon={Brain}
            title="AI-Powered Learning"
            description="Let our AI generate explanations, create practice questions, and provide personalized study materials."
            delay={0.2}
          />
          <SimpleFeature 
            icon={Search}
            title="Smart Search"
            description="Create personalized learning flows that match exactly how you study, memorize, and process information."
            delay={0.3}
          />
          <SimpleFeature 
            icon={Lightbulb}
            title="Instant Clarity"
            description="Turn complex topics into simple summaries. Understanding is just one click away."
            delay={0.4}
          />
           <SimpleFeature 
            icon={Zap}
            title="Active Recall"
            description="Automated flashcards and quizzes testing your knowledge gaps exactly when you need it."
            delay={0.5}
          />
           <SimpleFeature 
            icon={Share2}
            title="Collaborative Spaces"
            description="Share your notes and learn together. Knowledge grows when it's shared."
            delay={0.6}
          />
        </div>
      </div>
    </section>
  )
}
