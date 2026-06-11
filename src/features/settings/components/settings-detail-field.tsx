type SettingsDetailFieldProps = {
  label: string;
  value: React.ReactNode;
};

export function SettingsDetailField({
  label,
  value,
}: SettingsDetailFieldProps) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium tracking-wide text-stone-500 uppercase">
        {label}
      </p>
      <div className="text-sm text-stone-900">{value}</div>
    </div>
  );
}
