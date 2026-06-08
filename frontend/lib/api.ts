export interface FeedSource {
  articleId: string;
  publisherName: string;
  publisherDomain: string;
  biasLabel: string;
  biasScore: number;
  tone: string | null;
  url: string;
  title: string;
}

export interface FeedStory {
  id: string;
  title: string;
  summary: string | null;
  sourceCount: number;
  sources: FeedSource[];
  biasDistribution: Record<string, number>;
  toneDistribution: Record<string, number>;
  missingBiasLabels: string[];
  uniqueFactsByPublisher: Array<{ publisher: string; facts: string[] }>;
  publishedAt: string;
}

export interface FeedDispatch {
  articleId: string;
  storyId: string;
  storyTitle: string;
  title: string;
  publisherName: string;
  publisherDomain: string;
  biasLabel: string;
  publishedAt: string;
}

export interface FeedBlindspot {
  storyId: string;
  storyTitle: string;
  missingBiasLabels: string[];
  coveredBy: Array<{ publisherName: string; biasLabel: string }>;
}

export interface HomepageFeed {
  hero: FeedStory | null;
  comparison: FeedStory[];
  dispatches: FeedDispatch[];
  blindspots: FeedBlindspot[];
  generatedAt: string;
}

const API_BASE = process.env.API_BASE ?? 'http://localhost:3000';

export async function getHomepageFeed(): Promise<HomepageFeed> {
  const res = await fetch(`${API_BASE}/feed/homepage`, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error(`Failed to load homepage feed: ${res.status}`);
  }
  return res.json();
}

export interface ComparisonPerspective {
  articleId: string;
  publisherName: string;
  publisherDomain: string;
  biasLabel: string;
  biasScore: number;
  tone: string | null;
  url: string;
  title: string;
  coreFacts: string[];
  editorialReading: string | null;
  excerpt: string | null;
}

export interface StoryComparison {
  id: string;
  title: string;
  summary: string | null;
  publishedAt: string;
  sourceCount: number;
  biasDistribution: Record<string, number>;
  toneDistribution: Record<string, number>;
  missingBiasLabels: string[];
  uniqueFactsByPublisher: Array<{ publisher: string; facts: string[] }>;
  perspectives: ComparisonPerspective[];
  sharedFacts: string[];
}

export async function getStoryComparison(id: string): Promise<StoryComparison | null> {
  const res = await fetch(`${API_BASE}/feed/story/${id}`, { cache: 'no-store' });
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`Failed to load story comparison: ${res.status}`);
  }
  return res.json();
}
