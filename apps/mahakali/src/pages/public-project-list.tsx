import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import ProjectCard, { type ProjectCardData } from "@/components/ProjectCard";
import project1Img from "@/assets/images/project-1.png";
// @ts-ignore
import project2Img from "@/assets/images/project-2.png";
import project3Img from "@/assets/images/project-3.png";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";

const FADE_UP = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

type RawProject = {
  id: string | number;
  title: string;
  type?: string;
  location?: string;
  progress?: number;
  status?: string;
};

const FALLBACK_PROJECTS: Array<{
  img: string;
  title: string;
  category: string;
  location: string;
}> = [
  {
    img: project1Img,
    title: "Bagmati Commercial Tower",
    category: "Commercial",
    location: "Kathmandu, Nepal",
  },
  {
    img: project2Img,
    title: "Trishuli River Bridge",
    category: "Infrastructure",
    location: "Nuwakot, Nepal",
  },
  {
    img: project3Img,
    title: "Hetauda Industrial Complex",
    category: "Industrial",
    location: "Hetauda, Nepal",
  },
];

const PROJECT_IMGS = [project1Img, project2Img, project3Img];

export default function AllProjectsPage() {
  const [projects, setProjects] = useState<RawProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    (async () => {
      try {
        fetch("/api/public/projects")
          .then((r) => r.json())
          .then(setProjects)
          .catch(() => {});
        setProjects([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const cards: ProjectCardData[] = useMemo(() => {
    const source =
      projects.length > 0
        ? projects.map((p, i) => ({
            id: p.id,
            img: PROJECT_IMGS[i % PROJECT_IMGS.length],
            title: p.title,
            category: p.type ?? "Construction",
            location: p.location ?? "Nepal",
            progress: p.progress,
            status: p.status,
          }))
        : FALLBACK_PROJECTS;
    return source as ProjectCardData[];
  }, [projects]);

  const categories = useMemo(() => {
    const set = new Set(cards.map((c) => c.category));
    return ["All", ...Array.from(set)];
  }, [cards]);

  const filtered =
    activeCategory === "All"
      ? cards
      : cards.filter((c) => c.category === activeCategory);

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border bg-background/90 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="font-display font-bold text-xl tracking-tight"
          >
            <span className="text-primary">MAHAKALI</span>
          </Link>
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </nav>

      <div className="py-12 md:py-16 bg-secondary text-white min-h-screen">
        <div className="container mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={FADE_UP}
            className="max-w-2xl mb-16"
          >
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-white/50 text-xs mb-6">
              <Link href="/" className="hover:text-white/80 transition-colors">
                Home
              </Link>
              <span>/</span>
              <span className="text-white/80">Projects</span>
            </div>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-[2px] w-10 bg-primary" />
              <span className="text-primary font-bold uppercase tracking-widest text-sm">
                Portfolio
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-display font-bold mb-6 text-white">
              All Projects
            </h1>
            <p className="text-lg text-white/70">
              Every landmark development we've delivered, or are currently
              building, across Nepal.
            </p>
          </motion.div>

          {categories.length > 1 && (
            <div className="flex flex-wrap gap-3 mb-12">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-sm border transition-colors ${
                    activeCategory === cat
                      ? "bg-primary text-white border-primary"
                      : "border-white/20 text-white/70 hover:border-white/50 hover:text-white"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          {loading ? (
            <div className="grid md:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="aspect-[3/4] bg-white/5 animate-pulse"
                />
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-8">
              {filtered.map((project, i) => (
                <ProjectCard key={project.id ?? i} project={project} />
              ))}
            </div>
          )}

          {!loading && filtered.length === 0 && (
            <p className="text-white/50 text-center py-20">
              No projects found in this category.
            </p>
          )}
        </div>
      </div>
      {/* Footer strip */}
      <footer className="border-t border-border bg-secondary text-white/60 py-8">
        <div className="container mx-auto px-6 text-center text-sm">
          <p>
            © {new Date().getFullYear()} Mahakali Engineers and Developers Pvt.
            Ltd. · Chabahil-07, Kathmandu, Nepal
          </p>
        </div>
      </footer>
    </div>
  );
}
