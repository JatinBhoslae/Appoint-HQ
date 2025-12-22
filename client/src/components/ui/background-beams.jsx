"use client";
import React from "react";
import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

export const BackgroundBeams = ({ className }) => {
  return (
    <div
      className={cn(
        "absolute h-full w-full inset-0 bg-neutral-950 overflow-hidden",
        className
      )}
    >
      <div className="absolute inset-0 bg-neutral-950 [mask-image:radial-gradient(transparent,white)] pointer-events-none" />
      <div className="absolute top-0 left-0 w-full h-full bg-neutral-950 opacity-20">
         <motion.div
          animate={{
            translateY: ["-20%", "0%"],
            translateX: ["-10%", "10%"]
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            repeatType: "mirror",
            ease: "easeInOut"
          }}
          className="absolute inset-0 bg-[radial-gradient(circle_400px_at_50%_300px,#3b82f6,transparent)]"
        />
         <motion.div
           animate={{
            translateY: ["0%", "-20%"],
            translateX: ["10%", "-10%"]
           }}
           transition={{
             duration: 7,
             repeat: Infinity,
             repeatType: "mirror",
             ease: "easeInOut"
           }}
           className="absolute inset-0 bg-[radial-gradient(circle_400px_at_80%_100px,#8b5cf6,transparent)]"
         />
      </div>
      
       {/* Grid Pattern */}
       <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
       
    </div>
  );
};
