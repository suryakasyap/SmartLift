import { useState } from 'react';
import {
  User,
  Ruler,
  Palette,
  Globe,
  Calendar,
  Dumbbell,
  Mars,
  Venus,
  Terminal,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { ColorPicker } from '../components/ui/ColorPicker';
import { EquipmentSheet } from '../components/workout/EquipmentSheet';
import { db } from '../db/db';
import { useThemeStore } from '../store/themeStore';
import { useUserStore, type Gender } from '../store/userStore';
import { useEquipmentStore } from '../store/equipmentStore';
import { useDevStore } from '../store/devStore';
import { cn } from '../lib/utils';

const GENDER_OPTIONS: Gender[] = ['Male', 'Female', 'Other'];

const OtherGenderIcon = ({ className }: { className?: string }) => (
  <span className={cn('text-xl leading-none', className)}>⚥</span>
);

const GENDER_ICONS: Record<Gender, React.ComponentType<{ className?: string }>> = {
  Male: Mars,
  Female: Venus,
  Other: OtherGenderIcon,
};

interface ListItemProps {
  icon?: React.ComponentType<{ className?: string }>;
  label: string;
  value?: React.ReactNode;
  onClick?: () => void;
  isLast?: boolean;
  errorMessage?: string;
}

const ListItem = ({ icon: Icon, label, value, onClick, isLast = false, errorMessage }: ListItemProps) => (
  <div
    onClick={onClick}
    className={cn(
      '-mx-5 flex cursor-pointer flex-col rounded-xl px-5 py-4 transition-colors active:bg-zinc-800/50',
      !isLast && 'border-b border-dashed border-zinc-800',
    )}
  >
    <div className="flex w-full items-center justify-between">
      <div className="flex items-center gap-3 text-zinc-300">
        {Icon && <Icon className="h-5 w-5 text-zinc-500" />}
        <span className="text-sm font-medium">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        {typeof value === 'string' ? (
          <span className="text-sm font-bold text-white">{value}</span>
        ) : (
          value
        )}
      </div>
    </div>
    {errorMessage && (
      <p className="mt-2 pl-8 text-[10px] font-medium text-red-500">{errorMessage}</p>
    )}
  </div>
);

const SectionHeading = ({ children }: { children: React.ReactNode }) => (
  <h2 className="mb-2 ml-1 text-xs font-bold uppercase tracking-wider text-zinc-500">{children}</h2>
);

export default function Settings() {
  const { appColor, setAppColor } = useThemeStore();
  const { name, setName, gender, setGender, units, setUnits, weekStart, setWeekStart, language } =
    useUserStore();
  const { selectedEquipment } = useEquipmentStore();
  const { systemDate, setSystemDate } = useDevStore();

  const [languageError, setLanguageError] = useState<string | null>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [pendingName, setPendingName] = useState(name);
  const [isEquipmentOpen, setIsEquipmentOpen] = useState(false);

  const handleLanguageClick = () => {
    setLanguageError('Only English is supported right now');
    setTimeout(() => setLanguageError(null), 3000);
  };

  const startEditingName = () => {
    setPendingName(name);
    setIsEditingName(true);
  };

  const saveName = () => {
    if (pendingName.trim()) setName(pendingName.trim());
    setIsEditingName(false);
  };

  const handleNameKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') saveName();
    if (event.key === 'Escape') setIsEditingName(false);
  };

  const cycleGender = () => {
    const nextIndex = (GENDER_OPTIONS.indexOf(gender) + 1) % GENDER_OPTIONS.length;
    setGender(GENDER_OPTIONS[nextIndex]);
  };

  const equipmentLabel =
    selectedEquipment.length === 0
      ? 'No equipment'
      : `${selectedEquipment.length} equipment${selectedEquipment.length !== 1 ? 's' : ''}`;

  const handleClearData = async () => {
    if (confirm('Are you sure? This will delete EVERYTHING.')) {
      await db.delete();
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <>
      <div className="min-h-screen bg-background p-6 pb-32 pt-12 text-white">
        <h1 className="mb-8 text-3xl font-bold">Settings</h1>

        <section className="mb-8">
          <SectionHeading>About you</SectionHeading>
          <div className="rounded-2xl bg-zinc-900 px-5">
            <div className="flex items-center justify-between border-b border-dashed border-zinc-800 py-4">
              <div className="flex items-center gap-3 text-zinc-300">
                <User className="h-5 w-5 text-zinc-500" />
                <span className="text-sm font-medium">Name</span>
              </div>
              {isEditingName ? (
                <input
                  type="text"
                  value={pendingName}
                  onChange={(event) => setPendingName(event.target.value)}
                  onBlur={saveName}
                  onKeyDown={handleNameKeyDown}
                  autoFocus
                  className="w-32 border-none bg-transparent text-right text-sm font-bold text-white caret-white outline-none"
                />
              ) : (
                <span
                  onClick={startEditingName}
                  className="cursor-pointer text-sm font-bold text-white hover:text-zinc-300"
                >
                  {name}
                </span>
              )}
            </div>
            <ListItem icon={GENDER_ICONS[gender]} label="Gender" value={gender} onClick={cycleGender} />
            <ListItem
              icon={Dumbbell}
              label="Your equipment"
              value={equipmentLabel}
              onClick={() => setIsEquipmentOpen(true)}
              isLast
            />
          </div>
        </section>

        <section>
          <SectionHeading>Appearance</SectionHeading>
          <div className="rounded-2xl bg-zinc-900 px-5">
            <ListItem
              icon={Ruler}
              label="Units"
              value={units === 'Metrics' ? 'Metric (kg)' : 'Imperial (lbs)'}
              onClick={() => setUnits(units === 'Metrics' ? 'Imperial' : 'Metrics')}
            />
            <div className="flex items-center justify-between border-b border-dashed border-zinc-800 py-4">
              <div className="flex items-center gap-3 text-zinc-300">
                <Palette className="h-5 w-5 text-zinc-500" />
                <span className="text-sm font-medium">Main color</span>
              </div>
              <ColorPicker value={appColor} onChange={setAppColor} />
            </div>
            <ListItem
              icon={Calendar}
              label="Week starts"
              value={weekStart}
              onClick={() => setWeekStart(weekStart === 'Monday' ? 'Sunday' : 'Monday')}
            />
            <ListItem
              icon={Globe}
              label="Language"
              value={language}
              isLast
              onClick={handleLanguageClick}
              errorMessage={languageError ?? undefined}
            />
          </div>
        </section>

        <section className="mt-12">
          <div className="space-y-4 rounded-xl border border-red-900/50 bg-red-900/10 p-4">
            <div>
              <h3 className="font-bold text-red-400">Clear all data</h3>
              <p className="text-sm text-zinc-400">Permanently delete everything.</p>
            </div>
            <Button
              variant="secondary"
              className="w-full border border-red-900/50 bg-red-900/20 text-red-400 hover:bg-red-900/40"
              onClick={handleClearData}
            >
              Clear Data
            </Button>
          </div>
        </section>

        <section className="mt-8">
          <SectionHeading>Developer</SectionHeading>
          <div className="rounded-2xl bg-zinc-900 px-5 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-zinc-300">
                <Terminal className="h-5 w-5 text-zinc-500" />
                <span className="text-sm font-medium">System Date Override</span>
              </div>
              <input
                type="date"
                className="rounded-lg bg-zinc-800 p-2 text-xs font-bold text-white outline-none"
                onChange={(event) => {
                  if (event.target.valueAsDate) setSystemDate(event.target.valueAsDate);
                }}
              />
            </div>
            <p className="mt-2 text-[10px] text-zinc-500">
              Current simulated: {new Date(systemDate).toDateString()}
            </p>
          </div>
        </section>
      </div>

      <EquipmentSheet isOpen={isEquipmentOpen} onClose={() => setIsEquipmentOpen(false)} />
    </>
  );
}
