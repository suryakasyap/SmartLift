import { useState } from 'react';
import { useThemeStore } from '../store/themeStore';
import { useUserStore } from '../store/userStore';
import { ColorPicker } from '../components/FormComponents';
import { User, Ruler, Palette, Globe, Calendar, Dumbbell, Mars, Venus } from 'lucide-react';
import { cn } from '../lib/utils';
import { Button } from '../components/Button';
import { EquipmentSheet } from '../components/EquipmentSheet';
import { useEquipmentStore } from '../store/equipmentStore';
import { useDevStore } from '../store/devStore';
import { Terminal } from 'lucide-react'; // Dev icon

// Reusable List Item Component
const ListItem = ({
    icon: Icon,
    label,
    value,
    onClick,
    isLast = false,
    className,
    errorMessage
}: {
    icon?: React.ComponentType<{ className?: string }> | (() => React.ReactNode),
    label: string,
    value?: React.ReactNode,
    onClick?: () => void,
    isLast?: boolean,
    className?: string,
    errorMessage?: string
}) => (
    <div
        onClick={onClick}
        className={cn(
            "flex flex-col py-4 px-5 -mx-5 cursor-pointer active:bg-zinc-800/50 transition-colors rounded-xl",
            !isLast && "border-b border-zinc-800 border-dashed",
            className
        )}
    >
        <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3 text-zinc-300">
                {Icon && <Icon className="w-5 h-5 text-zinc-500" />}
                <span className="font-medium text-sm">{label}</span>
            </div>
            <div className="flex items-center gap-2">
                {typeof value === 'string' ? (
                    <span className="text-white font-bold text-sm">{value}</span>
                ) : value}
            </div>
        </div>
        {errorMessage && (
            <p className="text-[10px] text-red-500 font-medium mt-2 pl-8 opacity-0 animate-in fade-in slide-in-from-top-1 fill-mode-forwards opacity-100">
                {errorMessage}
            </p>
        )}
    </div>
);

export default function Settings() {
    const { appColor, setAppColor } = useThemeStore();
    const {
        name, setName,
        gender, setGender,
        units, setUnits,
        weekStart, setWeekStart,
        language
    } = useUserStore();

    const [languageError, setLanguageError] = useState<string | null>(null);
    const [isEditingName, setIsEditingName] = useState(false);
    const [tempName, setTempName] = useState(name);
    const [isEquipmentOpen, setIsEquipmentOpen] = useState(false);

    const { selectedEquipment } = useEquipmentStore();

    const getGenderIcon = () => {
        switch (gender) {
            case 'Male': return Mars;
            case 'Female': return Venus;
            default: return () => <span className="text-zinc-500 text-xl leading-none">⚥</span>;
        }
    };

    const handleLanguageClick = () => {
        setLanguageError("Only English is supported right now");
        setTimeout(() => setLanguageError(null), 3000);
    };

    // Name edit handlers
    const handleNameClick = () => {
        setTempName(name);
        setIsEditingName(true);
    };

    const handleNameSave = () => {
        if (tempName.trim()) setName(tempName.trim());
        setIsEditingName(false);
    };

    const handleNameKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleNameSave();
        if (e.key === 'Escape') setIsEditingName(false);
    };

    const toggleGender = () => {
        const options: ('Male' | 'Female' | 'Other')[] = ['Male', 'Female', 'Other'];
        const nextIndex = (options.indexOf(gender) + 1) % options.length;
        setGender(options[nextIndex]);
    };

    const toggleUnits = () => setUnits(units === 'Metrics' ? 'Imperial' : 'Metrics');
    const toggleWeekStart = () => setWeekStart(weekStart === 'Monday' ? 'Sunday' : 'Monday');

    return (
        <>
            <div className="p-6 pt-12 min-h-screen bg-black text-white pb-32">

                {/* Header (Hidden in design? Usually yes, or minimal) */}
                {/* The design just starts with "About you" */}
                <h1 className="text-3xl font-bold mb-8">Settings</h1>

                {/* About You Section */}
                <div className="mb-8">
                    <h2 className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-2 ml-1">About you</h2>
                    <div className="bg-zinc-900 rounded-2xl px-5">
                        {/* Name Row - Inline Edit */}
                        <div className="flex items-center justify-between py-4 border-b border-zinc-800 border-dashed">
                            <div className="flex items-center gap-3 text-zinc-300">
                                <User className="w-5 h-5 text-zinc-500" />
                                <span className="font-medium text-sm">Name</span>
                            </div>
                            {isEditingName ? (
                                <input
                                    type="text"
                                    value={tempName}
                                    onChange={(e) => setTempName(e.target.value)}
                                    onBlur={handleNameSave}
                                    onKeyDown={handleNameKeyDown}
                                    autoFocus
                                    className="bg-transparent border-none outline-none text-sm text-white text-right w-32 font-bold caret-white"
                                />
                            ) : (
                                <span
                                    onClick={handleNameClick}
                                    className="text-white font-bold text-sm cursor-pointer hover:text-zinc-300"
                                >
                                    {name}
                                </span>
                            )}
                        </div>
                        <ListItem
                            icon={getGenderIcon()}
                            label="Gender"
                            value={gender}
                            onClick={toggleGender}
                        />
                        <ListItem
                            icon={Dumbbell}
                            label="Your equipment"
                            value={selectedEquipment.length === 0 ? "No equipment" : `${selectedEquipment.length} equipment${selectedEquipment.length !== 1 ? 's' : ''}`}
                            onClick={() => setIsEquipmentOpen(true)}
                            isLast
                        />
                    </div>
                </div>

                {/* Appearance Section */}
                <div>
                    <h2 className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-2 ml-1">Appearance</h2>
                    <div className="bg-zinc-900 rounded-2xl px-5">
                        <ListItem
                            icon={Ruler}
                            label="Units"
                            value={units === 'Metrics' ? 'Metric (kg)' : 'Imperial (lbs)'}
                            onClick={toggleUnits}
                        />
                        {/* Theme (Light/Dark? Image has "Theme" but grayed out or hard to read. Assuming it's there.) */}
                        {/* <ListItem label="Theme" value="Dark" /> */}

                        {/* Main Color - Special Case */}
                        <div className="flex items-center justify-between py-4 border-b border-zinc-800 border-dashed">
                            <div className="flex items-center gap-3 text-zinc-300">
                                <Palette className="w-5 h-5 text-zinc-500" />
                                <span className="font-medium text-sm">Main color</span>
                            </div>
                            <div>
                                {/* Reusing existing inline ColorPicker for simplicity, but making it look compact */}
                                <ColorPicker value={appColor} onChange={setAppColor} />
                            </div>
                        </div>

                        <ListItem
                            icon={Calendar}
                            label="Week starts"
                            value={weekStart}
                            onClick={toggleWeekStart}
                        />
                        <ListItem
                            icon={Globe}
                            label="Language"
                            value={language}
                            isLast
                            onClick={handleLanguageClick}
                            errorMessage={languageError || undefined}
                        />
                    </div>
                </div>

                {/* Danger Zone - Kept at bottom */}
                <div className="mt-12">
                    <div className="bg-red-900/10 p-4 rounded-xl border border-red-900/50 space-y-4">
                        <div>
                            <h3 className="font-bold text-red-400">Clear all data</h3>
                            <p className="text-sm text-zinc-400">Permanently delete everything.</p>
                        </div>
                        <Button
                            variant="secondary"
                            className="w-full bg-red-900/20 text-red-400 border border-red-900/50 hover:bg-red-900/40"
                            onClick={async () => {
                                if (confirm("Are you sure? This will delete EVERYTHING.")) {
                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                    await (window as any).indexedDB.deleteDatabase('WorkoutTrackerDB');
                                    localStorage.clear();
                                    window.location.reload();
                                }
                            }}
                        >
                            Clear Data
                        </Button>
                    </div>
                </div>


                {/* Developer Settings */}
                <div className="mt-8">
                    <h2 className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-2 ml-1">Developer</h2>
                    <div className="bg-zinc-900 rounded-2xl px-5 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 text-zinc-300">
                                <Terminal className="w-5 h-5 text-zinc-500" />
                                <span className="font-medium text-sm">System Date Override</span>
                            </div>
                            <input
                                type="date"
                                className="bg-zinc-800 text-white p-2 rounded-lg text-xs font-bold outline-none"
                                onChange={(e) => {
                                    if (e.target.valueAsDate) {
                                        useDevStore.getState().setSystemDate(e.target.valueAsDate);
                                    }
                                }}
                            />
                        </div>
                        <p className="text-[10px] text-zinc-500 mt-2">
                            Current simulated: {useDevStore.getState().getSystemDate().toDateString()}
                        </p>
                    </div>
                </div>
            </div>

            <EquipmentSheet
                isOpen={isEquipmentOpen}
                onClose={() => setIsEquipmentOpen(false)}
            />
        </>
    );
}
