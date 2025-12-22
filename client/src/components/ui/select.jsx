import * as React from "react"
import { useMotionTemplate, useMotionValue, motion } from "framer-motion";
import { cn } from "../../lib/utils"

const Select = React.forwardRef(({ className, children, ...props }, ref) => {
  const radius = 100;
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
      <div className="relative bg-background rounded-xl">
        <select
          className={cn(
            `flex h-11 w-full items-center justify-between border-none bg-background/50 text-foreground rounded-xl px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-0 disabled:cursor-not-allowed disabled:opacity-50 appearance-none
            group-hover/input:shadow-none transition duration-400`,
            className
          )}
          ref={ref}
          {...props}
        >
          {children}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-muted-foreground">
            <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
            </svg>
        </div>
      </div>
    </motion.div>)
  );
})
Select.displayName = "Select"

export { Select }
