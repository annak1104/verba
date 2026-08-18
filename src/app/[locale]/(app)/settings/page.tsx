import {getTranslations} from "next-intl/server";
import {PageHeader} from "@/components/layout/page-header";
import {SettingsPanel} from "@/features/settings/components/settings-panel";

export default async function SettingsPage() {
  const t = await getTranslations("Settings");

  return (
    <div className="space-y-5">
      <PageHeader title={t("title")} subtitle={t("subtitle")} />
      <SettingsPanel />
    </div>
  );
}
