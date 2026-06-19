import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { User as AppUser } from '@/types';
import React from 'react';

interface PlayersListProps {
  uniquePlayers: AppUser[];
  playerSearch: string;
  setPlayerSearch: (val: string) => void;
  getUserLoyalty: (userId: string) => number;
  handleToggleBlacklist: (userId: string, currentStatus: boolean) => Promise<void>;
  t: (key: string) => string;
  locale: string;
}

export const PlayersList = React.memo(function PlayersList({
  uniquePlayers,
  playerSearch,
  setPlayerSearch,
  getUserLoyalty,
  handleToggleBlacklist,
  t,
  locale
}: PlayersListProps) {
  return (
    <Card className="bg-card/50 border-border backdrop-blur-xl">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4">
        <div>
          <CardTitle className="text-card-foreground">{t('playersList')}</CardTitle>
        </div>
        <div className="w-full sm:w-72">
          <Input
            placeholder={locale === 'ar' ? 'بحث بالاسم أو الهاتف...' : 'Search by name or phone...'}
            value={playerSearch}
            onChange={(e) => setPlayerSearch(e.target.value)}
            className="bg-card text-foreground border-border"
          />
        </div>
      </CardHeader>
      <CardContent>
        {uniquePlayers.length === 0 ? (
          <p className="text-muted-foreground text-center py-6">No players found.</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-muted/50">
                  <TableHead className="text-muted-foreground">Player</TableHead>
                  <TableHead className="text-muted-foreground">{t('loyaltyBookings')}</TableHead>
                  <TableHead className="text-muted-foreground">{t('playerStatus')}</TableHead>
                  <TableHead className="text-right text-muted-foreground">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {uniquePlayers
                  .filter(user => {
                    if (!playerSearch) return true;
                    const term = playerSearch.toLowerCase();
                    return (
                      user.name?.toLowerCase().includes(term) ||
                      user.phone?.includes(term)
                    );
                  })
                  .map(user => {
                    const loyalty = getUserLoyalty(user.uid);
                    const isBlack = !!user.isBlacklisted;
                    return (
                      <TableRow key={user.uid} className="border-border hover:bg-muted/50 text-foreground">
                        <TableCell className="font-medium">
                          <div>{user.name || 'Unnamed'}</div>
                          <div className="text-xs text-muted-foreground">{user.phone || 'No phone'}</div>
                        </TableCell>
                        <TableCell className="font-bold text-primary">{loyalty}</TableCell>
                        <TableCell>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            isBlack 
                              ? 'bg-destructive/20 text-destructive border border-destructive/20' 
                              : 'bg-primary/20 text-primary border border-primary/20'
                          }`}>
                            {isBlack ? t('blacklisted') : t('active')}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant={isBlack ? 'outline' : 'destructive'}
                            size="sm"
                            onClick={() => handleToggleBlacklist(user.uid, isBlack)}
                            className="font-bold transition-all hover:scale-105 active:scale-95"
                          >
                            {isBlack ? t('unblacklistBtn') : t('blacklistBtn')}
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
});
