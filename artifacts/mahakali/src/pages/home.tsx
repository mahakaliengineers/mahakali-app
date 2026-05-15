import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Building2, HardHat, ShieldCheck, Factory, ChevronRight, MapPin, Mail, Phone, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

// @ts-ignore
import logoImg from "@/assets/logo.png";
// @ts-ignore
import heroImg from "@/assets/images/hero.png";
// @ts-ignore
import project1Img from "@/assets/images/project-1.png";
// @ts-ignore
import project2Img from "@/assets/images/project-2.png";
// @ts-ignore
import project3Img from "@/assets/images/project-3.png";
// @ts-ignore
import aboutImg from "@/assets/images/about.png";

const FADE_UP = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const STAGGER = {
  visible: { transition: { staggerChildren: 0.1 } }
};

export default function Home() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-background/90 backdrop-blur-md border-b border-border shadow-sm py-4" : "bg-transparent py-6"}`}>
        <div className="container mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center cursor-pointer" onClick={() => scrollTo("home")}>
            <img src={logoImg} alt="Mahakali Engineers and Developers" className="h-14 w-auto object-contain" style={{ filter: scrolled ? "none" : "brightness(0) invert(1)" }} />
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium">
            <button onClick={() => scrollTo("about")} className={`hover:text-primary transition-colors ${scrolled ? "text-foreground" : "text-white/90"}`}>About</button>
            <button onClick={() => scrollTo("services")} className={`hover:text-primary transition-colors ${scrolled ? "text-foreground" : "text-white/90"}`}>Services</button>
            <button onClick={() => scrollTo("projects")} className={`hover:text-primary transition-colors ${scrolled ? "text-foreground" : "text-white/90"}`}>Projects</button>
            <Button onClick={() => scrollTo("contact")} variant={scrolled ? "default" : "secondary"} className="rounded-none font-semibold">
              Contact Us
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative h-[100dvh] flex items-center pt-20">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-secondary/80 mix-blend-multiply z-10" />
          <img src={heroImg} alt="Construction Site" className="w-full h-full object-cover" />
        </div>
        <div className="container mx-auto px-6 relative z-20">
          <motion.div 
            initial="hidden" animate="visible" variants={STAGGER}
            className="max-w-4xl"
          >
            <motion.div variants={FADE_UP} className="flex items-center gap-4 mb-6">
              <div className="h-[2px] w-12 bg-primary" />
              <span className="text-primary font-semibold tracking-wider uppercase text-sm">Engineers & Developers Pvt. Ltd.</span>
            </motion.div>
            <motion.h1 variants={FADE_UP} className="text-5xl md:text-7xl lg:text-8xl font-display font-bold text-white leading-[1.05] mb-8">
              Building Infrastructure <br/>
              <span className="text-white/70">Meant To Last Generations.</span>
            </motion.h1>
            <motion.p variants={FADE_UP} className="text-lg md:text-xl text-white/80 max-w-2xl mb-10 leading-relaxed">
              We are a premier Nepali construction firm delivering civil, structural, residential, commercial, and industrial engineering excellence at scale.
            </motion.p>
            <motion.div variants={FADE_UP} className="flex flex-wrap gap-4">
              <Button size="lg" className="rounded-none text-base h-14 px-8" onClick={() => scrollTo("projects")}>
                View Our Work <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" className="rounded-none text-base h-14 px-8 bg-transparent text-white border-white hover:bg-white hover:text-secondary" onClick={() => scrollTo("contact")}>
                Discuss a Project
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-secondary text-secondary-foreground py-16 border-t-[8px] border-primary">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            {[
              { label: "Years Experience", value: "25+" },
              { label: "Projects Completed", value: "450+" },
              { label: "Active Sites", value: "32" },
              { label: "Skilled Professionals", value: "1,200+" }
            ].map((stat, i) => (
              <motion.div 
                key={i}
                initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }}
                variants={FADE_UP}
                className="flex flex-col gap-2"
              >
                <div className="text-4xl md:text-5xl font-display font-bold text-primary">{stat.value}</div>
                <div className="text-sm md:text-base text-secondary-foreground/70 font-medium uppercase tracking-wider">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 md:py-32">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div 
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={STAGGER}
            >
              <motion.h2 variants={FADE_UP} className="text-3xl md:text-5xl font-display font-bold mb-6">
                Solid foundations.<br/>
                Visionary engineering.
              </motion.h2>
              <motion.p variants={FADE_UP} className="text-muted-foreground text-lg mb-6 leading-relaxed">
                At Mahakali Engineers and Developers, we don't just execute blueprints — we command the earth. For over two decades, we have been the silent force behind India's growing skyline and critical infrastructure.
              </motion.p>
              <motion.p variants={FADE_UP} className="text-muted-foreground text-lg mb-10 leading-relaxed">
                Our commitment is to safety, scale, and uncompromising quality. From massive industrial plants to delicate commercial facades, we bring the heavy weight of experience to every square foot we build.
              </motion.p>
              <motion.div variants={FADE_UP}>
                <Button variant="link" className="text-primary hover:text-primary/80 px-0 text-lg h-auto" onClick={() => scrollTo("contact")}>
                  Learn more about our legacy <ArrowUpRight className="ml-2 h-5 w-5" />
                </Button>
              </motion.div>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.8 }}
              className="relative aspect-square md:aspect-[4/3]"
            >
              <div className="absolute inset-0 bg-secondary translate-x-4 translate-y-4 md:translate-x-8 md:translate-y-8" />
              <img src={aboutImg} alt="Engineers reviewing blueprints" className="relative z-10 w-full h-full object-cover filter grayscale-[20%]" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-24 md:py-32 bg-muted/30">
        <div className="container mx-auto px-6">
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={FADE_UP}
            className="max-w-3xl mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-display font-bold mb-6">Capabilities & Expertise</h2>
            <p className="text-lg text-muted-foreground">Comprehensive construction solutions backed by advanced machinery and elite engineering teams.</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: Building2, title: "Commercial Complexes", desc: "High-rise office buildings, retail spaces, and IT parks built for the modern workforce." },
              { icon: Factory, title: "Industrial Projects", desc: "Heavy-duty manufacturing plants, warehouses, and logistics hubs requiring specialized structural integrity." },
              { icon: ShieldCheck, title: "Civil Infrastructure", desc: "Bridges, highways, and public works engineered to withstand the test of time and traffic." },
              { icon: HardHat, title: "Residential Development", desc: "Premium residential towers and gated communities focusing on safety and structural brilliance." }
            ].map((service, i) => (
              <motion.div 
                key={i}
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={FADE_UP}
                className="bg-card border border-border p-8 hover:border-primary transition-colors group"
              >
                <service.icon className="h-12 w-12 text-primary mb-6 group-hover:scale-110 transition-transform duration-300" strokeWidth={1.5} />
                <h3 className="text-xl font-display font-bold mb-4">{service.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{service.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Projects */}
      <section id="projects" className="py-24 md:py-32">
        <div className="container mx-auto px-6">
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={FADE_UP}
            className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16"
          >
            <div className="max-w-2xl">
              <h2 className="text-3xl md:text-5xl font-display font-bold mb-6">Featured Projects</h2>
              <p className="text-lg text-muted-foreground">A selection of our landmark developments across India.</p>
            </div>
            <Button variant="outline" className="rounded-none self-start md:self-auto border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground">
              View All Projects
            </Button>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { img: project1Img, title: "Bagmati Commercial Tower", category: "Commercial", location: "Kathmandu, Nepal" },
              { img: project2Img, title: "Trishuli River Bridge", category: "Infrastructure", location: "Nuwakot, Nepal" },
              { img: project3Img, title: "Hetauda Industrial Complex", category: "Industrial", location: "Hetauda, Nepal" }
            ].map((project, i) => (
              <motion.div 
                key={i}
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={FADE_UP}
                className="group cursor-pointer"
              >
                <div className="relative aspect-[4/3] mb-6 overflow-hidden bg-muted">
                  <div className="absolute inset-0 bg-secondary/20 group-hover:bg-transparent transition-colors z-10" />
                  <img src={project.img} alt={project.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold text-primary mb-2 uppercase tracking-wider">{project.category}</div>
                    <h3 className="text-2xl font-display font-bold mb-1">{project.title}</h3>
                    <div className="text-muted-foreground text-sm flex items-center gap-1">
                      <MapPin className="h-4 w-4" /> {project.location}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA / Contact Section */}
      <section id="contact" className="relative py-24 md:py-32 bg-secondary text-secondary-foreground">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={STAGGER}>
              <motion.h2 variants={FADE_UP} className="text-3xl md:text-5xl font-display font-bold mb-6 text-white">
                Let's build the future together.
              </motion.h2>
              <motion.p variants={FADE_UP} className="text-secondary-foreground/70 text-lg mb-12">
                Whether you're planning a massive industrial complex or a commercial tower, our engineering team is ready to deliver.
              </motion.p>
              
              <div className="space-y-8">
                <motion.div variants={FADE_UP} className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-white/10 flex items-center justify-center shrink-0">
                    <MapPin className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white mb-1">Corporate Office</h4>
                    <p className="text-secondary-foreground/70">Chabahil-07, Kathmandu, Nepal</p>
                  </div>
                </motion.div>
                
                <motion.div variants={FADE_UP} className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-white/10 flex items-center justify-center shrink-0">
                    <Phone className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white mb-1">Phone</h4>
                    <p className="text-secondary-foreground/70"><a href="tel:+9779851405916" className="hover:text-white transition-colors">+977 9851405916</a></p>
                  </div>
                </motion.div>
                
                <motion.div variants={FADE_UP} className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-white/10 flex items-center justify-center shrink-0">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white mb-1">Email</h4>
                    <p className="text-secondary-foreground/70">
                      <a href="mailto:mahakaliengineers885@gmail.com" className="hover:text-white transition-colors">mahakaliengineers885@gmail.com</a><br/>
                      <a href="https://mahakaliengineers.com.np" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">mahakaliengineers.com.np</a>
                    </p>
                  </div>
                </motion.div>
              </div>
            </motion.div>

            <motion.div 
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={FADE_UP}
              className="bg-background text-foreground p-8 md:p-12 shadow-xl"
            >
              <h3 className="text-2xl font-display font-bold mb-8">Request a Consultation</h3>
              <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">First Name</label>
                    <Input className="rounded-none border-border bg-muted/50 h-12" placeholder="John" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">Last Name</label>
                    <Input className="rounded-none border-border bg-muted/50 h-12" placeholder="Doe" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Email Address</label>
                  <Input className="rounded-none border-border bg-muted/50 h-12" type="email" placeholder="john@company.com" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Phone Number</label>
                  <Input className="rounded-none border-border bg-muted/50 h-12" type="tel" placeholder="+977" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Project Details</label>
                  <Textarea className="rounded-none border-border bg-muted/50 min-h-[120px]" placeholder="Tell us about your project..." />
                </div>
                <Button className="w-full rounded-none h-14 text-base font-bold" type="submit">
                  Submit Inquiry
                </Button>
              </form>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#111111] text-white/50 py-12 border-t border-white/10">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-6">
            <div className="flex items-center">
              <img src={logoImg} alt="Mahakali Engineers and Developers" className="h-12 w-auto object-contain" style={{ filter: "brightness(0) invert(1)" }} />
            </div>
            <div className="flex flex-col md:flex-row items-center gap-6 text-sm">
              <a href="tel:+9779851405916" className="hover:text-white transition-colors flex items-center gap-2">
                <Phone className="h-4 w-4" /> +977 9851405916
              </a>
              <a href="mailto:mahakaliengineers885@gmail.com" className="hover:text-white transition-colors flex items-center gap-2">
                <Mail className="h-4 w-4" /> mahakaliengineers885@gmail.com
              </a>
              <span className="flex items-center gap-2">
                <MapPin className="h-4 w-4" /> Chabahil-07, Kathmandu
              </span>
            </div>
          </div>
          <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
            <p className="text-center md:text-left">
              &copy; {new Date().getFullYear()} Mahakali Engineers and Developers Pvt. Ltd. All rights reserved.
            </p>
            <a href="https://mahakaliengineers.com.np" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
              mahakaliengineers.com.np
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
