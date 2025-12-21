import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Filter, X } from "lucide-react";


export interface FeedFilterOptions {
  contentType: 'all' | 'text' | 'image' | 'link';
  sortBy: 'recent' | 'popular' | 'trending';
  period: 'all' | 'today' | 'week' | 'month';
}

interface FeedFiltersProps {
  filters: FeedFilterOptions;
  onChange: (filters: FeedFilterOptions) => void;
}

const CONTENT_TYPE_LABELS = {
  all: 'Todos os tipos',
  text: 'Apenas texto',
  image: 'Com imagens',
  link: 'Com links',
};

const SORT_BY_LABELS = {
  recent: 'Mais recentes',
  popular: 'Mais curtidos',
  trending: 'Em alta',
};

const PERIOD_LABELS = {
  all: 'Todo período',
  today: 'Hoje',
  week: 'Última semana',
  month: 'Último mês',
};

export function FeedFilters({ filters, onChange }: FeedFiltersProps) {
  // Usar filters diretamente do prop, sem estado local duplicado
  const localFilters = filters;

  const handleFilterChange = (key: keyof FeedFilterOptions, value: string) => {
    const newFilters = { ...localFilters, [key]: value };
    onChange(newFilters);
    
    // Save to localStorage
    localStorage.setItem('feedFilters', JSON.stringify(newFilters));
  };

  const clearFilters = () => {
    const defaultFilters: FeedFilterOptions = {
      contentType: 'all',
      sortBy: 'recent',
      period: 'all',
    };
    onChange(defaultFilters);
    localStorage.removeItem('feedFilters');
  };

  const hasActiveFilters =
    localFilters.contentType !== 'all' ||
    localFilters.sortBy !== 'recent' ||
    localFilters.period !== 'all';

  return (
    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Filter className="w-4 h-4" />
        <span className="font-medium">Filtros:</span>
      </div>

      <div className="flex flex-wrap gap-2 flex-1">
        <Select
          value={localFilters.contentType}
          onValueChange={(value) => handleFilterChange('contentType', value)}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Tipo de conteúdo" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(CONTENT_TYPE_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={localFilters.sortBy}
          onValueChange={(value) => handleFilterChange('sortBy', value)}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Ordenar por" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(SORT_BY_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={localFilters.period}
          onValueChange={(value) => handleFilterChange('period', value)}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Período" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(PERIOD_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {hasActiveFilters && (
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="gap-1">
            {[
              localFilters.contentType !== 'all' && CONTENT_TYPE_LABELS[localFilters.contentType],
              localFilters.sortBy !== 'recent' && SORT_BY_LABELS[localFilters.sortBy],
              localFilters.period !== 'all' && PERIOD_LABELS[localFilters.period],
            ]
              .filter(Boolean)
              .length}{' '}
            {[
              localFilters.contentType !== 'all' && CONTENT_TYPE_LABELS[localFilters.contentType],
              localFilters.sortBy !== 'recent' && SORT_BY_LABELS[localFilters.sortBy],
              localFilters.period !== 'all' && PERIOD_LABELS[localFilters.period],
            ]
              .filter(Boolean)
              .length === 1
              ? 'filtro ativo'
              : 'filtros ativos'}
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="gap-1"
          >
            <X className="w-3 h-3" />
            Limpar
          </Button>
        </div>
      )}
    </div>
  );
}
