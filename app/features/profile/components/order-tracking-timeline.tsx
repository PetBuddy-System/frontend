import { useTranslation } from "react-i18next";

import { MaterialIcon } from "~/shared/ui";
import { cn } from "~/shared/lib/cn";

interface TimelineEntry {
  icon: string;
  time: string;
  title: string;
  description: string;
}

const MOCK_ENTRIES: TimelineEntry[] = [
  {
    icon: "location_on",
    time: "14:30 - 24/10/2024",
    title: "Đang đến trạm giao hàng Quận 7",
    description:
      "Kiện hàng đã rời trung tâm phân loại TP.HCM và đang trên đường tới bưu cục phát.",
  },
  {
    icon: "warehouse",
    time: "09:15 - 24/10/2024",
    title: "Rời kho trung chuyển miền Nam",
    description:
      "Đơn hàng đã được xử lý xong tại tổng kho và chuyển giao cho đối tác vận chuyển.",
  },
  {
    icon: "box_edit",
    time: "21:00 - 23/10/2024",
    title: "Đã nhập kho trung chuyển",
    description: "Kiện hàng đã đến kho chính PetStore.vn tại TP.HCM.",
  },
  {
    icon: "verified",
    time: "15:45 - 23/10/2024",
    title: "Xác nhận đơn hàng thành công",
    description:
      "PetStore đã tiếp nhận và đang tiến hành đóng gói các sản phẩm của bạn.",
  },
];

export function OrderTrackingTimeline() {
  const { t } = useTranslation("profile");

  return (
    <div className="rounded-2xl bg-card p-6 shadow-sm md:p-8">
      <h2 className="mb-8 flex items-center gap-2 font-display text-xl font-semibold">
        <MaterialIcon name="history" className="text-primary" />
        {t("orderTracking.timeline.title")}
      </h2>

      <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:h-full before:w-0.5 before:-translate-x-px before:bg-border">
        {MOCK_ENTRIES.map((entry, idx) => {
          const isLatest = idx === 0;

          return (
            <div key={idx} className="relative flex items-start gap-8">
              <div
                className={cn(
                  "absolute left-0 mt-1.5 flex h-10 w-10 items-center justify-center rounded-full ring-4 ring-card",
                  isLatest
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground",
                )}
              >
                <MaterialIcon name={entry.icon} className="text-[18px]" />
              </div>
              <div className="pl-14">
                <div className="mb-1 flex flex-col gap-2 md:flex-row md:items-baseline">
                  <time
                    className={cn(
                      "text-sm",
                      isLatest
                        ? "font-bold text-primary"
                        : "font-medium text-muted-foreground",
                    )}
                  >
                    {entry.time}
                  </time>
                  <span
                    className={cn(
                      "font-semibold",
                      isLatest
                        ? "text-foreground"
                        : "text-muted-foreground",
                    )}
                  >
                    {entry.title}
                  </span>
                </div>
                <p className="text-muted-foreground">{entry.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
