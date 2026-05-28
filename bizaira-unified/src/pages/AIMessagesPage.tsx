import { useState } from "react";
import { Link } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { useSmartMemory } from "@/hooks/useSmartMemory";
import { generateMessage } from "@/lib/ai-service";
import SparkleIcon from "@/components/SparkleIcon";
import { saveCreation, trackDownload } from "@/lib/creations-store";
import { getActivityStats } from "@/lib/activity-tracker";
import { openStudioLimitModal } from "@/lib/studio-limit-modal";
import {
  ArrowRight, ArrowLeft, Sparkles, Loader2,
  Copy, Check, RefreshCw, Minimize2, Heart, Layers, Download,
} from "lucide-react";

type Purpose = "sale" | "service" | "reminder" | "post" | "collection" | "launch";
type Tone = "formal" | "warm" | "marketing" | "emotional" | "short" | "luxury";

const PURPOSES: { id: Purpose; he: string; en: string }[] = [
  { id: "sale", he: "הודעת מכירה", en: "Sales" },
  { id: "service", he: "הודעת שירות", en: "Service" },
  { id: "reminder", he: "תזכורת", en: "Reminder" },
  { id: "post", he: "פוסט לרשתות", en: "Social Post" },
  { id: "collection", he: "תזכורת תשלום", en: "Payment Reminder" },
  { id: "launch", he: "הודעת השקה", en: "Launch" },
];

const TONES: { id: Tone; he: string; en: string }[] = [
  { id: "formal", he: "רשמי", en: "Formal" },
  { id: "warm", he: "חמים", en: "Warm" },
  { id: "marketing", he: "שיווקי", en: "Marketing" },
  { id: "emotional", he: "רגשי", en: "Emotional" },
  { id: "short", he: "קצר ומדויק", en: "Short" },
  { id: "luxury", he: "יוקרתי", en: "Luxury" },
];

const AIMessagesPage = () => {
  const { t, lang } = useI18n();
  const { profile } = useAuth();
  const isHe = lang === "he";
  const BackArrow = isHe ? ArrowRight : ArrowLeft;
  const isPremium = Boolean(profile?.plan?.toLowerCase().includes("pro") || profile?.plan?.toLowerCase().includes("premium"));
  const { saveEntry, lastEntry } = useSmartMemory("messages", isPremium);
  const { totalActions, limit } = getActivityStats();

  const [purpose, setPurpose] = useState<Purpose>("sale");
  const [tone, setTone] = useState<Tone>("warm");
  const [audience, setAudience] = useState("");
  const [details, setDetails] = useState("");
  const [result, setResult] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const previousMessageSummary = isPremium && lastEntry && lastEntry.data.audience
    ? `Previous message: audience=${lastEntry.data.audience}, tone=${lastEntry.data.tone}.`
    : "";

  const buildMessagePayload = (modifier?: string) => {
    const purposeLabels: Record<string, string> = {
      sale: "sales/promotional message", service: "customer service message",
      reminder: "appointment reminder", post: "social media post",
      collection: "gentle payment collection message", launch: "product/service launch announcement",
    };

    const toneLabels: Record<string, string> = {
      formal: "formal and professional", warm: "warm and friendly",
      marketing: "persuasive marketing", emotional: "emotional and personal",
      short: "concise and to-the-point", luxury: "luxury and premium",
    };

    return {
      messageType: purposeLabels[purpose] || (isHe ? "הודעה" : "message"),
      tone: toneLabels[tone] || (isHe ? "מקצועי" : "professional"),
      audience,
      details,
      language: isHe ? "hebrew" : "english",
      modifier: modifier || "",
      quality: isPremium ? "premium" : "standard",
      premium: isPremium,
      previousSummary: previousMessageSummary,
      systemPrompt: isHe
        ? "כתוב הודעה עסקית מקצועית, קצרה ותכליתית. אל תשתמש בפתיחים ארוכים או ניסוחים רגשיים מיותרים."
        : "Write a short, professional business message. Avoid long greetings, filler, or repetitive phrasing.",
    };
  };

  const handleGenerate = async (modifier?: string) => {
    if (totalActions >= limit) {
      openStudioLimitModal();
      return;
    }

    setIsGenerating(true);
    try {
      const payload = buildMessagePayload(modifier);
      const text = await generateMessage(payload);
      setResult(text);
      if (isPremium && text && !text.startsWith("שגיאה") && !text.startsWith("Failed")) {
        saveEntry({ purpose, tone, audience, details });
      }
      // Auto-save to personal archive
      if (text && !text.startsWith("שגיאה") && !text.startsWith("Failed")) {
        const purposeHe: Record<string, string> = {
          sale: "הודעת מכירה", service: "הודעת שירות", reminder: "תזכורת",
          post: "פוסט לרשתות", collection: "תזכורת תשלום", launch: "הודעת השקה",
        };
        saveCreation({
          type: "message",
          title: isHe ? purposeHe[purpose] || "הודעה" : purpose,
          content: text,
          metadata: { purpose, tone, audience },
        });
      }
    } catch (err: any) {
      console.error("Generation failed:", err?.message || err);
      setResult(isHe
        ? `שגיאה ביצירת ההודעה: ${err?.message || "נסו שוב"}`
        : `Failed to generate the message: ${err?.message || "Please try again."}`
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([result], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bizaira-message.txt`;
    a.click();
    URL.revokeObjectURL(url);
    trackDownload();
  };

  return (
    <div className="min-h-screen pb-24 bg-soft-cream flex flex-col" dir={isHe ? "rtl" : "ltr"}>
      <div className="sticky top-0 z-40 glass-card border-b border-border/40 px-4 py-3">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <Link to="/create" className="glass-card p-2 rounded-lg hover:scale-105 transition-all"><BackArrow size={18} className="text-foreground" /></Link>
            <div>
              <h1 className="text-base font-bold text-foreground">{t("msg.title")}</h1>
              <p className="text-xs text-muted-foreground">{t("msg.subtitle")}</p>
            </div>
          </div>
          <SparkleIcon size={18} />
        </div>
      </div>

      <div className="max-w-4xl mx-auto w-full px-4 pt-6 flex flex-col lg:flex-row gap-6">
        {/* Input */}
        <div className="lg:w-[360px] w-full space-y-4 min-w-0">
          <div className="glass-card rounded-xl p-4 space-y-3">
            <label className="text-xs font-bold text-foreground">{isHe ? "סוג הודעה" : "Message Type"}</label>
            <div className="grid grid-cols-2 gap-1.5">
              {PURPOSES.map(p => (
                <button
                  key={p.id}
                  onClick={() => setPurpose(p.id)}
                  className={`px-2 py-1.5 rounded-lg text-xs font-medium transition-all focus:outline-none focus:ring-2 focus:ring-[#0A192F]/40 focus:ring-offset-2 ${purpose === p.id ? "bg-[#001830] text-[#F5F5DC] border-none" : "bg-white text-[#0A192F] border border-[#E2E8F0] hover:bg-[#0A192F] hover:text-white"}`}
                >
                  {isHe ? p.he : p.en}
                </button>
              ))}
            </div>
          </div>

          <div className="glass-card rounded-xl p-4 space-y-3">
            <label className="text-xs font-bold text-foreground">{isHe ? "סגנון ניסוח" : "Tone"}</label>
            <div className="flex flex-wrap gap-1.5">
              {TONES.map(tn => (
                <button
                  key={tn.id}
                  onClick={() => setTone(tn.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all focus:outline-none focus:ring-2 focus:ring-[#0A192F]/40 focus:ring-offset-2 ${tone === tn.id ? "bg-[#001830] text-[#F5F5DC] border-none" : "bg-white text-[#0A192F] border border-[#E2E8F0] hover:bg-[#0A192F] hover:text-white"}`}
                >
                  {isHe ? tn.he : tn.en}
                </button>
              ))}
            </div>
          </div>

          <div className="glass-card rounded-xl p-4 space-y-3">
            <label className="text-xs font-bold text-foreground">{isHe ? "קהל יעד" : "Audience"}</label>
            <input value={audience} onChange={e => setAudience(e.target.value)} placeholder={isHe ? "לדוגמה: לקוחות קיימים, לידים חדשים..." : "e.g. existing clients, new leads..."} className="w-full bg-background/50 border border-border/50 rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50" />
          </div>

          <div className="glass-card rounded-xl p-4 space-y-3">
            <label className="text-xs font-bold text-foreground">{isHe ? "פרטים לכלול" : "Details to Include"}</label>
            <textarea value={details} onChange={e => setDetails(e.target.value)} placeholder={isHe ? "מבצע, תאריך, פרטים מיוחדים..." : "Promotions, dates, special details..."} rows={4} className="w-full min-h-[140px] bg-background/50 border border-border/50 rounded-lg px-3 py-3 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-ring/50" />
          </div>

          <button onClick={() => handleGenerate()} disabled={isGenerating} className="w-full gradient-glow glow-shadow text-primary-foreground font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 hover:scale-[1.02] transition-all disabled:opacity-50">
            {isGenerating ? <><Loader2 size={18} className="animate-spin" />{isHe ? "מנסח..." : "Writing..."}</> : <><Sparkles size={18} />{isHe ? "נסח הודעה" : "Write Message"}</>}
          </button>
        </div>

        {/* Result */}
        <div className="flex-1 space-y-4">
          {result ? (
            <div className="animate-fade-in-up space-y-4">
              <div className="glass-card rounded-xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded-lg gradient-glow flex items-center justify-center"><Sparkles size={12} className="text-primary-foreground" /></div>
                  <span className="text-sm font-bold text-foreground">{isHe ? "ההודעה שלך" : "Your Message"}</span>
                </div>
                <div className="bg-background/50 rounded-lg p-4 whitespace-pre-wrap text-sm text-foreground leading-relaxed border border-border/30">{result}</div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <button onClick={handleCopy} className="glass-card py-2.5 rounded-xl text-xs font-bold text-foreground flex items-center justify-center gap-1.5 hover:scale-[1.02] transition-all">
                  {copied ? <><Check size={14} className="text-green-500" />{isHe ? "הועתק!" : "Copied!"}</> : <><Copy size={14} />{isHe ? "העתק" : "Copy"}</>}
                </button>
                <button onClick={() => handleGenerate()} disabled={isGenerating} className="glass-card py-2.5 rounded-xl text-xs font-bold text-foreground flex items-center justify-center gap-1.5 hover:scale-[1.02] transition-all disabled:opacity-50">
                  <RefreshCw size={14} />{isHe ? "נסח מחדש" : "Rewrite"}
                </button>
                <button onClick={handleDownload} className="glass-card py-2.5 rounded-xl text-xs font-bold text-foreground flex items-center justify-center gap-1.5 hover:scale-[1.02] transition-all">
                  <Download size={14} />{isHe ? "הורדה" : "Download"}
                </button>
              </div>

              <div className="glass-card rounded-xl p-4 space-y-2">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{isHe ? "וריאציות" : "Variations"}</label>
                <div className="grid grid-cols-3 gap-1.5">
                  <button onClick={() => handleGenerate(isHe ? "כתוב גרסה קצרה יותר" : "Write a shorter version")} disabled={isGenerating} className="bg-muted hover:bg-muted/80 py-2 rounded-lg text-[10px] font-medium text-foreground flex flex-col items-center gap-1 transition-all disabled:opacity-50">
                    <Minimize2 size={14} />{isHe ? "קצר יותר" : "Shorter"}
                  </button>
                  <button onClick={() => handleGenerate(isHe ? "כתוב גרסה רגשית יותר" : "Write a more emotional version")} disabled={isGenerating} className="bg-muted hover:bg-muted/80 py-2 rounded-lg text-[10px] font-medium text-foreground flex flex-col items-center gap-1 transition-all disabled:opacity-50">
                    <Heart size={14} />{isHe ? "רגשי יותר" : "More emotional"}
                  </button>
                  <button onClick={() => handleGenerate(isHe ? "כתוב 3 וריאציות שונות" : "Write 3 different variations")} disabled={isGenerating} className="bg-muted hover:bg-muted/80 py-2 rounded-lg text-[10px] font-medium text-foreground flex flex-col items-center gap-1 transition-all disabled:opacity-50">
                    <Layers size={14} />{isHe ? "3 גרסאות" : "3 versions"}
                  </button>
                </div>
              </div>
            </div>
          ) : isGenerating ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-16 opacity-80">
              <div className="w-16 h-16 rounded-2xl glass-card flex items-center justify-center mb-4"><Loader2 size={24} className="animate-spin text-muted-foreground" /></div>
              <p className="text-sm font-bold text-foreground">{isHe ? "מנסח את ההודעה שלך..." : "Crafting your message..."}</p>
              <p className="text-xs text-muted-foreground mt-1">{isHe ? "אנא המתן בזמן שהמערכת יוצרת ניסוח שיווקי מקצועי." : "Please wait while the system generates a professional marketing copy."}</p>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-16 opacity-60">
              <div className="w-16 h-16 rounded-2xl glass-card flex items-center justify-center mb-4"><Sparkles size={24} className="text-muted-foreground" /></div>
              <p className="text-sm font-bold text-foreground">{isHe ? "ההודעה שלך תופיע כאן" : "Your message will appear here"}</p>
              <p className="text-xs text-muted-foreground mt-1">{isHe ? "מלא את הפרטים ולחץ על ׳נסח הודעה׳" : "Fill in the details and click 'Write Message'"}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIMessagesPage;
