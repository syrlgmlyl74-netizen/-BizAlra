import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";

const SupportPage = () => {
  const { t, lang } = useI18n();
  const isHe = lang === "he";
  const { user, profile } = useAuth();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [aiResponse, setAiResponse] = useState<{ title: string; content: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const faqs = [
    { q: t("faq.q1"), a: t("faq.a1") },
    { q: t("faq.q2"), a: t("faq.a2") },
    { q: t("faq.q3"), a: t("faq.a3") },
    { q: t("faq.q4"), a: t("faq.a4") },
    { q: t("faq.q5"), a: t("faq.a5") },
  ];

  const getAiResponse = (query: string): { title: string; content: string } => {
    const lowerQuery = query.toLowerCase().trim();
    const normalizedQuery = query.trim();

    const contains = (terms: string[]) => terms.some((term) => lowerQuery.includes(term));

    // Guest status queries
    if (contains(["אורח", "מצב אורח", "האם אני אורח", "אני במצב אורח", "guest", "guest mode"])) {
      return {
        title: isHe ? "סטטוס חשבון" : "Account Status",
        content: isHe
          ? "כן, כרגע את/ה מחובר/ת במצב אורח. כדי לשמור את הנתונים ולעדכן פרטים, מומלץ לבצע הרשמה קצרה במערכת. זה ייתן לך גישה מלאה לכל הכלים וההיסטוריה שלך."
          : "Yes, you are currently logged in as a guest. To save your data and update your profile, we recommend completing a quick registration. This will give you full access to all tools and your history.",
      };
    }

    // General greetings
    if (contains(["היי", "שלום", "מה קורה", "מה נשמע", "מה שלומך", "היי!", "שלום!", "hello", "hi"])) {
      return {
        title: isHe ? "ברוכים הבאים" : "Welcome",
        content: isHe
          ? "היי! במה אני יכול לעזור לך היום במרכז הניהול העסקי?"
          : "Hey! How can I help you today with your business management center?",
      };
    }

    // Platform features, how it works and BizAIra overview
    if (
      contains([
        "פיצ'רים",
        "איך זה עובד",
        "איך עובד",
        "איך משתמשים",
        "מה זה",
        "מה BizAIra",
        "bizaira",
        "ביזאירה",
        "כלים",
        "יצירת תוכן",
        "תמונות מוצר",
        "ניתוח עסקי",
        "ניהול זמן",
        "AI",
        "features",
        "how it works",
      ])
    ) {
      return {
        title: isHe ? "על BizAIra" : "About BizAIra",
        content: isHe
          ? "BizAIra היא פלטפורמת AI עסקית חכמה שמאגדת כלים ליצירת תוכן שיווקי, יצירת תמונות מוצר מדויקות, ניתוח עסקי וניהול זמן. העבודה קלה: אתה כותב שאלה או בקשה, והמערכת יוצרת עבורך פתרונות מוכנים לשימוש. ניתן להתחיל בחינם עם 5 יצירות בחודש, ולהתקדם למסלולים מותאמים לעסק שלך כאשר תרצה."
          : "BizAIra is a smart business AI platform that brings together tools for creating marketing content, generating precise product images, performing business analytics, and managing time. It works simply: you type a request or question, and the system creates ready-to-use solutions for you. You can start free with 5 creations per month and upgrade to tailored plans when you're ready.",
      };
    }

    // Help/Support specific queries
    if (contains(["עזרה", "בעיה", "תקלה", "שגיאה", "לא עובד", "help", "issue", "problem", "bug", "error"])) {
      return {
        title: isHe ? "תמיכה וסיוע" : "Support & Assistance",
        content: isHe
          ? "אני כאן כדי לעזור! תאר לי בדיוק מה קרה או מה השאלה שלך, ואספק לך תשובה מותאמת ומעודכנת. אם תרצה, אוכל גם להציג לך שלבים פשוטים כדי להתחיל בעבודה עם BizAIra או לפתור את בעיתך במהירות."
          : "I'm here to help! Tell me exactly what happened or what you need, and I'll provide you with a tailored and up-to-date solution. If you'd like, I can also walk you through simple steps to get started with BizAIra or resolve your issue quickly.",
      };
    }

    // Pricing and plans
    if (contains(["מחיר", "מחירים", "תכנית", "תכניות", "עלות", "כמה עולה", "subscription", "plan", "pricing", "cost"])) {
      return {
        title: isHe ? "תכניות ותמחור" : "Plans & Pricing",
        content: isHe
          ? "אנחנו מציעים תכניות גמישות המתאימות לכל סוג עסק. התחל בחינם עם 5 יצירות בחודש, והתקדם לתכנית Pro או Enterprise כשתרצה יותר. כל תכנית כוללת גישה לכל הכלים החכמים שלנו - יצירת תוכן, תמונות מוצר, ניתוח עסקי וניהול זמן."
          : "We offer flexible plans designed for every type of business. Start free with 5 creations per month and upgrade to Pro or Enterprise when you need more. Each plan includes access to all our smart tools - content creation, product images, business analytics, and time management.",
      };
    }

    // Generic intelligent response for other questions
    return {
      title: isHe ? "תשובה מקצועית" : "Professional Response",
      content: isHe
        ? "אין לי את המידע הנתון כדי לספק לך את זה כרגע. תוכל לפנות לתמיכה להמשך טיפול."
        : "I don't have the data available to provide that at this time. Please contact support for further assistance.",
    };
  };

  const handleSearch = async () => {
    const nextQuery = searchQuery.trim();
    if (!nextQuery) return;

    setSearchQuery(nextQuery);
    setSubmittedQuery(nextQuery);
    setIsLoading(true);

    // Simulate AI processing delay
    setTimeout(() => {
      setAiResponse(getAiResponse(nextQuery));
      setIsLoading(false);
    }, 400);
  };

  return (
    <div className="tone-shell min-h-screen bg-soft-cream px-5 pt-10 pb-28" dir={isHe ? "rtl" : "ltr"}>
      <div className="mx-auto max-w-5xl">
        <div className="mb-12 text-right">
          <p className="luxury-page-eyebrow mb-3">
            {isHe ? "מרכז תמיכה" : "Support Center"}
          </p>
          <h1 className="luxury-page-title mb-4">
            {isHe ? "תמיכה" : "Support"}
          </h1>
          <p className="luxury-page-copy">
            {isHe ? "היעזרו ב-AI החכם שלנו או עיינו בשאלות הנפוצות" : "Use our smart AI assistant or browse frequently asked questions"}
          </p>
        </div>

        <section className="mb-8 space-y-4">
          <div className="rounded-[12px] border border-[rgba(0,15,33,0.04)] bg-[#FAF9F6] p-5 shadow-[0_4px_20px_rgba(0,15,33,0.02)] text-right">
            <div className="mb-5 text-right">
              <p className="luxury-page-eyebrow">
                {isHe ? "עוזר חכם AI" : "Smart AI Assistant"}
              </p>
              <h2 className="luxury-card-title mt-2 text-2xl">
                {isHe ? "עוזר חכם AI" : "Smart AI Assistant"}
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
                    handleSearch();
                  }
                }}
                placeholder={isHe ? "שאל שאלה..." : "Ask a question..."}
                className="flex-1 min-w-0 rounded-[12px] border border-[rgba(0,15,33,0.08)] bg-[#FAF9F6] px-5 py-4 text-sm text-[#001830] placeholder:text-[#001830]/40 shadow-[0_4px_20px_rgba(0,15,33,0.02)] focus:border-[#001830] focus:outline-none focus:ring-2 focus:ring-[#001830]/20 transition text-right"
              />
              <button
                type="button"
                disabled={!searchQuery.trim() || isLoading}
                className="inline-flex min-w-[140px] items-center justify-center rounded-full border border-[rgba(0,15,33,0.08)] bg-[#001830] px-5 py-3 text-sm font-semibold uppercase tracking-[0.08em] text-[#FAF9F6] transition hover:bg-[#002741] disabled:opacity-60 disabled:cursor-not-allowed"
                onClick={handleSearch}
              >
                {isLoading ? (isHe ? "מעבד..." : "Processing...") : isHe ? "חפש" : "Search"}
              </button>
            </div>
            <p className="mt-4 text-xs leading-6 text-soft-muted">
              {isHe ? "נשמח לענות על כל שאלה" : "We're happy to help with any question"}
            </p>
          </div>
        </section>

        {/* AI Response Section */}
        {aiResponse && (
          <section className="mb-8">
            <div className="rounded-[12px] border border-[rgba(0,15,33,0.04)] bg-[#FAF9F6] p-5 shadow-[0_4px_20px_rgba(0,15,33,0.02)] text-right">
              <h3 className="luxury-card-title mb-3 text-right text-lg">
                {aiResponse.title}
              </h3>
              <p className="luxury-card-text whitespace-pre-line text-sm">
                {aiResponse.content}
              </p>
            </div>
          </section>
        )}

        {/* FAQ Section */}
        <section className="space-y-3">
          <div className="mb-6">
            <p className="text-xs font-medium uppercase tracking-widest text-[#001830]/60">
              {isHe ? "שאלות נפוצות" : "Frequently Asked Questions"}
            </p>
          </div>

          {faqs.map((faq, i) => {
            const isOpen = openFaq === i;
            return (
              <div
                key={i}
                className={`rounded-[12px] border border-[rgba(0,15,33,0.04)] bg-[#FAF9F6] p-0 shadow-[0_4px_20px_rgba(0,15,33,0.02)] text-right transition-all duration-300 ${
                  isOpen ? "" : "hover:-translate-y-0.5"
                }`}
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : i)}
                  className={`group w-full flex items-center justify-between rounded-[12px] px-6 py-6 transition duration-200 text-right ${
                    isOpen ? "text-[#001830]" : "text-[#001830] hover:bg-[#FAF9F6]"
                  }`}
                >
                  <span className="text-base font-semibold text-[#001830] transition-colors duration-200">
                    {faq.q}
                  </span>
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full transition-all duration-200 flex-shrink-0 ${
                      isOpen ? "bg-[#001830] text-[#FAF9F6]" : "bg-[#FAF9F6] text-[#001830] group-hover:bg-[#001830] group-hover:text-[#FAF9F6]"
                    }`}
                  >
                    {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </div>
                </button>
                {isOpen && (
                  <div className="border-t border-[rgba(0,15,33,0.06)] px-6 py-5 bg-[#FAF9F6] text-right">
                    <p className="text-sm leading-7 text-soft-muted">{faq.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </section>
      </div>
    </div>
  );
};

export default SupportPage;
