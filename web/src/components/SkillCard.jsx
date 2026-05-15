import React from 'react';
import { X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const SkillCard = ({ skill, onRemove, isOwner = false }) => {
  return (
    <div className="group relative inline-flex items-center gap-2 rounded-lg bg-secondary/50 border border-white/5 px-4 py-2 text-sm text-secondary-foreground transition-all hover:bg-secondary hover:border-white/10">
      <span className="font-medium">{skill.skillName}</span>
      {isOwner && (
        <button
          onClick={() => onRemove(skill.id)}
          className="ml-2 rounded-full p-1 opacity-50 hover:bg-white/10 hover:opacity-100 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          aria-label={`Remove ${skill.skillName}`}
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </div>
  );
};

export default SkillCard;