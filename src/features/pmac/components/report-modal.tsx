'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axios from 'axios';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { createBrowserSupabase } from '@/utils/supabase/client';
import { Indicador } from 'types/pmac';

/* ---------- Schemas per scenario ---------- */

const baseSchema = z.object({
  ano_referencia: z.coerce.number().int().min(2000).max(2100),
  url_evidencia: z.string().url('URL inválido').or(z.literal('')).optional(),
  observacoes: z.string().optional(),
});

const contadorSchema = baseSchema.extend({
  valor_executado: z.coerce.number().min(0, 'Valor tem de ser positivo'),
});

const marcosSchema = baseSchema.extend({
  marco_estado: z.enum(['25', '50', '75', '100'], {
    required_error: 'Selecione o estado do marco',
  }),
});

const metaDefinirSchema = baseSchema.extend({
  meta_alvo_proposta: z.coerce
    .number()
    .min(0, 'Meta tem de ser positiva'),
  valor_executado: z.coerce.number().min(0, 'Valor tem de ser positivo'),
});

/* ---------- Types ---------- */

type ContadorValues = z.infer<typeof contadorSchema>;
type MarcosValues = z.infer<typeof marcosSchema>;
type MetaDefinirValues = z.infer<typeof metaDefinirSchema>;

type Scenario = 'A' | 'B' | 'C';

/* ---------- Helpers ---------- */

const MARCO_OPTIONS = [
  { value: '25', label: 'Estudo (25%)' },
  { value: '50', label: 'Projeto (50%)' },
  { value: '75', label: 'Obra (75%)' },
  { value: '100', label: 'Concluído (100%)' },
];

function getScenario(ind: Indicador): Scenario {
  if (ind.meta_alvo == null) return 'C';
  if (ind.tipo_meta === 'Marcos') return 'B';
  return 'A';
}

function getSchema(scenario: Scenario) {
  switch (scenario) {
    case 'A':
      return contadorSchema;
    case 'B':
      return marcosSchema;
    case 'C':
      return metaDefinirSchema;
  }
}

const SCENARIO_TITLE: Record<Scenario, string> = {
  A: 'Contador',
  B: 'Marcos',
  C: 'Meta a Definir',
};

/* ---------- Component ---------- */

interface ReportModalProps {
  indicador: Indicador;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReportModal({
  indicador,
  open,
  onOpenChange,
}: ReportModalProps) {
  const scenario = getScenario(indicador);
  const schema = getSchema(scenario);

  const form = useForm<ContadorValues | MarcosValues | MetaDefinirValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      ano_referencia: new Date().getFullYear(),
      url_evidencia: '',
      observacoes: '',
      ...(scenario === 'A' && { valor_executado: 0 }),
      ...(scenario === 'B' && { marco_estado: undefined }),
      ...(scenario === 'C' && { meta_alvo_proposta: 0, valor_executado: 0 }),
    },
  });

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!open) {
      form.reset();
    }
  }, [open, form]);

  async function onSubmit(
    values: ContadorValues | MarcosValues | MetaDefinirValues
  ) {
    try {
      const supabase = createBrowserSupabase();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        toast.error('Sessão expirada. Por favor faça login novamente.');
        return;
      }

      // Build payload
      let valorExecutado: number;
      let metaAlvoProposta: number | undefined;

      if (scenario === 'B') {
        valorExecutado = Number((values as MarcosValues).marco_estado);
      } else if (scenario === 'C') {
        valorExecutado = (values as MetaDefinirValues).valor_executado;
        metaAlvoProposta = (values as MetaDefinirValues).meta_alvo_proposta;
      } else {
        valorExecutado = (values as ContadorValues).valor_executado;
      }

      const payload = {
        fk_indicador: indicador.id,
        ano_referencia: values.ano_referencia,
        valor_executado: valorExecutado,
        url_evidencia: values.url_evidencia || null,
        observacoes: values.observacoes || null,
        ...(metaAlvoProposta != null && {
          meta_alvo_proposta: metaAlvoProposta,
        }),
      };

      await axios.post('/api/protected/pmac/execucao', payload, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      toast.success('Reporte submetido com sucesso.');
      onOpenChange(false);
    } catch (error) {
      console.error('Error submitting report:', error);
      toast.error('Erro ao submeter reporte. Tente novamente.');
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            Atualizar Reporte
            <Badge variant='secondary' className='text-[10px]'>
              {SCENARIO_TITLE[scenario]}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            {indicador.nome}
            {indicador.unidade ? ` (${indicador.unidade})` : ''}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            {/* Year / date field — shared */}
            <FormField
              control={form.control}
              name='ano_referencia'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ano de Referência</FormLabel>
                  <FormControl>
                    <Input type='number' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Scenario A: numeric valor */}
            {scenario === 'A' && (
              <FormField
                control={form.control}
                name='valor_executado'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Valor Executado
                      {indicador.unidade ? ` (${indicador.unidade})` : ''}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        step='any'
                        placeholder='Ex: 3250'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Scenario B: milestone select */}
            {scenario === 'B' && (
              <FormField
                control={form.control}
                name={'marco_estado' as any}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estado do Marco</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Selecionar estado' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {MARCO_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Scenario C: proposed target + value */}
            {scenario === 'C' && (
              <>
                <FormField
                  control={form.control}
                  name={'meta_alvo_proposta' as any}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Meta Alvo Proposta</FormLabel>
                      <FormControl>
                        <Input
                          type='number'
                          step='any'
                          placeholder='Propor meta alvo'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='valor_executado'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor Executado Atual</FormLabel>
                      <FormControl>
                        <Input
                          type='number'
                          step='any'
                          placeholder='Execução atual'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            {/* Evidence URL — shared (A & B, optional for C) */}
            <FormField
              control={form.control}
              name='url_evidencia'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL de Evidência</FormLabel>
                  <FormControl>
                    <Input
                      type='url'
                      placeholder='https://...'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Observations — shared */}
            <FormField
              control={form.control}
              name='observacoes'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {scenario === 'C' ? 'Justificação' : 'Observações'}
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={
                        scenario === 'C'
                          ? 'Justifique a meta proposta...'
                          : 'Notas adicionais...'
                      }
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type='button'
                variant='outline'
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type='submit' disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting
                  ? 'A submeter...'
                  : 'Submeter Reporte'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
