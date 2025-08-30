"use client";

import { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";

type AOSOptions = {
  easing: string;
  duration: 1000;
};

export const AOSInit = () => {
  useEffect(() => {
    AOS.init({
      easing: "ease-out-quad",
      duration: 1000,
    });
  }, []);

  return null;
};
