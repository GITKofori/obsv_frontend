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
  estado_validacao: 'Pendente' | 'Aprovado' | 'Rejeitado';
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
