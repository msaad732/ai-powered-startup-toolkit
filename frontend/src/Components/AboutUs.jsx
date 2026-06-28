import React, { useState } from "react";
import {
  Users,
  Lightbulb,
  DollarSign,
  Presentation,
  Wand2,
  Banknote,
  ListChecks,
  Menu,
  Megaphone,
  Rocket,
  Scale,
  Heart,
  Star,
  Award,
  Code2,
  Cpu,
} from "lucide-react";
import { NavLink } from "react-router-dom";

const coreFeatures = [
  {
    icon: Lightbulb,
    title: "Idea Validation",
    description:
      "Stop investing time and money into ideas that won't stick. Our AI module conducts market analysis, provides deep competitor insights, and generates customer feedback predictions. This ensures you are building a product or service with verified, real-world potential.",
  },
  {
    icon: DollarSign,
    title: "Finance & Budget Management",
    description:
      "Get a handle on your money without needing a CFO. This feature automatically generates robust financial plans, critical cash flow projections, and detailed budgets. Use our tool to manage expenses, forecast revenue, and determine precise funding needs for smarter, more stable decision-making.",
  },
  {
    icon: Presentation,
    title: "Pitch Deck / Executive Summary (PPT) Creator",
    description:
      "Attracting investors requires a professional presentation. Create polished, investor-ready pitch decks and executive summaries in minutes. The AI structures your content logically, helps design compelling slides, and ensures your key business strengths are highlighted to maximize your chances of securing funding.",
  },
  {
    icon: Wand2,
    title: "Name & Slogan Generator",
    description:
      "Your brand identity is everything. Our generator delivers unique, catchy, and brandable startup names and slogans. The AI ensures your identity is memorable, relevant to your industry, and stands out effectively in a crowded market.",
  },
  {
    icon: Scale,
    title: "Venture Capitalists",
    description:
      "Venture Capitalists (VCs) are investors who provide capital to early-stage or growing startups in exchange for equity (ownership shares). They typically invest in high-risk, high-reward companies with the potential for rapid growth.",
  },
  {
    icon: Megaphone,
    title: "Social Media (Ads & Posters) Marketing",
    description:
      "Establish a powerful online presence from day one. Design highly engaging ad copies, compelling social media posts, and visual posters. The AI suggests optimized visuals, persuasive captions, and effective campaign strategies to boost your online visibility and convert more customers.",
  },
];

const FeatureDetailCard = ({ icon: Icon, title, description }) => (
  <div className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-xl shadow-lg hover:shadow-2xl transition duration-300 border border-gray-100 dark:border-gray-700/50 flex flex-col h-full">
    <div className="flex items-start mb-4">
      <div className="p-3 bg-indigo-500 rounded-xl text-white shadow-md flex-shrink-0">
        <Icon size={24} />
      </div>
      <h3 className="ml-4 pt-1 text-xl font-bold text-gray-800 dark:text-white">
        {title}
      </h3>
    </div>
    <p className="text-gray-600 dark:text-gray-300 leading-relaxed flex-grow text-sm md:text-base">
      {description}
    </p>
  </div>
);

// ─── Acknowledgements Section ─────────────────────────────────────────────────
const AcknowledgementsSection = () => (
  <section className="mb-12">
    <h2 className="text-4xl font-bold text-gray-900 dark:text-white text-center mb-3">
      Acknowledgements
    </h2>
    <p className="text-center text-gray-500 dark:text-gray-400 mb-10 text-base">
      This project stands on the shoulders of remarkable people and powerful
      technology.
    </p>

    <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-3">
      {/* Supervisor Card */}
      <div className="lg:col-span-3 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/20 border-2 border-indigo-200 dark:border-indigo-700 rounded-2xl p-8 shadow-xl flex flex-col sm:flex-row items-start gap-6">
        <div className="flex-shrink-0">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Award size={32} color="white" />
          </div>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-500 bg-indigo-100 dark:bg-indigo-900/50 px-3 py-1 rounded-full">
              Project Supervisor
            </span>
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={13}
                  className="text-yellow-400 fill-yellow-400"
                />
              ))}
            </div>
          </div>
          <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-1">
            Dr. Aun Irtaza
          </h3>
          <p className="text-indigo-600 dark:text-indigo-400 font-semibold text-sm mb-4">
            Associate Professor &amp; Research Supervisor
          </p>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-base">
            We extend our deepest gratitude to{" "}
            <span className="font-bold text-gray-900 dark:text-white">
              Dr. Aun Irtaza
            </span>{" "}
            for his exceptional mentorship and unwavering support throughout
            this project. His profound expertise and insightful guidance were
            instrumental in conceptualizing, structuring, and refining every
            dimension of this toolkit. Dr. Aun's ability to illuminate complex
            challenges with clarity, combined with his steadfast encouragement
            at every milestone, elevated this project from a raw concept into a
            polished, purpose-driven platform. We are truly fortunate to have
            had such a dedicated and visionary supervisor by our side.
          </p>
        </div>
      </div>

      {/* Claude AI Card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/50 rounded-2xl p-7 shadow-lg hover:shadow-xl transition duration-300 flex flex-col">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-rose-500 rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
            <Code2 size={24} color="white" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-orange-500 bg-orange-50 dark:bg-orange-900/20 px-2 py-0.5 rounded-full">
              AI Development Partner
            </span>
            <h3 className="text-xl font-extrabold text-gray-900 dark:text-white mt-1">
              Claude AI
            </h3>
          </div>
        </div>
        <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3">
          by Anthropic
        </p>
        <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm flex-grow">
          A special acknowledgement to{" "}
          <span className="font-bold text-gray-900 dark:text-white">
            Claude AI by Anthropic
          </span>{" "}
          for being an indispensable coding companion throughout the development
          of this toolkit. From architecting backend logic and debugging complex
          issues to refining frontend components and structuring API
          integrations, Claude's intelligent assistance accelerated our
          development cycle significantly. Its ability to understand context,
          generate clean code, and offer thoughtful solutions made it far more
          than just a tool, it was a true development partner.
        </p>
        <div className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-700">
          <div className="flex flex-wrap gap-2">
            {[
              "Code Architecture",
              "Debugging",
              "API Integration",
              "Component Design",
            ].map((tag) => (
              <span
                key={tag}
                className="text-xs bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 px-2 py-1 rounded-lg font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Groq API Card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/50 rounded-2xl p-7 shadow-lg hover:shadow-xl transition duration-300 flex flex-col">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
            <Cpu size={24} color="white" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-full">
              AI Inference Engine
            </span>
            <h3 className="text-xl font-extrabold text-gray-900 dark:text-white mt-1">
              Groq API
            </h3>
          </div>
        </div>
        <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3">
          Powering LLaMA 3.3 · 70B
        </p>
        <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm flex-grow">
          We proudly leverage the{" "}
          <span className="font-bold text-gray-900 dark:text-white">
            Groq API
          </span>{" "}
          to power the AI intelligence at the core of this toolkit. Running the
          LLaMA 3.3 70B model with remarkable speed and efficiency, Groq's
          blazing-fast inference infrastructure makes real-time AI generation
          possible across features like pitch deck creation, idea validation, VC
          readiness assessment, and more. Its generous free tier and
          enterprise-grade performance made it the ideal backbone for delivering
          a responsive, high-quality AI experience to our users.
        </p>
        <div className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-700">
          <div className="flex flex-wrap gap-2">
            {[
              "LLaMA 3.3 70B",
              "Real-time Inference",
              "Free Tier",
              "High Performance",
            ].map((tag) => (
              <span
                key={tag}
                className="text-xs bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 px-2 py-1 rounded-lg font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Built With Love card */}
      <div className="bg-gradient-to-br from-slate-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-7 shadow-lg flex flex-col justify-between">
        <div>
          <div className="w-12 h-12 bg-rose-500 rounded-xl flex items-center justify-center shadow-md mb-4">
            <Heart size={24} color="white" />
          </div>
          <h3 className="text-xl font-extrabold text-gray-900 dark:text-white mb-3">
            Built With Purpose
          </h3>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm">
            This toolkit was built with a singular mission: to democratize
            entrepreneurship. By combining the power of cutting-edge AI with
            thoughtful design, we aim to give every aspiring founder regardless
            of their background or resources the same strategic advantage that
            well-funded teams enjoy.
          </p>
        </div>
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-400 dark:text-gray-500 italic">
            "The best startups don't just solve problems — they redefine what's
            possible."
          </p>
        </div>
      </div>
    </div>
  </section>
);

const AboutUsContent = ({ isDarkMode, setIsDarkMode }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl transition-colors duration-500 overflow-hidden">
      <header className="bg-indigo-600 dark:bg-indigo-900 text-white py-12 px-4 sm:px-10 rounded-t-3xl shadow-inner">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight">
            About Our AI-Powered Startup Toolkit
          </h1>
        </div>
        <p className="text-indigo-200 text-xl sm:text-2xl font-light">
          Empowering entrepreneurs with intelligent tools to launch, grow, and
          scale.
        </p>
      </header>

      <main className="py-10 px-4 sm:px-10">
        {/* Mission Statement */}
        <section className="p-8 sm:p-10 rounded-2xl shadow-xl mb-12 border-l-8 border-indigo-500 bg-gray-50 dark:bg-gray-900/50">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Our Mission: Turning Ideas into Successful Ventures
          </h2>
          <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed mb-4">
            Launching a startup or growing a small business is challenging. It
            requires navigating complex processes like market research,
            financial planning, investor pitching, and brand creation—often
            without an expert team.
          </p>
          <p className="text-indigo-600 dark:text-indigo-400 text-lg font-medium leading-relaxed flex items-start">
            <Rocket
              className="text-indigo-500 dark:text-indigo-400 mr-2 mt-1 flex-shrink-0"
              size={20}
            />
            Our AI-powered Startup Toolkit was built to eliminate the guesswork.
            We provide entrepreneurs, solopreneurs, and small business owners
            with a unified, intelligent platform that brings clarity and
            confidence to every step of the entrepreneurial journey. We put the
            power of a full advisory team—finance, marketing, and strategy—right
            at your fingertips, ensuring you launch, grow, and scale your
            business with data-driven insights.
          </p>
        </section>

        {/* Core Features Grid */}
        <section className="mb-12">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white text-center mb-10">
            Core Features Explained
          </h2>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {coreFeatures.map((feature, index) => (
              <FeatureDetailCard key={index} {...feature} />
            ))}
          </div>
        </section>

        {/* Acknowledgements */}
        <AcknowledgementsSection />

        {/* Call to Action */}
        <section className="text-center py-12 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl border-2 border-dashed border-indigo-200 dark:border-indigo-700 mt-12">
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-3">
            Ready to Transform Your Idea?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-6">
            Stop stressing over complexity. Start building with certainty.{" "}
            <br />
            The AI-powered Startup Toolkit is your partner in achieving success.
          </p>
          <a
            href="/"
            className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-full shadow-lg text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 transition duration-150 ease-in-out transform hover:scale-105"
          >
            Explore the Toolkit
          </a>
        </section>
      </main>
    </div>
  );
};

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
    link: "pitch&ppt",
    description: "Generate executive summaries and presentation slides.",
  },
  {
    name: "Name & Slogan Generator",
    icon: Wand2,
    link: "name&slogangenerator",
    description: "AI-powered branding tools for names and taglines.",
  },
  {
    name: "Private Equity",
    icon: Banknote,
    link: "privateequity",
    description: "Modeling and analysis for equity investment potential.",
  },
  {
    name: "Social Media (Ads & Poster)",
    icon: Megaphone,
    link: "socialmedia",
    description: "Creative asset generation for marketing campaigns.",
  },
];

const Navbar = ({ isDarkMode, setIsDarkMode }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navLinks = features.filter((f) => f.link === "about");
  return (
    <nav className="fixed w-full top-0 z-50 bg-white/95 dark:bg-gray-900/95 shadow-xl border-b border-indigo-500/50 dark:border-indigo-700/50 backdrop-blur-sm transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
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
          <div className="hidden md:flex items-center space-x-4">
            {navLinks.map((feature) => (
              <a
                key={feature.link}
                href="/aboutus"
                className="px-3 py-2 rounded-full text-base font-medium transition duration-200 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
              >
                {feature.name}
              </a>
            ))}
          </div>
          <div className="md:hidden flex items-center space-x-2">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
            >
              <Menu className="block h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
      {isMenuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg">
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

export default function AboutUs() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 font-sans text-gray-900 dark:text-white transition-colors duration-500">
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap'); body { font-family: 'Inter', sans-serif; }`}</style>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-12">
          <AboutUsContent
            isDarkMode={isDarkMode}
            setIsDarkMode={setIsDarkMode}
          />
        </main>
        <footer className="w-full py-6 bg-white dark:bg-gray-900 border-t border-indigo-500/50 dark:border-indigo-700/50 mt-10 transition-colors duration-500">
          <div className="max-w-7xl mx-auto text-center text-sm text-gray-500 dark:text-gray-500">
            &copy; 2026 AI Powered Startup Toolkit. All rights reserved.
          </div>
        </footer>
      </div>
    </>
  );
}
