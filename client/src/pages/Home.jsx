import React, { useEffect } from "react";
import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import Hero from "../components/Hero";

const Home = () => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  useEffect(() => {
    function handleMouseMove({ currentTarget, clientX, clientY }) {
      mouseX.set(clientX);
      mouseY.set(clientY);
    }

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <div
      className="relative flex flex-col h-screen overflow-hidden bg-white dark:bg-background"
    >
      {/* AMAZING BACKGROUND */}
      <div className="absolute inset-0 -z-10 h-full w-full bg-white dark:bg-black">
          {/* Grey grid only visible in dark mode */}
          <div className="hidden dark:block absolute h-full w-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-50"></div>
      </div>
      
      {/* Spotlight Effect for Light Mode */}
      <motion.div
        className="pointer-events-none absolute inset-0 z-0 transition duration-300 dark:hidden"
        style={{
          background: useMotionTemplate`radial-gradient(600px circle at ${mouseX}px ${mouseY}px, rgba(100, 149, 237, 0.15), transparent 80%)`,
        }}
      />

      <motion.div
        className="absolute -top-20 -left-20 w-[800px] h-[800px] rounded-full bg-gradient-to-tr from-indigo-300/40 via-purple-300/40 to-blue-300/40 blur-[100px] mix-blend-multiply dark:mix-blend-normal dark:bg-primary/20"
        animate={{ x: [0, 50, 0], y: [0, 30, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-1/3 right-0 w-[600px] h-[600px] rounded-full bg-gradient-to-bl from-cyan-300/40 via-teal-300/40 to-emerald-300/40 blur-[100px] mix-blend-multiply dark:mix-blend-normal dark:bg-purple-500/10"
        animate={{ x: [0, -40, 0], y: [0, 40, 0], scale: [1, 1.2, 1] }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
         className="absolute -bottom-40 left-1/3 w-[700px] h-[700px] rounded-full bg-gradient-to-t from-pink-300/30 via-rose-300/30 to-orange-300/30 blur-[120px] mix-blend-multiply dark:mix-blend-normal dark:bg-blue-500/10"
         animate={{ x: [0, 30, 0], y: [0, -30, 0], scale: [1, 1.1, 1] }}
         transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* HERO */}
      <Hero />
    </div>
  );
};

export default Home;
