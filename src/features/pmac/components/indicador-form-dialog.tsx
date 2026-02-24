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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { createBrowserSupabase } from '@/utils/supabase/client';
import axios from 'axios';
import { TipoMeta } from 'types/pmac';

const TIPOS_META: TipoMeta[] = ['Contador', 'Marcos', 'Binária'];

interface IndicadorFormDialogProps {
  medidaId: string;
  medidaDesignacao: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

interface FormState {
  nome: string;
  unidade: string;
  tipo_meta: TipoMeta | '';
  meta_alvo: string;
}

const emptyForm: FormState = {
  nome: '',
  unidade: '',
  tipo_meta: '',
  meta_alvo: '',
};

export function IndicadorFormDialog({
  medidaId,
  medidaDesignacao,
  open,
  onOpenChange,
  onSuccess,
}: IndicadorFormDialogProps) {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(emptyForm);
      setErrors({});
      setSubmitError(null);
    }
  }, [open]);

  function validate(): boolean {
    const e: Partial<Record<keyof FormState, string>> = {};
    if (!form.nome.trim()) e.nome = 'Obrigatório';
    if (!form.unidade.trim()) e.unidade = 'Obrigatório';
    if (!form.tipo_meta) e.tipo_meta = 'Obrigatório';
    if (form.meta_alvo && isNaN(Number(form.meta_alvo))) {
      e.meta_alvo = 'Deve ser um número';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
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

      await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/protected/pmac/indicadores`,
        {
          nome: form.nome.trim(),
          unidade: form.unidade.trim(),
          tipo_meta: form.tipo_meta,
          meta_alvo: form.meta_alvo ? Number(form.meta_alvo) : null,
          fk_medida: medidaId,
        },
        { headers: { Authorization: `Bearer ${session.access_token}` } }
      );
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
      <DialogContent className='max-w-md'>
        <DialogHeader>
          <DialogTitle>Novo Indicador</DialogTitle>
          <p className='text-sm text-muted-foreground truncate'>
            Medida: {medidaDesignacao}
          </p>
        </DialogHeader>

        <div className='space-y-4 py-2'>
          {/* Nome */}
          <div className='space-y-1'>
            <Label htmlFor='ind-nome'>
              Nome <span className='text-destructive'>*</span>
            </Label>
            <Input
              id='ind-nome'
              placeholder='ex: Consumo energético reduzido'
              value={form.nome}
              onChange={(e) => setForm((p) => ({ ...p, nome: e.target.value }))}
              className={errors.nome ? 'border-destructive' : ''}
            />
            {errors.nome && <p className='text-xs text-destructive'>{errors.nome}</p>}
          </div>

          {/* Unidade */}
          <div className='space-y-1'>
            <Label htmlFor='ind-unidade'>
              Unidade <span className='text-destructive'>*</span>
            </Label>
            <Input
              id='ind-unidade'
              placeholder='ex: MWh, tCO2e, %'
              value={form.unidade}
              onChange={(e) => setForm((p) => ({ ...p, unidade: e.target.value }))}
              className={errors.unidade ? 'border-destructive' : ''}
            />
            {errors.unidade && <p className='text-xs text-destructive'>{errors.unidade}</p>}
          </div>

          {/* Tipo de Meta + Meta Alvo */}
          <div className='grid grid-cols-2 gap-3'>
            <div className='space-y-1'>
              <Label>
                Tipo de Meta <span className='text-destructive'>*</span>
              </Label>
              <Select
                value={form.tipo_meta}
                onValueChange={(v) =>
                  setForm((p) => ({ ...p, tipo_meta: v as TipoMeta }))
                }
              >
                <SelectTrigger className={errors.tipo_meta ? 'border-destructive' : ''}>
                  <SelectValue placeholder='Selecionar…' />
                </SelectTrigger>
                <SelectContent>
                  {TIPOS_META.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.tipo_meta && (
                <p className='text-xs text-destructive'>{errors.tipo_meta}</p>
              )}
            </div>

            <div className='space-y-1'>
              <Label htmlFor='ind-meta-alvo'>Meta Alvo</Label>
              <Input
                id='ind-meta-alvo'
                type='number'
                placeholder='ex: 100'
                value={form.meta_alvo}
                onChange={(e) => setForm((p) => ({ ...p, meta_alvo: e.target.value }))}
                className={errors.meta_alvo ? 'border-destructive' : ''}
              />
              {errors.meta_alvo && (
                <p className='text-xs text-destructive'>{errors.meta_alvo}</p>
              )}
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
            Criar Indicador
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
