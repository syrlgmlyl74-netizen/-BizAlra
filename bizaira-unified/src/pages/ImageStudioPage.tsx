import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { generateStudioImage } from "@/lib/ai-service";
import { getActivityStats, trackCreation, trackDownload } from "@/lib/activity-tracker";
import { openStudioLimitModal } from "@/lib/studio-limit-modal";
import {
  ArrowRight,
  ArrowLeft,
  Upload,
  X,
  Loader2,
  Paintbrush,
  Image as ImageIcon,
  RectangleHorizontal,
  RectangleVertical,
  Square,
  Lock,
} from "lucide-react";

type ImageType = "product" | "profile" | "logo" | "banner";
type StyleId = "realistic" | "minimal" | "luxury" | "cartoon" | "soft" | "modern";

const IMAGE_TYPES: { id: ImageType; he: string; en: string }[] = [
  { id: "product", he: "תמונת מוצר", en: "Product" },
  { id: "profile", he: "פרופיל עסקי", en: "Profile" },
  { id: "logo", he: "לוגו", en: "Logo" },
  { id: "banner", he: "באנר", en: "Banner" },
];

const STYLES: { id: StyleId; he: string; en: string }[] = [
  { id: "realistic", he: "ריאליסטי", en: "Realistic" },
  { id: "minimal", he: "מינימליסטי", en: "Minimalist" },
  { id: "luxury", he: "יוקרתי", en: "Luxury" },
  { id: "cartoon", he: "אילוסטרציה", en: "Illustration" },
  { id: "soft", he: "רך ועדין", en: "Soft" },
  { id: "modern", he: "מודרני", en: "Modern" },
];

const PRESET_COLORS = [
  "#ffffff", "#f9fafb", "#f3f4f6", "#e5e7eb", "#d1d5db", "#9ca3af", "#6b7280", "#4b5563", "#374151", "#1f2937", "#111827", "#000000",
  "#fef2f2", "#fecaca", "#fca5a5", "#f87171", "#ef4444", "#dc2626", "#b91c1c", "#991b1b", "#7f1d1d", "#450a0a",
  "#fff7ed", "#fed7aa", "#fdba74", "#fb923c", "#f97316", "#ea580c", "#c2410c", "#9a3412", "#7c2d12", "#431407",
  "#fefce8", "#fef08a", "#fde047", "#facc15", "#eab308", "#ca8a04", "#a16207", "#854d0e", "#713f12", "#422006",
  "#f0fdf4", "#bbf7d0", "#86efac", "#4ade80", "#22c55e", "#16a34a", "#15803d", "#166534", "#14532d", "#052e16",
  "#f0fdfa", "#99f6e4", "#5eead4", "#2dd4bf", "#14b8a6", "#0d9488", "#0f766e", "#115e59", "#134e4a", "#042f2e",
  "#eff6ff", "#bfdbfe", "#93c5fd", "#60a5fa", "#3b82f6", "#2563eb", "#1d4ed8", "#1e40af", "#1e3a8a", "#172554",
  "#eef2ff", "#c7d2fe", "#a5b4fc", "#818cf8", "#6366f1", "#4f46e5", "#4338ca", "#3730a3", "#312e81", "#1e1b4b",
  "#faf5ff", "#e9d5ff", "#d8b4fe", "#c084fc", "#a855f7", "#9333ea", "#7e22ce", "#6b21a8", "#581c87", "#3b0764",
  "#fdf2f8", "#fbcfe8", "#f9a8d4", "#f472b6", "#ec4899", "#db2777", "#be185d", "#9d174d", "#831843", "#500724",
  "#fff1f2", "#fecdd3", "#fda4af", "#fb7185", "#f43f5e", "#e11d48", "#be123c", "#9f1239", "#881337", "#4c0519",
];

const RATIOS = [
  { id: "1:1", icon: Square, label: "1:1" },
  { id: "4:3", icon: RectangleHorizontal, label: "4:3" },
  { id: "9:16", icon: RectangleVertical, label: "9:16" },
  { id: "16:9", icon: RectangleHorizontal, label: "16:9" },
];

const ImageStudioPage = () => {
  const { lang } = useI18n();
  const isHe = lang === "he";
  const BackArrow = isHe ? ArrowRight : ArrowLeft;
  const fileRef = useRef<HTMLInputElement>(null);
  const { user, profile } = useAuth();

  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [results, setResults] = useState<string[]>([]);
  const [activeResult, setActiveResult] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showAuthGuard, setShowAuthGuard] = useState(false);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  const [imageType, setImageType] = useState<ImageType>("product");
  const [style, setStyle] = useState<StyleId>("realistic");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [customColor, setCustomColor] = useState("#ffffff");
  const [ratio, setRatio] = useState("1:1");
  const [description, setDescription] = useState("");
  const [sidebarTab, setSidebarTab] = useState<"type" | "style" | "details">("type");

  const { totalActions, remainingActions, limit } = getActivityStats();
  const isLocked = totalActions >= limit;
  const remaining = remainingActions;

  const isPremium = Boolean(
    profile?.plan?.toLowerCase().includes("pro") ||
    profile?.plan?.toLowerCase().includes("business") ||
    profile?.plan?.toLowerCase().includes("premium")
  );

  useEffect(() => {
    return () => {
      setResults([]);
      setAlertMessage(null);
    };
  }, []);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (ev.target?.result) setUploadedImage(ev.target.result as string);
    };
    reader.readAsDataURL(file);
  };

  const downloadImage = async (imageUrl: string, index: number) => {
    try {
      const filename = `bizaira-image-${index + 1}.png`;
      const anchor = document.createElement("a");

      if (imageUrl.startsWith("data:")) {
        anchor.href = imageUrl;
        anchor.download = filename;
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
        return;
      }

      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);

      anchor.href = objectUrl;
      anchor.download = filename;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
    } catch (error) {
      console.error("Image download failed:", error);
      setAlertMessage(isHe
        ? "ההורדה נכשלה. יש לנסות שוב באחריות קישור תקין."
        : "Download failed. Please try again with a valid image URL.");
    }
  };

  const handleGenerate = async () => {
    if (totalActions >= limit) {
      openStudioLimitModal();
      return;
    }

    if (!user) {
      setShowAuthGuard(true);
      return;
    }

    const trimmedDescription = description.trim();
    if (!trimmedDescription) {
      setAlertMessage(
        "לא הזנת פרטים. אנא מלא את השדות הנדרשים כדי לאפשר לבינה המלאכותית להתחיל בתהליך היצירה."
      );
      return;
    }

    setAlertMessage(null);
    setIsGenerating(true);
    setResults([]);

    try {
      const imageUrls = await generateStudioImage({
        imageType,
        style,
        bgColor,
        ratio,
        description: trimmedDescription,
        editImage: uploadedImage || undefined,
        quality: isPremium ? "premium" : "standard",
        outputResolution: "8K",
      });

      if (imageUrls.length === 0) {
        throw new Error("No images returned");
      }

      setResults(imageUrls);
      setActiveResult(0);
      trackCreation();
    } catch (err: any) {
      console.error("Generation failed:", err);
      setAlertMessage(err?.message || "יצירת התמונה נכשלה. נסה שוב.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async (index: number) => {
    const imageUrl = results[index];
    if (!imageUrl) return;

    await downloadImage(imageUrl, index);
    trackDownload();
  };

  return (
    <div className="min-h-screen bg-soft-cream text-[#001830]" dir={isHe ? "rtl" : "ltr"}>
      <div className="mx-auto max-w-7xl px-6 py-6">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/create"
              className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-[#001830]/20 bg-surface-cream text-[#001830] transition hover:border-[#001830]"
            >
              <BackArrow size={18} />
            </Link>
            <div>
              <h1 className="text-xl font-semibold tracking-tight text-[#001830]">
                {isHe ? "סטודיו תמונות" : "Image Studio"}
              </h1>
              <p className="mt-1 text-xs leading-5 text-[#666]">
                {isHe ? "צור תמונות יוקרתיות עם AI" : "Create premium images with AI"}
              </p>
            </div>
          </div>
          <div className="rounded-2xl border border-[#001830]/10 bg-surface-cream px-3 py-2 text-xs font-semibold text-[#001830] shadow-sm">
            {remaining} {isHe ? "פעולות" : "actions left"}
          </div>
        </div>

        {alertMessage && (
          <div className="mb-5 rounded-2xl border border-[#F8D7DA] bg-[#FEF2F2] px-4 py-3 text-xs text-[#991B1B] shadow-sm">
            {alertMessage}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[1.6fr_0.95fr]">
          <div className="space-y-5">
            <div className="luxury-card p-6 text-right">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.24em] text-[#666]">
                    {isHe ? "תצוגה מקדימה" : "Preview"}
                  </p>
                  <h2 className="mt-1 text-lg font-semibold text-[#001830]">
                    {isHe ? "תצוגת תמונה חיה" : "Live preview"}
                  </h2>
                </div>
                <span className="rounded-full bg-[#001830] px-3 py-1.5 text-[9px] font-semibold text-[#F5F5DC]">
                  {isPremium ? (isHe ? "פרימיום" : "Premium") : isHe ? "חינמי" : "Free"}
                </span>
              </div>

              <div className="min-h-[380px] overflow-hidden rounded-[16px] border border-[var(--soft-border)] bg-surface-cream p-4 flex items-center justify-center">
                {results.length > 0 ? (
                  <img
                    src={results[activeResult]}
                    alt={`Generated ${activeResult + 1}`}
                    className="max-h-[500px] w-full rounded-[18px] object-contain"
                  />
                ) : uploadedImage ? (
                  <div className="relative h-full w-full rounded-[18px] overflow-hidden">
                    <img src={uploadedImage} alt="Uploaded" className="h-full w-full object-contain" />
                    <button
                      type="button"
                      onClick={() => setUploadedImage(null)}
                      className="absolute top-3 end-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-[#001830] shadow-sm transition hover:bg-white"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-sm font-semibold text-[#001830] mb-1">
                      {isHe ? "התוצאה תוצג כאן" : "Your creation will appear here"}
                    </p>
                    <p className="text-xs leading-5 text-[#999]">
                      {isHe ? "הוסף פרטים ולחץ 'צור תמונות'" : "Add details and click Create Images"}
                    </p>
                  </div>
                )}
              </div>

              {results.length > 1 && (
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  {results.map((image, index) => (
                    <button
                      type="button"
                      key={image}
                      onClick={() => setActiveResult(index)}
                      className={`h-12 w-12 overflow-hidden rounded-[12px] border ${activeResult === index ? "border-[#001830] shadow-lg" : "border-[#001830]/10"}`}
                    >
                      <img src={image} alt={`Variant ${index + 1}`} className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  disabled={isGenerating}
                  onClick={handleGenerate}
                  className="inline-flex min-w-[160px] items-center justify-center rounded-2xl bg-[#001830] px-5 py-3 text-xs font-semibold text-[#F5F5DC] transition hover:bg-[#0D2E48] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isGenerating ? (
                    <span className="flex items-center gap-2">
                      <Loader2 size={14} className="animate-spin" />
                      {isHe ? "יוצר..." : "Creating..."}
                    </span>
                  ) : (
                    <span>{isHe ? "צור תמונות" : "Create Images"}</span>
                  )}
                </button>
                {results.length > 0 && (
                  <button
                    type="button"
                    onClick={() => handleDownload(activeResult)}
                    className="inline-flex min-w-[160px] items-center justify-center rounded-2xl border border-[#001830]/20 bg-white px-5 py-3 text-xs font-semibold text-[#001830] transition hover:bg-[#F9F9F6]"
                  >
                    {isHe ? "הורד" : "Download"}
                  </button>
                )}
              </div>
            </div>
          </div>

          <aside className="space-y-5">
            <div className="luxury-card rounded-[16px] bg-surface-cream shadow-soft-business p-5">
              <div className="flex gap-2 rounded-full bg-[#F9F9F6] p-1">
                {([
                  { id: "type" as const, label: isHe ? "סוג" : "Type" },
                  { id: "style" as const, label: isHe ? "סגנון" : "Style" },
                  { id: "details" as const, label: isHe ? "פרטים" : "Details" },
                ]).map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setSidebarTab(tab.id)}
                    className={`flex-1 rounded-full px-3 py-2 text-xs font-semibold transition ${sidebarTab === tab.id ? "bg-[#001830] text-[#F5F5DC]" : "text-[#666] hover:bg-[#F9F9F6]"}`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {sidebarTab === "type" && (
                <div className="mt-4 space-y-4">
                  <div>
                    <p className="text-xs font-semibold text-[#001830] mb-2">{isHe ? "סוג תמונה" : "Image Type"}</p>
                    <div className="grid grid-cols-2 gap-2">
                      {IMAGE_TYPES.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setImageType(item.id)}
                          className={`rounded-2xl border px-3 py-2.5 text-xs font-medium transition ${imageType === item.id ? "border-[#001830] bg-[#001830] text-[#F5F5DC]" : "border-[#001830]/10 bg-surface-cream text-[#001830] hover:border-[#001830]/30"}`}
                        >
                          {isHe ? item.he : item.en}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-[#001830] mb-2">{isHe ? "יחס תמונה" : "Aspect Ratio"}</p>
                    <div className="grid grid-cols-2 gap-2">
                      {RATIOS.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setRatio(item.id)}
                          className={`rounded-2xl border px-3 py-2.5 text-xs font-medium transition ${ratio === item.id ? "border-[#001830] bg-[#001830] text-[#F5F5DC]" : "border-[#001830]/10 bg-surface-cream text-[#001830] hover:border-[#001830]/30"}`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {sidebarTab === "style" && (
                <div className="mt-4 space-y-4">
                  <div>
                    <p className="text-xs font-semibold text-[#001830] mb-2">{isHe ? "סגנון עיצוב" : "Design Style"}</p>
                    <div className="grid grid-cols-2 gap-2">
                      {STYLES.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setStyle(item.id)}
                          className={`rounded-2xl border px-3 py-2.5 text-xs font-medium transition ${style === item.id ? "border-[#001830] bg-[#001830] text-[#F5F5DC]" : "border-[#001830]/10 bg-surface-cream text-[#001830] hover:border-[#001830]/30"}`}
                        >
                          {isHe ? item.he : item.en}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-[#001830] mb-2">{isHe ? "צבע רקע" : "Background Color"}</p>
                    <div className="grid grid-cols-10 gap-1 mb-3 max-h-[180px] overflow-y-auto pr-1 border border-[#001830]/10 rounded-2xl p-2 bg-[#F9F9F6]">
                      {PRESET_COLORS.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => {
                            setBgColor(color);
                            setCustomColor(color);
                          }}
                          className={`aspect-square rounded-lg border-2 transition hover:scale-105 ${bgColor === color ? "border-[#001830] ring-2 ring-[#001830]/30 scale-105" : "border-[#001830]/10"}`}
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                    </div>
                    <div className="flex gap-2 items-center">
                      <input
                        type="color"
                        value={customColor}
                        onChange={(e) => {
                          setCustomColor(e.target.value);
                          setBgColor(e.target.value);
                        }}
                        className="h-8 w-8 rounded-lg border border-[#001830]/10 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={bgColor}
                        onChange={(e) => setBgColor(e.target.value)}
                        placeholder="#ffffff"
                        className="flex-1 rounded-lg border border-[#001830]/10 bg-surface-cream px-3 py-1.5 text-xs text-[#001830] placeholder:text-[#ccc] focus:border-[#001830] focus:outline-none focus:ring-2 focus:ring-[#001830]/10"
                      />
                    </div>
                  </div>
                </div>
              )}

              {sidebarTab === "details" && (
                <div className="mt-4 space-y-3">
                  <div>
                    <p className="text-xs font-semibold text-[#001830] mb-2">{isHe ? "תיאור" : "Description"}</p>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder={isHe ? "תאר את התמונה המבוקשת..." : "Describe the desired image..."}
                      rows={5}
                      className="w-full rounded-lg border border-[#001830]/10 bg-surface-cream px-3 py-2 text-xs text-[#001830] placeholder:text-[#ccc] focus:border-[#001830] focus:outline-none focus:ring-2 focus:ring-[#001830]/10"
                    />
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="w-full rounded-2xl border border-[var(--soft-border)] bg-surface-cream px-4 py-3 text-xs font-semibold text-[#001830] transition hover:border-[#001830]/30 hover:bg-[#F5F5DC]"
            >
              <Upload size={16} className="inline-block me-1" />
              <span>{isHe ? "העלה תמונה (אופ')" : "Upload image (optional)"}</span>
            </button>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />
          </aside>
        </div>
      </div>

      {showAuthGuard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 py-6">
          <div className="relative w-full max-w-xl rounded-[24px] border border-[#F5F5DC]/20 bg-[#001830] p-6 shadow-2xl">
            <button
              onClick={() => setShowAuthGuard(false)}
              className="absolute right-4 top-4 rounded-full border border-[#F5F5DC]/20 p-1.5 text-[#F5F5DC] transition hover:bg-[#F5F5DC]/10"
              aria-label={isHe ? "סגור" : "Close"}
            >
              <X size={16} />
            </button>
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#F5F5DC]/20 bg-[#F5F5DC]/5 text-[#F5F5DC]">
                <ImageIcon size={24} />
              </div>
              <h2 className="text-lg font-semibold text-[#F5F5DC]">
                {isHe ? "סטודיו תמונות - דרוש חשבון" : "Image Studio requires account"}
              </h2>
              <p className="max-w-md text-xs leading-5 text-[#F5F5DC]/80">
                {isHe
                  ? "יש להתחבר ליצור תמונות עם בינה מלאכותית"
                  : "Sign in to start creating images with AI"}
              </p>
              <div className="mt-3 flex w-full flex-col gap-2 sm:flex-row sm:justify-center">
                <Link
                  to="/auth"
                  onClick={() => setShowAuthGuard(false)}
                  className="inline-flex w-full items-center justify-center rounded-xl bg-[#F5F5DC] px-4 py-2 text-xs font-semibold text-[#001830] transition hover:bg-[#fbf7e5] sm:w-auto"
                >
                  {isHe ? "יצירת חשבון" : "Create account"}
                </Link>
                <Link
                  to="/auth"
                  onClick={() => setShowAuthGuard(false)}
                  className="inline-flex w-full items-center justify-center rounded-xl border border-[#F5F5DC]/20 bg-transparent px-4 py-2 text-xs font-semibold text-[#F5F5DC] transition hover:bg-[#F5F5DC]/10 sm:w-auto"
                >
                  {isHe ? "התחברות" : "Sign in"}
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {isLocked && (
        <div className="fixed inset-0 bg-soft-cream/90 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="luxury-card p-6 border border-[#001830]/10 max-w-sm mx-4 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F9F9F6] text-[#001830]">
              <Lock size={24} />
            </div>
            <h2 className="text-lg font-semibold text-[#001830] mb-2">
              {isHe ? "הגעת למגבלה" : "Monthly limit reached"}
            </h2>
            <p className="text-xs leading-5 text-[#666] mb-4">
              {isHe ? "שדרג לעיצוב ללא הגבלה" : "Upgrade for unlimited image creation"}
            </p>
            <Link
              to="/pricing"
              className="inline-block rounded-2xl bg-[#001830] px-5 py-2 text-xs font-semibold text-[#F5F5DC] transition hover:bg-[#0D2E48]"
            >
              {isHe ? "שדרוג" : "Upgrade"}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageStudioPage;
