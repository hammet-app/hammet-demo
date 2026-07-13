import Link from "next/link";
import { NavEntry } from "@/components/layout/sidebar-config";

type SidebarUIProps = {
  entries: NavEntry[];
  activePath: string;
  onNavigate?: () => void;
  onLogout: () => void;
};

export function SidebarUI({
  entries,
  activePath,
  onNavigate,
  onLogout,
}: SidebarUIProps) {
  return (
    <aside className="flex flex-col h-full w-[240px] bg-purple-dark text-white justify-between">

      {/* TOP */}
      <div className="flex flex-col gap-6 p-4">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-white rounded-sm" />
            <span className="font-semibold text-sm">Hammet</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-cyan rounded-full flex items-center justify-center text-xs font-bold text-purple-dark">
              RU
            </div>
            <div className="w-5 h-5 bg-white rounded-sm" />
          </div>
        </div>

        {/* NAV */}
        <nav className="flex flex-col gap-2">
          {entries.map((entry, i) => {
            if (entry.type === "section") {
              return (
                <p
                  key={i}
                  className="px-2 pt-4 text-[10px] uppercase tracking-wider text-white/30"
                >
                  {entry.label}
                </p>
              );
            }

            if (entry.type === "divider") {
              return (
                <div
                  key={i}
                  className="my-3 border-t border-white/20"
                />
              );
            }

            const item = entry;
            

            if (item.action === "logout") {
              return null; // handled below
            }

            if (!item.href) {
              return null;
            }

            if (!item.badge) {
              return null;
            }

            const isActive =
              activePath === item.href ||
              activePath.startsWith(item.href + "/");

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={`
                  flex items-center gap-2 px-3 py-2 rounded-md text-sm
                  transition
                  ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "text-white/70 hover:text-white hover:bg-white/10"
                  }
                `}
              >
                <item.icon size={16} />
                <span>{item.label}</span>

                {item.badge > 0 && (
                  <span className="ml-auto bg-cyan text-purple-dark text-[10px] px-1.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* BOTTOM */}
      <div className="p-4 flex flex-col gap-4">
        <div className="border-t border-white/30" />

        <button
          onClick={onLogout}
          className="flex items-center gap-2 bg-white text-red-600 px-3 py-2 rounded-md text-sm"
        >
          <div className="w-3 h-3 bg-red-600 rounded-sm" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}