import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, CheckCircle2, PlayCircle } from 'lucide-react';
import { Button } from './ui/button';
import { BackgroundBeams } from './ui/background-beams';

const Hero = () => {
  return (
    <section className="relative min-h-[95vh] flex flex-col items-center justify-center pt-20 overflow-hidden bg-transparent">
      <BackgroundBeams className="opacity-40" />
      
      <div className="container mx-auto px-4 text-center relative z-10">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8 backdrop-blur-sm hover:bg-primary/20 transition-colors cursor-default"
        >
          <Sparkles className="w-4 h-4" />
          <span>Intelligent Scheduling v2.0</span>
        </motion.div>

        {/* Main Heading */}
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-6xl md:text-8xl font-bold tracking-tighter mb-8 leading-tight"
        >
          <span className="bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/70">
            Booking Made
          </span>
          <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-500 to-blue-600 animate-gradient-x">
             Beautifully Simple
          </span>
        </motion.h1>

        {/* Tagline/Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed"
        >
          Streamline your appointments with the world's most intuitive platform. 
          Save time, reduce no-shows, and grow your business effortlessly.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
        >
          <Link to="/register">
            <Button size="lg" className="rounded-full px-8 h-14 text-lg shadow-xl shadow-primary/25 hover:shadow-primary/40 transition-all duration-300 transform hover:-translate-y-1">
              Start for Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <Link to="/login">
            <Button variant="outline" size="lg" className="rounded-full px-8 h-14 text-lg backdrop-blur-md bg-background/50 hover:bg-background/80 border-white/20">
              <PlayCircle className="mr-2 h-5 w-5" />
              Watch Demo
            </Button>
          </Link>
        </motion.div>

        {/* Social Proof / Trust Indicators */}
        <motion.div
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           transition={{ duration: 1, delay: 0.8 }}
           className="flex flex-wrap justify-center gap-8 text-sm text-muted-foreground/60"
        >
           <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span>No credit card required</span>
           </div>
           <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span>14-day free trial</span>
           </div>
           <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span>Cancel anytime</span>
           </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
