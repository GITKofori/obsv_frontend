'use client';

import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Sun,
  Moon,
  Plus,
  Minus
} from 'lucide-react';
import { useTheme } from 'next-themes';

import concelhosData from '@/assets/geojson/concelhos.json';
import { createBrowserSupabase } from '@/utils/supabase/client';
import { TerritorialProfileSheet } from '@/features/map/components/territorial-profile-sheet';
import { ExecutiveReport } from '@/features/map/components/executive-report';

// Set Mapbox access token
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN!;

const MUNICIPIO_ID_MAP: Record<string, number> = {
  Boticas: 1,
  Chaves: 2,
  Montalegre: 3,
  'Ribeira de Pena': 4,
  Valpaços: 5,
  'Vila Pouca de Aguiar': 6
};

interface SelectedFeature {
  name: string;
  properties: Record<string, unknown>;
  coordinates: number[][];
}

interface MunicipioInfo {
  id: number;
  nome: string;
  emissoes_base_2005: number | null;
  populacao_base_2005: number | null;
}

interface ProfileMunicipio {
  id: number;
  nome: string;
  emissoes: number | null;
}

interface ReportData {
  totalMedidas: number;
  medidasValidadas: number;
  setorProgress: { setor: string; total_medidas: number }[];
}

// ── Inline sub-component ──────────────────────────────────────────────────────

interface MunicipioInfoBoxProps {
  feature: SelectedFeature;
  municipios: MunicipioInfo[];
  onVerPerfil: (mun: ProfileMunicipio) => void;
}

function MunicipioInfoBox({
  feature,
  municipios,
  onVerPerfil
}: MunicipioInfoBoxProps) {
  const nome = feature.name;
  const info = municipios.find((m) => m.nome === nome);
  const emissoes = info?.emissoes_base_2005 ?? null;
  const municipioId = MUNICIPIO_ID_MAP[nome] ?? info?.id ?? null;

  return (
    <div className="rounded-lg border bg-card p-4 space-y-3 shadow-sm">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">
          Município Selecionado
        </p>
        <p className="text-lg font-bold">{nome}</p>
      </div>

      <div>
        <p className="text-xs text-muted-foreground">Emissões 2005</p>
        <p className="font-semibold text-sm">
          {emissoes != null
            ? `${emissoes.toLocaleString('pt-PT')} tCO2e`
            : 'N/D'}
        </p>
      </div>

      {municipioId != null && (
        <Button
          size="sm"
          className="w-full"
          onClick={() =>
            onVerPerfil({ id: municipioId, nome, emissoes })
          }
        >
          Ver Perfil Completo
        </Button>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function MapsPage() {
  const { theme, setTheme } = useTheme();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedFeature, setSelectedFeature] =
    useState<SelectedFeature | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Sidebar state
  const [selectedLayer, setSelectedLayer] = useState('emissoes');
  const [selectedYear, setSelectedYear] = useState(2024);

  // Municipios data (fetched once)
  const [municipios, setMunicicios] = useState<MunicipioInfo[]>([]);

  // Profile sheet state
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileMunicipio, setProfileMunicipio] =
    useState<ProfileMunicipio | null>(null);

  // Report overlay state
  const [reportOpen, setReportOpen] = useState(false);
  const [reportData, setReportData] = useState<ReportData | null>(null);

  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  // Sync with theme
  useEffect(() => {
    setIsDarkMode(theme === 'dark');
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = isDarkMode ? 'light' : 'dark';
    setTheme(newTheme);
    setIsDarkMode(!isDarkMode);
  };

  // Fetch municipios list once on mount
  useEffect(() => {
    (async () => {
      try {
        const supabase = createBrowserSupabase();
        const {
          data: { session }
        } = await supabase.auth.getSession();
        if (!session?.access_token) return;

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/protected/pmac/municipios`,
          { headers: { Authorization: `Bearer ${session.access_token}` } }
        );
        if (res.ok) {
          const data: MunicipioInfo[] = await res.json();
          setMunicicios(data);
        }
      } catch (err) {
        console.error('Failed to fetch municipios:', err);
      }
    })();
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) return;

    const mapStyles = {
      light: {
        version: 8 as const,
        sources: {
          'positron-light': {
            type: 'raster' as const,
            tiles: [
              'https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png'
            ],
            tileSize: 256,
            attribution: '© CartoDB © OpenStreetMap contributors',
            maxzoom: 19
          }
        },
        layers: [
          {
            id: 'positron-light-layer',
            type: 'raster' as const,
            source: 'positron-light'
          }
        ]
      },
      dark: {
        version: 8 as const,
        sources: {
          'dark-matter': {
            type: 'raster' as const,
            tiles: ['https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution: '© CartoDB © OpenStreetMap contributors',
            maxzoom: 19
          }
        },
        layers: [
          {
            id: 'dark-matter-layer',
            type: 'raster' as const,
            source: 'dark-matter'
          }
        ]
      }
    };

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: isDarkMode ? mapStyles.dark : mapStyles.light,
      center: [-7.7, 41.7],
      zoom: 10,
      attributionControl: false
    });

    map.current.addControl(new mapboxgl.AttributionControl({ compact: true }));

    map.current.on('load', () => {
      setMapLoaded(true);
    });

    return () => {
      map.current?.remove();
    };
  }, [isDarkMode]);

  // Add GeoJSON layers
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    const currentMap = map.current;

    if (currentMap.getLayer('concelhos-fill'))
      currentMap.removeLayer('concelhos-fill');
    if (currentMap.getLayer('concelhos-border'))
      currentMap.removeLayer('concelhos-border');
    if (currentMap.getSource('portugal-concelhos'))
      currentMap.removeSource('portugal-concelhos');

    const layerColors = {
      fillColor: isDarkMode
        ? 'rgba(139, 92, 246, 0.3)'
        : 'rgba(99, 102, 241, 0.2)',
      borderColor: isDarkMode ? '#A855F7' : '#4F46E5'
    };

    const targetMunicipios = [
      'Boticas',
      'Chaves',
      'Montalegre',
      'Ribeira de Pena',
      'Valpaços',
      'Vila Pouca de Aguiar'
    ];
    const filteredConcelhos = {
      ...concelhosData,
      features: (concelhosData as { features: unknown[] }).features.filter(
        (f: unknown) => {
          const feat = f as { properties: { NAME_2?: string } };
          return targetMunicipios.includes(feat.properties.NAME_2 ?? '');
        }
      )
    };

    currentMap.addSource('portugal-concelhos', {
      type: 'geojson',
      data: filteredConcelhos as Parameters<typeof currentMap.addSource>[1] extends { data: infer D } ? D : never
    });

    currentMap.addLayer({
      id: 'concelhos-fill',
      type: 'fill',
      source: 'portugal-concelhos',
      paint: {
        'fill-color': layerColors.fillColor,
        'fill-outline-color': layerColors.borderColor
      }
    });

    currentMap.addLayer({
      id: 'concelhos-border',
      type: 'line',
      source: 'portugal-concelhos',
      paint: {
        'line-color': layerColors.borderColor,
        'line-width': 1,
        'line-opacity': 0.8
      }
    });

    currentMap.on('click', 'concelhos-fill', handleFeatureClick);
  }, [mapLoaded, isDarkMode]);

  const handleFeatureClick = (e: mapboxgl.MapMouseEvent) => {
    if (e.features && e.features.length > 0) {
      const feature = e.features[0];
      const properties = (feature.properties ?? {}) as Record<string, unknown>;
      const featureInfo: SelectedFeature = {
        name:
          (properties.CONCELHO as string) ||
          (properties.NAME_2 as string) ||
          (properties.name as string) ||
          (properties.NAME as string) ||
          'Área Desconhecida',
        properties,
        coordinates: []
      };

      setSelectedFeature(featureInfo);

      if (feature.geometry && map.current) {
        const bounds = new mapboxgl.LngLatBounds();

        if (feature.geometry.type === 'Polygon') {
          feature.geometry.coordinates[0].forEach((coord: number[]) => {
            bounds.extend(coord as [number, number]);
          });
        } else if (feature.geometry.type === 'MultiPolygon') {
          feature.geometry.coordinates.forEach((polygon: number[][][]) => {
            polygon[0].forEach((coord: number[]) => {
              bounds.extend(coord as [number, number]);
            });
          });
        }

        map.current.fitBounds(bounds, { padding: 100, duration: 1500 });
      }
    }
  };

  const handleZoom = (direction: 'in' | 'out') => {
    if (!map.current) return;
    const currentZoom = map.current.getZoom();
    const newZoom = direction === 'in' ? currentZoom + 1 : currentZoom - 1;
    map.current.setZoom(Math.max(1, Math.min(20, newZoom)));
  };

  const handleVerPerfil = (mun: ProfileMunicipio) => {
    setProfileMunicipio(mun);
    setProfileOpen(true);
  };

  const handleExportReport = (data: ReportData) => {
    setReportData(data);
    setReportOpen(true);
  };

  return (
    <>
      {/* Executive Report overlay */}
      {reportOpen && reportData && profileMunicipio && (
        <ExecutiveReport
          municipioNome={profileMunicipio.nome}
          emissoes2005={profileMunicipio.emissoes}
          totalMedidas={reportData.totalMedidas}
          medidasValidadas={reportData.medidasValidadas}
          setorProgress={reportData.setorProgress}
          onClose={() => setReportOpen(false)}
        />
      )}

      <div className="flex flex-1 flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b p-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Mapa</h1>
            <p className="text-muted-foreground">
              Alto Tâmega e Barroso - PMAC
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={toggleTheme}
              className="h-9 w-9"
            >
              {isDarkMode ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Body: sidebar + map */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left sidebar */}
          <aside className="w-72 shrink-0 border-r bg-background overflow-y-auto p-5 space-y-6">
            <div>
              <h3 className="font-bold text-lg">Exploração Territorial</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Explore os concelhos do Alto Tâmega e Barroso
              </p>
            </div>

            {/* Layer selector */}
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Camada de Informação
              </Label>
              <Select value={selectedLayer} onValueChange={setSelectedLayer}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="emissoes">
                    Emissões GEE (tCO2e)
                  </SelectItem>
                  <SelectItem value="energia">
                    Consumo Energia Final (MWh)
                  </SelectItem>
                  <SelectItem value="medidas">
                    Medidas PMAC em Curso
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Year slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Ano de Referência
                </Label>
                <span className="text-sm font-bold">{selectedYear}</span>
              </div>
              <input
                type="range"
                min={2005}
                max={2024}
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="w-full accent-primary"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>2005</span>
                <span>2024</span>
              </div>
            </div>

            {/* Municipality info box */}
            {selectedFeature && (
              <MunicipioInfoBox
                feature={selectedFeature}
                municipios={municipios}
                onVerPerfil={handleVerPerfil}
              />
            )}

            {!selectedFeature && (
              <div className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
                Clique num concelho no mapa para ver informações
              </div>
            )}
          </aside>

          {/* Map area */}
          <div className="flex-1 relative">
            <div ref={mapContainer} className="absolute inset-0" />

            {/* Zoom Controls */}
            <div className="absolute right-4 top-4 flex flex-col gap-2">
              <Button
                size="icon"
                variant="secondary"
                onClick={() => handleZoom('in')}
                className="h-10 w-10 border bg-background/90 backdrop-blur-sm"
              >
                <Plus className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="secondary"
                onClick={() => handleZoom('out')}
                className="h-10 w-10 border bg-background/90 backdrop-blur-sm"
              >
                <Minus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Territorial Profile Sheet */}
      {profileMunicipio && (
        <TerritorialProfileSheet
          municipioId={profileMunicipio.id}
          municipioNome={profileMunicipio.nome}
          emissoes2005={profileMunicipio.emissoes}
          open={profileOpen}
          onOpenChange={setProfileOpen}
          onExportReport={handleExportReport}
        />
      )}
    </>
  );
}
