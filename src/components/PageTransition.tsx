import { ReactNode } from "react";
import { motion } from "framer-motion";

const variants = {
  initial: { opacity: 0, y: 12, scale: 0.99 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -8, scale: 0.99 },
};

const PageTransition = ({ children }: { children: ReactNode }) => (
  <motion.div
    variants={variants}
    initial="initial"
    animate="animate"
    exit="exit"
    transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
    style={{ width: "100%" }}
  >
    {children}
  </motion.div>
);

export default PageTransition;
