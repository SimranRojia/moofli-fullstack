import React from 'react';
import { Link } from 'react-router-dom';

// --- Reusable Button Component ---
// This matches the style from your landing page screenshot
const Button = ({ children, className, variant = 'primary' }) => {
  const styles = {
    primary: 'bg-green-500 hover:bg-green-600 text-white',
    secondary: 'bg-white text-green-500 hover:bg-slate-100',
    tertiary: 'text-slate-700 hover:bg-slate-100',
  };
  return (
    <button
      className={`font-['Fredoka_One',_cursive] font-medium py-3 px-8 rounded-full shadow-lg transition duration-300 ${styles[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

// --- Icon Components (Simple SVGs) ---
const CheckIcon = () => (
  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
  </svg>
);

const GrowthIcon = () => (
  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
);

const CelebrateIcon = () => (
  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
  </svg>
);

// --- Main About Page Component ---
export default function AboutPage() {
  return (
    <div className="bg-slate-50 text-slate-800 font-sans min-h-screen">
      {/* NOTE: For the 'font-['Fredoka_One',_cursive]' class to work, you must import 
        the 'Fredoka One' font in your main index.html file.
        Add this line to the <head> of your public/index.html:
        <link href="https://fonts.googleapis.com/css2?family=Fredoka+One&family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
      */}
      
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg shadow-sm">
        <nav className="container mx-auto flex items-center justify-between p-4">
          <Link to="/" className="flex items-center gap-x-3">
             <img src="/logo.png" alt="Moofli Logo" className="h-10 w-10"/>
             <span className="text-2xl font-extrabold text-green-600 font-['Fredoka_One',_cursive]">Moofli</span>
          </Link>
          <div className="flex items-center gap-x-2">
            <Link to="/login"><Button>Login</Button></Link>
            <Link to="/login"><Button variant="secondary">Sign Up</Button></Link>
          </div>
        </nav>
      </header>

      <main className="py-16 sm:py-20">
        
        {/* --- Hero Section --- */}
        <section className="text-center mb-16 sm:mb-24 px-4">
          <h1 className="text-5xl md:text-6xl font-bold font-['Fredoka_One',_cursive] text-slate-800 leading-tight">
            Our Story: Making <br />
            <span className="text-green-500">Every Day Count</span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto">
            At Moofli, we believe that reflection is the cornerstone of growth. We created a space designed to help you capture your thoughts, track your progress, and celebrate the journey.
          </p>
        </section>

        {/* --- Our Mission Section --- */}
        <section className="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl p-8 md:p-12 mb-16 sm:mb-24 px-4">
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
            <div className="md:w-1/2">
              <h2 className="text-4xl font-bold font-['Fredoka_One',_cursive] text-slate-800 leading-tight">
                Our <span className="text-green-500">Mission</span>
              </h2>
              <p className="mt-4 text-lg text-slate-700 leading-relaxed">
                To empower individuals to build meaningful habits and foster a deeper connection with their inner selves through intuitive, engaging, and supportive digital journaling. We strive to make consistency achievable and self-discovery a joyful process.
              </p>
            </div>
            <div className="md:w-1/2 flex justify-center">
              <img 
                src="https://placehold.co/600x400/e0f2f1/4CAF50?text=Our+Mission" 
                alt="Mission Illustration" 
                className="rounded-lg shadow-md w-full"
              />
            </div>
          </div>
        </section>

        {/* --- Why Moofli? Section --- */}
        <section className="max-w-5xl mx-auto px-4 mb-16 sm:mb-24">
          <h2 className="text-4xl font-bold font-['Fredoka_One',_cursive] text-center text-slate-800 leading-tight mb-12">
            Why <span className="text-green-500">Moofli</span>?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="text-center p-6 bg-white rounded-xl shadow-lg">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckIcon />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 font-['Fredoka_One',_cursive]">Intuitive & Beautiful</h3>
              <p className="mt-2 text-slate-600">A seamless journaling experience that feels natural and keeps you engaged.</p>
            </div>
            {/* Card 2 */}
            <div className="text-center p-6 bg-white rounded-xl shadow-lg">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <GrowthIcon />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 font-['Fredoka_One',_cursive]">Track Your Growth</h3>
              <p className="mt-2 text-slate-600">See your progress over time and understand your emotional landscape.</p>
            </div>
            {/* Card 3 */}
            <div className="text-center p-6 bg-white rounded-xl shadow-lg">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <CelebrateIcon />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 font-['Fredoka_One',_cursive]">Celebrate Wins</h3>
              <p className="mt-2 text-slate-600">Acknowledge every step forward, big or small, and build momentum.</p>
            </div>
          </div>
        </section>

        {/* --- Core Values Section --- */}
        <section className="max-w-5xl mx-auto px-4 mb-16 sm:mb-24">
            <h2 className="text-4xl font-bold font-['Fredoka_One',_cursive] text-center text-slate-800 leading-tight mb-12">
                Our Core <span className="text-green-500">Values</span>
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
                <div className="p-6 bg-white rounded-xl shadow-md">
                    <h3 className="text-2xl font-bold text-slate-800 font-['Fredoka_One',_cursive] mb-3">Empowerment</h3>
                    <p className="text-slate-700">We give you the tools to take control of your narrative and personal development.</p>
                </div>
                <div className="p-6 bg-white rounded-xl shadow-md">
                    <h3 className="text-2xl font-bold text-slate-800 font-['Fredoka_One',_cursive] mb-3">Simplicity</h3>
                    <p className="text-slate-700">Journaling should be easy, not a chore. Our design reflects this commitment to clarity.</p>
                </div>
                <div className="p-6 bg-white rounded-xl shadow-md">
                    <h3 className="text-2xl font-bold text-slate-800 font-['Fredoka_One',_cursive] mb-3">Privacy</h3>
                    <p className="text-slate-700">Your thoughts are sacred. We ensure your personal entries remain confidential and secure.</p>
                </div>
                <div className="p-6 bg-white rounded-xl shadow-md">
                    <h3 className="text-2xl font-bold text-slate-800 font-['Fredoka_One',_cursive] mb-3">Growth</h3>
                    <p className="text-slate-700">We are dedicated to helping you evolve, learn, and achieve your fullest potential.</p>
                </div>
            </div>
        </section>

        {/* --- Final CTA Section --- */}
        <section className="text-center bg-green-500 text-white p-12 sm:p-16 rounded-2xl max-w-4xl mx-auto shadow-xl">
          <h2 className="text-4xl md:text-5xl font-bold font-['Fredoka_One',_cursive] leading-tight">
            Ready to Start Your Journey?
          </h2>
          <p className="mt-4 text-xl max-w-2xl mx-auto text-green-100">
            Join the Moofli community and transform the way you reflect, grow, and live.
          </p>
          <Button variant="secondary" className="mt-8 text-lg">
            GET STARTED FOR FREE
          </Button>
        </section>
      </main>

      <footer className="bg-slate-800 text-slate-400 py-8">
        <div className="container mx-auto text-center">
            <p>&copy; 2025 Moofli Diary. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
}

