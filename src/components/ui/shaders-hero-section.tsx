"use client"

import { PulsingBorder, MeshGradient } from "@paper-design/shaders-react"
import { motion } from "framer-motion"
import React, { useEffect, useRef, useState } from "react"

interface ShaderBackgroundProps {
  children: React.ReactNode
}

export function ShaderBackground({ children }: ShaderBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isActive, setIsActive] = useState(false)

  useEffect(() => {
    const handleMouseEnter = () => setIsActive(true)
    const handleMouseLeave = () => setIsActive(false)

    const container = containerRef.current
    if (container) {
      container.addEventListener("mouseenter", handleMouseEnter)
      container.addEventListener("mouseleave", handleMouseLeave)
    }

    return () => {
      if (container) {
        container.removeEventListener("mouseenter", handleMouseEnter)
        container.removeEventListener("mouseleave", handleMouseLeave)
      }
    }
  }, [])

  return (
    <div ref={containerRef} className="min-h-screen w-full relative overflow-hidden bg-neutral-50">
      {/* SVG Filters */}
      <svg className="absolute inset-0 w-0 h-0">
        <defs>
          <filter id="glass-effect" x="-50%" y="-50%" width="200%" height="200%">
            <feTurbulence baseFrequency="0.005" numOctaves="1" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="0.3" />
            <feColorMatrix
              type="matrix"
              values="1 0 0 0 0.02
                      0 1 0 0 0.02
                      0 0 1 0 0.05
                      0 0 0 0.9 0"
              result="tint"
            />
          </filter>
          <filter id="gooey-filter" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9"
              result="gooey"
            />
            <feComposite in="SourceGraphic" in2="gooey" operator="atop" />
          </filter>
        </defs>
      </svg>

      {/* Background Shaders */}
      <MeshGradient
        className="absolute inset-0 w-full h-full opacity-40"
        colors={["#ffffff", "#e5e5e5", "#d4d4d4", "#f5f5f5", "#a3a3a3"]}
        speed={0.15}
      />
      <MeshGradient
        className="absolute inset-0 w-full h-full opacity-[0.03]"
        colors={["#000000", "#000000", "#000000", "#000000"]}
        speed={0.05}
      />

      {children}
    </div>
  )
}

export function PulsingCircle() {
  return (
    <div className="absolute bottom-12 right-12 z-30 hidden md:block">
      <div className="relative w-24 h-24 flex items-center justify-center">
        {/* Pulsing Border Circle */}
        <PulsingBorder
          colors={["#000000", "#2563eb", "#dc2626", "#16a34a", "#9333ea"]}
          colorBack="#ffffff"
          speed={1.5}
          roundness={1}
          thickness={0.1}
          softness={0.2}
          intensity={5}
          spots={3}
          spotSize={0.1}
          pulse={0.1}
          smoke={0.2}
          smokeSize={2}
          scale={0.65}
          rotation={0}
          frame={9161408.251009725}
          style={{
            width: "70px",
            height: "70px",
            borderRadius: "50%",
            border: "2px solid black",
            boxShadow: "4px 4px 0px 0px rgba(0,0,0,1)"
          }}
        />

        {/* Rotating Text Around the Pulsing Border */}
        <motion.svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 100 100"
          animate={{ rotate: 360 }}
          transition={{
            duration: 20,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
          style={{ transform: "scale(1.6)" }}
        >
          <defs>
            <path id="circle" d="M 50, 50 m -38, 0 a 38,38 0 1,1 76,0 a 38,38 0 1,1 -76,0" />
          </defs>
          <text className="text-[9.5px] fill-black font-bold uppercase tracking-widest font-sans">
            <textPath href="#circle" startOffset="0%">
              PROBLEMSPACE • DETECTIVE BOARD • 
            </textPath>
          </text>
        </motion.svg>
      </div>
    </div>
  )
}
