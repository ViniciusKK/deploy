export const QUEUE_NAMES = {
  STORY_DISCOVERY: 'story.discovery',
  CANDIDATE_FETCH: 'candidate.fetch',
  ARTICLE_EXTRACT: 'article.extract',
  STORY_CLUSTER: 'story.cluster',
  ARTICLE_ANALYZE: 'article.analyze',
  STORY_AGGREGATE: 'story.aggregate',
} as const;

export const LINK_DECISION_VALUES = ['MATCH', 'NO_MATCH', 'NEEDS_REVIEW'] as const;
export type LinkDecisionValue = (typeof LINK_DECISION_VALUES)[number];

export interface StoryDiscoveryJob {
  storyId: string;
}

export interface CandidateFetchJob {
  candidateArticleId: string;
}

export interface ArticleExtractJob {
  articleId: string;
}

export interface StoryClusterJob {
  storyId: string;
  articleId: string;
}

export interface ArticleAnalyzeJob {
  storyId: string;
  articleId: string;
}

export interface StoryAggregateJob {
  storyId: string;
}
