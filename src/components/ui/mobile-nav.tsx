'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { motion, AnimatePresence } from 'framer-motion';

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut } = useAuth();

  const navigation = [
    { name: 'Features', href: '#features' },
    { name: 'How It Works', href: '#how-it-works' },
    { name: 'Frameworks', href: '#frameworks' },
    { name: 'About', href: '#about' },
  ];

  const handleSignOut = async () => {
    await signOut();
    setIsOpen(false);
  };

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="md:hidden"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "Close mobile menu" : "Open mobile menu"}
        aria-expanded={isOpen}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="absolute left-0 right-0 top-full border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden"
          >
            <div className="container py-4">
              <nav className="flex flex-col space-y-4">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="py-2 text-base font-medium text-muted-foreground transition-colors hover:text-foreground"
                    onClick={() => setIsOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}

                <div className="border-t pt-4">
                  <div className="flex flex-col space-y-3">
                    {user ? (
                      <>
                        <span className="py-2 text-sm text-muted-foreground">
                          Welcome, {user.name}
                        </span>
                        <Link
                          href="/dashboard"
                          onClick={() => setIsOpen(false)}
                        >
                          <Button
                            variant="ghost"
                            className="w-full justify-start"
                          >
                            Dashboard
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          className="w-full justify-start"
                          onClick={handleSignOut}
                        >
                          Sign Out
                        </Button>
                      </>
                    ) : (
                      <>
                        <Link
                          href="/auth/signin"
                          onClick={() => setIsOpen(false)}
                        >
                          <Button
                            variant="ghost"
                            className="w-full justify-start"
                          >
                            Sign In
                          </Button>
                        </Link>
                        <Link
                          href="/auth/signup"
                          onClick={() => setIsOpen(false)}
                        >
                          <Button className="w-full justify-start">
                            Get Started
                          </Button>
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
