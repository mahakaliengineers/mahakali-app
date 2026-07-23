import { motion } from "framer-motion";
import { MapPin, ArrowRight } from "lucide-react";

const FADE_UP = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

export type ProjectCardData = {
  id?: string | number;
  img: string;
  title: string;
  category: string;
  location: string;
  progress?: number;
  status?: string;
};

export default function ProjectCard({ project }: { project: ProjectCardData }) {
  const inner = (
    <div className="relative aspect-[3/4] overflow-hidden bg-background">
      <img
        src={project.img}
        alt={project.title}
        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-secondary/95 via-secondary/50 to-transparent" />

      <div className="absolute top-6 left-6 z-20">
        <span className="bg-primary text-white text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-sm shadow-md">
          {project.category}
        </span>
      </div>

      {typeof project.progress === "number" &&
        project.status !== "completed" && (
          <div className="absolute top-6 right-6 z-20">
            <span className="bg-black/60 text-white text-xs font-bold px-2 py-1 rounded-sm">
              {project.progress}%
            </span>
          </div>
        )}

      <div className="absolute bottom-0 left-0 right-0 p-8 z-20 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
        <h3 className="text-2xl font-display font-bold text-white mb-2 leading-tight">
          {project.title}
        </h3>
        <div className="text-white/70 text-sm flex items-center gap-2 mb-6">
          <MapPin className="h-4 w-4 text-primary" /> {project.location}
        </div>
        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span className="inline-flex items-center text-sm font-bold text-primary">
            View Project <ArrowRight className="ml-2 h-4 w-4" />
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={FADE_UP}
      className="group block h-full"
    >
      {project.id ? (
        <a href={`/projects/${project.id}`} className="block">
          {inner}
        </a>
      ) : (
        <div className="cursor-default">{inner}</div>
      )}
    </motion.div>
  );
}
