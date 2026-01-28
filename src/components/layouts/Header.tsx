"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "../ui-tools/ui/button";
import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { TokenTimer } from "@/components/auth/TokenTimer";

export default function Navbar() {
  const user = useAuthStore((state) => state.user);
  const isLoading = useAuthStore((state) => state.isLoading);
  const logoutUser = useAuthStore((state) => state.logoutUser);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <header className="pt-4 px-4 md:px-6 relative z-50">
      {/* Desktop Navigation */}
      <nav className="flex justify-between items-center lg:mx-60">
        <Link href={"/"} className="hover:scale-95 hover:opacity-70 duration-200">
          <Image
            src={"/assets/images/Haykal-Logo.png"}
            alt="Jeddah Albalad Logo"
            priority
            width={500}
            height={500}
            className="w-16 sm:w-20"
          />
        </Link>

        <div className="flex sm:gap-2 gap-1">
          {!isMounted ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
              <span className="text-sm text-foreground/70">Loading...</span>
            </div>
          ) : isLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
              <span className="text-sm text-foreground/70">Checking...</span>
            </div>
          ) : user ? (
            <div className="flex items-center gap-3">
              <TokenTimer />
              <span className="text-sm text-foreground/70">Welcome{user?.username ? `, ${user.username}` : ""}</span>
              <Button
                variant="transparent"
                size="base"
                onClick={async () => {
                  try {
                    setIsLoggingOut(true);
                    await logoutUser();
                    // Auth store and logout handler clear everything automatically
                    router.push("/");
                  } catch (error) {
                    console.error("Logout failed:", error);
                  } finally {
                    setIsLoggingOut(false);
                  }
                }}
                disabled={isLoggingOut}
              >
                {isLoggingOut ? "Logging out…" : "Logout"}
              </Button>
            </div>
          ) : (
            <>
              <Link href="/login">
                <Button variant="grayFill" asChild>
                  <span>Login</span>
                </Button>
              </Link>
              <Link href="/signup">
                <Button variant="fill" asChild>
                  <span>SignUp</span>
                </Button>
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
