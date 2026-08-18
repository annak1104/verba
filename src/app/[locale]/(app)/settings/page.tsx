import {getTranslations} from "next-intl/server";
import {PageHeader} from "@/components/layout/page-header";
import {SettingsPanel} from "@/features/settings/components/settings-panel";
import {getUserSettings} from "@/features/settings/services/settings-service";

export default async function SettingsPage() {
  const t = await getTranslations("Settings");
  const settings = await getUserSettings();

  return (
    <div className="space-y-5">
      <PageHeader title={t("title")} subtitle={t("subtitle")} />
      <SettingsPanel settings={settings} />
    </div>
  );
}
