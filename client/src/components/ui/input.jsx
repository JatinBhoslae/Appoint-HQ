import * as React from "react"
import { cn } from "../../lib/utils"
import { motion, useMotionTemplate, useMotionValue } from "framer-motion";

const Input = React.forwardRef(({ className, type, icon, rightElement, ...props }, ref) => {
  const radius = 100; // change this to increase the rdaius of the hover effect
  const [visible, setVisible] = React.useState(false);

  let mouseX = useMotionValue(0);
  let mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }) {
    let { left, top } = currentTarget.getBoundingClientRect();

    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <motion.div
      style={{
        background: useMotionTemplate`
        radial-gradient(
          ${visible ? radius + "px" : "0px"} circle at ${mouseX}px ${mouseY}px,
          var(--primary),
          transparent 80%
        )
      `,
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      className="p-[2px] rounded-xl transition duration-300 group/input overflow-hidden"
    >
      <div className="relative flex items-center bg-background rounded-xl">
        {icon && (
            <div className="absolute left-3 text-muted-foreground group-focus-within/input:text-primary transition-colors z-10 pointer-events-none">
                {icon}
            </div>
        )}
        <input
          type={type}
          className={cn(
            `flex h-11 w-full border-none bg-background/50 text-foreground rounded-xl px-3 py-2 text-sm  file:border-0 file:bg-transparent 
            file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-0  disabled:cursor-not-allowed disabled:opacity-50
            group-hover/input:shadow-none transition duration-400
            ${icon ? "pl-10" : ""}
            ${rightElement ? "pr-10" : ""}`,
            className
          )}
          ref={ref}
          {...props}
        />
        {rightElement && (
            <div className="absolute right-3 z-10">
                {rightElement}
            </div>
        )}
      </div>
    </motion.div>
  );
})
Input.displayName = "Input"

export { Input }
