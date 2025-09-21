// src/components/CampaignCard.tsx
import Link from "next/link";

type Props = {
  id: string | number;
  title: string;
  cover: string | null;
  goal: number;      // mục tiêu (đ)
  raised: number;    // đã quyên góp (đ)
  orgName?: string | null;
  orgSlug?: string | null;
  badge?: string | undefined;
};

function toNum(v: any, d = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
}
function pct(raised: number, goal: number) {
  const g = Math.max(0, toNum(goal));
  if (!g) return 0;
  return Math.max(0, Math.min(100, Math.round((toNum(raised) / g) * 100)));
}
const fmtVND = (n: number) =>
  new Intl.NumberFormat("vi-VN").format(Math.round(toNum(n)));

export default function CampaignCard({
  id,
  title,
  cover,
  goal,
  raised,
  orgName,
  orgSlug,
  badge,
}: Props) {
  const progress = pct(raised, goal);
  const href = `/campaigns/${id}`;
  const img = cover || "/images/campaigns/placeholder.jpg"; // bạn có thể thay đường dẫn placeholder

  return (
    <article className="card card-hover overflow-hidden">
      {/* Cover */}
      <Link href={href} className="block relative">
        {/* Aspect 16:10 để lưới đều nhau */}
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
          {/* Dùng <img> thường để không phụ thuộc next/image config */}
          <img
            src={img}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {badge && (
            <span className="absolute left-3 top-3 rounded-full bg-emerald-600/95 px-3 py-1 text-xs font-semibold text-white shadow">
              {badge}
            </span>
          )}
        </div>
      </Link>

      {/* Body */}
      <div className="space-y-3 p-4">
        {/* Tiêu đề */}
        <Link
          href={href}
          className="line-clamp-2 text-base font-semibold leading-snug text-slate-900 hover:text-emerald-700"
          title={title}
        >
          {title}
        </Link>

        {/* Tổ chức */}
        {(orgName || orgSlug) && (
          <div className="text-sm text-slate-600">
            Tổ chức:{" "}
            {orgSlug ? (
              <Link
                href={`/org/${orgSlug}`}
                className="font-medium text-slate-800 hover:text-emerald-700"
              >
                {orgName || orgSlug}
              </Link>
            ) : (
              <span className="font-medium text-slate-800">{orgName}</span>
            )}
          </div>
        )}

        {/* Progress */}
        <div className="space-y-2">
          <div
            className="h-2 w-full overflow-hidden rounded-full bg-slate-200"
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Tiến độ gây quỹ"
            title={`Hoàn thành ${progress}%`}
          >
            <div
              className="h-full rounded-full bg-emerald-600 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-sm text-slate-600">
            <span>
              Đã quyên góp:{" "}
              <strong className="text-slate-900">{fmtVND(raised)}đ</strong>
            </span>
            <span>
              Mục tiêu: <strong className="text-slate-900">{fmtVND(goal)}đ</strong>
            </span>
          </div>
        </div>

        {/* CTA */}
        <div className="pt-1">
          <Link
            href={href}
            className="shine-btn inline-flex w-full items-center justify-center rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow hover:-translate-y-0.5"
          >
            Ủng hộ ngay
          </Link>
        </div>
      </div>
    </article>
  );
}
