import {getTranslations} from "next-intl/server";
import {PageHeader} from "@/components/layout/page-header";
import {ReviewCard} from "@/features/review/components/review-card";
import {getDueReview} from "@/features/review/services/review-service";

export default async function ReviewPage() {
  const t = await getTranslations("Review");
  const review = await getDueReview();

  return (
    <div className="space-y-5">
      <PageHeader title={t("title")} subtitle={t("subtitle")} />
      <ReviewCard item={review} />
    </div>
  );
}
