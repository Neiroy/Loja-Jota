type SettingsModuleBadgesProps = {
  modules: string[];
};

export function SettingsModuleBadges({ modules }: SettingsModuleBadgesProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {modules.map((module) => (
        <span
          key={module}
          className="inline-flex items-center rounded-full border border-stone-200 bg-stone-50 px-2.5 py-0.5 text-xs font-medium text-stone-700"
        >
          {module}
        </span>
      ))}
    </div>
  );
}
