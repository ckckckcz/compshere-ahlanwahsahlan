"use client"

export default function AnimatedCrossBanner() {
  const text1 = "Naik KAI, nyaman sampai tujuan!";
  const text2 = "Cepat, aman, dan tepat waktu!";
  const text3 = "Perjalanan seru dimulai di KAI!";
  const separator = " • "
  const fullText = Array(8)
    .fill(text1 + separator + text2 + separator + text3)
    .join(" ")

  return (
    <div className="w-full lg:h-24 lg:mt-0 mt-10 bg-white flex items-center justify-center relative z-20">
      {/* Second diagonal stripe - top-right to bottom-left */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative w-full h-[70px] lg:h-full">
          {/* Background stripe */}
          <div
            className="absolute inset-0 bg-[#F15A22] transform origin-center shadow-lg"
            style={{
              width: "150%",
              left: "-25%",
            }}
          />

          {/* Text container */}
          <div className="absolute inset-0 flex items-center overflow-hidden transform">
            <div className="flex animate-scroll-left-continuous">
              <span className="text-white font-bold lg:text-3xl text-2xl whitespace-nowrap">
                {fullText}
              </span>
              <span className="text-white font-bold lg:text-3xl text-2xl whitespace-nowrap">
                {fullText}
              </span>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes scroll-right-continuous {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        
        @keyframes scroll-left-continuous {
          0% {
            transform: translateX(-50%);
          }
          100% {
            transform: translateX(0);
          }
        }
        
        .animate-scroll-right-continuous {
          animation: scroll-right-continuous 50s linear infinite;
        }
        
        .animate-scroll-left-continuous {
          animation: scroll-left-continuous 50s linear infinite;
        }
      `}</style>
    </div>
  )
}