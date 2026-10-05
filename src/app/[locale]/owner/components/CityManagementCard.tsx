'use client';

import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useLocale } from 'next-intl';
import { CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { MapPin, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export interface CityItem {
  value: string;
  labelEn: string;
  labelAr: string;
}

const DEFAULT_CITIES: CityItem[] = [
  { value: 'obour', labelEn: 'Obour City', labelAr: 'مدينة العبور' },
  { value: 'new_cairo', labelEn: 'New Cairo', labelAr: 'القاهرة الجديدة' },
  { value: 'shorouk', labelEn: 'El Shorouk', labelAr: 'الشروق' },
  { value: 'october', labelEn: '6th October', labelAr: '6 أكتوبر' },
];

export function CityManagementCard() {
  const locale = useLocale();
  const isArabic = locale === 'ar';
  const [cities, setCities] = useState<CityItem[]>(DEFAULT_CITIES);
  const [newEn, setNewEn] = useState('');
  const [newAr, setNewAr] = useState('');
  const [saving, setSaving] = useState(false);
  const [cityToDelete, setCityToDelete] = useState<CityItem | null>(null);

  useEffect(() => {
    async function fetchCities() {
      try {
        const snap = await getDoc(doc(db, 'settings', 'cities'));
        if (snap.exists() && snap.data().list) {
          setCities(snap.data().list);
        }
      } catch (err) {
        console.warn('Error fetching cities:', err);
      }
    }
    fetchCities();
  }, []);

  const handleAddCity = async () => {
    if (!newEn.trim() || !newAr.trim()) {
      toast.error(
        isArabic
          ? 'يرجى إدخال اسم المدينة بالإنجليزية والعربية'
          : 'Please enter city name in English & Arabic'
      );
      return;
    }

    const valueKey = newEn.trim().toLowerCase().replace(/\s+/g, '_');
    if (cities.some((c) => c.value === valueKey)) {
      toast.error(isArabic ? 'هذه المدينة مضافة بالفعل' : 'This city is already added');
      return;
    }

    const updated = [...cities, { value: valueKey, labelEn: newEn.trim(), labelAr: newAr.trim() }];
    setSaving(true);
    try {
      await setDoc(doc(db, 'settings', 'cities'), { list: updated });
      setCities(updated);
      setNewEn('');
      setNewAr('');
      toast.success(isArabic ? 'تمت إضافة المدينة بنجاح!' : 'City added successfully!');
    } catch (err: unknown) {
      const error = err as Error;
      console.error('Failed to save city:', error);
      toast.error(error.message || (isArabic ? 'فشل حفظ المدينة' : 'Failed to add city'));
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDeleteCity = async () => {
    if (!cityToDelete) return;
    const updated = cities.filter((c) => c.value !== cityToDelete.value);
    setSaving(true);
    try {
      await setDoc(doc(db, 'settings', 'cities'), { list: updated });
      setCities(updated);
      toast.success(isArabic ? 'تم حذف المدينة من الفلتر' : 'City removed from filter');
    } catch (err: unknown) {
      const error = err as Error;
      console.error('Failed to delete city:', error);
      toast.error(error.message || (isArabic ? 'فشل حذف المدينة' : 'Failed to delete city'));
    } finally {
      setSaving(false);
      setCityToDelete(null);
    }
  };

  return (
    <div className="rounded-3xl p-6 md:p-8 bg-card border border-border shadow-xl mt-8 space-y-6">
      <CardHeader className="p-0">
        <CardTitle className="flex items-center gap-2 text-xl font-black text-foreground">
          <MapPin className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{isArabic ? 'إدارة المدن والمناطق (قائمة البحث)' : 'Manage Platform Cities (Search Dropdown)'}</span>
        </CardTitle>
        <CardDescription className="text-xs font-medium text-muted-foreground mt-1">
          {isArabic
            ? 'أضف أو احذف المدن المتاحة في فلاتر البحث للمستخدمين على الصفحة الرئيسية'
            : 'Add or remove available cities in the user search filter dropdown'}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0 space-y-6">
        {/* Add City Input Form */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            value={newEn}
            onChange={(e) => setNewEn(e.target.value)}
            placeholder={isArabic ? 'اسم المدينة (English)' : 'City Name (English)'}
            className="bg-background border-border text-xs rounded-xl"
          />
          <Input
            value={newAr}
            onChange={(e) => setNewAr(e.target.value)}
            placeholder={isArabic ? 'اسم المدينة (عربي)' : 'City Name (Arabic)'}
            className="bg-background border-border text-xs rounded-xl"
          />
          <Button
            onClick={handleAddCity}
            disabled={saving}
            className="bg-primary text-black font-extrabold hover:bg-primary/90 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{isArabic ? 'إضافة مدينة' : 'Add City'}</span>
          </Button>
        </div>

        {/* Existing Cities List */}
        <div className="space-y-2">
          <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            {isArabic ? 'المدن الحالية في الفلتر:' : 'Active Cities in Filter:'}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {cities.map((city) => (
              <div
                key={city.value}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-background border border-border text-xs font-bold shadow-sm"
              >
                <div>
                  <span className="text-foreground text-sm">{isArabic ? city.labelAr : city.labelEn}</span>
                  <span className="text-muted-foreground ms-2 text-[10px] font-mono">({city.value})</span>
                </div>
                <button
                  onClick={() => setCityToDelete(city)}
                  disabled={saving}
                  className="text-muted-foreground hover:text-red-400 p-1.5 rounded-lg hover:bg-red-500/10 transition-colors cursor-pointer"
                  title={isArabic ? 'حذف المدينة' : 'Delete City'}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </CardContent>

      {/* Confirmation Dialog for City Deletion */}
      <Dialog open={!!cityToDelete} onOpenChange={(open) => !open && setCityToDelete(null)}>
        <DialogContent className="rounded-3xl border-border bg-card">
          <DialogHeader>
            <DialogTitle className="text-destructive font-black flex items-center gap-2">
              <Trash2 className="w-5 h-5" />
              {isArabic ? 'حذف المدينة من الفلتر' : 'Remove City from Filter'}
            </DialogTitle>
            <DialogDescription>
              {isArabic
                ? `هل أنت متأكد من رغبتك في حذف مدينة "${cityToDelete?.labelAr}" من قائمة البحث العامة؟`
                : `Are you sure you want to remove "${cityToDelete?.labelEn}" from the active search filters?`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setCityToDelete(null)}
              disabled={saving}
              className="rounded-xl cursor-pointer"
            >
              {isArabic ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDeleteCity}
              disabled={saving}
              className="rounded-xl font-bold cursor-pointer"
            >
              {saving ? (isArabic ? 'جاري الحذف...' : 'Deleting...') : (isArabic ? 'تأكيد الحذف' : 'Confirm Delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
