import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import {
  Camera,
  MessageSquare,
  BarChart3,
  Clock,
  Calculator,
  Calendar,
} from "lucide-react";

const CreatePage = () => {
  const navigate = useNavigate();
  const { t, lang } = useI18n();
  const isHe = lang === "he";
  const [selectedTool, setSelectedTool] = useState("message");

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
      icon: Clock,
      titleKey: "tool.time.title",
      descKey: "tool.time.desc",
      route: "/create/time",
    },
    {
      id: "pricing",
      icon: Calculator,
      titleKey: "tool.pricing.title",
      descKey: "tool.pricing.desc",
      route: "/create/pricing",
    },
    {
      id: "calendar",
      icon: Calendar,
      titleKey: "tool.calendar.title",
      descKey: "tool.calendar.desc",
      route: "/journal",
    },
  ];

  return (
    <div className="min-h-screen pb-32 bg-soft-cream text-[#001830]" dir={isHe ? "rtl" : "ltr"}>
      <div className="px-6 pt-10 pb-6">
        <p className="luxury-page-eyebrow mb-3">
          {t("create.heading")}
        </p>

        <h1 className="luxury-page-title mb-3">
          {t("create.title")}
        </h1>

        <p className="luxury-page-copy">
          {t("create.subheading")}
        </p>
      </div>

      <div className="max-w-6xl mx-auto px-6 space-y-4">
        {tools.map((tool) => {
          const IconComp = tool.icon;
          const isSelected = selectedTool === tool.id;

          return (
            <button
              key={tool.id}
              onClick={() => {
                setSelectedTool(tool.id);
                navigate(tool.route);
              }}
              className={`luxury-card group w-full rounded-[12px] border border-[rgba(0,15,33,0.04)] bg-[#FAF9F6] shadow-[0_4px_20px_rgba(0,15,33,0.02)] transition duration-300 ${isSelected ? "ring-1 ring-[#001830]/10" : "hover:-translate-y-0.5 hover:shadow-soft-business"}`}
            >
              <div className="luxury-card-row items-start">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#001830]/10 text-[#001830]">
                    <IconComp size={22} />
                  </div>

                  <div className="space-y-2">
                    <h2 className="luxury-card-title text-lg md:text-xl">{t(tool.titleKey)}</h2>
                    <p className="luxury-card-text text-sm">{t(tool.descKey)}</p>
                  </div>
                </div>

                <div className="rounded-full bg-[#001830] px-3 py-2 text-[10px] font-bold uppercase tracking-[0.24em] text-[#FAF9F6] shadow-[0_10px_24px_rgba(0,24,48,0.12)]">
                  {isHe ? "פתח ←" : "Open →"}
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
