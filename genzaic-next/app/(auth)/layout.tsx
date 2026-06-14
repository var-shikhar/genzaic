import Link from "next/link"
import { Star } from "lucide-react"
import Image from "next/image"
import logoFull from "../../public/logo.png"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="h-dvh flex overflow-hidden">
      {/* Left Panel — Marketing / Branding (hidden on mobile) */}
      <div
        className="hidden lg:flex lg:w-[48%] xl:w-[52%] relative flex-col justify-between overflow-hidden"
        style={{
          background:
            "linear-gradient(145deg, #1a1030 0%, #2d1b69 35%, #4c1d95 65%, #7c3aed 100%)",
        }}
      >
        {/* Subtle pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
        />

        {/* Glowing orbs */}
        <div className="absolute top-[15%] right-[10%] w-[300px] h-[300px] rounded-full bg-violet-500/20 blur-[120px]" />
        <div className="absolute bottom-[20%] left-[5%] w-[250px] h-[250px] rounded-full bg-fuchsia-500/15 blur-[100px]" />

        {/* Top — Logo */}
        <div className="relative z-10 p-8">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="flex items-center gap-2.5">
              <Image src={logoFull} alt="Genzaic" width={100} height={20} />
            </div>
          </Link>
        </div>

        {/* Center — Headline + Stats */}
        <div className="relative z-10 px-8 xl:px-12 flex-1 flex flex-col justify-center">
          <h1 className="text-3xl xl:text-4xl font-bold text-white leading-tight tracking-tight mb-4">
            The Digital Storefront
            <br />
            <span className="bg-gradient-to-r from-violet-200 to-fuchsia-200 bg-clip-text text-transparent">
              Built for Indian Creators
            </span>
          </h1>
          <p className="text-violet-200/70 text-sm xl:text-base max-w-md leading-relaxed mb-8">
            Sell PDFs, templates, code & digital products. UPI-ready, GST-ready
            — zero setup fees.
          </p>

          {/* Stats row */}
          <div className="flex gap-8 mb-10">
            {[
              { value: "0", label: "Setup Fee" },
              { value: "10K+", label: "Creators" },
              { value: "T+7", label: "Payouts" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-2xl xl:text-3xl font-bold text-white">
                  {stat.value}
                </p>
                <p className="text-violet-300/60 text-xs mt-0.5">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>

          {/* Testimonial */}
          <div className="bg-white/[0.07] backdrop-blur-sm rounded-2xl border border-white/[0.08] p-5 max-w-md">
            <div className="flex gap-0.5 mb-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star
                  key={i}
                  className="w-3.5 h-3.5 fill-amber-400 text-amber-400"
                />
              ))}
            </div>
            <p className="text-white/80 text-sm leading-relaxed mb-4">
              &ldquo;GenZaic made it incredibly easy to start selling my design
              templates. The UPI integration and auto GST invoicing saved me
              hours of work every week.&rdquo;
            </p>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-400 to-fuchsia-400 flex items-center justify-center text-white text-xs font-bold">
                RP
              </div>
              <div>
                <p className="text-white text-sm font-medium">Rahul P.</p>
                <p className="text-violet-300/50 text-xs">
                  Design Template Creator
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="relative z-10 p-8">
          <p className="text-violet-300/40 text-xs">
            &copy; {new Date().getFullYear()} GenZaic. Made in India
          </p>
        </div>
      </div>

      {/* Right Panel — Auth Form */}
      <div className="flex-1 flex flex-col bg-background">
        {/* Mobile-only logo */}
        <div className="lg:hidden px-5 pt-4 pb-2 flex-shrink-0">
          <Link href="/" className="inline-flex items-center gap-2">
            <Image src={logoFull} alt="Genzaic" width={100} height={20} />
          </Link>
        </div>

        {/* Form container */}
        <div className="flex-1 flex items-center justify-center px-5 sm:px-8 py-4 min-h-0">
          <div className="w-full max-w-[420px]">{children}</div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 text-center flex-shrink-0">
          <p className="text-[11px] text-muted-foreground">
            &copy; {new Date().getFullYear()} GenZaic.{" "}
            <a href="#" className="hover:text-foreground transition-colors">
              Privacy Policy
            </a>{" "}
            &middot;{" "}
            <a href="#" className="hover:text-foreground transition-colors">
              Terms of Service
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
