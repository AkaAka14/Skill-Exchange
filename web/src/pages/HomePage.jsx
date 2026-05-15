import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { ArrowRight, Zap, Target, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';

const HomePage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>SkillSwap AI | Share & Learn</title>
      </Helmet>
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
          <div className="absolute inset-0 z-0">
             <div className="absolute inset-0 bg-background/90 z-10 mix-blend-multiply" />
             <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/80 to-background z-20" />
             <img 
               src="https://images.unsplash.com/photo-1702479744181-2d6b58941583" 
               alt="Abstract network of connections"
               className="w-full h-full object-cover opacity-40 grayscale"
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
                Exchange Knowledge, <br className="hidden md:block"/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Empower Growth.</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-medium">
                SkillSwap AI connects professionals globally. Share the skills you have, learn the skills you want, and accelerate your career.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <Button asChild size="lg" className="h-12 px-8 bg-primary hover:bg-primary/90 text-white w-full sm:w-auto group">
                  <Link to="/auth">
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="h-12 px-8 border-white/20 text-white hover:bg-white/10 w-full sm:w-auto">
                  <Link to="/auth">Sign In</Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features Bento Grid */}
        <section className="py-24 bg-background">
          <div className="container mx-auto px-4">
            <div className="mb-16 text-center">
              <h2 className="text-3xl md:text-4xl font-bold font-heading text-white mb-4">How it works</h2>
              <p className="text-muted-foreground max-w-xl mx-auto">A seamless ecosystem designed to match your expertise with those who need it.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {/* Feature 1 - Large */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="col-span-1 md:col-span-2 rounded-2xl bg-card border border-white/5 p-8 relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <Zap className="h-10 w-10 text-primary mb-6" />
                <h3 className="text-2xl font-bold text-white mb-2 font-heading">Smart Matching Algorithm</h3>
                <p className="text-muted-foreground max-w-sm">Our AI analyzes your skill profile and instantly suggests the most relevant partners who have what you want, and want what you have.</p>
              </motion.div>

              {/* Feature 2 - Small */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="col-span-1 rounded-2xl bg-secondary/30 border border-white/5 p-8"
              >
                <Target className="h-8 w-8 text-accent mb-6" />
                <h3 className="text-xl font-bold text-white mb-2 font-heading">Goal Oriented</h3>
                <p className="text-sm text-muted-foreground">Focus strictly on specific skills. No fluff, just direct professional exchange.</p>
              </motion.div>

              {/* Feature 3 - Small */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="col-span-1 rounded-2xl bg-secondary/30 border border-white/5 p-8"
              >
                <Users className="h-8 w-8 text-white/80 mb-6" />
                <h3 className="text-xl font-bold text-white mb-2 font-heading">Global Network</h3>
                <p className="text-sm text-muted-foreground">Connect with professionals from around the world to broaden your perspective.</p>
              </motion.div>

              {/* Feature 4 - Large */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="col-span-1 md:col-span-2 rounded-2xl bg-primary border border-primary p-8 relative overflow-hidden"
              >
                <div className="relative z-10">
                  <h3 className="text-2xl font-bold text-primary-foreground mb-2 font-heading">Ready to share?</h3>
                  <p className="text-primary-foreground/80 max-w-sm mb-6">Join thousands of others currently exchanging skills on the platform.</p>
                  <Button variant="secondary" asChild className="bg-white text-primary hover:bg-white/90">
                    <Link to="/auth">Create Account</Link>
                  </Button>
                </div>
                {/* Decorative background element */}
                <div className="absolute right-0 bottom-0 translate-x-1/4 translate-y-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
              </motion.div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default HomePage;