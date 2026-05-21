import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useI18n } from "@/lib/i18n";

const SupportPage = () => {
  const { t, lang } = useI18n();
  const isHe = lang === "he";
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const faqs = [
    { q: t("faq.q1"), a: t("faq.a1") },
    { q: t("faq.q2"), a: t("faq.a2") },
    { q: t("faq.q3"), a: t("faq.a3") },
    { q: t("faq.q4"), a: t("faq.a4") },
    { q: t("faq.q5"), a: t("faq.a5") },
  ];

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredFaqs = normalizedQuery
    ? faqs.filter((faq) => {
        const content = `${faq.q} ${faq.a}`.toLowerCase();
        return content.includes(normalizedQuery);
      })
    : faqs;

  return (
    <div className="min-h-screen bg-white px-5 pt-10 pb-28" dir={isHe ? "rtl" : "ltr"}>
      <div className="mx-auto max-w-5xl">
        <div className="mb-12">
          <p className="text-[11px] font-semibold uppercase tracking-[0.4em] text-[#64748B] mb-3">
            {isHe ? "מרכז תמיכה" : "Support Center"}
          </p>
          <h1 className="text-5xl font-black tracking-tight text-[#000B18] mb-4">
            {t("support.title")}
          </h1>
          <p className="max-w-3xl text-lg leading-9 text-[#1F2937]">
            {t("support.subtitle")}
          </p>
        </div>

        <section className="mb-8 space-y-4">
          <div className="rounded-[32px] border border-[#000B18] bg-white p-6 shadow-[0_24px_60px_rgba(0,11,24,0.08)]">
            <div className="mb-5">
              <p className="text-xs uppercase tracking-[0.35em] text-[#64748B]">
                {isHe ? "עזרה מהירה" : "Quick Help"}
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-[#000B18]">
                {isHe ? "חיפוש ב-FAQ" : "Search the FAQ"}
              </h2>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    setSearchQuery(searchQuery.trim());
                  }
                }}
                placeholder={isHe ? "חפש שאלות ותשובות ב-FAQ" : "Search questions and answers in FAQ"}
                className="flex-1 min-w-0 rounded-full border border-[#000B18] bg-white px-5 py-4 text-base text-[#000B18] placeholder:text-[#94a3b8] shadow-[0_18px_40px_rgba(0,11,24,0.08)] focus:border-[#000B18] focus:outline-none focus:ring-2 focus:ring-[#000B18]/10"
              />
              <button
                type="button"
                className="inline-flex min-w-[140px] items-center justify-center rounded-full bg-[#000B18] px-5 py-4 text-sm font-semibold uppercase tracking-[0.08em] text-white transition hover:bg-[#000B18]/90"
                onClick={() => setSearchQuery(searchQuery.trim())}
              >
                {isHe ? "חפש" : "Search"}
              </button>
            </div>
            <p className="mt-4 text-sm leading-7 text-[#475569]">
              {isHe
                ? "העוזר החכם מנתח את בקשתך ומציע פתרונות עסקיים מהירים וחדים."
                : "The smart assistant analyzes your request and offers fast, sharp business guidance."}
            </p>
          </div>
        </section>

        <section className="space-y-4">
          {filteredFaqs.length === 0 ? (
            <div className="rounded-[28px] border border-[#E5E7EB] bg-[#F8F9FB] p-12 text-center">
              <p className="text-lg font-semibold text-[#000B18]">
                לא נמצאו תוצאות מתאימות. לניסוח אחר או פנה לתמיכה.
              </p>
            </div>
          ) : (
            filteredFaqs.map((faq, i) => {
              const isOpen = openFaq === i;
              return (
                <div key={i} className="overflow-hidden rounded-[28px] border border-[#E5E7EB] bg-white shadow-[0_14px_32px_rgba(0,11,24,0.04)]">
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : i)}
                    className="group w-full flex items-center justify-between px-6 py-5 text-start transition-colors duration-200 hover:bg-[#000B18] hover:text-white"
                  >
                    <span className="text-base font-semibold text-[#000B18] transition-colors duration-200">
                      {faq.q}
                    </span>
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#F3F7FB] text-[#475569] transition-colors duration-200 group-hover:bg-white">
                      {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </div>
                  </button>
                  {isOpen && (
                    <div className="border-t border-[#E5E7EB] px-6 py-5 bg-white">
                      <p className="text-sm leading-8 text-[#475569]">{faq.a}</p>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </section>
      </div>
    </div>
  );
};

export default SupportPage;
