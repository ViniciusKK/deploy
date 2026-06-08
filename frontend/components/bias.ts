export type BiasLabel =
  | 'LEFT'
  | 'LEAN_LEFT'
  | 'CENTER'
  | 'LEAN_RIGHT'
  | 'RIGHT'
  | string;

export function biasColorClass(label: string): string {
  switch (label.toUpperCase()) {
    case 'LEFT':
      return 'bg-bias-left';
    case 'LEAN_LEFT':
      return 'bg-bias-lean-left';
    case 'CENTER':
      return 'bg-bias-center';
    case 'LEAN_RIGHT':
      return 'bg-bias-lean-right';
    case 'RIGHT':
      return 'bg-bias-right';
    default:
      return 'bg-subtle-foreground';
  }
}

export function biasBorderClass(label: string): string {
  switch (label.toUpperCase()) {
    case 'LEFT':
      return 'border-bias-left';
    case 'LEAN_LEFT':
      return 'border-bias-lean-left';
    case 'CENTER':
      return 'border-bias-center';
    case 'LEAN_RIGHT':
      return 'border-bias-lean-right';
    case 'RIGHT':
      return 'border-bias-right';
    default:
      return 'border-subtle-foreground';
  }
}

export function biasTextColorClass(label: string): string {
  switch (label.toUpperCase()) {
    case 'LEFT':
      return 'text-bias-left';
    case 'LEAN_LEFT':
      return 'text-bias-lean-left';
    case 'CENTER':
      return 'text-bias-center';
    case 'LEAN_RIGHT':
      return 'text-bias-lean-right';
    case 'RIGHT':
      return 'text-bias-right';
    default:
      return 'text-subtle-foreground';
  }
}

export function biasLabelPt(label: string): string {
  switch (label.toUpperCase()) {
    case 'LEFT':
      return 'Esquerda';
    case 'LEAN_LEFT':
      return 'Centro-esquerda';
    case 'CENTER':
      return 'Centro';
    case 'LEAN_RIGHT':
      return 'Centro-direita';
    case 'RIGHT':
      return 'Direita';
    default:
      return label;
  }
}

export const BIAS_ORDER: string[] = ['LEFT', 'LEAN_LEFT', 'CENTER', 'LEAN_RIGHT', 'RIGHT'];
