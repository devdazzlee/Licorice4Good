'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function ProcessSteps() {
  const pathRef = useRef<SVGPathElement>(null)
  const stepRefs = useRef<Array<HTMLDivElement | null>>([])

  useEffect(() => {
    const path = pathRef.current
    const totalLength = path?.getTotalLength() ?? 0

    if (!path) return

    path.style.strokeDasharray = `${totalLength}`
    path.style.strokeDashoffset = `${totalLength}`

    const tl = gsap.timeline()

    tl.to(path, {
      strokeDashoffset: 0,
      duration: 2,
      ease: 'power2.inOut',
    })

    stepRefs.current.forEach((el) => {
      if (el) {
        tl.fromTo(
          el,
          { opacity: 0, y: 50 },
          { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' },
          `+=0.2`
        )
      }
    })
  }, [])

  return (
    <section className="relative py-16 px-4 sm:px-10 max-w-6xl mx-auto">
      <h2 className="text-orange-500 font-semibold text-sm uppercase mb-2">Our Process</h2>
      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
        How It Works? Follow the steps to the profit
      </h1>
      <p className="text-gray-600 mb-12 max-w-2xl">
        Looking to spice up snack time with something fun, flavorful, and a little nostalgic?...
      </p>

      {/* SVG Line */}
      <svg
        className="absolute top-40 left-0 w-full h-full pointer-events-none"
        viewBox="0 0 1000 400"
        preserveAspectRatio="none"
      >
        <path
          ref={pathRef}
          d="M 50 300 C 150 200, 350 200, 450 300 S 750 400, 950 200"
          fill="none"
          stroke="#ff4d30"
          strokeWidth="4"
          strokeLinecap="round"
        />
      </svg>

      <div className="relative z-10 space-y-24">
        {[1, 2, 3].map((num, i) => (
          <div
            key={num}
            ref={(el) => {
              stepRefs.current[i] = el;
            }}
            className={`flex flex-col sm:flex-row sm:items-start gap-6 ${
              i % 2 === 0 ? 'sm:flex-row' : 'sm:flex-row-reverse'
            }`}
          >
            <div className="text-7xl text-gray-200 font-bold">{num}</div>
            <div>
              <h3 className="font-semibold text-lg text-gray-900 mb-2">
                {i === 0 && 'Sign Up for a Fundraiser'}
                {i === 1 && 'Start Selling'}
                {i === 2 && 'Earn 50% Of Every Sale'}
              </h3>
              <p className="text-gray-600 max-w-md">
                {i === 0 &&
                  'No Fees. No minimums. Sign up via our online form, email, or call our team. We’ll send you samples.'}
                {i === 1 &&
                  'We make it easy. Fundraiser runs for 4–5 days. We provide a media kit and best practices.'}
                {i === 2 &&
                  '50% of your sales (not including tax/shipping) go to your organization. You’ll receive a check within 14 days.'}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
