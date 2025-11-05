"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { ConnectWallet } from "./ConnectWallet"

export default function Header() {
  const pathname = usePathname()
  
  const navItems = [
    { href: "/", label: "Home" },
    { href: "/agents", label: "Agent Directory" },
    { href: "/chat", label: "SomniaX Chat" },
    { href: "/submit", label: "Submit Agent" },
  ]
  
  return (
    <>
      {/* Testnet Banner */}
      <div className="bg-accent text-accent-foreground py-2 text-center text-sm font-bold">
        🚀 TESTNET ONLY • Built on Somnia • Powered by x402 🚀
      </div>
      
      <header className="border-b bg-background sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Image 
              src="/somnialogo.png" 
              alt="Somnia Logo" 
              width={40} 
              height={40}
              className="h-10 w-10"
              priority
            />
            <span className="font-black text-2xl tracking-tight uppercase">
              SOMNIAX
            </span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-bold transition-colors hover:text-primary ${
                  pathname === item.href ? "text-primary" : "text-foreground"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          
          <ConnectWallet />
        </div>
      </header>
    </>
  )
}