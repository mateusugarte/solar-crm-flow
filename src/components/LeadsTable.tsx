import { useState } from 'react';
import { Lead } from '@/pages/Dashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { RefreshCw, Search, Users, Phone, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LeadsTableProps {
  leads: Lead[];
  loading: boolean;
  onRefresh: () => void;
}

export function LeadsTable({ leads, loading, onRefresh }: LeadsTableProps) {
  const [search, setSearch] = useState('');

  const filteredLeads = leads.filter(lead => 
    lead.nome_completo?.toLowerCase().includes(search.toLowerCase()) ||
    lead.nome_whatsapp?.toLowerCase().includes(search.toLowerCase()) ||
    lead.numero?.includes(search)
  );

  const getQualificationBadge = (qual: string | null) => {
    if (!qual) return null;
    const lower = qual.toLowerCase();
    if (lower.includes('hot') || lower.includes('qualificado')) {
      return <Badge className="bg-success text-success-foreground">Qualificado</Badge>;
    }
    if (lower.includes('warm') || lower.includes('morno')) {
      return <Badge className="bg-warning text-warning-foreground">Morno</Badge>;
    }
    return <Badge variant="secondary">{qual}</Badge>;
  };

  return (
    <Card className="border-0 shadow-soft">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-muted">
            <Users className="w-5 h-5 text-muted-foreground" />
          </div>
          <div>
            <CardTitle className="text-xl font-display">Leads</CardTitle>
            <p className="text-sm text-muted-foreground">{filteredLeads.length} contatos</p>
          </div>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onRefresh}
          disabled={loading}
          className="gap-2"
        >
          <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
          Atualizar
        </Button>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 mb-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou número..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold">Contato</TableHead>
                <TableHead className="font-semibold">Número</TableHead>
                <TableHead className="font-semibold">Qualificação</TableHead>
                <TableHead className="font-semibold">Renda</TableHead>
                <TableHead className="font-semibold hidden lg:table-cell">Última Mensagem</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLeads.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10">
                    <MessageSquare className="w-10 h-10 mx-auto text-muted-foreground/30 mb-2" />
                    <p className="text-muted-foreground">Nenhum lead encontrado</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredLeads.map((lead, index) => (
                  <TableRow 
                    key={lead.id} 
                    className="animate-fade-in hover:bg-muted/30 transition-colors"
                    style={{ animationDelay: `${index * 30}ms` }}
                  >
                    <TableCell>
                      <div>
                        <p className="font-medium">{lead.nome_completo || lead.nome_whatsapp || 'Sem nome'}</p>
                        {lead.nome_whatsapp && lead.nome_completo && (
                          <p className="text-xs text-muted-foreground">{lead.nome_whatsapp}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <span className="font-mono text-sm">{lead.numero}</span>
                      </div>
                    </TableCell>
                    <TableCell>{getQualificationBadge(lead.qualificacao)}</TableCell>
                    <TableCell>
                      {lead.renda ? (
                        <span className="text-sm">{lead.renda}</span>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell max-w-xs">
                      {lead.ultima_mensagem ? (
                        <p className="text-sm text-muted-foreground truncate">
                          {lead.ultima_mensagem}
                        </p>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
