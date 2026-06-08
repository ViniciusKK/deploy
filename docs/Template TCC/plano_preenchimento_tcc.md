# Plano de preenchimento do template TCC

## Artefato criado
- Cópia de trabalho do template: `Template_TCC_Inteli Empreendedor - preenchimento.docx`

## Recorte do que o repositório já sustenta
O repositório descreve e implementa um MVP chamado **Espectro API**, com backend em NestJS + TypeScript, banco PostgreSQL com Prisma, filas BullMQ/Redis, integração com OpenAI e uma interface web em Next.js para consumo das agregações.

Isso sustenta bem o capítulo técnico do TCC e parte da introdução. Já os capítulos de mercado, validação de negócio e plano financeiro não estão materializados no código e precisarão de conteúdo complementar.

## Estratégia de preenchimento
Preencha o documento em quatro passes:

1. **Metadados e pré-textuais**
   - Capa, folha de rosto, resumo, abstract, sumário e listas.
   - Dependem pouco do código e podem ser fechados primeiro.

2. **Base conceitual do projeto**
   - Introdução, contexto, problema, proposta de valor e objetivos.
   - Fontes principais: `README.md` e `espectro_mvp.md`.

3. **Capítulo técnico**
   - Arquitetura, entidades, endpoints, pipeline, filas, frontend e decisões de implementação.
   - Fontes principais: `prisma/schema.prisma`, `src/app.module.ts`, `src/worker/pipeline.processor.ts`, controladores e `web/`.

4. **Capítulos de negócio e validação**
   - Hipóteses de mercado, TAM/SAM/SOM, concorrência, BMC, GTM, projeção financeira, validação com usuários e riscos.
   - Exigem pesquisa externa e evidências que não estão no repositório.

## Plano por seção do template

### 1. Cover / Cover Page / Catalog Card
**Preencher manualmente**
- Nome do aluno
- Título e subtítulo
- Nome do orientador/coorientador
- Cidade e ano

**Observação**
- Nada disso está no repositório.

### 2. Acknowledgments / Epigraph
**Opcional**
- Pode deixar para o final.

### 3. Resumo / Abstract
**Dá para redigir com base no repo**
- Problema: comparação de cobertura jornalística entre espectros políticos.
- Solução: backend MVP que organiza descoberta, extração, clustering, análise e agregação.
- Tecnologias: NestJS, Prisma, PostgreSQL, Redis/BullMQ, OpenAI, Next.js.
- Resultado esperado: consolidar visões divergentes, distribuição por viés e blindspots.

**Falta complementar**
- Resultados quantitativos reais
- Método formal de validação
- Conclusões fechadas

### 4. Lists / Abbreviations / Summary
**Preencher depois do corpo**
- Lista de ilustrações: diagramas de arquitetura, fluxo do pipeline, modelo de dados, telas.
- Lista de tabelas: requisitos, entidades, concorrentes, hipóteses, riscos.
- Acrônimos sugeridos: MVP, API, LLM, KPI, BMC, TAM, SAM, SOM.
- Sumário: atualizar automaticamente no Word ao final.

### 5. Introduction
**Pode ser preenchida majoritariamente com o repo**

**Contexto e motivação**
- Use a proposta do `README.md`: comparar como diferentes linhas editoriais cobrem o mesmo fato.
- Use o `espectro_mvp.md` para explicar o pipeline do produto.

**Problema e proposta de valor**
- Problema: leitura fragmentada da cobertura jornalística e dificuldade de identificar enquadramentos, tons e pontos cegos.
- Proposta de valor: consolidar múltiplas fontes e expor diferenças de narrativa por espectro.

**Objetivos**
- Geral: desenvolver e validar um MVP computacional para comparação de cobertura de notícias.
- Específicos:
  - modelar entidades do domínio;
  - implementar pipeline de processamento;
  - integrar análise com LLM;
  - agregar resultados por viés e tom;
  - exibir resultados em interface web.

**Justificativa**
- Relevância informacional, tecnológica e potencial de uso em análise de mídia.

**Estrutura do trabalho**
- Fechar por último, após os capítulos.

### 6. Solution Development
#### 6.1 Hypotheses
**Só parcialmente suportado pelo repo**

**Pode preencher agora**
- Hipótese de problema: usuários têm dificuldade em comparar a mesma notícia entre veículos de orientações distintas.
- Hipótese de solução: um pipeline automatizado com LLM e agregação por viés melhora essa comparação.

**Ainda falta evidência**
- Hipótese de valor
- Disposição a pagar
- Modelo de monetização validado

#### 6.2 Market Sizing and Analysis
**Não está no repo**
- Exige definição de público-alvo e cálculo de TAM/SAM/SOM.
- Sugestão de recorte inicial: pesquisadores, jornalistas, analistas políticos, assessorias, edtechs e observatórios de mídia.

#### 6.3 Competitive Analysis and Differentials
**Quase todo fora do repo**
- O diferencial técnico inferível do projeto é combinar:
  - pipeline reprocessável;
  - clustering por história;
  - análise estruturada com LLM;
  - agregação com distribuição e blindspots.
- Concorrentes e benchmark precisam de pesquisa externa.

### 7. Technological Solution
**Este é o capítulo mais forte com base no repositório**

**Requisitos e especificações**
- Funcionais:
  - cadastrar stories;
  - cadastrar artigos manualmente;
  - extrair texto;
  - clusterizar artigo em story;
  - analisar artigo;
  - agregar história;
  - consultar agregação.
- Não funcionais:
  - reprocessamento por etapa;
  - separação por filas;
  - persistência estruturada;
  - fallback determinístico sem chave OpenAI.

**Arquitetura**
- Backend modular em NestJS.
- Banco PostgreSQL com Prisma.
- Redis/BullMQ para pipeline assíncrono.
- Serviço OpenAI para análise.
- Frontend Next.js consumindo a API.

**Modelagem de dados**
- Entidades principais:
  - `Publisher`
  - `Story`
  - `CandidateArticle`
  - `Article`
  - `ArticleRawContent`
  - `StoryArticleLink`
  - `ArticleAnalysis`
  - `StoryAggregation`

**Implementação do MVP**
- Etapas do fluxo:
  1. criação da história;
  2. cadastro/ingestão de artigo;
  3. extração;
  4. clustering;
  5. análise;
  6. agregação;
  7. visualização.

**Ponto importante para o texto**
- `story.discovery` e `candidate.fetch` estão stubados no MVP. Isso deve entrar como limitação e decisão de escopo.

**Testes e avaliação técnica**
- O repositório não traz suíte de testes automatizados.
- Você pode reportar avaliação técnica por execução de fluxo com fixtures e validação manual dos endpoints e da interface.

### 8. Business Plan
**Muito pouco material no repo**

**O que dá para inferir**
- Produto digital de análise comparativa de notícias.
- Potenciais clientes institucionais e acadêmicos.

**O que falta produzir fora do código**
- SWOT
- Business Model Canvas
- Go-to-market
- aquisição e retenção
- pricing
- projeções de receita/custo
- investimento inicial
- ROI / break-even

### 9. Validation and Results
**Suporte parcial**

**Pode aproveitar**
- Fixtures em `fixtures/news/` para demonstrar exemplos de processamento.
- Frontend e endpoints para mostrar evidências funcionais.
- Resultado de agregação com distribuição por publisher, bias e tone.
- Blindspots por fatos exclusivos e vieses ausentes.

**Ainda falta**
- protocolo de validação com usuários;
- métricas de negócio;
- feedback estruturado;
- KPIs reais de adoção ou retenção.

### 10. Conclusion
**Preencher por último**
- Retomar problema, solução, escopo entregue, limitações do MVP e próximos passos.
- Próximos passos naturais do repo:
  - automatizar discovery e fetch;
  - ampliar validação;
  - medir qualidade das análises;
  - expandir cobertura do frontend.

### 11. References
**Parte pode sair do repo, parte é externa**

**Referências internas do projeto**
- `README.md`
- `espectro_mvp.md`
- código-fonte do backend e frontend

**Referências externas esperadas**
- NestJS
- Prisma
- BullMQ
- OpenAI API
- ABNT/NBR usadas no template
- literatura sobre viés midiático, framing e análise de notícias

## Ordem recomendada de preenchimento
1. Definir título, subtítulo e autores.
2. Escrever Introdução.
3. Escrever capítulo de Solução Tecnológica.
4. Gerar figuras do fluxo, arquitetura e modelo de dados.
5. Preencher Resumo e Abstract.
6. Completar Business Plan com pesquisa externa.
7. Completar Validation and Results com evidências e métricas.
8. Fechar Conclusão e Referências.
9. Atualizar listas e sumário automáticos no Word.

## Lacunas objetivas que o repo não cobre
- Nome dos autores e orientadores
- Hipóteses de mercado validadas
- Pesquisa com usuários
- Benchmark competitivo formal
- TAM/SAM/SOM
- BMC
- Estratégia comercial
- Projeções financeiras
- KPIs reais de uso

## Próximo passo prático
Se o objetivo for acelerar, o próximo passo correto é preencher primeiro:
- `Introduction`
- `Technological Solution`
- `Validation and Results` (na parte técnica)

Essas são as seções mais sustentadas pelas evidências atuais do repositório.
