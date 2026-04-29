import { motion, useInView } from "motion/react";
import { Mail, Linkedin, Github, ArrowUpRight } from "lucide-react";
import { Fragment, useRef } from "react";
import { GitHubCalendar } from "react-github-calendar";
import epsteinProjectMedia from "@/assets/RagEpsteinDemo.mp4";
import baconheadThumbnail from "@/assets/baconheadDemo.gif";
import easyFinderThumbnail from "@/assets/EasyFinderPic.jpg";
import profilePhoto from "@/assets/IMG_4586.JPG";

const projects = [
  {
    id: "01",
    title: "RAG for Epstein File",
    category: "Systems · Backend",
    year: "2025",
    description:
      "RAG for 20k+ document corpus of the Epstein File. Include Q&A with Citations, entity search function, and relationship Graphs between entities. Allows open any cited document to see full DOJ text files.",
    tech: ["Go", "Redis", "gRPC", "Docker"],
    thumbnail: epsteinProjectMedia,
    media: "video" as const,
    link: "https://github.com/CHUNKYBOI666/RAGforEpsteinFiles",
  },
  {
    id: "02",
    title: "Baconhead",
    category: "Full-Stack · Web",
    year: "2024",
    description:
      "Explores vision model which trains a bot that watches gameplay, learn game states and takes over to play the game. Tests and ran on simple roblox obbies.",
    tech: ["React", "Python", "FastAPI", "PostgreSQL"],
    thumbnail: baconheadThumbnail,
    media: "image" as const,
    link: "https://github.com/ibrahimansr/baconhead",
  },
  {
    id: "03",
    title: "EasyFinder",
    category: "Creative Tool · Web",
    year: "2024",
    description:
      "Semantic file search for macOS via Raycast. Describe what you're looking for in plain English and EasyFinder returns the most relevant images, PDFs, Office docs, and Markdown files from your machine. Uses Gemini's Multimodel Embedding 2 model.",
    tech: ["Next.js", "TypeScript", "Cloudflare", "Supabase"],
    thumbnail: easyFinderThumbnail,
    media: "image" as const,
    link: "https://github.com/CHUNKYBOI666/EasyFinder",
  },
];

function ProjectRow({
  project,
  index,
}: {
  project: (typeof projects)[0];
  index: number;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px 0px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, ease: [0.25, 0.1, 0.25, 1], delay: index * 0.08 }}
    >
      <div className="group grid grid-cols-1 md:grid-cols-[2fr_3fr] gap-6 py-8">
        {/* Thumbnail */}
        <div className="relative overflow-hidden rounded-[2px] aspect-[16/11] bg-[#f5f5f5]">
          {project.media === "video" ? (
            <video
              src={project.thumbnail}
              className="absolute inset-0 z-[1] size-full object-cover opacity-90 transition-all duration-500 group-hover:opacity-100 group-hover:scale-[1.03]"
              muted
              loop
              playsInline
              autoPlay
              aria-label={project.title}
            />
          ) : (
            <img
              src={project.thumbnail}
              alt={project.title}
              className="absolute inset-0 z-[1] size-full object-cover opacity-90 transition-all duration-500 group-hover:opacity-100 group-hover:scale-[1.03]"
              loading="eager"
              decoding="async"
            />
          )}
          <div
            className="pointer-events-none absolute inset-0 z-[2] bg-black/0 transition-colors duration-300 group-hover:bg-black/5"
            aria-hidden
          />
        </div>

        {/* Details */}
        <div className="flex flex-col justify-between py-1">
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-[10px] font-medium tracking-[0.2em] text-[#aaaaaa] uppercase">
                  {project.id}
                </span>
                <h3 className="mt-1 text-[15px] font-bold tracking-tight text-black leading-tight">
                  {project.title}
                </h3>
              </div>
              <a
                href={project.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-shrink-0 mt-1 text-[#cccccc] hover:text-black transition-colors duration-200"
                aria-label={`View ${project.title} on GitHub`}
              >
                <ArrowUpRight size={15} />
              </a>
            </div>

            <p className="text-[10px] font-medium tracking-[0.15em] text-[#aaaaaa] uppercase">
              {project.category}&ensp;·&ensp;{project.year}
            </p>

            <p className="text-[12.5px] text-[#555555] leading-relaxed max-w-sm">
              {project.description}
            </p>
          </div>

          {/* Tech tags */}
          <div className="flex flex-wrap gap-1.5 mt-5">
            {project.tech.map((t) => (
              <span
                key={t}
                className="text-[10px] tracking-wide text-[#888888] border border-[#e8e8e8] px-2 py-0.5 rounded-[2px]"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>
      <hr className="border-[#eeeeee]" />
    </motion.div>
  );
}

export default function App() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="relative isolate min-h-screen text-[#1a1a1a] selection:bg-black selection:text-white"
    >
      {/* Keep behind page content but above body (avoid z-[-1], which can sit under the root white fill). */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          backgroundImage: `url(${profilePhoto})`,
          backgroundSize: "cover",
          backgroundPosition: "center 69%",
          backgroundRepeat: "no-repeat",
          opacity: 0.12,
          filter: "grayscale(100%) contrast(110%)",
        }}
      />

      <div className="relative z-10 max-w-[900px] mx-auto px-6 py-12 md:py-20">
        {/* Header */}
        <header className="mb-3 flex items-center justify-between">
          <nav className="text-[11px] font-medium text-[#666666] tracking-tight">
            <span className="hover:text-black cursor-pointer transition-colors">home</span>
            <span className="mx-2">/</span>
          </nav>
          <div className="flex items-center gap-5 text-[#666666]">
            <a
              href="mailto:aidenhua2007@gmail.com"
              className="hover:text-black transition-colors"
              aria-label="Email Aiden Hua"
            >
              <Mail size={16} />
            </a>
            <a
              href="https://www.linkedin.com/in/aiden-hua-660952294"
              className="hover:text-black transition-colors"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Aiden Hua on LinkedIn"
            >
              <Linkedin size={16} />
            </a>
            <a
              href="https://github.com/CHUNKYBOI666"
              className="hover:text-black transition-colors"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Aiden Hua on GitHub"
            >
              <Github size={16} />
            </a>
          </div>
        </header>

        <hr className="border-[#eeeeee] mb-10" />

        {/* Intro Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center mb-14">
          <div className="space-y-6 max-w-xl">
            <motion.h1 
              className="relative text-xl font-medium tracking-tight text-gray-800 cursor-default w-fit"
              initial="initial"
              whileHover="hover"
            >
              <motion.span
                variants={{
                  initial: { opacity: 1, y: 0, filter: "blur(0px)" },
                  hover: { opacity: 0, y: -8, filter: "blur(4px)" }
                }}
                transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
                className="inline-block"
              >
                Aiden Hua
              </motion.span>
              <motion.span
                variants={{
                  initial: { opacity: 0, y: 8, filter: "blur(4px)" },
                  hover: { opacity: 1, y: 0, filter: "blur(0px)" }
                }}
                transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
                className="absolute left-0 top-0 inline-block text-black"
              >
                华一诺
              </motion.span>
            </motion.h1>

            <div className="space-y-5 text-[13px] text-[#444444] leading-relaxed font-normal">
              <p>
                Studying CS @
                <a
                  href="https://www.mcgill.ca"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative inline-block font-bold no-underline after:content-[''] after:absolute after:left-0 after:bottom-px after:h-[1.5px] after:w-full after:origin-left after:scale-x-0 after:bg-current after:transition-transform after:duration-300 after:ease-out hover:after:scale-x-100"
                >
                  McGill
                </a>
                , Incoming Video Design Engineer{" "}
                <span className="group relative inline-block font-bold">
                  @Evertz
                  <span className="pointer-events-none absolute left-0 bottom-px h-[1.5px] w-full origin-left scale-x-0 bg-current transition-transform duration-300 ease-out group-hover:scale-x-100" />
                </span>
                .
              </p>
              <p className="mt-4">
                Recently made baconhead and Rag for Epstein File. Tryna learn
                how to build RAG end to end, and also finetuning models.
              </p>
            </div>
          </div>

          {/* Contribution Graph */}
          <div className="w-full overflow-hidden flex justify-end items-center">
            <a
              href="https://github.com/CHUNKYBOI666"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-max opacity-80 hover:opacity-100 transition-opacity duration-300"
              aria-label="View GitHub Contributions"
            >
              <GitHubCalendar
                username="CHUNKYBOI666"
                blockSize={12}
                blockMargin={6}
                blockRadius={0}
                showTotalCount={false}
                showColorLegend={false}
                theme={{
                  light: ["#eeeeee", "#767676", "#676767", "#4d4d4d", "#1a1a1a"],
                }}
                transformData={(contributions) =>
                  contributions.filter(
                    (day) => new Date(day.date) >= new Date("2025-11-01")
                  )
                }
              />
            </a>
          </div>
        </div>

        <hr className="border-[#eeeeee] mb-10" />

        {/* Projects Section */}
        <section className="mb-16">
          <div className="flex items-baseline justify-between mb-2">
            <h2 className="text-[10px] font-bold tracking-[0.25em] text-black uppercase opacity-60">
              Projects
            </h2>
            <span className="text-[10px] text-[#aaaaaa] tracking-wide">
              {projects.length} total
            </span>
          </div>

          <hr className="border-[#eeeeee]" />

          <div>
            {projects.map((project, i) => (
              <Fragment key={project.id}>
                <ProjectRow project={project} index={i} />
              </Fragment>
            ))}
          </div>
        </section>

        {/* Other Work */}
        <section className="mb-16">
          <h2 className="text-[10px] font-bold tracking-[0.25em] text-black uppercase mb-6 opacity-60">
            Also
          </h2>
          <div className="space-y-6">
            {[
              { label: "photos", description: "captured from moments noticed" },
            ].map(({ label, description }) => (
              <div key={label}>
                <a
                  href="#"
                  className="inline-block text-base hover:text-black underline underline-offset-4 decoration-[#eeeeee] hover:decoration-black transition-colors mb-0.5"
                >
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
