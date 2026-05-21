import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/");
    }
  }, [navigate, user]);

  const cards = [
    {
      id: 1,
      title: "סטודיו AI",
      desc: "צור תמונות עסקיות ברזולוציה גבוהה ובטון פרימיום.",
      path: "/create/image-studio",
      featured: true,
    },
    {
      id: 2,
      title: "סטטוס אישי",
      desc: "נהל את החשבון, הקרדיטים והעדפות המערכת.",
      path: "/profile",
    },
    {
      id: 3,
      title: "ניתוחים עסקיים",
      desc: "קבל דוחות מהירים על ביצועי העסק שלך.",
      path: "/create/analytics",
    },
    {
      id: 4,
      title: "בחר מסלול",
      desc: "שדרג לתכנית פרימיום עם ניהול עסקי מקצועי.",
      path: "/pricing",
    },
    {
      id: 5,
      title: "תמיכה מקצועית",
      desc: "מצא פתרונות מהירים למוקדי שירות ותהליכים.",
      path: "/support",
    },
  ];

  return (
    <div className="min-h-screen bg-white text-[#000B18]" dir="rtl">
      <main className="mx-auto max-w-7xl px-6 py-10">
        <section className="text-center">
          <div className="mx-auto max-w-4xl">
            <h1 className="mx-auto max-w-full whitespace-nowrap text-[clamp(1.5rem,2.2vw,2rem)] font-semibold tracking-tight text-[#000B18]">
              ברוכים הבאים למרכז הניהול העסקי שלך
            </h1>
            <p className="mt-4 text-sm leading-7 text-[#475569]">
              בחר את הפעולה הבאה כדי להתקדם במהירות ובסטייל.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <button
                onClick={() => navigate("/auth?mode=login")}
                className="min-w-[160px] rounded-3xl bg-[#000B18] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#000B18]/90"
              >
                התחברות
              </button>
              <button
                onClick={() => navigate("/auth?mode=register")}
                className="min-w-[160px] rounded-3xl bg-[#000B18] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#000B18]/90"
              >
                הרשמה
              </button>
            </div>
          </div>
        </section>

        <section className="mt-12 grid grid-cols-1 md:grid-cols-5 gap-6">
          {cards.map((card) => (
            <button
              key={card.id}
              type="button"
              onClick={() => navigate(card.path)}
              className={`group flex h-[18rem] w-full flex-col justify-between overflow-hidden rounded-[24px] border bg-white p-4 text-right transition-all duration-300 ${card.featured ? "border-[#000B18] shadow-[0_16px_40px_rgba(0,11,24,0.12)]" : "border-[#E2E8F0] shadow-[0_10px_25px_rgba(0,11,24,0.06)]"} hover:border-transparent hover:bg-[#000B18] hover:text-white`}
            >
              <div className="space-y-4">
                {card.featured && (
                  <span className="inline-flex rounded-full bg-[#000B18] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.26em] text-white">
                    הכי מומלץ
                  </span>
                )}
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold transition-colors duration-300 group-hover:text-white">
                    {card.title}
                  </h2>
                  <p className="text-sm leading-7 text-[#475569] transition-colors duration-300 group-hover:text-white/90">
                    {card.desc}
                  </p>
                </div>
              </div>
              <div className="inline-flex w-full items-center justify-center rounded-full border border-[#000B18] px-4 py-3 text-sm font-semibold text-[#000B18] transition-all duration-300 group-hover:border-transparent group-hover:bg-white/10 group-hover:text-white">
                פתח
              </div>
            </button>
          ))}
        </section>
      </main>
    </div>
  );
};

export default DashboardPage;
