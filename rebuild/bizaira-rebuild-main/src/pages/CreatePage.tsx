import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import {
  Camera, MessageSquare, BarChart3, CalendarClock, DollarSign, BookOpen,
  ChevronLeft, ChevronRight,
} from "lucide-react";

const CREAM_BG = "#FBF4E8";
const NAVY = "#001830";
const GRAY_TEXT = "#6B7280";
const ICON_BG = "#E9EEF5";

const CreatePage = () => {
  const navigate = useNavigate();
  const { t, lang } = useI18n();
  const isHe = lang === "he";
  const [selectedTool, setSelectedTool] = useState("message");
  const Arrow = isHe ? ChevronLeft : ChevronRight;

  const toolTypes = [
    { id: "studio",    icon: Camera,       title: "סטודיו תמונות",   desc: "תמונות מוצר, לוגו, פרופיל עסקי וסטורי", route: "/create/product-photos" },
    { id: "message",   icon: MessageSquare, title: "הודעות AI",      desc: "ניסוח שיווקי חכם",              route: "/create/messages" },
    { id: "analytics", icon: BarChart3,     title: "ניתוח עסקי",      desc: "תובנות ומסקנות חכמות",          route: "/create/analytics" },
    { id: "time",      icon: CalendarClock, title: "ניהול זמן",       desc: "אופטימיזציה חכמה",            route: "/create/time" },
    { id: "pricing",   icon: DollarSign,   title: "תמחור חכם",       desc: "אסטרטגיית מחירים",             route: "/create/pricing" },
    { id: "journal",   icon: BookOpen,     title: "יומן עסקי",       desc: "ניהול פגישות ותזכורות",         route: "/journal" },
  ];

  return (
    <div className="min-h-screen pb-28 px-5" dir={isHe ? "rtl" : "ltr"} style={{ backgroundColor: CREAM_BG }}>
      <div className="mb-7">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">
          {isHe ? "סטודיו AI" : "AI Studio"}
        </p>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">
          {t("create.title")}
        </h1>
      </div>

      <div className="space-y-3">
        {toolTypes.map((tool, i) => {
          const IconComp = tool.icon;
          const isActive = selectedTool === tool.id;

          return (
            <button
              key={tool.id}
              onClick={() => {
                setSelectedTool(tool.id);
                navigate(tool.route);
              }}
              className={`relative w-full rounded-3xl bg-white shadow-[0_18px_50px_-28px_rgba(0,24,48,0.18)] transition-all duration-300 ease-out overflow-hidden ${isActive ? "border border-[#001830]" : "border border-transparent hover:border-slate-200"}`}
              style={{ animationDelay: `${i * 55}ms` }}
            >
              {isActive && <div className="absolute top-0 right-0 h-full w-1 bg-[#001830]" />}

              <div className="flex items-center justify-between gap-4 px-5 py-5">
                <div className="flex items-center gap-4 flex-row-reverse">
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: ICON_BG }}>
                    <IconComp size={24} strokeWidth={1.5} style={{ color: NAVY }} />
                  </div>

                  <div className="text-right">
                    <div className="text-lg font-semibold leading-snug" style={{ color: NAVY }}>
                      {tool.title}
                    </div>
                    <div className="text-sm leading-relaxed mt-1" style={{ color: GRAY_TEXT }}>
                      {tool.desc}
                    </div>
                  </div>
                </div>

                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#F1F6FB]">
                  <Arrow size={18} strokeWidth={2} style={{ color: NAVY, opacity: 0.65 }} />
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CreatePage;
