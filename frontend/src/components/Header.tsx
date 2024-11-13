// components/Header.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { Menu } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
} from "@/components/ui/navigation-menu";
import {
  ClerkProvider,
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton
} from '@clerk/nextjs';
import Image from 'next/image';
import Link from 'next/link'; // Import Link from next/link

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { href: '/functions', label: 'Model Training' },
    { href: '/visual', label: 'Data Visualization' },
    { href: '/predict', label: 'Predictions' },
  ];

  return (
    <header
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-slate-900/95 backdrop-blur-sm border-b border-slate-800'
          : 'bg-slate-900'
      }`}
    >
      <div className="container mx-auto px-4">
        <nav className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" passHref>
            <span className="text-2xl font-bold">
              <span className="flex flex-row items-center space-x-2 bg-gradient-to-r from-blue-400 to-teal-400 bg-clip-text text-transparent">
                <Image src={'/new-brain.svg'} alt='brain-logo' width={40} height={40} className='hover:animate-pulse'/>
                <span>AutoML-MLOps</span>
              </span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <NavigationMenu>
              <NavigationMenuList className='cursor-pointer'>
                {navItems.map((item) => (
                 <NavigationMenuItem key={item.href}>
                 <Link href={item.href} passHref legacyBehavior>
                   <NavigationMenuLink className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-transparent px-4 py-2 text-sm font-medium transition-colors hover:bg-slate-800 hover:text-slate-100 focus:bg-slate-800 focus:text-slate-100 focus:outline-none disabled:pointer-events-none disabled:opacity-50 text-slate-300">
                     {item.label}
                   </NavigationMenuLink>
                 </Link>
               </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* Navigation Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <SignedOut>
              <SignInButton />
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>
            <Link href="/get-started" passHref>
              <span className="bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
                Get Started
              </span>
            </Link>
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <button className="p-2 text-slate-300 hover:bg-slate-800 rounded-md">
                  <Menu className="h-6 w-6" />
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-slate-900 border-slate-800">
                <nav className="flex flex-col gap-4 mt-8">
                  {navItems.map((item) => (
                    <Link href={item.href} passHref key={item.href}>
                      <span className="text-lg text-slate-300 hover:text-white transition-colors px-4 py-2 hover:bg-slate-800 rounded-md">
                        {item.label}
                      </span>
                    </Link>
                  ))}
                  <div className="pt-4 mt-4 border-t border-slate-800 space-y-4">
                    <SignedOut>
                      <Link href="/sign-in" passHref>
                        <span className="block text-lg text-white hover:text-white transition-colors px-4 py-2 hover:bg-slate-800 rounded-md">
                          Sign In
                        </span>
                      </Link>
                    </SignedOut>
                    <SignedIn>
                      <UserButton />
                    </SignedIn>
                    <Link href="/get-started" passHref>
                      <span className="block text-lg text-white bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 px-4 py-2 rounded-md text-center">
                        Get Started
                      </span>
                    </Link>
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </nav>
      </div>
    </header>
  );
}
