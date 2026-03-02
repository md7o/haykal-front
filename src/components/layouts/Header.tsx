"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "../ui/shadcn_ui/button";
import { useState, useEffect } from "react";
import { useAuthStore } from "@/lib/store/authStore";
import { useRouter } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger } from "../ui/shadcn_ui/select";
import { Rocket, User2 } from "lucide-react";
import ActivityDialog from "../ui/custom_ui/ActivityDialog";

export default function Navbar() {
  const user = useAuthStore((state) => state.user);
  const isLoading = useAuthStore((state) => state.isLoading);
  const logoutUser = useAuthStore((state) => state.logoutUser);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isActivityOpen, setIsActivityOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logoutUser();
      window.location.reload();
      router.push("/");
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="fixed top-0 left-0 w-screen pt-4 px-4 md:px-6 z-50 bg-background/95 backdrop-blur-sm">
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
            <div className="flex justify-center items-center gap-5">
              <Button variant={"outline"} onClick={() => setIsActivityOpen(true)} className="md:flex hidden">
                <Rocket /> Activity
              </Button>
              <Select onValueChange={(value) => value === "logout" && handleLogout()}>
                <SelectTrigger className="w-auto px-3 py-1 font-bold bg-transparent text-sm rounded-soft focus:outline-none hover:bg-black/50 transition-all duration-200">
                  <User2 /> {user.username}
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="logout">
                    <Button variant={"outline"} onClick={() => setIsActivityOpen(true)} className=" md:hidden px-0">
                      <Rocket /> Activity
                    </Button>
                  </SelectItem>
                  <SelectItem value="logout" className="px-4 py-2 bg-transparent cursor-pointer">
                    {isLoggingOut ? "Logging out…" : "Logout"}
                  </SelectItem>
                </SelectContent>
              </Select>
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
        <ActivityDialog open={isActivityOpen} onOpenChange={setIsActivityOpen} />
      </nav>
    </header>
  );
}
