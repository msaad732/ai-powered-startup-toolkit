import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import {
  Users,
  ListChecks,
  Lightbulb,
  DollarSign,
  Presentation,
  Wand2,
  Banknote,
  Megaphone,
  Menu,
  X,
  Scale,
} from "lucide-react";

const features = [
  {
    name: "About us",
    icon: Users,
    link: "about",
    description: "The team, motivation, and project goals.",
  },
  {
    name: "Features",
    icon: ListChecks,
    link: "features",
    description: "Detailed breakdown of all application functionalities.",
  },
  {
    name: "Idea Validation",
    icon: Lightbulb,
    link: "ideavalidation",
    description: "Tools and methodologies for validating business ideas.",
  },
  {
    name: "Finance & Budget",
    icon: DollarSign,
    link: "finance",
    description: "Financial projections, budgeting, and cost analysis.",
  },
  {
    name: "Pitch Deck / Summary",
    icon: Presentation,
    link: "pitch-ppt",
    description: "Generate executive summaries and presentation slides.",
  },
  {
    name: "Venture Capitalists",
    icon: Scale,
    link: "private-equity",
    description:
      "A venture capitalist is an investor who provides funding to early-stage or high-growth startups in exchange for equity (ownership).",
  },
  {
    name: "Name & Slogan Generator",
    icon: Wand2,
    link: "name-slogangenerator",
    description: "AI-powered branding tools for names and taglines.",
  },

  {
    name: "Social Media (Ads & Poster)",
    icon: Megaphone,
    link: "socialmedia",
    description: "Creative asset generation for marketing campaigns.",
  },
];

//  Feature Card Component (Now a clickable link) ---
const FeatureCard = ({ feature }) => {
  const IconComponent = feature.icon;
  return (
    <a
      href={`/${feature.link}`}
      className="flex flex-col items-center justify-center p-6 bg-gray-100 dark:bg-gray-700/50 rounded-xl shadow-lg 
                 transition duration-300 ease-in-out transform hover:scale-[1.03] 
                 hover:bg-indigo-200/50 dark:hover:bg-indigo-600/70 cursor-pointer 
                 border-2 border-transparent hover:border-indigo-500 dark:hover:border-indigo-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/50"
    >
      <IconComponent className="w-8 h-8 md:w-10 md:h-10 text-indigo-600 dark:text-indigo-300 mb-3" />
      <h3 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white text-center mb-2">
        {feature.name}
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-300 text-center">
        {feature.description}
      </p>
    </a>
  );
};

const Navbar = ({ isDarkMode, setIsDarkMode }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Only include 'About us' link for structural placeholder
  const navLinks = features.filter((f) => f.link === "about");

  return (
    <nav className="fixed w-full top-0 z-50 bg-white/95 dark:bg-gray-900/95 shadow-xl border-b border-indigo-500/50 dark:border-indigo-700/50 backdrop-blur-sm transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo/Title (Static) */}
          <div className="flex items-center">
            <img
              className="h-12 w-12 text-indigo-600 dark:text-indigo-400 mr-3"
              src="../../Images/logo4.png"
              alt=""
            />
            <NavLink
              to="/"
              className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition cursor-pointer"
            >
              AI Powered Startup Toolkit
            </NavLink>
          </div>

          {/* Desktop Menu and Theme Toggle */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Nav Link Placeholders (Static) */}
            {navLinks.map((feature) => (
              <a
                key={feature.link}
                href="/aboutus" // Link remains static as requested
                className={`
                  px-3 py-2 rounded-full text-base font-medium transition duration-200 
                  text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white
                `}
              >
                {feature.name}
              </a>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
            >
              {isMenuOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg animate-in slide-in-from-top duration-300">
          <div className="px-4 pt-2 pb-6 space-y-1">
            {navLinks.map((feature) => (
              <a
                key={feature.link}
                href="/aboutus"
                onClick={() => setIsMenuOpen(false)}
                className="block px-4 py-3 rounded-lg text-lg font-medium text-gray-700 dark:text-gray-200 hover:bg-indigo-50 dark:hover:bg-gray-700 hover:text-indigo-600 dark:hover:text-white transition"
              >
                {feature.name}
              </a>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

//  Page Content (Static Dashboard Only) ---
const PageContent = () => {
  // Filter to show the main dashboard features
  const dashboardFeatures = features.filter(
    (f) => f.link !== "home" && f.link !== "about" && f.link !== "features",
  );

  return (
    <div className="text-center pt-16 pb-10 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border-b-4 border-indigo-500 transition-colors duration-500">
      <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white mb-4">
        Welcome to the{" "}
        <span className="text-indigo-600 dark:text-indigo-400">
          AI-Powered Startup Toolkit
        </span>
      </h1>
      <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-10">
        A professional framework for building, validating, and presenting your
        Startup Idea.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-4 sm:px-8">
        {dashboardFeatures.map((f) => (
          // Using the updated clickable FeatureCard
          <FeatureCard key={f.link} feature={f} />
        ))}
      </div>
    </div>
  );
};

//  Main Home Component (Static)
export default function Home() {
  // State for theme is retained
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Utility function to scroll to the top and apply theme class
  useEffect(() => {
    // Apply or remove the 'dark' class to the root HTML element
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    window.scrollTo(0, 0);
  }, [isDarkMode]); // Only depends on theme now

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 font-sans text-gray-900 dark:text-white transition-colors duration-500">
      <style>
        {/* Inter Font from Google Fonts for a professional look */}
        {`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap');
          body { font-family: 'Inter', sans-serif; }`}
      </style>

      {/* Navbar receives only theme props */}
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        <PageContent />
      </main>

      {/* Simple Footer */}
      <footer className="w-full py-6 bg-white dark:bg-gray-900 border-t border-indigo-500/50 dark:border-indigo-700/50 mt-10 transition-colors duration-500">
        <div className="max-w-7xl mx-auto text-center text-sm text-gray-500 dark:text-gray-500">
          &copy; 2026 AI Powered Startup Toolkit. Built for University
          Submission.
        </div>
      </footer>
    </div>
  );
}
