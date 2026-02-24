'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2 } from 'lucide-react';
import { createBrowserSupabase } from '@/utils/supabase/client';
import axios from 'axios';
import { Medida, Municipio, UserRole } from 'types/pmac';

const SETORES = [
  'Energia',
  'Transportes',
  'Resíduos',
  'Água',
  'Agroflorestal',
  'Saúde',
  'Proteção Civil',
] as const;

const TIPOS_RESPOSTA = ['Adaptação', 'Mitigação', 'Transversal'] as const;

const ODS_LABELS: Record<number, string> = {
  1: 'Erradicar a Pobreza',
  2: 'Erradicar a Fome',
  3: 'Saúde de Qualidade',
  4: 'Educação de Qualidade',
  5: 'Igualdade de Género',
  6: 'Água Potável e Saneamento',
  7: 'Energias Renováveis e Acessíveis',
  8: 'Trabalho Digno e Crescimento Económico',
  9: 'Indústria, Inovação e Infraestrutura',
  10: 'Reduzir as Desigualdades',
  11: 'Cidades e Comunidades Sustentáveis',
  12: 'Produção e Consumo Sustentáveis',
  13: 'Ação Climática',
  14: 'Proteger a Vida Marinha',
  15: 'Proteger a Vida Terrestre',
  16: 'Paz, Justiça e Instituições Eficazes',
  17: 'Parcerias para a Implementação dos Objetivos',
};

interface FormState {
  id: string;
  designacao: string;
  setor: string;
  tipo_resposta: string;
  fk_municipio: string;
  descricao: string;
  objetivos: string;
  ods_associados: number[];
}

function emptyForm(userRole: UserRole): FormState {
  return {
    id: '',
    designacao: '',
    setor: '',
    tipo_resposta: '',
    fk_municipio: userRole.fk_municipio ? String(userRole.fk_municipio) : '',
    descricao: '',
    objetivos: '',
    ods_associados: [],
  };
}

function medidaToForm(medida: Medida): FormState {
  return {
    id: medida.id,
    designacao: medida.designacao,
    setor: medida.setor,
    tipo_resposta: medida.tipo_resposta,
    fk_municipio: String(medida.fk_municipio),
    descricao: medida.descricao ?? '',
    objetivos: medida.objetivos ?? '',
    ods_associados: medida.ods_associados ?? [],
  };
}

interface MedidaFormDialogProps {
  mode: 'create' | 'edit';
  medida: Medida | null;
  municipios: Municipio[];
  userRole: UserRole;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function MedidaFormDialog({
  mode,
  medida,
  municipios,
  userRole,
  open,
  onOpenChange,
  onSuccess,
}: MedidaFormDialogProps) {
  const [form, setForm] = useState<FormState>(() =>
    mode === 'edit' && medida ? medidaToForm(medida) : emptyForm(userRole)
  );
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(mode === 'edit' && medida ? medidaToForm(medida) : emptyForm(userRole));
      setErrors({});
      setSubmitError(null);
    }
  }, [open, mode, medida, userRole]);

  const isTecnico = userRole.role === 'tecnico_municipal';

  function validate(): boolean {
    const e: Partial<Record<keyof FormState, string>> = {};
    if (!form.id.trim()) e.id = 'Obrigatório';
    else if (!/^[A-Z0-9_]+$/.test(form.id)) e.id = 'Apenas letras maiúsculas, números e _';
    else if (form.id.length > 20) e.id = 'Máximo 20 caracteres';
    if (!form.designacao.trim()) e.designacao = 'Obrigatório';
    if (!form.setor) e.setor = 'Obrigatório';
    if (!form.tipo_resposta) e.tipo_resposta = 'Obrigatório';
    if (!form.fk_municipio) e.fk_municipio = 'Obrigatório';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function toggleOds(id: number) {
    setForm((prev) => ({
      ...prev,
      ods_associados: prev.ods_associados.includes(id)
        ? prev.ods_associados.filter((o) => o !== id)
        : [...prev.ods_associados, id].sort((a, b) => a - b),
    }));
  }

  async function handleSubmit() {
    if (!validate()) return;
    setLoading(true);
    setSubmitError(null);
    try {
      const supabase = createBrowserSupabase();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) throw new Error('Sessão expirada');

      const payload = {
        ...form,
        fk_municipio: Number(form.fk_municipio),
        descricao: form.descricao || null,
        objetivos: form.objetivos || null,
      };
      const headers = { Authorization: `Bearer ${session.access_token}` };
      const base = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/protected/pmac/medidas`;

      if (mode === 'create') {
        await axios.post(base, payload, { headers });
      } else {
        await axios.put(`${base}/${medida!.id}`, payload, { headers });
      }
      onOpenChange(false);
      onSuccess();
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setSubmitError(err.response?.data?.error ?? err.message ?? 'Erro desconhecido');
      } else if (err instanceof Error) {
        setSubmitError(err.message);
      } else {
        setSubmitError('Erro desconhecido');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-lg max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Nova Medida' : 'Editar Medida'}
          </DialogTitle>
        </DialogHeader>

        <div className='space-y-4 py-2'>
          {/* ID */}
          <div className='space-y-1'>
            <Label htmlFor='medida-id'>
              Código <span className='text-destructive'>*</span>
            </Label>
            <Input
              id='medida-id'
              placeholder='ex: MAA01_CHV'
              value={form.id}
              onChange={(e) =>
                setForm((p) => ({ ...p, id: e.target.value.toUpperCase() }))
              }
              disabled={mode === 'edit'}
              className={errors.id ? 'border-destructive' : ''}
            />
            {errors.id && (
              <p className='text-xs text-destructive'>{errors.id}</p>
            )}
          </div>

          {/* Designação */}
          <div className='space-y-1'>
            <Label htmlFor='medida-designacao'>
              Designação <span className='text-destructive'>*</span>
            </Label>
            <Textarea
              id='medida-designacao'
              rows={2}
              value={form.designacao}
              onChange={(e) =>
                setForm((p) => ({ ...p, designacao: e.target.value }))
              }
              className={errors.designacao ? 'border-destructive' : ''}
            />
            {errors.designacao && (
              <p className='text-xs text-destructive'>{errors.designacao}</p>
            )}
          </div>

          {/* Setor + Tipo de Resposta */}
          <div className='grid grid-cols-2 gap-3'>
            <div className='space-y-1'>
              <Label>
                Setor <span className='text-destructive'>*</span>
              </Label>
              <Select
                value={form.setor}
                onValueChange={(v) => setForm((p) => ({ ...p, setor: v }))}
              >
                <SelectTrigger
                  className={errors.setor ? 'border-destructive' : ''}
                >
                  <SelectValue placeholder='Selecionar…' />
                </SelectTrigger>
                <SelectContent>
                  {SETORES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.setor && (
                <p className='text-xs text-destructive'>{errors.setor}</p>
              )}
            </div>

            <div className='space-y-1'>
              <Label>
                Tipo de Resposta <span className='text-destructive'>*</span>
              </Label>
              <Select
                value={form.tipo_resposta}
                onValueChange={(v) =>
                  setForm((p) => ({ ...p, tipo_resposta: v }))
                }
              >
                <SelectTrigger
                  className={errors.tipo_resposta ? 'border-destructive' : ''}
                >
                  <SelectValue placeholder='Selecionar…' />
                </SelectTrigger>
                <SelectContent>
                  {TIPOS_RESPOSTA.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.tipo_resposta && (
                <p className='text-xs text-destructive'>
                  {errors.tipo_resposta}
                </p>
              )}
            </div>
          </div>

          {/* Município */}
          <div className='space-y-1'>
            <Label>
              Município <span className='text-destructive'>*</span>
            </Label>
            <Select
              value={form.fk_municipio}
              onValueChange={(v) =>
                setForm((p) => ({ ...p, fk_municipio: v }))
              }
              disabled={isTecnico}
            >
              <SelectTrigger
                className={errors.fk_municipio ? 'border-destructive' : ''}
              >
                <SelectValue placeholder='Selecionar…' />
              </SelectTrigger>
              <SelectContent>
                {municipios.map((m) => (
                  <SelectItem key={m.id} value={String(m.id)}>
                    {m.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.fk_municipio && (
              <p className='text-xs text-destructive'>{errors.fk_municipio}</p>
            )}
          </div>

          {/* Descrição */}
          <div className='space-y-1'>
            <Label htmlFor='medida-descricao'>Descrição</Label>
            <Textarea
              id='medida-descricao'
              rows={3}
              value={form.descricao}
              onChange={(e) =>
                setForm((p) => ({ ...p, descricao: e.target.value }))
              }
            />
          </div>

          {/* Objetivos */}
          <div className='space-y-1'>
            <Label htmlFor='medida-objetivos'>Objetivos</Label>
            <Textarea
              id='medida-objetivos'
              rows={3}
              value={form.objetivos}
              onChange={(e) =>
                setForm((p) => ({ ...p, objetivos: e.target.value }))
              }
            />
          </div>

          {/* ODS */}
          <div className='space-y-2'>
            <Label>ODS Associados</Label>
            <div className='grid grid-cols-2 gap-1.5 rounded-md border p-3 max-h-48 overflow-y-auto'>
              {Array.from({ length: 17 }, (_, i) => i + 1).map((id) => (
                <label
                  key={id}
                  className='flex items-center gap-2 cursor-pointer text-sm'
                >
                  <Checkbox
                    checked={form.ods_associados.includes(id)}
                    onCheckedChange={() => toggleOds(id)}
                  />
                  <span className='leading-tight'>
                    {id}. {ODS_LABELS[id]}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {submitError && (
            <p className='text-sm text-destructive bg-destructive/10 rounded px-3 py-2'>
              {submitError}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button
            variant='outline'
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
            {mode === 'create' ? 'Criar' : 'Guardar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
