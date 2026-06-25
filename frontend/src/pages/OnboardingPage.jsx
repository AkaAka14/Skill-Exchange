import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext.jsx';
import apiServerClient from '@/lib/apiServerClient.js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SKILL_CATEGORIES } from '@/components/SkillForm.jsx';
import { toast } from 'sonner';
import { Plus, X, ArrowRight, ArrowLeft, Sparkles } from 'lucide-react';

const STEPS = ['About You', 'Skills You Offer', 'Skills to Learn'];

function SkillPicker({ skills, onAdd, onRemove, badgeClass }) {
  const [category,  setCategory]  = useState('');
  const [skillName, setSkillName] = useState('');

  const add = () => {
    const name = skillName.trim();
    if (!name || !category) return;
    const key = `${category}::${name}`;
    if (skills.find(s => s.key === key)) return;
    onAdd({ key, skillName: name, category });
    setSkillName('');
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="bg-input border-white/10 text-white w-[180px] shrink-0">
            <SelectValue placeholder="Category…" />
          </SelectTrigger>
          <SelectContent className="bg-card border-white/10 max-h-60">
            {SKILL_CATEGORIES.map(c => (
              <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          value={skillName}
          onChange={e => setSkillName(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
          placeholder={category ? `Skill in ${category}…` : 'Pick a category first'}
          disabled={!category}
          className="bg-input border-white/10 text-white flex-1"
        />

        <Button
          type="button"
          size="icon"
          variant="outline"
          className="border-white/10 shrink-0"
          onClick={add}
          disabled={!category || !skillName.trim()}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {skills.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {skills.map(s => (
            <Badge key={s.key} className={`gap-1 pr-1 ${badgeClass}`}>
              <span className="text-[10px] opacity-60">{s.category} ·</span> {s.skillName}
              <button onClick={() => onRemove(s.key)}>
                <X className="h-3 w-3 ml-0.5" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

const OnboardingPage = () => {
  const { currentUser, updateCurrentUser } = useAuth();
  const navigate = useNavigate();

  const [step,      setStep]      = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [bio,       setBio]       = useState('');
  const [offered,   setOffered]   = useState([]);
  const [wanted,    setWanted]    = useState([]);

  const handleSkip = () => navigate('/');

  const handleFinish = async () => {
    setIsLoading(true);
    try {
      if (bio.trim()) {
        const fd = new FormData();
        fd.append('bio', bio.trim());
        const updated = await apiServerClient.put('/users/me', fd);
        updateCurrentUser(updated);
      }

      await Promise.all([
        ...offered.map(s => apiServerClient.post('/skills', { skillName: s.skillName, category: s.category, skillType: 'have' })),
        ...wanted.map(s  => apiServerClient.post('/skills', { skillName: s.skillName, category: s.category, skillType: 'want' })),
      ]);

      toast.success('Profile set up! Welcome 🎉');
      navigate('/');
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-lg">

        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 text-primary mb-3">
            <Sparkles className="h-5 w-5" />
            <span className="text-sm font-medium">Welcome, {currentUser?.name?.split(' ')[0]}!</span>
          </div>
          <h1 className="text-2xl font-bold font-heading text-white">Set up your profile</h1>
          <p className="text-sm text-muted-foreground mt-1">Just a few details to get started</p>
        </div>

        {/* Step indicators */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {STEPS.map((label, i) => (
            <React.Fragment key={label}>
              <div className="flex items-center gap-1.5">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                  i === step ? 'bg-primary text-white' : i < step ? 'bg-primary/30 text-primary' : 'bg-white/10 text-muted-foreground'
                }`}>
                  {i < step ? '✓' : i + 1}
                </div>
                <span className={`text-xs hidden sm:block ${i === step ? 'text-white' : 'text-muted-foreground'}`}>{label}</span>
              </div>
              {i < STEPS.length - 1 && <div className="w-6 h-px bg-white/10" />}
            </React.Fragment>
          ))}
        </div>

        <div className="bg-card border border-white/10 rounded-2xl p-8 shadow-2xl">
          <AnimatePresence mode="wait">

            {step === 0 && (
              <motion.div key="s0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
                <Label className="text-muted-foreground">Bio</Label>
                <Textarea
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  placeholder="Tell others about yourself — your background, interests, what you're working on…"
                  className="bg-input border-white/10 text-white resize-none h-32 mt-2"
                  maxLength={500}
                />
                <p className="text-xs text-muted-foreground text-right mt-1">{bio.length}/500</p>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
                <p className="text-sm font-medium text-white mb-1">Skills you can teach</p>
                <p className="text-xs text-muted-foreground mb-4">Pick a category, then type the specific skill</p>
                <SkillPicker
                  skills={offered}
                  onAdd={s => setOffered(p => [...p, s])}
                  onRemove={key => setOffered(p => p.filter(s => s.key !== key))}
                  badgeClass="bg-pink-500/15 text-pink-300 border-pink-500/25"
                />
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
                <p className="text-sm font-medium text-white mb-1">Skills you want to learn</p>
                <p className="text-xs text-muted-foreground mb-4">Pick a category, then type what you'd like to learn</p>
                <SkillPicker
                  skills={wanted}
                  onAdd={s => setWanted(p => [...p, s])}
                  onRemove={key => setWanted(p => p.filter(s => s.key !== key))}
                  badgeClass="bg-purple-500/15 text-purple-300 border-purple-500/25"
                />
              </motion.div>
            )}

          </AnimatePresence>

          <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/10">
            <Button
              type="button"
              variant="ghost"
              onClick={step === 0 ? handleSkip : () => setStep(step - 1)}
              className="text-muted-foreground hover:text-white"
            >
              {step === 0 ? 'Skip for now' : <><ArrowLeft className="h-4 w-4 mr-1" /> Back</>}
            </Button>

            {step < STEPS.length - 1 ? (
              <Button onClick={() => setStep(step + 1)} className="bg-primary text-white hover:bg-primary/90">
                Next <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button onClick={handleFinish} disabled={isLoading} className="bg-primary text-white hover:bg-primary/90">
                {isLoading ? 'Saving…' : 'Finish setup'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;