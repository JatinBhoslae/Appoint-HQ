import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { cn } from "../../lib/utils";

export const TextReveal = ({ text, className, delay = 0, stagger = 0.05 }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-10%" });

  const words = text.split(" ");

  const container = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: stagger, delayChildren: delay * i },
    }),
  };

  const child = {
    hidden: {
      opacity: 0,
      y: 20,
      filter: "blur(8px)",
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100,
      },
    },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100,
      },
    },
  };

  return (
    <motion.div
      ref={ref}
      variants={container}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      className={cn("flex flex-wrap", className)}
    >
      {words.map((word, index) => (
        <motion.span variants={child} className="mr-[0.2em] inline-block" key={index}>
          {word}
        </motion.span>
      ))}
    </motion.div>
  );
};
