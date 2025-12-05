import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { MessageLoading } from '@/components/ui/message-loading';
import { motion, AnimatePresence } from 'framer-motion';

interface PageTransitionProps {
  children: React.ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [displayChildren, setDisplayChildren] = useState(children);
  const [currentKey, setCurrentKey] = useState(location.key);

  useEffect(() => {
    if (location.key !== currentKey) {
      setIsLoading(true);
      const timer = setTimeout(() => {
        setDisplayChildren(children);
        setCurrentKey(location.key);
        setIsLoading(false);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [location.key, children, currentKey]);

  return (
    <>
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[100] flex items-center justify-center"
          >
            {/* Animated background */}
            <div className="absolute inset-0 bg-background/95 backdrop-blur-xl">
              {/* Subtle floating orbs */}
              <div className="absolute inset-0 overflow-hidden">
                <motion.div
                  className="absolute w-96 h-96 rounded-full bg-primary/5 blur-3xl"
                  animate={{
                    x: [0, 100, 0],
                    y: [0, 50, 0],
                  }}
                  transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  style={{ top: '10%', left: '10%' }}
                />
                <motion.div
                  className="absolute w-80 h-80 rounded-full bg-primary/3 blur-3xl"
                  animate={{
                    x: [0, -80, 0],
                    y: [0, 80, 0],
                  }}
                  transition={{
                    duration: 10,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  style={{ bottom: '20%', right: '15%' }}
                />
              </div>
            </div>
            
            {/* Loading indicator */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="relative z-10 flex flex-col items-center gap-6"
            >
              <div className="w-12 h-12 flex items-center justify-center">
                <MessageLoading />
              </div>
              <span className="text-sm text-muted-foreground tracking-wide">
                Carregando...
              </span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <motion.div
        key={currentKey}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {displayChildren}
      </motion.div>
    </>
  );
}
