import React from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import useLenis from "../../hooks/useLenis";
import { Button } from "../../component/buttons/button";
import { JournalIcon, StreakIcon, CalendarIcon } from "./Icons";

function Landing() {
  useLenis();

  // Parallax scroll transforms (for gradient blobs)
  const { scrollY } = useScroll();
  const yBlob1 = useTransform(scrollY, [0, 1000], [0, -200]);
  const yBlob2 = useTransform(scrollY, [0, 1000], [0, -100]);

  const features = [
    {
      icon: <JournalIcon className="w-12 h-12 text-green-500" />,
      title: "A Space to Think Clearly",
      description:
        "Write freely without noise. Moofli becomes your calm corner to process thoughts, organize ideas, and reflect.",
    },
    {
      icon: <StreakIcon className="w-12 h-12 text-orange-400" />,
      title: "Build Habits That Stick",
      description:
        "Stay consistent with streaks, daily prompts, and subtle nudges that keep you grounded.",
    },
    {
      icon: <CalendarIcon className="w-12 h-12 text-sky-500" />,
      title: "A Timeline of Growth",
      description:
        "Track your mood, progress, patterns, and emotional cycles — all visualized beautifully.",
    },
  ];

  return (
    <div className="bg-slate-50 text-slate-800 font-sans overflow-x-hidden">

      {/* NAV */}
      <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-lg shadow-sm">
        <nav className="container mx-auto flex items-center justify-between p-4">
          <Link to="/" className="flex items-center gap-x-3">
            <img src="/logo.png" alt="Moofli Logo" className="h-10 w-10" />
            <span className="text-2xl font-extrabold text-green-600 font-['Fredoka_One']">
              Moofli
            </span>
          </Link>

          <div className="flex items-center gap-x-2">
            <Link to="/login"><Button>Login</Button></Link>
            <Link to="/login"><Button variant="secondary">Sign Up</Button></Link>
          </div>
        </nav>
      </header>

      <main>

        {/* *********************** HERO SECTION ************************* */}
        <section className="relative h-[120vh] flex items-center justify-center text-center px-6 overflow-hidden">

          {/* Gradient layers instead of bg image */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-b from-[#dff7f7] via-[#eefcfc] to-white"
            animate={{ opacity: [0.95, 1, 0.95] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          />


          {/* Organic blurred blob 1 */}
          <motion.div
            className="absolute top-10 left-10 w-[400px] h-[400px] bg-green-300/40 rounded-full blur-[120px]"
            style={{ y: yBlob1 }}
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 8, repeat: Infinity }}
          />

          {/* Organic blurred blob 2 */}
          <motion.div
            className="absolute bottom-10 right-10 w-[500px] h-[500px] bg-sky-300/40 rounded-full blur-[140px]"
            style={{ y: yBlob2 }}
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 7, repeat: Infinity }}
          />

          {/* HERO TEXT CONTENT */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="max-w-4xl relative z-10"
          >
            <h1 className="text-6xl lg:text-7xl font-extrabold font-['Fredoka_One'] leading-tight mb-6">
              Your Mind. Your Space.
              <span className="text-green-600 block">Reimagined.</span>
            </h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 1 }}
              className="text-xl text-slate-600 max-w-2xl mx-auto"
            >
              Write, reflect, and transform your thoughts with a journaling experience built for emotional clarity.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1, duration: 0.8 }}
              className="mt-10"
            >
              <Link to="/login">
                <Button variant="secondary" size="lg">Start Writing</Button>
              </Link>
            </motion.div>
          </motion.div>

          {/* Scroll Indicator */}
          <motion.div
            className="absolute bottom-12 text-slate-500 z-10"
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <div className="text-sm">Scroll</div>
            <div className="mx-auto mt-1 w-1 h-6 bg-slate-400 rounded-full"></div>
          </motion.div>
        </section>


        {/* *********************** PARALLAX SHAPES SECTION ************************* */}
        <section className="relative h-[160vh] flex items-center justify-center overflow-hidden bg-gradient-to-b from-white to-[#f8fdfc]">


          {/* Parallax abstract shapes */}
          <motion.div
            className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-green-200/40 blur-[120px] rounded-full"
            style={{ y: yBlob1 }}
          />

          <motion.div
            className="absolute top-40 right-1/4 w-[600px] h-[600px] bg-sky-200/40 blur-[140px] rounded-full"
            style={{ y: yBlob2 }}
          />

          {/* Content */}
          <motion.div
            className="relative z-10 max-w-3xl text-center px-6"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-5xl font-extrabold mb-6">
              A Space That Moves With You
            </h2>
            <p className="text-lg text-slate-600">
              Experience a smooth, immersive interface where each scroll flows naturally —
              powered by Lenis and motion design.
            </p>
          </motion.div>
        </section>


        {/* *********************** STORY FEATURE SECTION ************************* */}
        <section className="relative py-40 bg-slate-900 text-slate-100 overflow-hidden">

          {/* Moving background blob */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900 opacity-80"
            animate={{ opacity: [0.8, 1, 0.8] }}
            transition={{ duration: 6, repeat: Infinity }}
          />

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="text-center mb-16 px-6 relative z-10"
          >
            <h2 className="text-4xl lg:text-5xl font-extrabold mb-4">
              Turn Your Diary Into a Movie
            </h2>
            <p className="text-lg text-slate-300 max-w-2xl mx-auto">
              With a single tap, Moofli transforms your daily entry into a 180-second animated story.
              Your words gain motion, emotion, and perspective.
            </p>
          </motion.div>

          {/* Video Showcase */}
          <div className="flex justify-center relative z-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="rounded-3xl overflow-hidden shadow-[0_0_80px_-10px_rgba(0,255,200,0.12)]"
            >
              <video
                src="/story-demo.mp4"
                autoPlay
                muted
                loop
                playsInline
                className="w-[90vw] max-w-[900px] rounded-3xl"
              />
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-center mt-12 text-slate-400 text-sm tracking-widest relative z-10"
          >
            Your Story. Your Perspective. Reimagined.
          </motion.div>

        </section>


        {/* *********************** FEATURES GRID ************************* */}
        <section className="py-32 bg-white">
          <div className="container mx-auto px-6">
            <h2 className="text-4xl font-extrabold text-center mb-20">
              Why Thousands Choose Moofli
            </h2>

            <div className="grid md:grid-cols-3 gap-16">
              {features.map((f, i) => (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15, duration: 0.6 }}
                  className="p-10 bg-slate-50 rounded-2xl shadow"
                >
                  <div className="flex justify-center mb-6">{f.icon}</div>
                  <h3 className="text-xl font-bold mb-3 text-slate-800">{f.title}</h3>
                  <p className="text-slate-600">{f.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>


        {/* *********************** FINAL CTA ************************* */}
        <section className="py-32 bg-gradient-to-b from-green-50 to-white text-center px-6">
          <h2 className="text-4xl font-extrabold mb-6">
            Ready to Feel More Connected to Yourself?
          </h2>
          <p className="max-w-2xl mx-auto text-slate-600 text-lg">
            Start your journey today with a space designed to help you reflect, grow, and find emotional clarity.
          </p>

          <div className="mt-10">
            <Button variant="secondary" size="lg">Get Started Free</Button>
          </div>
        </section>

      </main>

      <footer className="bg-slate-800 text-slate-400 py-8 text-center">
        © 2025 Moofli Diary — All Rights Reserved.
      </footer>
    </div>
  );
}

export default Landing;
