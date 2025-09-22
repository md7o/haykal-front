"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "../ui/button";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const { isLogged, user, isCheckingAuth, logoutUser } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();

  return (
    <header className="py-4 px-4 md:px-6 relative z-50">
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
          {isCheckingAuth ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
              <span className="text-sm text-foreground/70">Checking...</span>
            </div>
          ) : isLogged ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-foreground/70">Welcome{user?.username ? `, ${user.username}` : ""}</span>
              <Button
                variant="transparent"
                size="base"
                onClick={async () => {
                  try {
                    setIsLoggingOut(true);
                    await logoutUser();
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
                <Button variant="transparent" size="base" asChild>
                  <span>Login</span>
                </Button>
              </Link>
              <Link href="/signup">
                <Button variant="fill" size="small" asChild>
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
