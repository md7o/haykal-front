"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "../ui/button";

export default function Navbar() {
  const openDialog = (type: "services") => {
    console.log("Open dialog:", type);
  };

  return (
    <header className="py-4 px-4 md:px-6 relative z-50">
      {/* Desktop Navigation */}
      <nav className="flex justify-between items-center lg:mx-60">
        <Link
          href={"/"}
          className="hover:scale-95 hover:opacity-70 duration-200"
        >
          <Image
            src={"/assets/images/Haykal-Logo.png"}
            alt="Jeddah Albalad Logo"
            property="true"
            width={500}
            height={500}
            className="w-16 sm:w-20"
          />
        </Link>

        <div className="flex sm:gap-2 gap-1">
          <Button
            variant="transparent"
            size={"base"}
            onClick={() => openDialog("services")}
          >
            Login
          </Button>
          <Button
            variant="fill"
            size={"small"}
            onClick={() => openDialog("services")}
          >
            SignUp
          </Button>
        </div>
      </nav>
    </header>
  );
}
