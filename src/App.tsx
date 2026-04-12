import { motion } from "motion/react";
import { Mail, Linkedin, Github } from "lucide-react";

const workItems = [
  { label: "projects", description: "built end-to-end through code" },
  { label: "sketches", description: "(coming soon!) drawn in one take with a ball-point pen" },
  { label: "photos", description: "captured from moments noticed" },
];

export default function App() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="min-h-screen bg-white text-[#1a1a1a] selection:bg-black selection:text-white"
    >
      <div className="max-w-[900px] mx-auto px-6 py-12 md:py-20">
        {/* Header / Breadcrumb */}
        <header className="mb-3 flex items-center justify-between">
          <nav className="text-[11px] font-medium text-[#666666] tracking-tight">
            <span className="hover:text-black cursor-pointer transition-colors">home</span>
            <span className="mx-2">/</span>
          </nav>
          <div className="flex items-center gap-5 text-[#666666]">
            <a href="#" className="hover:text-black transition-colors">
              <Mail size={16} />
            </a>
            <a href="#" className="hover:text-black transition-colors">
              <Linkedin size={16} />
            </a>
            <a href="#" className="hover:text-black transition-colors">
              <Github size={16} />
            </a>
          </div>
        </header>

        <hr className="border-[#eeeeee] mb-10" />

        {/* Intro Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-14">
          <div className="space-y-6">
            <h1 className="text-lg font-bold tracking-tight text-black uppercase">
              Aiden Hua
            </h1>

            <a
              href="#"
              className="block text-xs text-[#444444] hover:text-black underline underline-offset-4 decoration-[#eeeeee] hover:decoration-black transition-colors"
            >
              CS | McGill University
            </a>

            <div className="space-y-5 text-[13px] text-[#444444] leading-relaxed max-w-md font-normal">
              <p>
                I'm a student who is passionate about designing and building systems that create meaningful impact. I am currently seeking <span className="italic">summer 2026</span> (May-August) internships.
              </p>
              <p>
                In my leisure time, I pursue strategic and creative interests including chess, drawing, photography, and volleyball. I'm committed to continuous learning, collaborative problem-solving, and building professional relationships.
              </p>
            </div>
          </div>

          <div className="relative aspect-[4/3] md:aspect-square overflow-hidden rounded-[2px]">
            <img
              src="https://picsum.photos/seed/mountain-hiker/800/800?grayscale"
              alt="Aiden Hua"
              className="object-cover w-full h-full opacity-95 hover:opacity-100 transition-opacity duration-200"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>

        <hr className="border-[#eeeeee] mb-10" />

        {/* My Work Section */}
        <section className="mb-16">
          <h2 className="text-[10px] font-bold tracking-[0.25em] text-black uppercase mb-6 opacity-60">
            My Work
          </h2>

          <div className="space-y-6">
            {workItems.map(({ label, description }) => (
              <div key={label}>
                <a href="#" className="inline-block text-base hover:text-black underline underline-offset-4 decoration-[#eeeeee] hover:decoration-black transition-colors mb-0.5">
                  {label}
                </a>
                <p className="text-[#888888] italic text-[11px]">{description}</p>
              </div>
            ))}
          </div>
        </section>

        <hr className="border-[#eeeeee] mb-6" />
      </div>
    </motion.div>
  );
}
