# ESPECTRO — Backend MVP (Worker + API)

## Visão Geral
Sistema para descoberta, análise e comparação de notícias por espectro político.

Pipeline:
1. Descoberta
2. Extração
3. Clustering
4. Análise (LLM)
5. Agregação

---

## Stack
- Node.js + TypeScript
- NestJS
- PostgreSQL
- Redis + BullMQ
- Prisma

---

## Entidades

### publishers
- id
- name
- domain
- bias_label
- bias_score

### stories
- id
- title
- canonical_summary
- seed_keywords_json

### candidate_articles
- id
- story_id
- publisher_id
- url
- status

### articles
- id
- publisher_id
- title
- extraction_status
- cluster_status
- analysis_status

### article_raw_contents
- article_id
- raw_html
- extracted_text

### story_article_links
- story_id
- article_id
- decision

### article_analyses
- article_id
- core_facts_json
- framing_signals_json
- tone

### story_aggregations
- story_id
- distribution_json
- blindspots_json

---

## Filas
- story.discovery
- candidate.fetch
- article.extract
- story.cluster
- article.analyze
- story.aggregate

---

## Endpoints principais

### Stories
POST /stories  
GET /stories  
GET /stories/:id  

### Articles
POST /articles/manual  
POST /articles/:id/raw-text  
POST /articles/:id/extract  

### Clustering
POST /stories/:storyId/cluster/:articleId  

### Analysis
POST /stories/:storyId/articles/:articleId/analyze  

### Aggregation
POST /stories/:id/aggregate  
GET /stories/:id/aggregation  

---

## Princípios
- Tudo reprocessável
- Permitir override manual
- Separar etapas

---

## Objetivo do MVP
Comparar cobertura da mesma notícia em diferentes espectros políticos.
