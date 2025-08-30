import Link from "next/link";
import Image from "next/image";
import { Mail, Linkedin } from "lucide-react"; // using lucide icons

export default function Footer() {
  return (
    <footer className="w-full bg-[#272727]">
      <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Left side - logo / brand */}
        <Link
          href={"/"}
          className="hover:scale-95 hover:opacity-70 duration-200"
        >
          <Image
            src={"/assets/images/Haykal-Logo.png"}
            alt="Haykal Logo"
            width={500}
            height={500}
            className="w-[5rem]"
          />
        </Link>

        {/* Center - navigation links */}
        <div className="flex gap-6 text-sm text-white">
          <a href="#" className="hover:opacity-60 transition">
            Home
          </a>
          <a href="#" className="hover:opacity-60 transition">
            Features
          </a>
          <a href="#" className="hover:opacity-60 transition">
            Pricing
          </a>
          <a href="#" className="hover:opacity-60 transition">
            Contact
          </a>
        </div>

        {/* Right side - email + LinkedIn */}
        <div className="flex gap-4">
          <a
            href="mailto:info@haykal.com"
            className="w-8 h-8 flex items-center justify-center border border-primary text-white rounded-full shadow-sm hover:opacity-80 transition"
            aria-label="Email"
          >
            <Mail size={16} />
          </a>
          <a
            href="https://linkedin.com/company/haykal"
            target="_blank"
            rel="noopener noreferrer"
            className="w-8 h-8 flex items-center justify-center border border-primary text-white rounded-full shadow-sm hover:opacity-80 transition"
            aria-label="LinkedIn"
          >
            <Linkedin size={16} />
          </a>
        </div>
      </div>

      {/* Bottom note */}
      <div className="text-center text-xs text-white py-4 border-t border-gray-200 w-3/5 mx-auto">
        © {new Date().getFullYear()} Haykal. All rights reserved.
      </div>
    </footer>
  );
}
