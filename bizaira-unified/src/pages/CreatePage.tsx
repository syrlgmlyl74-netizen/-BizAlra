import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import {
  Camera, MessageSquare, BarChart3, CalendarClock, DollarSign, BookOpen,
  ChevronLeft, ChevronRight,
} from "lucide-react";

const CREAM_BG = "#FCFAF7";
const NAVY = "#001830";
const GRAY_TEXT = "#6B7280";
const ICON_BG = "#E9EEF5";

const CreatePage = () => {
  const navigate = useNavigate();
  const { t, lang } = useI18n();
  const isHe = lang === "he";
  const [selectedTool, setSelectedTool] = useState("message");
  const Arrow = isHe ? ChevronLeft : ChevronRight;

  const tools = [
    {
      id: "studio",
      icon: Camera,
      titleKey: "tool.studio.title",
      descKey: "tool.studio.desc",
      route: "/create/product-photos",
    },
    {
      id: "message",
      icon: MessageSquare,
      titleKey: "tool.messages.title",
      descKey: "tool.messages.desc",
      route: "/create/messages",
    },
    {
      id: "analytics",
      icon: BarChart3,
      titleKey: "tool.analytics.title",
      descKey: "tool.analytics.desc",
      route: "/create/analytics",
    },
    {
      id: "time",
      icon: CalendarClock,
      titleKey: "tool.time.title",
      descKey: "tool.time.desc",
      route: "/create/time",
    },
    {
      id: "pricing",
      icon: DollarSign,
      titleKey: "tool.pricing.title",
      descKey: "tool.pricing.desc",
      route: "/create/pricing",
    },
    {
      id: "journal",
      icon: BookOpen,
      titleKey: "tool.journal.title",
      descKey: "tool.journal.desc",
      route: "/journal",
    },
  ];

  return (
    <div className="min-h-screen pb-32" dir={isHe ? "rtl" : "ltr"} style={{ backgroundColor: CREAM_BG }}>
      <div className="px-6 pt-8 pb-6">
        <p className="text-[10px] font-semibold uppercase tracking-widest mb-3" style={{ color: GRAY_TEXT, letterSpacing: "0.1em" }}>
          {isHe ? "סטודיו AI" : "AI STUDIO"}
        </p>

        <h1 className="text-4xl font-black mb-2" style={{ color: NAVY, fontFamily: "'Playfair Display', serif" }}>
          {t("create.title")}
        </h1>

        <p className="text-base leading-relaxed" style={{ color: GRAY_TEXT }}>
          {isHe ? "בחרי את הכלי שתרצי לפתוח" : "Choose the tool you'd like to open"}
        </p>
      </div>

      <div className="px-6 space-y-3">
        {tools.map((tool, i) => {
          const IconComp = tool.icon;

          return (
            <button
              key={tool.id}
              onClick={() => {
                setSelectedTool(tool.id);
                navigate(tool.route);
              }}
              className="group relative w-full rounded-3xl bg-white shadow-[0_18px_50px_-28px_rgba(0,24,48,0.18)] border border-[#E5E7EB] transition-all duration-300 ease-out overflow-hidden hover:bg-[#000C1A] hover:ring-1 hover:ring-[#1f2b4b]/70"
              style={{ animationDelay: `${i * 55}ms`, minHeight: "124px" }}
            >
              <div className="flex items-center gap-4 px-5 py-5 h-full">
                <div className={`flex items-center gap-4 ${isHe ? "flex-row-reverse" : "flex-row"}`}>
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 bg-[#F1F5F9] transition-colors duration-300 group-hover:bg-[#0A1222]">
                    <IconComp size={24} strokeWidth={1.5} className="text-[#001830] transition-colors duration-300 group-hover:text-white" />
                  </div>

                  <div className={isHe ? "text-right" : "text-left"}>
                    <div className="text-lg font-semibold leading-snug text-[#001830] transition-colors duration-300 group-hover:text-white">
                      {t(tool.titleKey)}
                    </div>
                    <div className="text-sm leading-relaxed mt-1 text-[#6B7280] transition-colors duration-300 group-hover:text-slate-300">
                      {t(tool.descKey)}
                    </div>
                  </div>
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
