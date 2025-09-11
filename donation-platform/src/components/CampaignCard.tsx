import Link from "next/link";

export default function CampaignCard({
  id, title, cover, goal, raised, orgName, orgSlug, badge,
}: {
  id: string;
  title: string;
  cover?: string | null;
  goal: number;
  raised: number;
  orgName?: string | null;
  orgSlug?: string | null;
  badge?: string;
}) {
  const pct = Math.min(100, Math.round((raised / Math.max(1, goal)) * 100));

  return (
    <div className="h-full bg-white border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition flex flex-col">
      {/* Ảnh cover cố định chiều cao */}
      <Link href={`/campaigns/${id}`} className="block relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          alt=""
          src={cover || "/images/sample-cover.jpg"}
          className="h-44 w-full object-cover"
        />
        {!!badge && (
          <span className="absolute top-2 right-2 text-xs px-2 py-1 rounded bg-rose-600 text-white">
            {badge}
          </span>
        )}
      </Link>

      {/* Nội dung chiếm phần còn lại */}
      <div className="p-4 flex flex-col gap-2 flex-1">
        {/* Tổ chức (chiều cao nhỏ, không ảnh hưởng) */}
        {orgName && (
          orgSlug ? (
            <Link
              href={`/org/${orgSlug}`}
              className="text-xs text-gray-500 hover:text-rose-600 underline underline-offset-2"
            >
              {orgName}
            </Link>
          ) : (
            <p className="text-xs text-gray-500">{orgName}</p>
          )
        )}

        {/* Tiêu đề: khóa min-height để mọi card bằng nhau */}
        <Link
          href={`/campaigns/${id}`}
          className="font-medium hover:text-rose-600 line-clamp-2 min-h-[44px]"  /* ~2 dòng */
        >
          {title}
        </Link>

        {/* Progress */}
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-rose-600" style={{ width: `${pct}%` }} />
        </div>

        {/* Số liệu: đẩy xuống cuối */}
        <div className="mt-auto">
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold text-rose-600">
              {raised.toLocaleString("vi-VN")}đ
            </span>
            <span className="text-gray-500">{pct}%</span>
          </div>
          <p className="text-xs text-gray-400">
            Mục tiêu {goal.toLocaleString("vi-VN")}đ
          </p>
        </div>
      </div>
    </div>
  );
}
