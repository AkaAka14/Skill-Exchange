import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';

const SkillForm = ({ onAddSkill, isLoading }) => {
  const [skillName, setSkillName] = useState('');
  const [skillType, setSkillType] = useState('have');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!skillName.trim()) return;

    try {
      await onAddSkill({ skillName: skillName.trim(), skillType });
      setSkillName('');
    } catch (err) {
      // Error handled by hook
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 items-end">
      <div className="flex-1 w-full space-y-2">
        <label htmlFor="skillName" className="text-sm font-medium text-muted-foreground">Skill Name</label>
        <Input 
          id="skillName"
          value={skillName}
          onChange={(e) => setSkillName(e.target.value)}
          placeholder="e.g. React.js, Digital Marketing"
          className="bg-input border-white/10 text-white placeholder:text-muted-foreground"
          disabled={isLoading}
        />
      </div>
      <div className="w-full sm:w-[150px] space-y-2">
        <label htmlFor="skillType" className="text-sm font-medium text-muted-foreground">Type</label>
        <Select value={skillType} onValueChange={setSkillType} disabled={isLoading}>
          <SelectTrigger className="bg-input border-white/10 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-card border-white/10">
            <SelectItem value="have">I Have</SelectItem>
            <SelectItem value="want">I Want</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button 
        type="submit" 
        disabled={isLoading || !skillName.trim()}
        className="w-full sm:w-auto bg-primary text-white hover:bg-primary/90"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Skill
      </Button>
    </form>
  );
};

export default SkillForm;