import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { ArrowRight, Zap, Target, Users, Quote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext.jsx';

const testimonials = [
  {
    name: 'Priya Sharma',
    role: 'UX Designer → Learning Python',
    avatar: 'PS',
    avatarColor: 'from-pink-500 to-rose-500',
    text: "I traded my Figma skills for Python lessons and landed a data product role in 3 months. SkillSwap AI matched me with someone who needed exactly what I had. I didn't spend a single rupee on courses.",
    skill: 'Figma ↔ Python',
  },
  {
    name: 'Aisha Mensah',
    role: 'Marketing Lead → Learning Web Dev',
    avatar: 'AM',
    avatarColor: 'from-purple-500 to-violet-500',
    text: "As a woman in tech in Accra, finding mentors was hard. This platform connected me with a developer in Berlin who wanted SEO skills. We've been swapping weekly for 6 months now.",
    skill: 'SEO & Content ↔ React',
  },
  {
    name: 'Sakura Tanaka',
    role: 'Software Engineer → Learning Finance',
    avatar: 'ST',
    avatarColor: 'from-fuchsia-500 to-pink-500',
    text: "I always wanted to understand financial modelling but courses were expensive. I offered TypeScript tutoring and got weekly finance sessions from a Goldman analyst. The AI match was eerily accurate.",
    skill: 'TypeScript ↔ Financial Modelling',
  },
  {
    name: 'Fatima Al-Rashid',
    role: 'Data Analyst → Learning Public Speaking',
    avatar: 'FA',
    avatarColor: 'from-indigo-500 to-purple-500',
    text: "Numbers are my comfort zone, speaking isn't. SkillSwap paired me with a communications coach who needed Excel automation help. Two months later I gave my first conference talk.",
    skill: 'Excel & SQL ↔ Public Speaking',
  },
  {
    name: 'Valentina Cruz',
    role: 'Freelance Illustrator → Learning No-Code',
    avatar: 'VC',
    avatarColor: 'from-rose-500 to-orange-400',
    text: "I wanted to build my own portfolio site without hiring a developer. I found a no-code builder who needed branding help. We built each other's businesses basically for free.",
    skill: 'Illustration & Branding ↔ Webflow',
  },
  {
    name: 'Meera Nair',
    role: 'HR Professional → Learning AI Tools',
    avatar: 'MN',
    avatarColor: 'from-pink-400 to-fuchsia-500',
    text: "AI was intimidating until I started swapping HR strategy sessions for hands-on AI tool training. The semantic matching on this platform is genuinely impressive — it found my perfect learning partner in minutes.",
    skill: 'HR Strategy ↔ AI & Prompt Engineering',
  },
];

const HomePage = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>Saheli | Share . Learn . Grow</title>
      </Helmet>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-950 via-background to-pink-950 z-10" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/60 to-background z-20" />
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-pink-600/20 rounded-full blur-3xl z-10" />
            <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl z-10" />
            <img
              src="https://images.unsplash.com/photo-1702479744181-2d6b58941583"
              alt="Abstract network of connections"
              className="w-full h-full object-cover opacity-10 grayscale"
            />
          </div>

          <div className="container relative z-30 mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-3xl mx-auto space-y-8"
            >
              <h1 className="text-5xl md:text-7xl font-extrabold font-heading tracking-tight text-white leading-[1.1]">
                Exchange Knowledge, <br className="hidden md:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400">
                  Empower Growth.
                </span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-medium">
                Saheli connects professionals globally. Share the skills you have, learn the skills you want, and accelerate your career.
              </p>

              {!isAuthenticated && (
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                  <Button
                    asChild size="lg"
                    className="h-12 px-8 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white border-0 w-full sm:w-auto group shadow-lg shadow-pink-500/25"
                  >
                    <Link to="/auth">
                      Get Started
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </Button>
                  <Button
                    asChild size="lg" variant="outline"
                    className="h-12 px-8 border-pink-500/30 text-white hover:bg-pink-500/10 w-full sm:w-auto"
                  >
                    <Link to="/auth">Sign In</Link>
                  </Button>
                </div>
              )}

              {isAuthenticated && (
                <div className="flex items-center justify-center pt-4">
                  <Button
                    asChild size="lg"
                    className="h-12 px-8 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white border-0 group shadow-lg shadow-pink-500/25"
                  >
                    <Link to="/matches">
                      View Your Matches
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </Button>
                </div>
              )}
            </motion.div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-24 bg-background">
          <div className="container mx-auto px-4">
            <div className="mb-16 text-center">
              <h2 className="text-3xl md:text-4xl font-bold font-heading text-white mb-4">How it works</h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                A seamless ecosystem designed to match your expertise with those who need it.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                className="col-span-1 md:col-span-2 rounded-2xl bg-card border border-white/5 p-8 relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <Zap className="h-10 w-10 text-pink-400 mb-6" />
                <h3 className="text-2xl font-bold text-white mb-2 font-heading">Smart Matching Algorithm</h3>
                <p className="text-muted-foreground max-w-sm">Our AI analyzes your skill profile and instantly suggests the most relevant partners who have what you want, and want what you have.</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
                className="col-span-1 rounded-2xl bg-gradient-to-br from-purple-900/40 to-pink-900/20 border border-purple-500/10 p-8"
              >
                <Target className="h-8 w-8 text-purple-400 mb-6" />
                <h3 className="text-xl font-bold text-white mb-2 font-heading">Goal Oriented</h3>
                <p className="text-sm text-muted-foreground">Focus strictly on specific skills. No fluff, just direct professional exchange.</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
                className="col-span-1 rounded-2xl bg-gradient-to-br from-pink-900/30 to-purple-900/20 border border-pink-500/10 p-8"
              >
                <Users className="h-8 w-8 text-pink-400 mb-6" />
                <h3 className="text-xl font-bold text-white mb-2 font-heading">Global Network</h3>
                <p className="text-sm text-muted-foreground">Connect with professionals from around the world to broaden your perspective.</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }}
                className="col-span-1 md:col-span-2 rounded-2xl bg-gradient-to-r from-pink-600 to-purple-700 border border-pink-500/30 p-8 relative overflow-hidden"
              >
                <div className="relative z-10">
                  <h3 className="text-2xl font-bold text-white mb-2 font-heading">Ready to share?</h3>
                  <p className="text-white/80 max-w-sm mb-6">Join thousands of others currently exchanging skills on the platform.</p>
                  <Button variant="secondary" asChild className="bg-white text-pink-600 hover:bg-white/90 font-semibold">
                    <Link to={isAuthenticated ? '/matches' : '/auth'}>
                      {isAuthenticated ? 'View Matches' : 'Create Account'}
                    </Link>
                  </Button>
                </div>
                <div className="absolute right-0 bottom-0 translate-x-1/4 translate-y-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
              </motion.div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-background via-purple-950/20 to-background" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-pink-600/5 rounded-full blur-3xl" />

          <div className="container relative mx-auto px-4">
            <div className="mb-16 text-center">
              <span className="text-xs font-semibold uppercase tracking-widest text-pink-400 mb-3 block">
                Community Stories
              </span>
              <h2 className="text-3xl md:text-4xl font-bold font-heading text-white mb-4">
                Women leading the exchange
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Real stories from professionals who swapped skills and changed their careers.
              </p>
            </div>

            {/* Masonry-style grid */}
            <div className="columns-1 md:columns-2 lg:columns-3 gap-6 max-w-6xl mx-auto space-y-6">
              {testimonials.map((t, i) => (
                <motion.div
                  key={t.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="break-inside-avoid rounded-2xl bg-card border border-white/5 p-6 relative group hover:border-pink-500/20 transition-colors"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />

                  {/* Quote icon */}
                  <Quote className="h-6 w-6 text-pink-500/40 mb-4" />

                  {/* Text */}
                  <p className="text-sm text-muted-foreground leading-relaxed mb-5">
                    "{t.text}"
                  </p>

                  {/* Skill badge */}
                  <div className="mb-4">
                    <span className="text-xs px-2.5 py-1 rounded-full bg-pink-500/10 text-pink-400 border border-pink-500/20 font-medium">
                      {t.skill}
                    </span>
                  </div>

                  {/* Author */}
                  <div className="flex items-center gap-3">
                    <div className={`h-9 w-9 rounded-full bg-gradient-to-br ${t.avatarColor} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                      {t.avatar}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.role}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Bottom CTA */}
            {!isAuthenticated && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mt-16"
              >
                <p className="text-muted-foreground mb-4">Ready to write your own story?</p>
                <Button
                  asChild size="lg"
                  className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white border-0 shadow-lg shadow-pink-500/25"
                >
                  <Link to="/auth">
                    Join Saheli
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </motion.div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default HomePage;