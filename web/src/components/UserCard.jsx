import React from 'react';
import { Mail, Briefcase, GraduationCap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

const UserCard = ({ user }) => {
  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <Card className="bg-card border-white/10 shadow-lg shadow-violet-900/10 hover:shadow-violet-900/20 transition-all duration-300">
      <CardHeader className="flex flex-row items-start gap-4 pb-4">
        <Avatar className="h-12 w-12 rounded-xl border border-white/10 bg-primary/20">
          <AvatarFallback className="rounded-xl text-primary font-bold">
            {getInitials(user.name)}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <CardTitle className="text-lg font-heading tracking-tight">{user.name || 'Anonymous User'}</CardTitle>
          <div className="flex items-center text-xs text-muted-foreground mt-1">
            <Mail className="h-3 w-3 mr-1" />
            {user.emailVisibility ? user.email : 'Email hidden'}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
            <Briefcase className="h-4 w-4 text-primary" />
            Skills They Have
          </div>
          <div className="flex flex-wrap gap-2">
            {user.skillsHave?.length > 0 ? (
              user.skillsHave.map(skill => (
                <Badge key={skill.id} variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 border-0">
                  {skill.skillName}
                </Badge>
              ))
            ) : (
              <span className="text-xs text-muted-foreground">No skills listed yet</span>
            )}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
            <GraduationCap className="h-4 w-4 text-accent" />
            Skills They Want
          </div>
          <div className="flex flex-wrap gap-2">
            {user.skillsWant?.length > 0 ? (
              user.skillsWant.map(skill => (
                <Badge key={skill.id} variant="outline" className="border-white/20 text-muted-foreground">
                  {skill.skillName}
                </Badge>
              ))
            ) : (
              <span className="text-xs text-muted-foreground">No skills listed yet</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserCard;