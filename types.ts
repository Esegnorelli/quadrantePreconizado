export interface Session {
  loggedIn: boolean;
  email: string;
}

export interface Loja {
  id: string;
  nome: string;
}

export interface Movimentacao {
  id: string;
  dataISO: string;
  lojaId: string;
  faturamento: number;
  preconizado: number;
  padronizacao: number;
  layout: number;
  cultura: number;
}

export interface Settings {
  metaFaturamento: number;
  metaPreconizado: number;
}

export enum Page {
  Quadrante = 'quadrante',
  Registros = 'registros',
  Lojas = 'lojas',
}
