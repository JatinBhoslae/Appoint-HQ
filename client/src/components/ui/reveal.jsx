import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

export const Reveal = ({ children, className, width = "fit-content", delay = 0.25, duration = 0.5, y = 50, blur = true }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-50px" });

    const variants = {
        hidden: { opacity: 0, y: y, filter: blur ? "blur(8px)" : "blur(0px)" },
        visible: { opacity: 1, y: 0, filter: "blur(0px)" }
    };

    return (
        <div ref={ref} className={className} style={{ position: "relative" }}>
            <motion.div
                variants={variants}
                initial="hidden"
                animate={isInView ? "visible" : "hidden"}
                transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }} // custom ease
            >
                {children}
            </motion.div>
        </div>
    );
};
