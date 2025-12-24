"use client"

import Image from "next/image"
import AnimateInView from "./animate-in-view"
import SectionHeading from "./section-heading"

export function InterfacePreviewSection() {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="order-2 lg:order-1">
            <SectionHeading
              title="Optimized for Phones Too!!"
              description="Access your notes anywhere with our fully responsive design optimized for all your devices. Whether you're on the bus or in bed, your learning continues."
              centered={false}
              className="mb-8"
            />

            <AnimateInView delay={0.2}>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="h-2 w-2 mt-2 rounded-full bg-primary" />
                  <p className="text-muted-foreground">Seamless sync across all devices</p>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="h-2 w-2 mt-2 rounded-full bg-primary" />
                  <p className="text-muted-foreground">Touch-optimized interface for mobile learning</p>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="h-2 w-2 mt-2 rounded-full bg-primary" />
                  <p className="text-muted-foreground">Offline access to your most recent notes</p>
                </div>
              </div>
            </AnimateInView>
          </div>

          <div className="order-1 lg:order-2 relative mx-auto lg:mx-0 max-w-[320px] lg:max-w-none">
            <AnimateInView>
              <div className="relative z-10 rounded-[2.5rem] overflow-hidden shadow-2xl">
                <Image
                  src="/screenshots/iPhones1.png"
                  alt="OpenBook Mobile Interface"
                  width={600}
                  height={1200}
                  className="w-full h-auto"
                />
              </div>
              {/* Decorative elements */}
              <div className="absolute top-10 -right-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl -z-10" />
              <div className="absolute bottom-10 -left-10 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -z-10" />
            </AnimateInView>
          </div>
        </div>
      </div>
    </section>
  )
}
