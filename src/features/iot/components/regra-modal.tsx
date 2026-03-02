'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axios from 'axios';
import { toast } from 'sonner';
import { createBrowserSupabase } from '@/utils/supabase/client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

import {
  PARCELA_LABELS,
  TOPICO_LABELS,
  OPERADOR_LABELS,
  FUNCAO_LABELS,
  FIELDS_BY_PARCELA_TOPICO,
  FIELD_META,
} from '../constants';
import type { AlertaRegra } from 'types/pmac';

const schema = z
  .object({
    nome: z.string().min(1, 'Nome obrigatório'),
    parcela: z.string().min(1),
    topico: z.enum(['t1', 't2']),
    campo: z.string().min(1, 'Campo obrigatório'),
    operador: z.enum(['>', '<', '>=', '<=', '=']),
    valor_threshold: z.coerce.number(),
    tipo: z.enum(['instant', 'aggregated']),
    funcao_agregacao: z.enum(['avg', 'sum', 'min', 'max']).nullable().optional(),
    intervalo_minutos: z.coerce.number().nullable().optional(),
  })
  .refine(
    (d) =>
      d.tipo !== 'aggregated' ||
      (d.funcao_agregacao && d.intervalo_minutos && d.intervalo_minutos > 0),
    {
      message: 'Regras agregadas requerem função de agregação e intervalo',
      path: ['funcao_agregacao'],
    }
  );

type FormValues = z.infer<typeof schema>;

interface RegraModalProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  editing?: AlertaRegra | null;
}

export function RegraModal({ open, onClose, onSaved, editing }: RegraModalProps) {
  const [saving, setSaving] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      nome: '',
      parcela: 'point1',
      topico: 't2',
      campo: '',
      operador: '>',
      valor_threshold: 0,
      tipo: 'instant',
      funcao_agregacao: null,
      intervalo_minutos: null,
    },
  });

  const parcelaValue = form.watch('parcela');
  const topicoValue = form.watch('topico');
  const tipoValue = form.watch('tipo');

  const availableFields =
    FIELDS_BY_PARCELA_TOPICO[`${parcelaValue}:${topicoValue}`] ?? [];

  // Reset campo when parcela/topico changes
  useEffect(() => {
    const current = form.getValues('campo');
    if (current && !availableFields.includes(current)) {
      form.setValue('campo', availableFields[0] ?? '');
    }
  }, [parcelaValue, topicoValue, availableFields, form]);

  // Populate form when editing
  useEffect(() => {
    if (editing) {
      form.reset({
        nome: editing.nome,
        parcela: editing.parcela,
        topico: editing.topico,
        campo: editing.campo,
        operador: editing.operador,
        valor_threshold: editing.valor_threshold,
        tipo: editing.tipo,
        funcao_agregacao: editing.funcao_agregacao ?? null,
        intervalo_minutos: editing.intervalo_minutos ?? null,
      });
    } else {
      form.reset();
    }
  }, [editing, form]);

  async function onSubmit(values: FormValues) {
    setSaving(true);
    try {
      const supabase = createBrowserSupabase();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      const headers = { Authorization: `Bearer ${session.access_token}` };
      const base = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/protected/alertas/regras`;

      if (editing) {
        await axios.put(`${base}/${editing.id}`, values, { headers });
        toast.success('Regra atualizada');
      } else {
        await axios.post(base, values, { headers });
        toast.success('Regra criada');
      }

      onSaved();
      onClose();
    } catch {
      toast.error('Erro ao guardar regra');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className='max-w-md'>
        <DialogHeader>
          <DialogTitle>
            {editing ? 'Editar Regra de Alerta' : 'Nova Regra de Alerta'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            {/* Nome */}
            <FormField
              control={form.control}
              name='nome'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da Regra</FormLabel>
                  <FormControl>
                    <Input placeholder='Ex: CO₂ alto em Rio Torto' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='grid grid-cols-2 gap-3'>
              {/* Parcela */}
              <FormField
                control={form.control}
                name='parcela'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Parcela</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(PARCELA_LABELS).map(([k, v]) => (
                          <SelectItem key={k} value={k}>
                            {v}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Tópico */}
              <FormField
                control={form.control}
                name='topico'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tópico</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(TOPICO_LABELS).map(([k, v]) => (
                          <SelectItem key={k} value={k}>
                            {v}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Campo */}
            <FormField
              control={form.control}
              name='campo'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Parâmetro</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Selecionar parâmetro...' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableFields.map((f) => (
                        <SelectItem key={f} value={f}>
                          {FIELD_META[f]?.label ?? f}
                          {FIELD_META[f]?.unit ? ` (${FIELD_META[f].unit})` : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='grid grid-cols-2 gap-3'>
              {/* Operador */}
              <FormField
                control={form.control}
                name='operador'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Condição</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(OPERADOR_LABELS).map(([k, v]) => (
                          <SelectItem key={k} value={k}>
                            {k} ({v})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Valor */}
              <FormField
                control={form.control}
                name='valor_threshold'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Valor limite
                      {FIELD_META[form.watch('campo')]?.unit
                        ? ` (${FIELD_META[form.watch('campo')].unit})`
                        : ''}
                    </FormLabel>
                    <FormControl>
                      <Input type='number' step='any' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Tipo */}
            <FormField
              control={form.control}
              name='tipo'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Avaliação</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value='instant'>
                        Instantâneo — verificado em cada leitura
                      </SelectItem>
                      <SelectItem value='aggregated'>
                        Agregado — calculado sobre um intervalo
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Aggregated-only fields */}
            {tipoValue === 'aggregated' && (
              <div className='grid grid-cols-2 gap-3 rounded-md border p-3'>
                <FormField
                  control={form.control}
                  name='funcao_agregacao'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Função</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value ?? ''}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='Função...' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(FUNCAO_LABELS).map(([k, v]) => (
                            <SelectItem key={k} value={k}>
                              {v}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='intervalo_minutos'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Intervalo (min)</FormLabel>
                      <FormControl>
                        <Input
                          type='number'
                          min='1'
                          placeholder='60'
                          {...field}
                          value={field.value ?? ''}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value ? parseInt(e.target.value) : null
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            <DialogFooter>
              <Button type='button' variant='outline' onClick={onClose}>
                Cancelar
              </Button>
              <Button type='submit' disabled={saving}>
                {saving ? 'A guardar...' : editing ? 'Atualizar' : 'Criar Regra'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
