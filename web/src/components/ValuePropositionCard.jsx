import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

const ValuePropositionCard = ({ title, description, variant = 'default' }) => {
  const variantStyles = {
    default: 'bg-card border-border shadow-sm',
    muted: 'bg-muted border-transparent',
    accent: 'bg-accent/5 border-accent/20'
  };

  return (
    <Card className={`h-full transition-all duration-300 hover:shadow-md ${variantStyles[variant]}`}>
      <CardContent className="p-6 flex flex-col h-full">
        <h3 className="heading-section text-xl text-card-foreground mb-3">
          {title}
        </h3>
        <p className="text-muted-foreground text-sm leading-relaxed">
          {description}
        </p>
      </CardContent>
    </Card>
  );
};

export default ValuePropositionCard;