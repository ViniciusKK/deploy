-- CreateEnum
CREATE TYPE "CandidateArticleStatus" AS ENUM ('PENDING', 'FETCHED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ExtractionStatus" AS ENUM ('PENDING', 'READY', 'FAILED');

-- CreateEnum
CREATE TYPE "ClusterStatus" AS ENUM ('PENDING', 'LINKED', 'REJECTED');

-- CreateEnum
CREATE TYPE "AnalysisStatus" AS ENUM ('PENDING', 'READY', 'FAILED');

-- CreateEnum
CREATE TYPE "LinkDecision" AS ENUM ('MATCH', 'NO_MATCH', 'NEEDS_REVIEW');

-- CreateTable
CREATE TABLE "publishers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "biasLabel" TEXT NOT NULL,
    "biasScore" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "publishers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stories" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "canonicalSummary" TEXT,
    "seedKeywordsJson" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "candidate_articles" (
    "id" TEXT NOT NULL,
    "storyId" TEXT NOT NULL,
    "publisherId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "status" "CandidateArticleStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "candidate_articles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "articles" (
    "id" TEXT NOT NULL,
    "publisherId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "extractionStatus" "ExtractionStatus" NOT NULL DEFAULT 'PENDING',
    "clusterStatus" "ClusterStatus" NOT NULL DEFAULT 'PENDING',
    "analysisStatus" "AnalysisStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "articles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "article_raw_contents" (
    "articleId" TEXT NOT NULL,
    "rawHtml" TEXT,
    "extractedText" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "article_raw_contents_pkey" PRIMARY KEY ("articleId")
);

-- CreateTable
CREATE TABLE "story_article_links" (
    "id" TEXT NOT NULL,
    "storyId" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "decision" "LinkDecision" NOT NULL,
    "rationale" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "story_article_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "article_analyses" (
    "id" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "coreFactsJson" JSONB NOT NULL,
    "framingSignalsJson" JSONB NOT NULL,
    "tone" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "article_analyses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "story_aggregations" (
    "id" TEXT NOT NULL,
    "storyId" TEXT NOT NULL,
    "distributionJson" JSONB NOT NULL,
    "blindspotsJson" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "story_aggregations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "publishers_domain_key" ON "publishers"("domain");

-- CreateIndex
CREATE UNIQUE INDEX "candidate_articles_url_key" ON "candidate_articles"("url");

-- CreateIndex
CREATE INDEX "candidate_articles_storyId_idx" ON "candidate_articles"("storyId");

-- CreateIndex
CREATE INDEX "candidate_articles_publisherId_idx" ON "candidate_articles"("publisherId");

-- CreateIndex
CREATE UNIQUE INDEX "articles_url_key" ON "articles"("url");

-- CreateIndex
CREATE INDEX "articles_publisherId_idx" ON "articles"("publisherId");

-- CreateIndex
CREATE INDEX "story_article_links_storyId_idx" ON "story_article_links"("storyId");

-- CreateIndex
CREATE INDEX "story_article_links_articleId_idx" ON "story_article_links"("articleId");

-- CreateIndex
CREATE UNIQUE INDEX "story_article_links_storyId_articleId_key" ON "story_article_links"("storyId", "articleId");

-- CreateIndex
CREATE INDEX "article_analyses_articleId_idx" ON "article_analyses"("articleId");

-- CreateIndex
CREATE INDEX "story_aggregations_storyId_idx" ON "story_aggregations"("storyId");

-- AddForeignKey
ALTER TABLE "candidate_articles" ADD CONSTRAINT "candidate_articles_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES "stories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidate_articles" ADD CONSTRAINT "candidate_articles_publisherId_fkey" FOREIGN KEY ("publisherId") REFERENCES "publishers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "articles" ADD CONSTRAINT "articles_publisherId_fkey" FOREIGN KEY ("publisherId") REFERENCES "publishers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "article_raw_contents" ADD CONSTRAINT "article_raw_contents_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "story_article_links" ADD CONSTRAINT "story_article_links_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES "stories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "story_article_links" ADD CONSTRAINT "story_article_links_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "article_analyses" ADD CONSTRAINT "article_analyses_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "story_aggregations" ADD CONSTRAINT "story_aggregations_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES "stories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
