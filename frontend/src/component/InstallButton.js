import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { tv } from 'tailwind-variants';

// --- Reusable Button Component (Inlined) ---
const button = tv({
  base: 'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-bold tracking-wide transition-all disabled:pointer-events-none disabled:opacity-50 outline-none focus-visible:ring-[3px]',
  variants: {
    variant: {
      secondary: 'bg-green-400 text-white hover:bg-green-400/90 border-green-500 border-b-4 active:border-b-0',
      ghost: 'bg-transparent text-slate-500 hover:bg-slate-100',
    },
    size: {
        sm: 'h-10 px-4',
    }
  },
  defaultVariants: { variant: 'secondary', size: 'sm' },
});
const Button = React.forwardRef(({ className, variant, size, rounded, ...props }, ref) => (
  <button className={button({ variant, size, rounded, className })} ref={ref} {...props} />
));
Button.displayName = 'Button';


export default function InstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    // Check if the app is already installed or if the user has dismissed the prompt.
    const isAppInstalled = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    const hasDismissed = sessionStorage.getItem('installPromptDismissed');

    if (isAppInstalled || hasDismissed) {
      return; // If already installed or dismissed, do nothing.
    }

    const handler = (e) => {
      // This event is fired by the browser when the app is installable.
      e.preventDefault();
      // Store the event so it can be triggered later.
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => {
        window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstall = async () => {
    // If deferredPrompt is not available, we can't install.
    // This shouldn't happen with the new logic, but it's a good safeguard.
    if (!deferredPrompt) return;
    
    // Show the browser's installation prompt.
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    // We no longer need the prompt. Clear it.
    if (outcome === 'accepted' || outcome === 'dismissed') {
        setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    // Remember the user's choice for this session.
    sessionStorage.setItem('installPromptDismissed', 'true');
    setDeferredPrompt(null);
  };

  return (
    <AnimatePresence>
      {/* Only render the banner if the browser has provided an install prompt */}
      {deferredPrompt && (
        <motion.div
          className="fixed bottom-0 left-0 right-0 z-50 p-4 flex justify-center"
          initial={{ y: "100%" }}
          animate={{ y: "0%" }}
          exit={{ y: "100%" }}
          transition={{ type: "tween", ease: "easeInOut", duration: 0.5 }}
        >
          <div className="bg-white rounded-2xl shadow-2xl flex items-center gap-x-4 p-4 max-w-md w-full">
             <img src="/logo.png" alt="Moofli Logo" className="h-12 w-12 hidden sm:block"/>
             <div className="flex-grow">
                <h3 className="font-bold text-slate-800 font-['Fredoka_One',_cursive]">Install the Moofli App!</h3>
                <p className="text-sm text-slate-500">Get the full experience on your home screen.</p>
             </div>
             <div className="flex items-center gap-x-2">
                <Button variant="ghost" onClick={handleDismiss}>Not now</Button>
                <Button onClick={handleInstall}>
                    Install
                </Button>
             </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

