import { cn } from '../../lib/utils';
import { PRESET_COLORS } from '../../constants';

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
}

/** Preset swatches plus a native colour input for custom values. */
export const ColorPicker = ({ value, onChange }: ColorPickerProps) => {
  const isCustom = !PRESET_COLORS.includes(value as (typeof PRESET_COLORS)[number]);

  return (
    <div className="flex justify-end gap-2">
      {PRESET_COLORS.map((color) => (
        <button
          key={color}
          aria-label={`Select colour ${color}`}
          onClick={() => onChange(color)}
          className={cn(
            'h-6 w-6 rounded-full border-2 transition-all',
            value === color
              ? 'scale-110 border-white'
              : 'border-transparent opacity-70 hover:opacity-100',
          )}
          style={{ backgroundColor: color }}
        />
      ))}

      <div className="relative">
        <button
          aria-label="Pick a custom colour"
          className={cn(
            'flex h-6 w-6 items-center justify-center rounded-full border bg-zinc-800 transition-all',
            isCustom ? 'scale-110 border-white' : 'border-zinc-700 opacity-70 hover:opacity-100',
          )}
        >
          <div
            className="h-4 w-4 rounded-full bg-gradient-to-br from-red-500 via-green-500 to-blue-500 opacity-80"
            style={isCustom ? { background: value } : undefined}
          />
        </button>
        <input
          type="color"
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      </div>
    </div>
  );
};
