export interface Municipio {
  id: number;
  nome: string;
  populacao_base_2005: number | null;
  emissoes_base_2005: number | null;
}

export interface Medida {
  id: string;
  fk_municipio: number;
  municipio_nome: string;
  setor: 'Energia' | 'Transportes' | 'Resíduos' | 'Água' | 'Agroflorestal' | 'Saúde' | 'Proteção Civil';
  tipo_resposta: 'Adaptação' | 'Mitigação' | 'Transversal';
  descricao: string | null;
  objetivos: string | null;
  designacao: string;
  ods_associados: number[];
  num_indicadores?: number;
  indicadores?: Indicador[];
}

export type TipoMeta = 'Contador' | 'Marcos' | 'Binária';

export interface Indicador {
  id: number;
  fk_medida: string;
  nome: string;
  unidade: string;
  tipo_meta: TipoMeta;
  meta_alvo: number | null;
  is_validada: boolean;
  valor_acumulado?: number;
  ultimo_registo?: string;
  execucoes?: Execucao[];
}

export interface Execucao {
  id: number;
  fk_indicador: number;
  ano_referencia: number;
  valor_executado: number;
  fk_user_autor: string;
  url_evidencia: string | null;
  observacoes: string | null;
  data_insercao: string;
  estado_validacao: 'Rascunho' | 'Submetido' | 'Aprovado' | 'Rejeitado';
  nota_rejeicao?: string | null;
}

export interface SensorIoT {
  id: string;
  fk_municipio: number;
  municipio_nome: string;
  tipo_sensor: string;
  ultimo_valor: number;
  limiar_alerta: number;
  ultima_leitura: string;
  em_alerta: boolean;
}

export interface UserRole {
  id: number;
  supabase_user_id: string;
  role: 'cimat_admin' | 'tecnico_municipal' | 'parceiro_externo';
  fk_municipio: number | null;
  municipio_nome: string | null;
  medidas_atribuidas: string[];
}

export interface TrajetoriaData {
  baseline: {
    emissoes_base_2005: number;
    populacao_base_2005: number;
  };
  medidas_progress: {
    em_execucao: number;
    total: number;
  };
  medidas_por_setor: { setor: string; count: number }[];
}

export interface PmacSummary {
  medidas: (Medida & { indicadores: Indicador[] })[];
  ods_summary: { ods_id: number; count: number }[];
  setor_progress: { setor: string; total_medidas: number }[];
}

// ─── IoT Real-time types ──────────────────────────────────────────────────────

export interface LeituraT1 {
  Timestamp: string;
  solo_vibracao_x: string | number;
  solo_vibracao_y: string | number;
  solo_vibracao_z: string | number;
  solo_presenca_chuva: string | number;
}

export interface LeituraT2ArSolo {
  Timestamp: string;
  ar_temperatura: number;
  ar_humidade: number;
  ar_luz_solar: number;
  ar_co2: number;
  ar_intensidade_uv: number;
  ar_indice_uv: number;
  ar_pressao_atmosferica: number;
  solo_temperatura: number;
  solo_humidade: number;
  solo_condutividade: number;
  solo_ph: number;
  solo_potassio: number;
  solo_fosforo: number;
  solo_azoto: number;
  solo_quantidade_chuva: number;
}

export interface LeituraT2Agua {
  Timestamp: string;
  agua_cloro_residual: number;
  agua_ph: number;
  agua_turvacao: number;
  agua_nivel: number;
}

export type LeituraT2 = LeituraT2ArSolo | LeituraT2Agua;

export interface ParcelaState {
  t1: LeituraT1 | null;
  t2: LeituraT2 | null;
}

export interface IoTStreamState {
  point1: ParcelaState;
  point2: ParcelaState;
  point3: ParcelaState;
  connected: boolean;
}

export type AlertaOperador = '>' | '<' | '>=' | '<=' | '=';
export type AlertaTipo = 'instant' | 'aggregated';
export type AlertaFuncao = 'avg' | 'sum' | 'min' | 'max';

export interface AlertaRegra {
  id: number;
  fk_user: string;
  nome: string;
  parcela: string;
  topico: 't1' | 't2';
  campo: string;
  operador: AlertaOperador;
  valor_threshold: number;
  tipo: AlertaTipo;
  funcao_agregacao: AlertaFuncao | null;
  intervalo_minutos: number | null;
  ativo: boolean;
  criado_em: string;
}

export interface AlertaDisparado {
  id: number;
  fk_regra: number;
  regra_nome: string;
  operador: AlertaOperador;
  valor_threshold: number;
  parcela: string;
  campo: string;
  valor_medido: number;
  disparado_em: string;
  reconhecido: boolean;
  reconhecido_em: string | null;
  reconhecido_por: string | null;
}

export interface SSEAlertaEvent {
  id: number;
  regra: { id: number; nome: string };
  parcela: string;
  campo: string;
  valor_medido: number;
  valor_threshold: number;
  operador: AlertaOperador;
  disparado_em: string;
}

// ─── Historico ────────────────────────────────────────────────────────────────

export interface LeituraHistorico {
  parcela: string;
  timestamp: string;
  dados: Record<string, number>;
}

export interface StatsPoint {
  periodo: string;
  media: number;
  minimo: number;
  maximo: number;
  contagem: number;
}

export interface ValidacaoPendentes {
  execucoes_pendentes: (Execucao & {
    indicador_nome: string;
    tipo_meta: TipoMeta;
    meta_alvo: number | null;
    is_validada: boolean;
    medida_id: string;
    medida_designacao: string;
    setor: string;
    municipio_nome: string;
  })[];
  metas_pendentes: (Indicador & {
    medida_id: string;
    medida_designacao: string;
    municipio_nome: string;
  })[];
}
