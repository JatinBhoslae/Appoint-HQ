import * as React from "react"
import { useMotionTemplate, useMotionValue, motion } from "framer-motion";
import { cn } from "../../lib/utils"

const Textarea = React.forwardRef(({ className, ...props }, ref) => {
  const radius = 100; // change this to increase the rdaius of the hover effect
  const [visible, setVisible] = React.useState(false);

  let mouseX = useMotionValue(0);
  let mouseY = useMotionValue(0);

  function handleMouseMove({
    currentTarget,
    clientX,
    clientY
  }) {
    let { left, top } = currentTarget.getBoundingClientRect();

    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    (<motion.div
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
      className="p-[2px] rounded-xl transition duration-300 group/input overflow-hidden">
      <textarea
        className={cn(
          `flex min-h-[80px] w-full border-none bg-background/50 text-foreground rounded-xl px-3 py-2 text-sm  file:border-0 file:bg-transparent 
          file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-0  disabled:cursor-not-allowed disabled:opacity-50
          group-hover/input:shadow-none transition duration-400`,
          className
        )}
        ref={ref}
        {...props} />
    </motion.div>)
  );
})
Textarea.displayName = "Textarea"

export { Textarea }
