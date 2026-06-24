import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import apiServerClient from '@/lib/apiServerClient';
import { useSkills } from '@/hooks/useSkills.js';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
  Loader2, Pencil, Check, X, Plus, Trash2,
  BookOpen, Target, Star, Calendar, Users,
  FileText, Heart, MessageCircle, Send, Globe,
  ChevronDown, ChevronUp, Tag
} from 'lucide-react';
import { FavoriteButton } from '@/components/FavoriteButton';
import { ReviewsSection } from '@/components/ReviewsSection';
import { StarRating } from '@/components/StarRating';

// ─── Blog Post Card ────────────────────────────────────────────────────────────
function BlogCard({ post, isOwn, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const preview = post.content.length > 200 ? post.content.slice(0, 200) + '…' : post.content;

  return (
    <div className="group rounded-xl border border-white/8 bg-gradient-to-br from-white/[0.03] to-pink-500/[0.02] p-5 hover:border-pink-500/20 transition-all duration-200">
      <div className="flex items-start justify-between gap-3 mb-2">
        <h3 className="font-semibold text-white text-base leading-snug">{post.title}</h3>
        {isOwn && (
          <button
            onClick={() => onDelete(post.id)}
            className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive flex-shrink-0"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>

      {post.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-pink-500/10 text-pink-400 border border-pink-500/20"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      <p className="text-sm text-muted-foreground leading-relaxed">
        {expanded ? post.content : preview}
      </p>

      {post.content.length > 200 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-xs text-pink-400 hover:text-pink-300 mt-2 transition-colors"
        >
          {expanded ? <><ChevronUp className="h-3 w-3" /> Show less</> : <><ChevronDown className="h-3 w-3" /> Read more</>}
        </button>
      )}

      <div className="flex items-center gap-4 mt-4 pt-3 border-t border-white/5">
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <Heart className="h-3 w-3 text-pink-400" />
          {post.likes || 0}
        </span>
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <MessageCircle className="h-3 w-3 text-purple-400" />
          {post.comments || 0}
        </span>
        <span className="ml-auto text-xs text-muted-foreground">
          {post.createdAt ? new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Just now'}
        </span>
      </div>
    </div>
  );
}

// ─── Write Blog Form ───────────────────────────────────────────────────────────
function WriteBlogForm({ onSubmit, onCancel }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const addTag = () => {
    const t = tagInput.trim().toLowerCase().replace(/\s+/g, '-');
    if (t && !tags.includes(t) && tags.length < 5) {
      setTags([...tags, t]);
      setTagInput('');
    }
  };

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) return;
    setSubmitting(true);
    try {
      await onSubmit({ title: title.trim(), content: content.trim(), tags });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-xl border border-pink-500/20 bg-gradient-to-br from-pink-500/5 to-purple-500/5 p-5 mb-4">
      <h3 className="text-sm font-semibold text-pink-400 uppercase tracking-wide mb-4 flex items-center gap-1.5">
        <FileText className="h-3.5 w-3.5" /> New Post
      </h3>

      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Post title…"
        className="mb-3 h-9 bg-white/5 border-white/10 focus:border-pink-500/50"
      />

      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Share what you know, a tip, a lesson learned, or a project you're proud of…"
        rows={5}
        maxLength={2000}
        className="mb-3 bg-white/5 border-white/10 focus:border-pink-500/50 resize-none"
      />

      {/* Tags */}
      <div className="mb-4">
        <div className="flex gap-2 mb-2">
          <Input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            placeholder="Add a tag (e.g. react)"
            className="h-8 text-xs bg-white/5 border-white/10"
            onKeyDown={(e) => e.key === 'Enter' && addTag()}
          />
          <Button size="sm" variant="ghost" onClick={addTag} className="h-8 text-xs border border-white/10 hover:border-pink-500/30">
            <Tag className="h-3 w-3" />
          </Button>
        </div>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <span
                key={tag}
                onClick={() => setTags(tags.filter((t) => t !== tag))}
                className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-pink-500/10 text-pink-400 border border-pink-500/20 cursor-pointer hover:bg-pink-500/20 transition-colors"
              >
                #{tag} ×
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-2 justify-end">
        <Button variant="ghost" size="sm" onClick={onCancel} className="text-muted-foreground">
          Cancel
        </Button>
        <Button
          size="sm"
          onClick={handleSubmit}
          disabled={submitting || !title.trim() || !content.trim()}
          className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white border-0"
        >
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Send className="h-3.5 w-3.5 mr-1" /> Publish</>}
        </Button>
      </div>
    </div>
  );
}

// ─── Main ProfilePage ──────────────────────────────────────────────────────────
export default function ProfilePage() {
  const { id: userId } = useParams();
  const { currentUser } = useAuth();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [editing, setEditing] = useState(false);
  const [editBio, setEditBio] = useState('');
  const [editName, setEditName] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const { skills, getSkillsByUser, addSkill, removeSkill } = useSkills();
  const [newHaveSkill, setNewHaveSkill] = useState('');
  const [newWantSkill, setNewWantSkill] = useState('');
  const [addingSkill, setAddingSkill] = useState(false);

  // Blog state
  const [posts, setPosts] = useState([]);
  const [showWriteForm, setShowWriteForm] = useState(false);
  const [postsLoading, setPostsLoading] = useState(false);

  const profileId = userId || currentUser?.id;
  const isOwnProfile = profileId === currentUser?.id;

  // Load profile
  useEffect(() => {
    if (!profileId) return;
    setLoading(true);
    apiServerClient
      .get(`/users/${profileId}`)
      .then((data) => {
        setProfile(data);
        setEditBio(data.bio || '');
        setEditName(data.name || '');
      })
      .catch(() => setError('Failed to load profile.'))
      .finally(() => setLoading(false));
  }, [profileId]);

  // Load skills (own profile only)
  useEffect(() => {
    if (isOwnProfile && profileId) getSkillsByUser(profileId);
  }, [isOwnProfile, profileId, getSkillsByUser]);

  // Load blog posts — replace with your real endpoint when ready
  useEffect(() => {
    if (!profileId) return;
    setPostsLoading(true);
    apiServerClient
      .get(`/posts?userId=${profileId}`)
      .then((data) => setPosts(Array.isArray(data) ? data : []))
      .catch(() => setPosts([]))
      .finally(() => setPostsLoading(false));
  }, [profileId]);

  const handleSave = async () => {
    setSaving(true);
    setSaveError('');
    try {
      const fd = new FormData();
      fd.append('name', editName);
      fd.append('bio', editBio);
      if (avatarFile) fd.append('avatar', avatarFile);
      const updated = await apiServerClient.put('/users/me', fd);
      setProfile(updated);
      setEditing(false);
      setAvatarFile(null);
    } catch (err) {
      setSaveError(err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleAddSkill = async (skillName, skillType) => {
    if (!skillName.trim()) return;
    setAddingSkill(true);
    try {
      await addSkill({ skillName: skillName.trim(), skillType });
      if (skillType === 'have') setNewHaveSkill('');
      else setNewWantSkill('');
    } catch (_) {}
    finally { setAddingSkill(false); }
  };

  const handlePublishPost = async (postData) => {
    try {
      const created = await apiServerClient.post('/posts', postData);
      setPosts((prev) => [created, ...prev]);
      setShowWriteForm(false);
    } catch (err) {
      // toast shown by apiServerClient
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      await apiServerClient.delete(`/posts/${postId}`);
      setPosts((prev) => prev.filter((p) => p.id !== postId));
    } catch (_) {}
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-pink-400" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="max-w-xl mx-auto px-4 py-12 text-center">
        <p className="text-destructive">{error || 'Profile not found.'}</p>
      </div>
    );
  }

  const haveSkills = skills.filter((s) => s.skillType === 'have');
  const wantSkills = skills.filter((s) => s.skillType === 'want');
  const memberSince = profile.createdAt
    ? new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : null;

  return (
    <div className="min-h-screen bg-background">

      {/* ── Cover banner ──────────────────────────────────────────────────── */}
      <div className="relative h-44 md:h-56 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-pink-600/30 via-purple-900/60 to-background" />
        {/* Ambient orbs */}
        <div className="absolute -top-10 left-1/3 w-80 h-80 bg-pink-500/15 rounded-full blur-3xl" />
        <div className="absolute -top-16 right-1/4 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl" />
        {/* Subtle grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      <div className="max-w-2xl mx-auto px-4 -mt-20 relative z-10 pb-16">

        {/* ── Header card ───────────────────────────────────────────────────── */}
        <div className="rounded-2xl bg-card/90 backdrop-blur-md border border-white/8 p-6 mb-5 shadow-xl shadow-black/20">

          {/* Top row: avatar + name + actions */}
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="p-0.5 rounded-full bg-gradient-to-br from-pink-500 to-purple-600">
                <Avatar className="h-20 w-20 ring-2 ring-background">
                  <AvatarImage src={avatarFile ? URL.createObjectURL(avatarFile) : profile.avatarUrl} />
                  <AvatarFallback className="text-2xl bg-gradient-to-br from-pink-600 to-purple-700 text-white">
                    {profile.name?.[0] ?? '?'}
                  </AvatarFallback>
                </Avatar>
              </div>
              {editing && (
                <label className="absolute -bottom-1 -right-1 bg-gradient-to-br from-pink-500 to-purple-600 text-white rounded-full p-1.5 cursor-pointer shadow-lg border-2 border-background">
                  <Pencil className="h-3 w-3" />
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => setAvatarFile(e.target.files[0])} />
                </label>
              )}
            </div>

            {/* Name / email / rating */}
            <div className="flex-1 min-w-0 pt-1">
              {editing ? (
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="text-xl font-bold mb-1 h-9 bg-white/5"
                />
              ) : (
                <h1 className="text-2xl font-bold text-white truncate">{profile.name}</h1>
              )}

              <p className="text-sm text-muted-foreground truncate">{profile.email}</p>

              {profile.avgRating != null && (
                <div className="flex items-center gap-1.5 mt-1.5">
                  <StarRating value={Math.round(profile.avgRating)} size="sm" />
                  <span className="text-xs text-muted-foreground">
                    {profile.avgRating.toFixed(1)} · {profile.reviewCount} review{profile.reviewCount !== 1 ? 's' : ''}
                  </span>
                </div>
              )}

              {memberSince && (
                <div className="flex items-center gap-1 mt-1.5 text-xs text-muted-foreground/70">
                  <Calendar className="h-3 w-3" />
                  Joined {memberSince}
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 flex-shrink-0 pt-1">
              {!isOwnProfile && <FavoriteButton userId={profile._id} variant="full" />}
              {isOwnProfile && !editing && (
                <Button
                  size="sm"
                  onClick={() => setEditing(true)}
                  className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white border-0 shadow-md shadow-pink-900/30"
                >
                  <Pencil className="h-3.5 w-3.5 mr-1.5" /> Edit profile
                </Button>
              )}
              {isOwnProfile && editing && (
                <>
                  <Button
                    size="sm"
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white border-0"
                  >
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => { setEditing(false); setEditBio(profile.bio || ''); setEditName(profile.name || ''); setAvatarFile(null); }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-white/5 my-5" />

          {/* Stats row */}
          <div className="grid grid-cols-4 gap-2">
            {[
              {
                icon: <BookOpen className="h-4 w-4 text-pink-400" />,
                value: isOwnProfile ? haveSkills.length : (profile.skillsOffered?.length || 0),
                label: 'Teaching',
                color: 'from-pink-900/30 to-purple-900/20 border-pink-500/10',
              },
              {
                icon: <Target className="h-4 w-4 text-purple-400" />,
                value: isOwnProfile ? wantSkills.length : (profile.skillsWanted?.length || 0),
                label: 'Learning',
                color: 'from-purple-900/30 to-pink-900/20 border-purple-500/10',
              },
              {
                icon: <FileText className="h-4 w-4 text-pink-300" />,
                value: posts.length,
                label: 'Posts',
                color: 'from-pink-900/30 to-purple-900/20 border-pink-500/10',
              },
              {
                icon: <Star className="h-4 w-4 text-amber-400" />,
                value: profile.avgRating ? profile.avgRating.toFixed(1) : '—',
                label: 'Rating',
                color: 'from-amber-900/20 to-orange-900/10 border-amber-500/10',
              },
            ].map(({ icon, value, label, color }) => (
              <div key={label} className={`rounded-xl bg-gradient-to-br ${color} border p-3 text-center`}>
                <div className="flex justify-center mb-1">{icon}</div>
                <p className="text-base font-bold text-white leading-none mb-0.5">{value}</p>
                <p className="text-[10px] text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>

          {saveError && <p className="text-destructive text-sm mt-3">{saveError}</p>}
        </div>

        {/* ── Bio ───────────────────────────────────────────────────────────── */}
        <div className="rounded-2xl bg-card border border-white/8 p-5 mb-5">
          <h2 className="text-xs font-semibold text-pink-400 uppercase tracking-widest mb-3">About</h2>
          {editing ? (
            <Textarea
              value={editBio}
              onChange={(e) => setEditBio(e.target.value)}
              rows={4}
              maxLength={500}
              placeholder="Tell others about yourself, your background, and what you love to do…"
              className="bg-white/5 border-white/10 resize-none"
            />
          ) : (
            <p className="text-sm text-muted-foreground leading-relaxed">
              {profile.bio || (isOwnProfile
                ? 'You haven\'t added a bio yet. Click "Edit profile" to introduce yourself.'
                : 'This person hasn\'t added a bio yet.')}
            </p>
          )}
        </div>

        {/* ── Skills ────────────────────────────────────────────────────────── */}
        <div className="rounded-2xl bg-card border border-white/8 p-5 mb-5">
          <h2 className="text-xs font-semibold text-pink-400 uppercase tracking-widest mb-4">Skills</h2>

          {isOwnProfile ? (
            <div className="space-y-5">
              {/* Can teach */}
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
                  <BookOpen className="h-3.5 w-3.5 text-pink-400" /> Can teach
                </p>
                <div className="flex flex-wrap gap-2 mb-2 min-h-[28px]">
                  {haveSkills.length === 0
                    ? <span className="text-xs text-muted-foreground/60">No skills added yet.</span>
                    : haveSkills.map((s) => (
                        <Badge key={s.id || s._id} className="flex items-center gap-1 pr-1 bg-pink-500/15 text-pink-300 border border-pink-500/25 hover:bg-pink-500/25">
                          {s.skillName}
                          <button onClick={() => removeSkill(s.id || s._id)} className="ml-1 hover:text-white transition-colors">
                            <X className="h-2.5 w-2.5" />
                          </button>
                        </Badge>
                      ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newHaveSkill}
                    onChange={(e) => setNewHaveSkill(e.target.value)}
                    placeholder="e.g. React, Photography…"
                    className="h-8 text-sm bg-white/5 border-white/10"
                    onKeyDown={(e) => e.key === 'Enter' && handleAddSkill(newHaveSkill, 'have')}
                  />
                  <Button size="sm" onClick={() => handleAddSkill(newHaveSkill, 'have')} disabled={addingSkill || !newHaveSkill.trim()}
                    className="h-8 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white border-0">
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              {/* Wants to learn */}
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
                  <Target className="h-3.5 w-3.5 text-purple-400" /> Wants to learn
                </p>
                <div className="flex flex-wrap gap-2 mb-2 min-h-[28px]">
                  {wantSkills.length === 0
                    ? <span className="text-xs text-muted-foreground/60">No skills added yet.</span>
                    : wantSkills.map((s) => (
                        <Badge key={s.id || s._id} variant="outline" className="flex items-center gap-1 pr-1 border-purple-500/25 text-purple-300">
                          {s.skillName}
                          <button onClick={() => removeSkill(s.id || s._id)} className="ml-1 hover:text-white transition-colors">
                            <X className="h-2.5 w-2.5" />
                          </button>
                        </Badge>
                      ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newWantSkill}
                    onChange={(e) => setNewWantSkill(e.target.value)}
                    placeholder="e.g. Public speaking, Excel…"
                    className="h-8 text-sm bg-white/5 border-white/10"
                    onKeyDown={(e) => e.key === 'Enter' && handleAddSkill(newWantSkill, 'want')}
                  />
                  <Button size="sm" variant="outline" onClick={() => handleAddSkill(newWantSkill, 'want')} disabled={addingSkill || !newWantSkill.trim()}
                    className="h-8 border-purple-500/25 text-purple-300 hover:bg-purple-500/10">
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {profile.skillsOffered?.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
                    <BookOpen className="h-3.5 w-3.5 text-pink-400" /> Can teach
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {profile.skillsOffered.map((s) => (
                      <Badge key={s} className="bg-pink-500/15 text-pink-300 border border-pink-500/25">{s}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {profile.skillsWanted?.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
                    <Target className="h-3.5 w-3.5 text-purple-400" /> Wants to learn
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {profile.skillsWanted.map((s) => (
                      <Badge key={s} variant="outline" className="border-purple-500/25 text-purple-300">{s}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Community Contributions ────────────────────────────────────────── */}
        <div className="rounded-2xl bg-card border border-white/8 p-5 mb-5">
          <div className="flex items-center justify-between mb-1">
            <div>
              <h2 className="text-xs font-semibold text-pink-400 uppercase tracking-widest">Community Posts</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {isOwnProfile
                  ? 'Share tips, lessons, and ideas with the community.'
                  : `${profile.name?.split(' ')[0]} has shared ${posts.length} post${posts.length !== 1 ? 's' : ''}.`}
              </p>
            </div>
            {isOwnProfile && !showWriteForm && (
              <Button
                size="sm"
                onClick={() => setShowWriteForm(true)}
                className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white border-0 text-xs"
              >
                <Pencil className="h-3.5 w-3.5 mr-1.5" /> Write a post
              </Button>
            )}
          </div>

          {/* Write form */}
          {showWriteForm && (
            <div className="mt-4">
              <WriteBlogForm
                onSubmit={handlePublishPost}
                onCancel={() => setShowWriteForm(false)}
              />
            </div>
          )}

          {/* Posts list */}
          {postsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-pink-400" />
            </div>
          ) : posts.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-10 text-center">
              <div className="w-10 h-10 rounded-full bg-pink-500/10 border border-pink-500/20 flex items-center justify-center mb-1">
                <Globe className="h-5 w-5 text-pink-400" />
              </div>
              <p className="text-sm font-medium text-white">
                {isOwnProfile ? 'Nothing published yet' : 'No posts yet'}
              </p>
              <p className="text-xs text-muted-foreground max-w-xs">
                {isOwnProfile
                  ? 'Write your first post — a tip, a project breakdown, a lesson you wish you knew earlier.'
                  : 'Check back later.'}
              </p>
              {isOwnProfile && !showWriteForm && (
                <Button
                  size="sm"
                  onClick={() => setShowWriteForm(true)}
                  variant="outline"
                  className="mt-2 border-pink-500/30 text-pink-400 hover:bg-pink-500/10"
                >
                  <Plus className="h-3.5 w-3.5 mr-1" /> Write your first post
                </Button>
              )}
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {posts.map((post) => (
                <BlogCard
                  key={post.id || post._id}
                  post={post}
                  isOwn={isOwnProfile}
                  onDelete={handleDeletePost}
                />
              ))}
            </div>
          )}
        </div>

        {/* ── Reviews ───────────────────────────────────────────────────────── */}
        <div className="rounded-2xl bg-card border border-white/8 p-5">
          <h2 className="text-xs font-semibold text-pink-400 uppercase tracking-widest mb-4">Reviews</h2>
          <ReviewsSection profileUserId={profile._id} />
        </div>

      </div>
    </div>
  );
}
