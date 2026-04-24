import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import {
  Camera, MessageSquare, BarChart3, CalendarClock, DollarSign, BookOpen,
  ChevronLeft, ChevronRight,
} from "lucide-react";

const NAVY   = "#001830";
const PURPLE = "#0D2344";

const CreatePage = () => {
  const navigate = useNavigate();
  const { t, lang } = useI18n();
  const isHe = lang === "he";
  const Arrow = isHe ? ChevronLeft : ChevronRight;
  const [selectedTool, setSelectedTool] = useState("message");

  const tools = [
    {
      id: "studio",
      icon: Camera,
      title: "סטודיו תמונות",
      desc: "תמונות מוצר, לוגו, פרופיל עסקי וסטורי",
      route: "/create/product-photos",
    },
    {
      id: "message",
      icon: MessageSquare,
      title: "הודעות AI",
      desc: "ניסוח שיווקי חכם",
      route: "/create/messages",
    },
    {
      id: "analytics",
      icon: BarChart3,
      title: "ניתוח עסקי",
      desc: "תובנות ומסקנות חכמות",
      route: "/create/analytics",
    },
    {
      id: "time",
      icon: CalendarClock,
      title: "ניהול זמן",
      desc: "אופטימיזציה חכמה",
      route: "/create/time",
    },
    {
      id: "pricing",
      icon: DollarSign,
      title: "תמחור חכם",
      desc: "אסטרטגיית מחירים",
      route: "/create/pricing",
    },
    {
      id: "journal",
      icon: BookOpen,
      title: "יומן עסקי",
      desc: "ניהול פגישות ותזכורות",
      route: "/journal",
    },
  ];

  return (
    <div className="min-h-screen pb-28 bg-[#f8f2e6]" dir={isHe ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="px-5 pt-8 mb-6">
        <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
          {isHe ? "סטודיו AI" : "AI Studio"}
        </p>
        <h1 className="text-2xl font-black" style={{ color: NAVY }}>
          {t("create.title")}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {isHe ? "בחרי את הכלי שתרצי לפתוח" : "Choose the tool you'd like to open"}
        </p>
      </div>

      {/* Tool cards */}
      <div className="flex flex-col gap-3 px-5">
        {tools.map((tool, i) => {
          const IconComp = tool.icon;
          const isActive = selectedTool === tool.id;

          return (
            <button
              key={tool.id}
              onClick={() => {
                setSelectedTool(tool.id);
                navigate(tool.route);
              }}
              className={`relative w-full rounded-2xl bg-white shadow-sm border transition-all duration-300 ease-out overflow-hidden group ${isActive ? "border-[1px] border-[#001830]" : "border border-transparent hover:border-slate-200"}`}
              style={{ animationDelay: `${i * 55}ms` }}
            >
              {isActive && (
                <div className="absolute top-0 right-0 h-full w-1 bg-[#001830]" />
              )}

              <div className="flex items-center justify-between gap-4 px-4 py-4 transition-all duration-300">
                <div className="flex items-center gap-4 flex-row-reverse">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110"
                    style={{ background: "hsl(252 73% 96%)" }}
                  >
                    <IconComp size={20} strokeWidth={1.5} style={{ color: PURPLE }} />
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold leading-snug" style={{ color: NAVY }}>
                      {tool.title}
                    </div>
                    <div className="text-[11px] text-muted-foreground leading-relaxed mt-0.5">
                      {tool.desc}
                    </div>
                  </div>
                </div>

                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-300"
                  style={{ background: "hsl(220 18% 95%)" }}
                >
                  <Arrow size={14} strokeWidth={2} style={{ color: NAVY, opacity: 0.5 }} />
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
