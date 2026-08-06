import { ModalShell } from './ModalShell';
import { Button } from '@/components/ui/Button';
import { useSettingsStore } from '@/store/useSettingsStore';
import { cn } from '@/utils/cn';

interface UnitsModalProps {
  open: boolean;
  onClose: () => void;
  isAr: boolean;
}

interface UnitOption<T extends string> {
  val: T;
  labelEn: string;
  labelAr: string;
}

function UnitGroup<T extends string>({
  title,
  options,
  value,
  onSelect,
  isAr,
}: {
  title: string;
  options: UnitOption<T>[];
  value: T;
  onSelect: (v: T) => void;
  isAr: boolean;
}) {
  return (
    <div className="space-y-2">
      <p className="text-[11px] font-black uppercase tracking-wider text-text-muted">{title}</p>
      <div className="grid grid-cols-2 gap-2">
        {options.map((item) => (
          <button
            key={item.val}
            onClick={() => onSelect(item.val)}
            className={cn(
              'py-3 rounded-xl text-xs font-bold border transition-all text-center',
              value === item.val
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border bg-bg-surface-hover/40 text-text-secondary hover:text-text-primary',
            )}
          >
            {isAr ? item.labelAr : item.labelEn}
          </button>
        ))}
      </div>
    </div>
  );
}

export function UnitsModal({ open, onClose, isAr }: UnitsModalProps) {
  const settings = useSettingsStore();

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      title={isAr ? 'تعديل الوحدات' : 'Select Preferences'}
      footer={
        <Button
          onClick={onClose}
          variant="primary"
          className="w-full text-xs font-black uppercase py-3"
        >
          {isAr ? 'حفظ' : 'Save Changes'}
        </Button>
      }
    >
      <UnitGroup<'kg' | 'lbs'>
        title={isAr ? 'الوزن' : 'Weight'}
        value={settings.weightUnit}
        onSelect={settings.setWeightUnit}
        isAr={isAr}
        options={[
          { val: 'kg', labelEn: 'Kilograms (kg)', labelAr: 'كيلوغرام (كغ)' },
          { val: 'lbs', labelEn: 'Pounds (lbs)', labelAr: 'جنيه (رطل)' },
        ]}
      />
      <UnitGroup<'km' | 'miles'>
        title={isAr ? 'المسافة' : 'Distance'}
        value={settings.distanceUnit}
        onSelect={settings.setDistanceUnit}
        isAr={isAr}
        options={[
          { val: 'km', labelEn: 'Kilometers (km)', labelAr: 'كيلومتر (كم)' },
          { val: 'miles', labelEn: 'Miles (mi)', labelAr: 'ميل (ميل)' },
        ]}
      />
      <UnitGroup<'cm' | 'inches'>
        title={isAr ? 'القياسات' : 'Measurements'}
        value={settings.measurementUnit}
        onSelect={settings.setMeasurementUnit}
        isAr={isAr}
        options={[
          { val: 'cm', labelEn: 'Centimeters (cm)', labelAr: 'سنتيمتر (سم)' },
          { val: 'inches', labelEn: 'Inches (in)', labelAr: 'بوصة (بوصة)' },
        ]}
      />
    </ModalShell>
  );
}
