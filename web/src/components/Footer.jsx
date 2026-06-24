import React from 'react';
import { Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="border-t border-white/10 bg-background py-12">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="col-span-1 md:col-span-2 space-y-4">
          <Link to="/" className="flex items-center gap-2 text-primary">
            <Sparkles className="h-5 w-5" />
            <span className="font-bold text-lg text-white">Saheli</span>
          </Link>
          <p className="text-muted-foreground max-w-sm">
            Connect, share, and grow. The intelligent platform for women professionals and students to exchange valuable skills globally.
          </p>
        </div>
        
        <div>
          <h4 className="font-semibold text-white mb-4 font-heading">Platform</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/matches" className="hover:text-primary transition-colors">Find Matches</Link></li>
            <li><Link to="/profile" className="hover:text-primary transition-colors">Your Profile</Link></li>
            <li><Link to="/auth" className="hover:text-primary transition-colors">Sign In</Link></li>
          </ul>
        </div>
        
        <div>
          <h4 className="font-semibold text-white mb-4 font-heading">Legal</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><span className="cursor-pointer hover:text-white transition-colors">Privacy Policy</span></li>
            <li><span className="cursor-pointer hover:text-white transition-colors">Terms of Service</span></li>
          </ul>
        </div>
      </div>
      <div className="container mx-auto px-4 mt-12 pt-8 border-t border-white/10 text-center text-sm text-muted-foreground">
        &copy; {new Date().getFullYear()} Saheli - Akansha Patel. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;