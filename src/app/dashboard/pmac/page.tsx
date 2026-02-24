'use client';

import { useEffect, useState, useCallback } from 'react';
import PageContainer from '@/components/layout/page-container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PmacSummary, Medida, Municipio } from 'types/pmac';
import { MedidasTable } from '@/features/pmac/components/medidas-table';
import { SetorChart } from '@/features/pmac/components/setor-chart';
import { OdsGrid } from '@/features/pmac/components/ods-grid';
import { MedidaFormDialog } from '@/features/pmac/components/medida-form-dialog';
import { DeleteMedidaDialog } from '@/features/pmac/components/delete-medida-dialog';
import { ClipboardList, Loader2, Plus } from 'lucide-react';
import { useMunicipio } from '@/hooks/use-municipio';
import { useUserRole } from '@/hooks/use-user-role';
import { createBrowserSupabase } from '@/utils/supabase/client';
import axios from 'axios';

export default function PmacPage() {
  const { municipioId } = useMunicipio();
  const { userRole, isCimatAdmin, isTecnico } = useUserRole();
  const canManageAny = isCimatAdmin || isTecnico;

  const [data, setData] = useState<PmacSummary | null>(null);
  const [municipios, setMunicipios] = useState<Municipio[]>([]);
  const [loading, setLoading] = useState(true);

  // Dialog state
  const [dialogMode, setDialogMode] = useState<'create' | 'edit' | null>(null);
  const [selectedMedida, setSelectedMedida] = useState<Medida | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Medida | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const supabase = createBrowserSupabase();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      const headers = { Authorization: `Bearer ${session.access_token}` };
      const base = process.env.NEXT_PUBLIC_BACKEND_URL;

      const url = municipioId
        ? `${base}/api/protected/dashboard-pmac/pmac-summary?municipio=${municipioId}`
        : `${base}/api/protected/dashboard-pmac/pmac-summary`;
      const summaryRes = await axios.get(url, { headers });
      setData(summaryRes.data);
    } catch (error) {
      console.error('Error fetching PMAC data:', error);
    } finally {
      setLoading(false);
    }
  }, [municipioId]);

  useEffect(() => {
    async function fetchMunicipios() {
      try {
        const supabase = createBrowserSupabase();
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) return;
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/protected/pmac/municipios`,
          { headers: { Authorization: `Bearer ${session.access_token}` } }
        );
        setMunicipios(res.data);
      } catch (error) {
        console.error('Error fetching municipios:', error);
      }
    }
    fetchMunicipios();
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  function handleEdit(medida: Medida) {
    setSelectedMedida(medida);
    setDialogMode('edit');
  }

  function handleDelete(medida: Medida) {
    setDeleteTarget(medida);
  }

  const medidas = data?.medidas ?? [];
  const odsSummary = data?.ods_summary ?? [];
  const setorProgress = data?.setor_progress ?? [];

  if (loading) {
    return (
      <PageContainer>
        <div className='flex flex-1 items-center justify-center py-20'>
          <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className='flex flex-1 flex-col space-y-6'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <ClipboardList className='h-6 w-6 text-primary' />
            <h2 className='text-2xl font-bold tracking-tight'>
              Monitorização PMAC
            </h2>
          </div>
          {canManageAny && (
            <Button
              size='sm'
              onClick={() => {
                setSelectedMedida(null);
                setDialogMode('create');
              }}
            >
              <Plus className='mr-2 h-4 w-4' />
              Nova Medida
            </Button>
          )}
        </div>

        {/* Charts row */}
        <div className='grid gap-4 md:grid-cols-2'>
          <Card>
            <CardHeader>
              <CardTitle className='text-base'>Progresso por Setor</CardTitle>
            </CardHeader>
            <CardContent>
              <SetorChart data={setorProgress} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className='text-base'>
                Objetivos de Desenvolvimento Sustentável
              </CardTitle>
            </CardHeader>
            <CardContent>
              <OdsGrid data={odsSummary} />
            </CardContent>
          </Card>
        </div>

        {/* Medidas table */}
        <Card>
          <CardHeader>
            <CardTitle className='text-base'>Medidas e Indicadores</CardTitle>
            <p className='text-sm text-muted-foreground'>
              Clique numa medida para expandir os indicadores e reportar execução
            </p>
          </CardHeader>
          <CardContent className='p-0'>
            <MedidasTable
              medidas={medidas}
              userRole={userRole}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onRefresh={fetchData}
            />
          </CardContent>
        </Card>
      </div>

      {/* Dialogs */}
      {userRole && (
        <>
          <MedidaFormDialog
            mode={dialogMode === 'edit' ? 'edit' : 'create'}
            medida={selectedMedida}
            municipios={municipios}
            userRole={userRole}
            open={dialogMode !== null}
            onOpenChange={(open) => {
              if (!open) setDialogMode(null);
            }}
            onSuccess={fetchData}
          />
          <DeleteMedidaDialog
            medida={deleteTarget}
            open={deleteTarget !== null}
            onOpenChange={(open) => {
              if (!open) setDeleteTarget(null);
            }}
            onSuccess={fetchData}
          />
        </>
      )}
    </PageContainer>
  );
}
