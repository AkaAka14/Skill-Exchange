import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    passwordConfirm: '',
    name: ''
  });

  const { login, signup } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/home";

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        await login(formData.email, formData.password);
        toast.success("Logged in successfully");
      } else {
        if (formData.password !== formData.passwordConfirm) {
          throw new Error("Passwords do not match");
        }
        await signup({
          email: formData.email,
          password: formData.password,
          passwordConfirm: formData.passwordConfirm,
          name: formData.name
        });
        toast.success("Account created successfully");
      }
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err.message || "Authentication failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <Helmet>
        <title>{isLogin ? 'Sign In | Saheli' : 'Sign Up | Saheli'}</title>
      </Helmet>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md bg-card border border-white/10 rounded-2xl p-8 shadow-2xl"
      >
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold font-heading text-white">
            {isLogin ? 'Welcome back' : 'Create an account'}
          </h2>
          <p className="text-sm text-muted-foreground mt-2">
            {isLogin ? 'Enter your credentials to access your account' : 'Enter your details to join Saheli'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="space-y-2">
              <Label htmlFor="name" className="text-muted-foreground">Full Name</Label>
              <Input
                id="name"
                name="name"
                required={!isLogin}
                value={formData.name}
                onChange={handleChange}
                className="bg-input border-white/10 text-white"
                placeholder="John Doe"
              />
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="email" className="text-muted-foreground">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="bg-input border-white/10 text-white"
              placeholder="you@example.com"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password" className="text-muted-foreground">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              value={formData.password}
              onChange={handleChange}
              className="bg-input border-white/10 text-white"
            />
          </div>

          {!isLogin && (
            <div className="space-y-2">
              <Label htmlFor="passwordConfirm" className="text-muted-foreground">Confirm Password</Label>
              <Input
                id="passwordConfirm"
                name="passwordConfirm"
                type="password"
                required={!isLogin}
                value={formData.passwordConfirm}
                onChange={handleChange}
                className="bg-input border-white/10 text-white"
              />
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full bg-primary text-white hover:bg-primary/90 mt-6"
            disabled={isLoading}
          >
            {isLoading ? "Please wait..." : (isLogin ? "Sign In" : "Sign Up")}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button 
            type="button" 
            onClick={() => setIsLogin(!isLogin)}
            className="text-primary hover:underline font-medium"
          >
            {isLogin ? "Sign Up" : "Sign In"}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthPage;