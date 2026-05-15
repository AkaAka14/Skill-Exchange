import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

const ServiceCard = ({ icon: Icon, title, description }) => {
  return (
    <Card className="h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-border">
      <CardContent className="p-8 flex flex-col h-full">
        <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
          <Icon className="w-7 h-7 text-primary" />
        </div>
        <h3 className="heading-section text-2xl text-card-foreground mb-4">
          {title}
        </h3>
        <p className="text-muted-foreground leading-relaxed">
          {description}
        </p>
      </CardContent>
    </Card>
  );
};

export default ServiceCard;