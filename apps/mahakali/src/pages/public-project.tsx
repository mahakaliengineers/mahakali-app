import { useEffect, useState } from "react";
import { Link } from "wouter";
import {
  MapPin,
  Calendar,
  ArrowLeft,
  CheckCircle2,
  Circle,
} from "lucide-react";

interface PublicProject {
  id: number;
  title: string;
  description: string | null;
  location: string | null;
  type: string | null;
  status: string;
  progress: number;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  photos: Array<{ id: number; url: string; caption: string | null }>;
  milestones: Array<{
    id: number;
    title: string;
    completed: boolean;
    order: number;
  }>;
  testimonials: Array<{
    id: number;
    authorName: string;
    authorRole: string | null;
    text: string;
    rating: number;
  }>;
}

const STATUS_LABEL: Record<string, string> = {
  planning: "Planning",
  active: "In Progress",
  on_hold: "On Hold",
  completed: "Completed",
};

const STATUS_STYLE: Record<string, string> = {
  planning: "bg-yellow-100 text-yellow-700 border border-yellow-200",
  active: "bg-green-100 text-green-700 border border-green-200",
  on_hold: "bg-gray-100 text-gray-600 border border-gray-200",
  completed: "bg-blue-100 text-blue-700 border border-blue-200",
};

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg
          key={s}
          viewBox="0 0 20 20"
          className={`w-4 h-4 ${s <= rating ? "fill-yellow-400" : "fill-gray-200"}`}
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export default function PublicProjectPage({
  projectId,
}: {
  projectId: number;
}) {
  const [project, setProject] = useState<PublicProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lightbox, setLightbox] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/public/projects/${projectId}`)
      .then((r) => {
        if (!r.ok) throw new Error("Project not found");
        return r.json();
      })
      .then(setProject)
      .catch((err) => setError(err.message ?? "Failed to load project"))
      .finally(() => setLoading(false));
  }, [projectId]);

  if (loading)
    return (
      <div className="min-h-screen bg-background">
        {/* Nav stub */}
        <nav className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-40 px-6 py-4">
          <div className="container mx-auto flex items-center gap-3">
            <Link
              href="/"
              className="font-display font-bold text-xl tracking-tight"
            >
              MAHAKALI
            </Link>
          </div>
        </nav>
        <div className="container mx-auto px-6 py-20">
          <div className="max-w-4xl mx-auto space-y-6 animate-pulse">
            <div className="h-10 bg-muted rounded w-2/3" />
            <div className="h-5 bg-muted rounded w-1/3" />
            <div className="h-64 bg-muted rounded-xl" />
            <div className="h-4 bg-muted rounded w-full" />
            <div className="h-4 bg-muted rounded w-3/4" />
          </div>
        </div>
      </div>
    );

  if (error || !project)
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <nav className="border-b border-border px-6 py-4">
          <div className="container mx-auto">
            <Link href="/" className="font-display font-bold text-xl">
              MAHAKALI
            </Link>
          </div>
        </nav>
        <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-6">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-muted-foreground"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            Project Not Found
          </h1>
          <p className="text-muted-foreground">
            {error || "This project doesn't exist or has been removed."}
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-sm font-medium text-sm hover:opacity-90 transition-opacity mt-2"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
        </div>
      </div>
    );

  const completedMilestones = project.milestones.filter(
    (m) => m.completed,
  ).length;
  const totalMilestones = project.milestones.length;

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky nav */}
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

      {/* Hero */}
      <div className="bg-secondary text-white py-16 md:py-24">
        <div className="container mx-auto px-6 max-w-5xl">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-white/50 text-xs mb-6">
            <Link href="/" className="hover:text-white/80 transition-colors">
              Home
            </Link>
            <Link
              href="/projects"
              className="hover:text-white/80 transition-colors"
            >
              <span>/</span>
              <span className="pl-2">Projects</span>
            </Link>
            <span>/</span>
            <span className="text-white/80">{project.title}</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              {project.type && (
                <span className="inline-block bg-primary text-white text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-sm mb-4">
                  {project.type}
                </span>
              )}
              <h1 className="text-3xl md:text-5xl font-display font-bold mb-4 leading-tight">
                {project.title}
              </h1>
              <div className="flex items-center flex-wrap gap-4 text-white/70 text-sm">
                {project.location && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-primary" />
                    {project.location}
                  </span>
                )}
                {project.startDate && (
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-primary" />
                    Started{" "}
                    {new Date(project.startDate).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                    })}
                  </span>
                )}
              </div>
            </div>
            <div className="flex-shrink-0">
              <span
                className={`text-sm font-semibold px-4 py-2 rounded-sm ${STATUS_STYLE[project.status]}`}
              >
                {STATUS_LABEL[project.status] ?? project.status}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="container mx-auto px-6 max-w-5xl py-12 md:py-16">
        <div className="grid lg:grid-cols-3 gap-10">
          {/* Left column — main content */}
          <div className="lg:col-span-2 space-y-10">
            {/* Description */}
            {project.description && (
              <section>
                <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-3">
                  <div className="h-5 w-0.5 bg-primary" />
                  About This Project
                </h2>
                <p className="text-muted-foreground leading-relaxed text-base">
                  {project.description}
                </p>
              </section>
            )}

            {/* Progress */}
            <section>
              <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-3">
                <div className="h-5 w-0.5 bg-primary" />
                Progress Overview
              </h2>
              <div className="bg-muted/50 rounded-xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground font-medium">
                    Overall Completion
                  </span>
                  <span className="text-2xl font-bold font-display text-foreground">
                    {project.progress}%
                  </span>
                </div>
                <div className="relative h-3 bg-border rounded-full overflow-hidden">
                  <div
                    className="absolute left-0 top-0 h-full bg-primary rounded-full transition-all duration-1000"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
                {totalMilestones > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {completedMilestones} of {totalMilestones} milestones
                    completed
                  </p>
                )}
              </div>
            </section>

            {/* Photos gallery */}
            {project.photos.length > 0 && (
              <section>
                <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-3">
                  <div className="h-5 w-0.5 bg-primary" />
                  Project Gallery
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {project.photos.map((photo) => (
                    <button
                      key={photo.id}
                      onClick={() => setLightbox(photo.url)}
                      className="group relative aspect-video bg-muted rounded-lg overflow-hidden hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <img
                        src={photo.url}
                        alt={photo.caption ?? "Project photo"}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                        <svg
                          className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                          />
                        </svg>
                      </div>
                      {photo.caption && (
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-2 py-1.5">
                          <p className="text-xs text-white truncate">
                            {photo.caption}
                          </p>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </section>
            )}

            {/* Milestones */}
            {project.milestones.length > 0 && (
              <section>
                <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-3">
                  <div className="h-5 w-0.5 bg-primary" />
                  Project Milestones
                </h2>
                <div className="space-y-2">
                  {project.milestones.map((m, i) => (
                    <div
                      key={m.id}
                      className={`flex items-center gap-4 p-4 rounded-lg border ${m.completed ? "bg-green-50 border-green-200" : "bg-muted/30 border-border"}`}
                    >
                      {m.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                      ) : (
                        <Circle className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                      )}
                      <span
                        className={`text-sm font-medium ${m.completed ? "text-green-800" : "text-foreground"}`}
                      >
                        {m.title}
                      </span>
                      {m.completed && (
                        <span className="ml-auto text-xs font-medium text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                          Done
                        </span>
                      )}
                      {!m.completed && (
                        <span className="ml-auto text-xs text-muted-foreground">
                          Step {i + 1}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Client testimonials */}
            {project.testimonials.length > 0 && (
              <section>
                <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-3">
                  <div className="h-5 w-0.5 bg-primary" />
                  Client Feedback
                </h2>
                <div className="space-y-4">
                  {project.testimonials.map((t) => (
                    <div
                      key={t.id}
                      className="bg-muted/40 rounded-xl border border-border p-6 relative"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        className="absolute top-5 right-5 w-8 h-8 text-muted/40"
                        fill="currentColor"
                      >
                        <path d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179zm10 0C13.553 16.227 13 15 13 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179z" />
                      </svg>
                      <StarRow rating={t.rating} />
                      <p className="text-muted-foreground italic text-sm leading-relaxed mt-3 mb-4">
                        "{t.text}"
                      </p>
                      <div className="flex items-center gap-3 pt-3 border-t border-border">
                        <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {t.authorName.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-foreground">
                            {t.authorName}
                          </p>
                          {t.authorRole && (
                            <p className="text-xs text-primary">
                              {t.authorRole}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Right sidebar */}
          <div className="space-y-6">
            {/* Project info card */}
            <div className="bg-muted/40 rounded-xl border border-border p-6 space-y-4 sticky top-20">
              <h3 className="font-bold text-foreground text-sm uppercase tracking-wider">
                Project Details
              </h3>
              <div className="space-y-3 text-sm">
                <InfoRow label="Type" value={project.type ?? "—"} />
                <InfoRow
                  label="Status"
                  value={STATUS_LABEL[project.status] ?? project.status}
                />
                <InfoRow label="Location" value={project.location ?? "—"} />
                <InfoRow
                  label="Start Date"
                  value={
                    project.startDate
                      ? new Date(project.startDate).toLocaleDateString(
                          "en-US",
                          { year: "numeric", month: "long", day: "numeric" },
                        )
                      : "—"
                  }
                />
                <InfoRow
                  label="Est. Completion"
                  value={
                    project.endDate
                      ? new Date(project.endDate).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "—"
                  }
                />
                {totalMilestones > 0 && (
                  <InfoRow
                    label="Milestones"
                    value={`${completedMilestones} / ${totalMilestones} done`}
                  />
                )}
              </div>

              <div className="pt-4 border-t border-border">
                <a
                  href="/#contact"
                  className="block w-full bg-primary hover:opacity-90 text-white text-sm font-bold text-center py-3 rounded-sm transition-opacity"
                >
                  Get a Quote
                </a>
              </div>
            </div>

            {/* CTA card */}
            <div className="bg-secondary text-white rounded-xl p-6 space-y-3">
              <h3 className="font-bold font-display">
                Interested in a similar project?
              </h3>
              <p className="text-white/70 text-sm leading-relaxed">
                Our engineering team is ready to discuss your vision and deliver
                excellence.
              </p>
              <a
                href="/#contact"
                className="inline-block text-primary text-sm font-bold hover:underline"
              >
                Contact us →
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <button
            onClick={() => setLightbox(null)}
            className="absolute top-4 right-4 text-white/60 hover:text-white p-2"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
          <img
            src={lightbox}
            alt="Full size"
            className="max-w-full max-h-[90vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Footer strip */}
      <footer className="border-t border-border bg-secondary text-white/60 py-8 mt-16">
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

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground text-right">{value}</span>
    </div>
  );
}
