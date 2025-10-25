'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface SocialPost {
  id: string;
  platform: 'Facebook' | 'Instagram' | 'LinkedIn' | 'Twitter';
  content: string;
  hashtags: string[];
  emojis: string;
  cta: string;
  characterCount: number;
  bestTimeToPost: string;
  engagementTips: string[];
}

// Legacy format support
interface LegacySocialPost {
  platform: string;
  copy: string;
  cta: string;
}

interface SocialMediaManagerProps {
  demoId: string;
  initialPosts?: (SocialPost | LegacySocialPost)[];
}

const platformColors = {
  Facebook: 'from-blue-600 to-blue-700',
  Instagram: 'from-pink-600 via-purple-600 to-orange-500',
  LinkedIn: 'from-blue-700 to-blue-800',
  Twitter: 'from-sky-500 to-sky-600',
};

const platformIcons = {
  Facebook: '📘',
  Instagram: '📸',
  LinkedIn: '💼',
  Twitter: '🐦',
};

const platformLimits = {
  Facebook: 63206,
  Instagram: 2200,
  LinkedIn: 3000,
  Twitter: 280,
};

export default function SocialMediaManager({ demoId, initialPosts = [] }: SocialMediaManagerProps) {
  const [selectedPlatform, setSelectedPlatform] = useState<'Facebook' | 'Instagram' | 'LinkedIn' | 'Twitter'>('Facebook');
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedVariation, setSelectedVariation] = useState<number>(0);

  const platforms: Array<'Facebook' | 'Instagram' | 'LinkedIn' | 'Twitter'> = ['Facebook', 'Instagram', 'LinkedIn', 'Twitter'];

  // Convert legacy posts to new format
  const convertLegacyPost = (post: LegacySocialPost): SocialPost => {
    const platform = post.platform as 'Facebook' | 'Instagram' | 'LinkedIn' | 'Twitter';
    return {
      id: `legacy-${platform}-${Date.now()}`,
      platform,
      content: post.copy || '',
      hashtags: [],
      emojis: '',
      cta: post.cta || '',
      characterCount: (post.copy || '').length,
      bestTimeToPost: 'Not specified',
      engagementTips: [],
    };
  };

  // Initialize posts from initialPosts prop
  useEffect(() => {
    if (initialPosts.length > 0) {
      const convertedPosts = initialPosts.map((post) => {
        // Check if it's already in the new format
        if ('content' in post && 'hashtags' in post) {
          return post as SocialPost;
        }
        // Convert legacy format
        return convertLegacyPost(post as LegacySocialPost);
      });
      setPosts(convertedPosts);
    }
  }, [initialPosts]);

  // Filter posts by selected platform
  const platformPosts = posts.filter(post => post.platform === selectedPlatform);

  // Generate new posts for a platform
  const handleGenerate = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/social-media/${demoId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform: selectedPlatform,
          regenerate: true,
        }),
      });

      if (!response.ok) throw new Error('Failed to generate posts');

      const data = await response.json();
      setPosts(prev => [
        ...prev.filter(p => p.platform !== selectedPlatform),
        ...data.posts,
      ]);
      setSelectedVariation(0);
    } catch (error) {
      console.error('Error generating posts:', error);
      alert('Failed to generate posts. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Copy to clipboard
  const handleCopy = async (post: SocialPost) => {
    const fullPost = `${post.content}\n\n${post.hashtags.map(h => `#${h}`).join(' ')}\n\n${post.cta}`;
    try {
      await navigator.clipboard.writeText(fullPost);
      setCopiedId(post.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  // Load posts on mount
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch(`/api/social-media/${demoId}`);
        if (response.ok) {
          const data = await response.json();
          if (data.posts && data.posts.length > 0) {
            setPosts(data.posts);
          }
        }
      } catch (error) {
        console.error('Error fetching posts:', error);
      }
    };

    if (initialPosts.length === 0) {
      fetchPosts();
    }
  }, [demoId, initialPosts.length]);

  const currentPost = platformPosts[selectedVariation];
  const characterLimit = platformLimits[selectedPlatform];
  const isOverLimit = currentPost ? currentPost.characterCount > characterLimit : false;

  return (
    <div className="w-full rounded-3xl border border-white/10 bg-slate-950/50 p-8 backdrop-blur-sm">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white">Social Media Manager</h2>
        <p className="mt-2 text-slate-400">Production-ready posts tailored to your business</p>
      </div>

      {/* Platform Tabs */}
      <div className="mb-8 flex flex-wrap gap-2">
        {platforms.map(platform => (
          <button
            key={platform}
            onClick={() => {
              setSelectedPlatform(platform);
              setSelectedVariation(0);
            }}
            className={`rounded-full px-6 py-3 text-sm font-semibold transition-all ${
              selectedPlatform === platform
                ? 'bg-linear-to-r text-white shadow-lg ' + platformColors[platform]
                : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            {platformIcons[platform]} {platform}
          </button>
        ))}
      </div>

      {/* Generate Button */}
      <div className="mb-6 flex items-center justify-between">
        <div className="text-sm text-slate-400">
          {platformPosts.length > 0
            ? `${platformPosts.length} variation${platformPosts.length > 1 ? 's' : ''} available`
            : 'No posts generated yet'}
        </div>
        <button
          onClick={handleGenerate}
          disabled={loading}
          className={`rounded-full px-6 py-3 text-sm font-semibold text-white transition-all ${
            loading
              ? 'cursor-not-allowed bg-slate-700'
              : 'bg-linear-to-r hover:scale-105 hover:shadow-lg ' + platformColors[selectedPlatform]
          }`}
        >
          {loading ? (
            <>
              <span className="inline-block animate-spin mr-2">⟳</span>
              Generating...
            </>
          ) : (
            <>🔄 {platformPosts.length > 0 ? 'Regenerate' : 'Generate'} Posts</>
          )}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {currentPost ? (
          <motion.div
            key={currentPost.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Variation Selector */}
            {platformPosts.length > 1 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-400">Variation:</span>
                {platformPosts.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedVariation(idx)}
                    className={`h-8 w-8 rounded-full text-sm font-semibold transition-all ${
                      selectedVariation === idx
                        ? 'bg-emerald-500 text-white shadow-lg'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>
            )}

            {/* Post Preview */}
            <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-6">
              <div className="mb-4 flex items-start justify-between">
                <div className={`inline-flex items-center gap-2 rounded-full bg-linear-to-r px-4 py-2 text-sm font-semibold text-white ${platformColors[selectedPlatform]}`}>
                  {platformIcons[selectedPlatform]} {selectedPlatform}
                </div>
                <button
                  onClick={() => handleCopy(currentPost)}
                  className="rounded-full bg-slate-800 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-slate-700 hover:shadow-lg"
                >
                  {copiedId === currentPost.id ? '✓ Copied!' : '📋 Copy'}
                </button>
              </div>

              <div className="space-y-4 text-white">
                <p className="whitespace-pre-wrap text-base leading-relaxed">{currentPost.content}</p>

                {currentPost.hashtags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {currentPost.hashtags.map((tag, idx) => (
                      <span key={idx} className="rounded-full bg-blue-500/20 px-3 py-1 text-sm text-blue-300">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4">
                  <p className="text-sm font-semibold text-emerald-300">Call to Action:</p>
                  <p className="mt-1 text-sm text-emerald-200">{currentPost.cta}</p>
                </div>
              </div>

              {/* Character Count */}
              <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
                <div className={`text-sm ${isOverLimit ? 'text-red-400' : 'text-slate-400'}`}>
                  {currentPost.characterCount} / {characterLimit} characters
                  {isOverLimit && ' (Over limit!)'}
                </div>
                <div className={`h-2 w-32 rounded-full bg-slate-700 overflow-hidden`}>
                  <div
                    className={`h-full transition-all ${
                      isOverLimit ? 'bg-red-500' : 'bg-emerald-500'
                    }`}
                    style={{
                      width: `${Math.min((currentPost.characterCount / characterLimit) * 100, 100)}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Best Time to Post */}
            <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-6">
              <h3 className="mb-3 text-lg font-semibold text-white">📅 Best Time to Post</h3>
              <p className="text-slate-300">{currentPost.bestTimeToPost}</p>
            </div>

            {/* Engagement Tips */}
            <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-6">
              <h3 className="mb-4 text-lg font-semibold text-white">💡 Engagement Tips</h3>
              <ul className="space-y-2">
                {currentPost.engagementTips.map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-xs font-bold text-emerald-400">
                      {idx + 1}
                    </span>
                    <span className="text-slate-300">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/20 bg-slate-900/30 py-16 text-center"
          >
            <div className="text-6xl mb-4">{platformIcons[selectedPlatform]}</div>
            <p className="text-lg font-semibold text-white">No {selectedPlatform} posts yet</p>
            <p className="mt-2 text-sm text-slate-400">Click "Generate Posts" to create production-ready content</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
