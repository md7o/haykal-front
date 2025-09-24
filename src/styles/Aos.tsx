"use client";

import { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";

// Local options type (kept for clarity)
export const AOSInit = () => {
  useEffect(() => {
    AOS.init({
      easing: "ease-out-quad",
      duration: 1000,
    });
  }, []);

  return null;
};
