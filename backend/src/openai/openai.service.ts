import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { parseModelJson } from '../common/json.utils';
import { clipText, keywordOverlap, tokenize, uniqueTokens } from '../common/text.utils';

export interface AnalysisPayload {
  storyTitle: string;
  storySummary?: string | null;
  publisherName: string;
  publisherBiasLabel: string;
  articleTitle: string;
  articleText: string;
}

export interface AnalysisResult {
  coreFacts: string[];
  editorialReading: string;
  tone: string;
}

@Injectable()
export class OpenAiService {
  private readonly logger = new Logger(OpenAiService.name);

  constructor(private readonly configService: ConfigService) {}

  async analyzeArticle(payload: AnalysisPayload): Promise<AnalysisResult> {
    const apiKey = this.configService.get<string>('app.openAiApiKey', '');
    if (!apiKey) {
      this.logger.warn(
        `OPENAI_API_KEY not set — using fallback analysis for ${payload.publisherName}`,
      );
      return this.buildFallback(payload);
    }

    const client = new OpenAI({ apiKey });
    const model = this.configService.get<string>('app.openAiModel', 'gpt-5-mini');
    const prompt = this.buildPrompt(payload);

    try {
      const response = await client.responses.create({
        model,
        input: prompt,
      });

      const text = response.output_text ?? '';
      const parsed = parseModelJson<AnalysisResult>(text);
      if (!parsed) {
        this.logger.warn(
          `OpenAI returned unparseable JSON for ${payload.publisherName} (model=${model}). Raw: ${text.slice(0, 300)}`,
        );
        return this.buildFallback(payload);
      }

      return this.sanitizeResult(parsed, payload);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error(
        `OpenAI call failed for ${payload.publisherName} (model=${model}): ${message}`,
      );
      return this.buildFallback(payload);
    }
  }

  private buildPrompt(payload: AnalysisPayload): string {
    return `
Voce e um editor critico comparando coberturas. Analise como o veiculo abaixo enquadrou a noticia e retorne apenas JSON valido.

Formato:
{
  "coreFacts": ["fato 1", "fato 2", "fato 3"],
  "editorialReading": "2 a 3 frases diretas sobre o enquadramento deste veiculo",
  "tone": "tom em ate 4 palavras"
}

Regras de editorialReading:
- 2 a 3 frases, no maximo ~70 palavras no total.
- Seja direto: o que este veiculo ENFATIZA, quem ele CENTRALIZA como protagonista, o que ele MINIMIZA ou DEIXA DE FORA, e que linguagem ou angulo distintivo usa.
- Nao seja neutro nem genericamente descritivo. Aponte a lente editorial em primeiro plano.
- Nao acuse de "viés" sem evidencia: justifique com escolhas concretas do texto.
- Escreva em portugues, sem markdown.

Regras gerais:
- Liste de 3 a 5 fatos centrais verificaveis em coreFacts.
- tone em ate 4 palavras (ex.: "critico", "elogioso", "tecnico-investigativo").
- Nao inclua texto fora do JSON.

Contexto da historia:
Titulo: ${payload.storyTitle}
Resumo: ${payload.storySummary ?? 'Sem resumo canonico.'}

Contexto do veiculo:
Nome: ${payload.publisherName}
Espectro declarado: ${payload.publisherBiasLabel}

Artigo deste veiculo:
Titulo: ${payload.articleTitle}
Texto: ${clipText(payload.articleText, 12000)}
    `.trim();
  }

  private sanitizeResult(result: AnalysisResult, payload: AnalysisPayload): AnalysisResult {
    const coreFacts = Array.isArray(result.coreFacts)
      ? result.coreFacts
          .map((fact) => fact.trim())
          .filter(Boolean)
          .slice(0, 5)
      : [];

    const editorialReading = typeof result.editorialReading === 'string'
      ? clipText(result.editorialReading.trim(), 600)
      : '';

    const tone = result.tone?.trim() || this.buildFallback(payload).tone;

    if (coreFacts.length === 0 || !editorialReading) {
      this.logger.warn(
        `Sanitized OpenAI result is incomplete for ${payload.publisherName} ` +
          `(coreFacts=${coreFacts.length}, editorialReading=${editorialReading ? 'set' : 'empty'}) — using fallback`,
      );
      return this.buildFallback(payload);
    }

    return {
      coreFacts,
      editorialReading,
      tone,
    };
  }

  private buildFallback(payload: AnalysisPayload): AnalysisResult {
    const sentences = payload.articleText
      .split(/(?<=[.!?])\s+/)
      .map((sentence) => sentence.trim())
      .filter(Boolean);

    const coreFacts = sentences.slice(0, 3).map((sentence) => clipText(sentence, 180));
    const storyTokens = uniqueTokens(tokenize(`${payload.storyTitle} ${payload.storySummary ?? ''}`));
    const articleTokens = uniqueTokens(tokenize(`${payload.articleTitle} ${payload.articleText}`));
    const overlaps = keywordOverlap(storyTokens, articleTokens).slice(0, 4);

    const lensHint = overlaps.length > 0 ? overlaps.join(', ') : payload.articleTitle;
    const editorialReading = `Cobertura de ${payload.publisherName} (${payload.publisherBiasLabel}) com foco em ${lensHint}. Análise editorial automática indisponível — texto bruto resumido a partir do artigo.`;

    return {
      coreFacts: coreFacts.length > 0 ? coreFacts : [clipText(payload.articleTitle, 180)],
      editorialReading,
      tone: this.deriveTone(payload.articleText),
    };
  }

  private deriveTone(text: string): string {
    const lowered = text.toLowerCase();
    if (/(critica|denuncia|ataque|grave|crise)/.test(lowered)) {
      return 'crítico';
    }
    if (/(aplaude|celebra|avanço|vitória|sucesso)/.test(lowered)) {
      return 'favorável';
    }
    return 'informativo';
  }
}
