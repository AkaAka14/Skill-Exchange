import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';

export const SKILL_CATEGORIES = [
  { value: 'Programming',         label: 'Programming' },
  { value: 'Languages',           label: 'Languages' },
  { value: 'Music',               label: 'Music' },
  { value: 'Design',              label: 'Design' },
  { value: 'Mathematics',         label: 'Mathematics' },
  { value: 'Science',             label: 'Science' },
  { value: 'Writing',             label: 'Writing' },
  { value: 'Photography & Video', label: 'Photography & Video' },
  { value: 'Cooking',             label: 'Cooking' },
  { value: 'Fitness & Sports',    label: 'Fitness & Sports' },
  { value: 'Business',            label: 'Business' },
  { value: 'Marketing',           label: 'Marketing' },
  { value: 'Finance',             label: 'Finance' },
  { value: 'Teaching',            label: 'Teaching' },
  { value: 'Crafts & DIY',        label: 'Crafts & DIY' },
  { value: 'Other',               label: 'Other' },
];

export const SKILL_LEVELS = [
  { value: 'beginner',     label: 'Beginner',     desc: 'Just starting out' },
  { value: 'intermediate', label: 'Intermediate',  desc: 'Comfortable with basics' },
  { value: 'advanced',     label: 'Advanced',      desc: 'Deep expertise' },
];

const SkillForm = ({ onAddSkill, isLoading }) => {
  const [category,  setCategory]  = useState('');
  const [skillName, setSkillName] = useState('');
  const [level,     setLevel]     = useState('intermediate');

  const canSubmit = !isLoading && category && skillName.trim();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    try {
      await onAddSkill({ skillName: skillName.trim(), category, level });
      setSkillName('');
      // keep category + level — user often adds multiple skills in the same category
    } catch (_) { /* handled by hook */ }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="flex flex-col sm:flex-row gap-3">

        {/* Category */}
        <div className="w-full sm:w-[200px] space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Category</label>
          <Select value={category} onValueChange={setCategory} disabled={isLoading}>
            <SelectTrigger className="bg-input border-white/10 text-white">
              <SelectValue placeholder="Select category…" />
            </SelectTrigger>
            <SelectContent className="bg-card border-white/10 max-h-64">
              {SKILL_CATEGORIES.map(c => (
                <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Skill name */}
        <div className="flex-1 space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Skill name</label>
          <Input
            value={skillName}
            onChange={e => setSkillName(e.target.value)}
            placeholder={
              category === 'Programming'         ? 'e.g. React, Python, Rust…'    :
              category === 'Languages'           ? 'e.g. Spanish, Mandarin…'      :
              category === 'Music'               ? 'e.g. Guitar, Piano…'          :
              category === 'Design'              ? 'e.g. Figma, Illustration…'    :
              category === 'Mathematics'         ? 'e.g. Calculus, Statistics…'   :
              category === 'Fitness & Sports'    ? 'e.g. Yoga, Basketball…'       :
              'Enter skill name…'
            }
            className="bg-input border-white/10 text-white placeholder:text-muted-foreground"
            disabled={isLoading || !category}
          />
        </div>

        {/* Level */}
        <div className="w-full sm:w-[160px] space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Level</label>
          <Select value={level} onValueChange={setLevel} disabled={isLoading}>
            <SelectTrigger className="bg-input border-white/10 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-card border-white/10">
              {SKILL_LEVELS.map(l => (
                <SelectItem key={l.value} value={l.value}>
                  <span>{l.label}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Preview + submit */}
      <div className="flex items-center gap-3">
        {category && skillName.trim() && (
          <p className="text-xs text-muted-foreground flex-1 flex items-center gap-1.5">
            Adding:
            <span className="text-white font-medium">{skillName.trim()}</span>
            <span className="text-pink-400">· {category}</span>
            <span className="text-muted-foreground/60">
              · {SKILL_LEVELS.find(l => l.value === level)?.label}
            </span>
          </p>
        )}
        <Button
          type="submit"
          disabled={!canSubmit}
          className="ml-auto bg-primary text-white hover:bg-primary/90"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Skill
        </Button>
      </div>
    </form>
  );
};

export default SkillForm;