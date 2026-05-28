import { useState } from "react";
import { Link } from "react-router-dom";
import SparkleIcon from "@/components/SparkleIcon";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { useSmartMemory } from "@/hooks/useSmartMemory";
import { generateAnalytics } from "@/lib/ai-service";
import { getActivityStats } from "@/lib/activity-tracker";
import { openStudioLimitModal } from "@/lib/studio-limit-modal";
import { saveCreation, trackDownload } from "@/lib/creations-store";
import {
  ArrowRight, ArrowLeft, TrendingUp, TrendingDown, DollarSign,
  Users, Target, MessageSquare, BarChart3, Lock, Sparkles, Loader2,
  PieChart, Download, FileText, Heart, HelpCircle, Trophy, AlertTriangle, RefreshCw,
} from "lucide-react";

const MONTHS_HE = ["ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני", "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר"];
const MONTHS_EN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const BusinessAnalyticsPage = () => {
  const { t, lang } = useI18n();
  const { profile } = useAuth();
  const isHe = lang === "he";
  const BackArrow = isHe ? ArrowRight : ArrowLeft;
  const currency = "₪";
  const isPremium = Boolean(profile?.plan?.toLowerCase().includes("pro") || profile?.plan?.toLowerCase().includes("premium"));
  const { saveEntry, getProgressMessages, history, lastEntry } = useSmartMemory("analytics", isPremium);
  const { totalActions, limit } = getActivityStats();

  const [monthlyRevenue, setMonthlyRevenue] = useState("");
  const [monthlyExpenses, setMonthlyExpenses] = useState("");
  const [newClientsCount, setNewClientsCount] = useState("");
  const [dataEntered, setDataEntered] = useState(false);

  // Personal questions
  const [feeling, setFeeling] = useState("");
  const [tooMuchTime, setTooMuchTime] = useState("");
  const [wantToImprove, setWantToImprove] = useState("");

  const [question, setQuestion] = useState("");
  const [aiAnswer, setAiAnswer] = useState("");
  const [analysisResult, setAnalysisResult] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isAsking, setIsAsking] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "monthly" | "ask">("overview");
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const revenue = Number(monthlyRevenue) || 0;
  const expenses = Number(monthlyExpenses) || 0;
  const profit = revenue - expenses;
  const profitMargin = revenue > 0 ? Math.round((profit / revenue) * 100) : 0;
  const clients = Number(newClientsCount) || 0;

  // Simulate monthly data for table
  const currentMonth = new Date().getMonth();
  // Only show real monthly data from history, don't fabricate data
  const monthlyData = history && history.length > 0 
    ? history.map((entry, i) => ({
        month: isHe ? MONTHS_HE[entry.month] : MONTHS_EN[entry.month],
        revenue: entry.revenue || 0,
        expenses: entry.expenses || 0,
        clients: entry.clients || 0,
        growth: i === 0 ? 0 : Math.round(((entry.revenue - (history[i-1]?.revenue || entry.revenue)) / (history[i-1]?.revenue || entry.revenue || 1)) * 100),
      }))
    : [];

  const previousSummary = isPremium && lastEntry?.data
    ? `Previous session: revenue ₪${lastEntry.data.revenue || 0}, clients ${lastEntry.data.clients || 0}, profit margin ${lastEntry.data.profitMargin || 0}%.`
    : "";

  const handleStartAnalysis = async () => {
    if (totalActions >= limit) {
      openStudioLimitModal();
      return;
    }

    if (revenue <= 0) return;
    setIsAnalyzing(true);
    setAnalysisError(null);
    try {
      const answer = await generateAnalytics({
        revenue,
        expenses,
        clients,
        feeling,
        tooMuchTime,
        wantToImprove,
        question: "",
        language: isHe ? "hebrew" : "english",
        quality: "executive",
        premium: isPremium,
        previousSummary,
        systemPrompt: isHe
          ? "נתח את העסק בקצרה ובדיוק. ספק שלושה צירים ברורים: רווחיות, היקף לקוחות והמלצה אסטרטגית מעשית."
          : "Analyze the business concisely and precisely. Provide three clear points: profitability, client volume, and a practical strategy recommendation.",
      });
      setAnalysisResult(answer);
      if (isPremium) saveEntry({ revenue, profit, clients, profitMargin });
      if (answer && !answer.startsWith("לא הצלחתי")) {
        saveCreation({
          type: "analytics",
          title: t("analytics.title"),
          content: isHe
            ? `ניתוח עסקי ראשוני:\n${answer}`
            : `Initial business analysis:\n${answer}`,
          metadata: { revenue, expenses, clients, profitMargin },
        });
      }
      setDataEntered(true);
    } catch (err: any) {
      console.error("Analytics generation failed:", err?.message || err);
      setAnalysisError(err?.message || t("analytics.analysisFailed"));
    } finally {
      setIsAnalyzing(false);
    }
  };

  const progressMessages = getProgressMessages({ revenue, profit, clients, profitMargin }, lang);

  const handleAsk = async () => {
    if (totalActions >= limit) {
      openStudioLimitModal();
      return;
    }

    if (!question.trim()) return;
    setIsAsking(true);
    try {
      const answer = await generateAnalytics({
        revenue,
        expenses,
        clients,
        feeling,
        tooMuchTime,
        wantToImprove,
        question,
        language: isHe ? "hebrew" : "english",
        quality: "executive",
        premium: isPremium,
        previousSummary,
        systemPrompt: isHe
          ? "ענה על השאלה באופן ברור, תכליתי וקצר. ספק המלצה עסקית אחת או שניים בלבד."
          : "Answer the question clearly, directly, and briefly. Provide one or two practical recommendations only.",
      });
      setAiAnswer(answer);
      if (answer && !answer.startsWith("לא הצלחתי")) {
        saveCreation({
          type: "analytics",
          title: t("analytics.title"),
          content: isHe
            ? `שאלה: ${question}\n\nתשובה:\n${answer}`
            : `Question: ${question}\n\nAnswer:\n${answer}`,
          metadata: { revenue, expenses, clients },
        });
      }
    } catch (err: any) {
      console.error("Analytics generation failed:", err?.message || err);
      setAiAnswer(t("analytics.askFailed"));
    } finally {
      setIsAsking(false);
    }
  };

  const handleDownloadReport = () => {
    const content = isHe
      ? `${t("analytics.reportTitle")}\n${"=".repeat(30)}\n\n${t("analytics.reportRevenue")} : ${currency}${revenue.toLocaleString()}\n${t("analytics.reportExpenses")} : ${currency}${expenses.toLocaleString()}\n${t("analytics.reportNetProfit")} : ${currency}${profit.toLocaleString()}\n${t("analytics.reportProfitMargin")} : ${profitMargin}%\n${t("analytics.reportNewClients")} : ${clients}\n\n${aiAnswer ? `${t("analytics.reportAnswer")}\n${aiAnswer}` : ""}`
      : `${t("analytics.reportTitle")}\n${"=".repeat(30)}\n\n${t("analytics.reportRevenue")} : ${currency}${revenue.toLocaleString()}\n${t("analytics.reportExpenses")} : ${currency}${expenses.toLocaleString()}\n${t("analytics.reportNetProfit")} : ${currency}${profit.toLocaleString()}\n${t("analytics.reportProfitMargin")} : ${profitMargin}%\n${t("analytics.reportNewClients")} : ${clients}\n\n${aiAnswer ? `${t("analytics.reportAnswer")}\n${aiAnswer}` : ""}`;
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "business-analytics-report.txt";
    a.click();
    URL.revokeObjectURL(url);
    trackDownload();
  };

  const proFeatures = [t("analytics.forecast"), t("analytics.simulations"), t("analytics.multiYear"), t("analytics.breakeven")];

  return (
    <div className="min-h-screen pb-24 bg-soft-cream" dir={isHe ? "rtl" : "ltr"}>
      <div className="sticky top-0 z-40 glass-card border-b border-border/40 px-4 py-3">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <Link to="/create" className="glass-card p-2 rounded-lg hover:scale-105 transition-all"><BackArrow size={18} className="text-foreground" /></Link>
            <div><h1 className="text-base font-bold text-foreground">{t("analytics.title")}</h1><p className="text-xs text-muted-foreground">{t("analytics.subtitle")}</p></div>
          </div>
          <div className="flex items-center gap-2">
            {dataEntered && (
              <button onClick={handleDownloadReport} className="glass-card px-3 py-2 rounded-lg text-xs font-medium text-foreground flex items-center gap-1.5 hover:scale-105 transition-all">
                <Download size={14} />{t("analytics.download")}
              </button>
            )}
            <SparkleIcon size={18} />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 pt-6 space-y-5">

        {!dataEntered ? (
          <div className="space-y-5 animate-fade-in-up">
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-2xl glass-card flex items-center justify-center mx-auto mb-4">
                <BarChart3 size={28} className="text-muted-foreground" />
              </div>
              <h2 className="text-lg font-bold text-foreground">{t("analytics.enterDataTitle")}</h2>
              <p className="text-sm text-muted-foreground mt-1">{t("analytics.enterDataSubtitle")}</p>
            </div>

            {/* Business data */}
            <div className="glass-card rounded-xl p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-foreground mb-1.5 flex items-center gap-1"><DollarSign size={12} />{t("analytics.monthlyRevenue")}</label>
                  <input type="number" value={monthlyRevenue} onChange={e => setMonthlyRevenue(e.target.value)} placeholder={t("analytics.monthlyRevenue.ph")} className="w-full bg-background/50 border border-border/50 rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground mb-1.5 flex items-center gap-1"><TrendingDown size={12} />{t("analytics.monthlyExpenses")}</label>
                  <input type="number" value={monthlyExpenses} onChange={e => setMonthlyExpenses(e.target.value)} placeholder={t("analytics.monthlyExpenses.ph")} className="w-full bg-background/50 border border-border/50 rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground mb-1.5 flex items-center gap-1"><Users size={12} />{t("analytics.newClients")}</label>
                  <input type="number" value={newClientsCount} onChange={e => setNewClientsCount(e.target.value)} placeholder={t("analytics.newClients.ph")} className="w-full bg-background/50 border border-border/50 rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50" />
                </div>
              </div>
            </div>

            {/* Personal questions */}
            <div className="glass-card rounded-xl p-5 space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <Heart size={14} className="text-accent" />
                <span className="text-sm font-bold text-foreground">{t("analytics.personalQuestions")}</span>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                  <HelpCircle size={10} />{t("analytics.feelingLabel")}
                </label>
                <input value={feeling} onChange={e => setFeeling(e.target.value)} placeholder={t("analytics.feelingPh")} className="w-full bg-background/50 border border-border/50 rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                  <HelpCircle size={10} />{t("analytics.timeLabel")}
                </label>
                <input value={tooMuchTime} onChange={e => setTooMuchTime(e.target.value)} placeholder={t("analytics.timePh")} className="w-full bg-background/50 border border-border/50 rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                  <HelpCircle size={10} />{t("analytics.improveLabel")}
                </label>
                <input value={wantToImprove} onChange={e => setWantToImprove(e.target.value)} placeholder={t("analytics.improvePh")} className="w-full bg-background/50 border border-border/50 rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50" />
              </div>
            </div>

            <button onClick={handleStartAnalysis} disabled={!monthlyRevenue || isAnalyzing} className="w-full gradient-glow glow-shadow text-primary-foreground font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 hover:scale-[1.02] transition-all disabled:opacity-50">
              {isAnalyzing ? <><Loader2 size={18} className="animate-spin" />{t("analytics.analyzing")}</> : <><Sparkles size={18} />{t("analytics.analyzeButton")}</>}
            </button>
          </div>
        ) : (
          <div className="space-y-5 animate-fade-in-up">
            {/* Metrics — no "close rate" */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {[
                { label: t("analytics.table.revenue"), value: `${currency}${revenue.toLocaleString()}`, icon: DollarSign, up: true },
                { label: t("analytics.reportNetProfit"), value: `${currency}${profit.toLocaleString()}`, icon: TrendingUp, up: profit > 0 },
                { label: t("analytics.table.clients"), value: `${clients}`, icon: Users, up: true },
              ].map(m => (
                <div key={m.label} className="glass-card rounded-xl p-4 hover:scale-[1.02] transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center"><m.icon size={16} className="text-muted-foreground" /></div>
                    {m.up ? <TrendingUp size={12} className="text-green-500" /> : <TrendingDown size={12} className="text-destructive" />}
                  </div>
                  <div className="text-xl font-black text-foreground">{m.value}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{m.label}</div>
                </div>
              ))}
            </div>

            {/* Progress messages */}
            {progressMessages.length > 0 && (
              <div className="glass-card rounded-xl p-4 space-y-2 border border-primary/20">
                <div className="flex items-center gap-2 mb-1"><Trophy size={14} className="text-primary" /><span className="text-sm font-bold text-foreground">{t("analytics.progressTracking")}</span></div>
                {progressMessages.map((msg, i) => (
                  <div key={i} className="bg-primary/5 rounded-lg p-2.5 text-sm text-foreground">{msg}</div>
                ))}
              </div>
            )}


            <div className="glass-card rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-foreground">{t("analytics.profitMargin")}</span>
                <span className={`text-lg font-black ${profitMargin >= 30 ? "text-green-500" : profitMargin >= 15 ? "text-yellow-500" : "text-destructive"}`}>{profitMargin}%</span>
              </div>
              <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-700 ${profitMargin >= 30 ? "bg-green-500" : profitMargin >= 15 ? "bg-yellow-500" : "bg-destructive"}`} style={{ width: `${Math.min(profitMargin, 100)}%` }} />
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 glass-card rounded-xl p-1">
              {([
                { id: "overview" as const, icon: PieChart, label: t("analytics.tabs.overview") },
                { id: "monthly" as const, icon: BarChart3, label: t("analytics.tabs.monthly") },
                { id: "ask" as const, icon: MessageSquare, label: t("analytics.tabs.ask") },
              ]).map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-bold transition-all ${activeTab === tab.id ? "bg-[#001830] text-[#F5F5DC] border-transparent shadow-sm" : "bg-white text-[#0A192F] border border-[#E2E8F0] hover:bg-[#F8FAFC] hover:text-[#0A192F]"}`}>
                  <tab.icon size={14} />{tab.label}
                </button>
              ))}
            </div>

            {activeTab === "overview" && (
              <div className="space-y-4 animate-fade-in-up">
                <div className="glass-card rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-4"><SparkleIcon size={14} /><span className="text-sm font-bold text-foreground">{t("analytics.autoInsights")}</span></div>
                  <div className="space-y-2">
                    {(profitMargin >= 30
                      ? [t("analytics.insight.profit.good", { margin: profitMargin })]
                      : [t("analytics.insight.profit.low", { margin: profitMargin })]
                    ).concat(
                      clients > 10 ? [t("analytics.insight.clients.growth", { clients })] : [t("analytics.insight.clients.opportunity", { clients })],
                    ).map((text, i) => (
                      <div key={i} className="rounded-lg p-3 border border-border/30 bg-background/40">
                        <p className="text-sm text-foreground leading-relaxed">{text}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <button onClick={() => setDataEntered(false)} className="w-full glass-card py-2.5 rounded-xl text-xs font-bold text-muted-foreground hover:text-foreground flex items-center justify-center gap-1.5 transition-all">
                  <FileText size={14} />{t("analytics.editData")}
                </button>
              </div>
            )}
            {analysisResult && !analysisError && (
              <div className="glass-card rounded-xl p-4 bg-background/70 border border-border/30 animate-fade-in-up">
                <div className="flex items-center gap-2 mb-3"><BarChart3 size={14} className="text-primary" /><span className="text-sm font-bold text-foreground">{t("analytics.aiInsights")}</span></div>
                <div className="whitespace-pre-wrap text-sm text-foreground leading-relaxed">{analysisResult}</div>
              </div>
            )}

            {analysisError && (
              <div className="glass-card rounded-xl p-4 bg-red-50 border border-red-200 animate-fade-in-up">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle size={14} className="text-red-500" />
                  <span className="text-sm font-bold text-red-700">{t("analytics.error")}</span>
                </div>
                <p className="text-sm text-red-600 mb-3">{analysisError}</p>
                <button
                  onClick={handleStartAnalysis}
                  disabled={isAnalyzing}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
                >
                  <RefreshCw size={14} className={isAnalyzing ? "animate-spin" : ""} />
                  {t("analytics.retry")}
                </button>
              </div>
            )}

            {/* Monthly table */}
            {activeTab === "monthly" && (
              <div className="space-y-4 animate-fade-in-up">
                <div className="glass-card rounded-xl p-4 overflow-x-auto">
                  <div className="flex items-center gap-2 mb-4"><BarChart3 size={14} className="text-primary" /><span className="text-sm font-bold text-foreground">{t("analytics.monthlyTable")}</span></div>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border/30">
                        <th className="text-start py-2 px-2 text-xs font-bold text-muted-foreground">{t("analytics.table.month")}</th>
                        <th className="text-start py-2 px-2 text-xs font-bold text-muted-foreground">{t("analytics.table.revenue")}</th>
                        <th className="text-start py-2 px-2 text-xs font-bold text-muted-foreground">{t("analytics.table.expenses")}</th>
                        <th className="text-start py-2 px-2 text-xs font-bold text-muted-foreground">{t("analytics.table.clients")}</th>
                        <th className="text-start py-2 px-2 text-xs font-bold text-muted-foreground">{t("analytics.table.change")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {monthlyData.map((row, i) => {
                        const rowProfit = row.revenue - row.expenses;
                        const isPositive = rowProfit > 0;
                        return (
                          <tr key={i} className={`border-b border-border/10 transition-colors ${i === monthlyData.length - 1 ? "bg-primary/5 font-bold" : "hover:bg-muted/30"}`}>
                            <td className="py-2.5 px-2 text-foreground font-semibold">{row.month}</td>
                            <td className="py-2.5 px-2">
                              <span className={isPositive ? "text-green-600" : "text-destructive"}>{currency}{row.revenue.toLocaleString()}</span>
                            </td>
                            <td className="py-2.5 px-2 text-muted-foreground">{currency}{row.expenses.toLocaleString()}</td>
                            <td className="py-2.5 px-2 text-foreground">{row.clients}</td>
                            <td className="py-2.5 px-2">
                              {row.growth !== 0 && (
                                <span className={`inline-flex items-center gap-0.5 text-xs font-bold px-1.5 py-0.5 rounded-md ${row.growth > 0 ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-destructive"}`}>
                                  {row.growth > 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                                  {row.growth > 0 ? "+" : ""}{row.growth}%
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === "ask" && (
              <div className="space-y-4 animate-fade-in-up">
                <div className="glass-card rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-7 h-7 rounded-lg gradient-glow flex items-center justify-center"><Sparkles size={14} className="text-primary-foreground" /></div>
                    <span className="text-sm font-bold text-foreground">{t("analytics.askAi")}</span>
                  </div>
                  <div className="flex gap-2">
                    <input value={question} onChange={e => setQuestion(e.target.value)} onKeyDown={e => e.key === "Enter" && handleAsk()} placeholder={t("analytics.askPhGeneral")} className="flex-1 bg-background/50 border border-border/50 rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50" />
                    <button onClick={handleAsk} disabled={isAsking || !question.trim()} className="gradient-glow px-4 rounded-lg text-primary-foreground font-bold text-sm disabled:opacity-50 flex items-center gap-1.5">
                      {isAsking ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                      {t("analytics.ask")}
                    </button>
                  </div>
                  {aiAnswer && (
                    <div className="mt-4 bg-background/40 rounded-xl p-4 border border-border/30 animate-fade-in-up">
                      <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{aiAnswer}</p>
                    </div>
                  )}
                  <div className="mt-4 space-y-1.5">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{t("analytics.suggestedLabel")}</label>
                    {[t("analytics.suggestedQuestion.profit"), t("analytics.suggestedQuestion.improve"), t("analytics.suggestedQuestion.save")].map(q => (
                      <button key={q} onClick={() => setQuestion(q)} className="w-full text-start bg-muted/40 hover:bg-muted rounded-lg px-3 py-2 text-xs text-muted-foreground hover:text-foreground transition-all">{q}</button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* PRO */}
            <div className="glass-card rounded-xl p-4 opacity-70">
              <div className="flex items-center gap-2 mb-2"><Lock size={14} className="text-muted-foreground" /><span className="text-sm font-bold gradient-glow-text">{t("analytics.proFeatures")}</span></div>
              <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">{proFeatures.map(f => <div key={f} className="bg-muted/30 rounded-lg p-2 text-center">{f}</div>)}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BusinessAnalyticsPage;
