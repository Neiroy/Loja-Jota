import type { LucideIcon } from 'lucide-react';
import {
  Info,
  LayoutGrid,
  Shield,
  SlidersHorizontal,
  Store,
  UserRound,
} from 'lucide-react';

import { StatusBadge } from '@/components/shared/status-badge';
import { SettingsDetailField } from '@/features/settings/components/settings-detail-field';
import { SettingsModuleBadges } from '@/features/settings/components/settings-module-badges';
import { cn } from '@/lib/utils';
import type { SettingsOverview } from '@/types/settings.types';

type SettingsOverviewProps = {
  overview: SettingsOverview;
};

type SettingsSectionProps = {
  title: string;
  description?: string;
  icon: LucideIcon;
  children: React.ReactNode;
};

function SettingsSection({
  title,
  description,
  icon: Icon,
  children,
}: SettingsSectionProps) {
  return (
    <section
      className={cn(
        'space-y-4 rounded-xl border border-stone-200 bg-white p-6 shadow-sm'
      )}
    >
      <div className="space-y-1">
        <h2 className="flex items-center gap-2 text-lg font-medium text-stone-800">
          <span className="rounded-lg bg-stone-100 p-2 text-stone-600">
            <Icon className="size-4" />
          </span>
          {title}
        </h2>
        {description ? (
          <p className="text-sm text-stone-500">{description}</p>
        ) : null}
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

export function SettingsOverview({ overview }: SettingsOverviewProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <SettingsSection
        title="Informações da loja"
        description="Identificação do ambiente interno de operação."
        icon={Store}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <SettingsDetailField
            label="Nome da loja"
            value={overview.store.name}
          />
          <SettingsDetailField label="Tipo" value={overview.store.type} />
          <SettingsDetailField
            label="Status"
            value={<StatusBadge variant="paid" label={overview.store.status} />}
          />
          <SettingsDetailField
            label="Ambiente"
            value={overview.store.environment}
          />
        </div>
      </SettingsSection>

      <SettingsSection
        title="Conta e acesso"
        description="Informações da sessão autenticada."
        icon={UserRound}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <SettingsDetailField label="Nome" value={overview.account.fullName} />
          <SettingsDetailField label="E-mail" value={overview.account.email} />
          <SettingsDetailField
            label="Tipo de acesso"
            value={overview.account.roleLabel}
          />
          <SettingsDetailField
            label="Autenticação"
            value={overview.account.authProvider}
          />
        </div>
      </SettingsSection>

      <SettingsSection
        title="Preferências operacionais"
        description="Parâmetros padrão do controle interno da loja."
        icon={SlidersHorizontal}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <SettingsDetailField
            label="Prazo padrão do fiado"
            value={`${overview.preferences.creditTermDays} dias`}
          />
          <SettingsDetailField
            label="Moeda"
            value={overview.preferences.currency}
          />
          <SettingsDetailField
            label="Idioma"
            value={overview.preferences.language}
          />
          <SettingsDetailField
            label="Controle de estoque"
            value={
              <StatusBadge
                variant="paid"
                label={overview.preferences.stockControl}
              />
            }
          />
        </div>
      </SettingsSection>

      <SettingsSection
        title="Módulos ativos"
        description="Funcionalidades disponíveis nesta versão do sistema."
        icon={LayoutGrid}
      >
        <SettingsModuleBadges modules={overview.modules} />
      </SettingsSection>

      <SettingsSection
        title="Segurança"
        description="Controles de acesso e proteção de dados."
        icon={Shield}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <SettingsDetailField
            label="Rotas protegidas"
            value={
              <StatusBadge
                variant="paid"
                label={overview.security.protectedRoutes}
              />
            }
          />
          <SettingsDetailField
            label="RLS"
            value={<StatusBadge variant="paid" label={overview.security.rls} />}
          />
          <SettingsDetailField
            label="Usuários"
            value={overview.security.users}
          />
          <SettingsDetailField
            label="Service Role"
            value={overview.security.serviceRole}
          />
        </div>
      </SettingsSection>

      <SettingsSection
        title="Sobre o sistema"
        description="Informações técnicas da plataforma."
        icon={Info}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <SettingsDetailField label="Versão" value={overview.about.version} />
          <SettingsDetailField
            label="Hospedagem"
            value={overview.about.hosting}
          />
          <SettingsDetailField
            label="Banco de dados"
            value={overview.about.database}
          />
        </div>
      </SettingsSection>
    </div>
  );
}
