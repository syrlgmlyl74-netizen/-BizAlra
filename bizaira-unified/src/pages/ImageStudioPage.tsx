import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { generateStudioImage } from "@/lib/ai-service";
import { getActivityStats, trackCreation, trackDownload } from "@/lib/activity-tracker";
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
  "#ffffff",
  "#111111",
  "#f5f0e8",
  "#1a1a3e",
  "#f5e0e0",
  "#d4ddd0",
  "#fef3c7",
  "#dbeafe",
  "#fce7f3",
  "#d1fae5",
  "#e0e7ff",
  "#fde68a",
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

  const { totalActions, remainingActions } = getActivityStats();
  const isLocked = totalActions >= 5;
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
    <div className="min-h-screen bg-white text-[#000B18]" dir={isHe ? "rtl" : "ltr"}>
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Link
              to="/create"
              className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-[#E5E7EB] bg-white text-[#000B18] transition hover:border-[#000B18]"
            >
              <BackArrow size={20} />
            </Link>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-[#000B18]">
                {isHe ? "סטודיו תמונות" : "Image Studio"}
              </h1>
              <p className="mt-2 text-sm leading-7 text-[#475569]">
                {isHe ? "צור תמונות יוקרתיות עבור העסק שלך באמצעות AI" : "Create premium images for your business with AI."}
              </p>
            </div>
          </div>
          <div className="rounded-3xl border border-[#E5E7EB] bg-white px-4 py-3 text-sm font-semibold text-[#000B18] shadow-sm">
            {remaining} {isHe ? "פעולות נותרו" : "actions left"}
          </div>
        </div>

        {alertMessage && (
          <div className="mb-6 rounded-3xl border border-[#F8D7DA] bg-[#FEF2F2] px-5 py-4 text-sm text-[#991B1B] shadow-sm">
            {alertMessage}
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-[1.6fr_0.95fr]">
          <div className="space-y-6">
            <div className="rounded-[32px] border border-[#E5E7EB] bg-white p-6 shadow-[0_20px_40px_rgba(0,11,24,0.08)]">
              <div className="mb-6 flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.32em] text-[#64748B]">
                    {isHe ? "תצוגה מקדימה" : "Preview"}
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-[#000B18]">
                    {isHe ? "תצוגת תמונה חיה" : "Live image preview"}
                  </h2>
                </div>
                <span className="rounded-full bg-[#000B18] px-4 py-2 text-xs font-semibold text-[#F5F5DC]">
                  {isPremium ? (isHe ? "מנוי פרימיום" : "Premium") : isHe ? "מנוי חינמי" : "Free Tier"}
                </span>
              </div>

              <div className="min-h-[420px] overflow-hidden rounded-[28px] border border-[#E5E7EB] bg-[#F8F9FB] p-6 flex items-center justify-center">
                {results.length > 0 ? (
                  <img
                    src={results[activeResult]}
                    alt={`Generated ${activeResult + 1}`}
                    className="max-h-[580px] w-full rounded-[24px] object-contain"
                  />
                ) : uploadedImage ? (
                  <div className="relative h-full w-full rounded-[24px] overflow-hidden">
                    <img src={uploadedImage} alt="Uploaded" className="h-full w-full object-contain" />
                    <button
                      type="button"
                      onClick={() => setUploadedImage(null)}
                      className="absolute top-4 end-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-[#000B18] shadow-sm transition hover:bg-white"
                    >
                      <X size={18} />
                    </button>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-lg font-semibold text-[#000B18] mb-2">
                      {isHe ? "היצירה שלך תוצג כאן" : "Your creation will appear here"}
                    </p>
                    <p className="text-sm leading-7 text-[#64748B]">
                      {isHe ? "הזן פרטים ולחץ על 'צור תמונות' כדי לראות תוצאה" : "Enter details and click Create Images to see the result."}
                    </p>
                  </div>
                )}
              </div>

              {results.length > 1 && (
                <div className="mt-6 flex flex-wrap items-center gap-3">
                  {results.map((image, index) => (
                    <button
                      type="button"
                      key={image}
                      onClick={() => setActiveResult(index)}
                      className={`h-16 w-16 overflow-hidden rounded-[18px] border ${activeResult === index ? "border-[#000B18] shadow-lg" : "border-[#E5E7EB]"}`}
                    >
                      <img src={image} alt={`Variant ${index + 1}`} className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  disabled={isGenerating}
                  onClick={handleGenerate}
                  className="inline-flex min-w-[180px] items-center justify-center rounded-full bg-[#000B18] px-6 py-4 text-sm font-semibold text-white transition hover:bg-[#001830] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isGenerating ? (
                    <span className="flex items-center gap-2">
                      <Loader2 size={18} className="animate-spin" />
                      {isHe ? "יוצר תמונה..." : "Generating image..."}
                    </span>
                  ) : (
                    <span>{isHe ? "צור תמונות" : "Create Images"}</span>
                  )}
                </button>
                {results.length > 0 && (
                  <button
                    type="button"
                    onClick={() => handleDownload(activeResult)}
                    className="inline-flex min-w-[180px] items-center justify-center rounded-full border border-[#000B18] bg-white px-6 py-4 text-sm font-semibold text-[#000B18] transition hover:bg-[#000B18] hover:text-white"
                  >
                    {isHe ? "הורד תמונה" : "Download Image"}
                  </button>
                )}
              </div>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-[32px] border border-[#E5E7EB] bg-white p-6 shadow-[0_20px_40px_rgba(0,11,24,0.08)]">
              <div className="flex gap-3 rounded-full bg-[#F8F9FB] p-1">
                {([
                  { id: "type" as const, label: isHe ? "סוג" : "Type" },
                  { id: "style" as const, label: isHe ? "סגנון" : "Style" },
                  { id: "details" as const, label: isHe ? "פרטים" : "Details" },
                ]).map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setSidebarTab(tab.id)}
                    className={`flex-1 rounded-full px-4 py-3 text-sm font-semibold transition ${sidebarTab === tab.id ? "bg-[#000B18] text-white" : "text-[#64748B] hover:bg-white"}`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {sidebarTab === "type" && (
                <div className="mt-6 space-y-5">
                  <div>
                    <p className="text-sm font-semibold text-[#000B18] mb-3">{isHe ? "סוג תמונה" : "Image Type"}</p>
                    <div className="grid grid-cols-2 gap-3">
                      {IMAGE_TYPES.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setImageType(item.id)}
                          className={`rounded-3xl border px-4 py-4 text-sm font-medium transition ${imageType === item.id ? "border-[#000B18] bg-[#000B18] text-white" : "border-[#E5E7EB] bg-white text-[#000B18] hover:border-[#000B18]"}`}
                        >
                          {isHe ? item.he : item.en}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-[#000B18] mb-3">{isHe ? "יחס תמונה" : "Aspect Ratio"}</p>
                    <div className="grid grid-cols-2 gap-3">
                      {RATIOS.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setRatio(item.id)}
                          className={`rounded-3xl border px-4 py-4 text-sm font-medium transition ${ratio === item.id ? "border-[#000B18] bg-[#000B18] text-white" : "border-[#E5E7EB] bg-white text-[#000B18] hover:border-[#000B18]"}`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {sidebarTab === "style" && (
                <div className="mt-6 space-y-5">
                  <div>
                    <p className="text-sm font-semibold text-[#000B18] mb-3">{isHe ? "סגנון עיצוב" : "Design Style"}</p>
                    <div className="grid grid-cols-2 gap-3">
                      {STYLES.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setStyle(item.id)}
                          className={`rounded-3xl border px-4 py-4 text-sm font-medium transition ${style === item.id ? "border-[#000B18] bg-[#000B18] text-white" : "border-[#E5E7EB] bg-white text-[#000B18] hover:border-[#000B18]"}`}
                        >
                          {isHe ? item.he : item.en}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-[#000B18] mb-3">{isHe ? "צבע רקע" : "Background Color"}</p>
                    <div className="grid grid-cols-6 gap-2 mb-4">
                      {PRESET_COLORS.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => {
                            setBgColor(color);
                            setCustomColor(color);
                          }}
                          className={`h-10 rounded-2xl border-2 transition ${bgColor === color ? "border-[#000B18] shadow-lg" : "border-[#E5E7EB]"}`}
                          style={{ backgroundColor: color }}
                          aria-label={color}
                        />
                      ))}
                    </div>
                    <div className="flex gap-3">
                      <input
                        type="color"
                        value={customColor}
                        onChange={(e) => {
                          setCustomColor(e.target.value);
                          setBgColor(e.target.value);
                        }}
                        className="h-11 w-16 rounded-3xl border border-[#E5E7EB] cursor-pointer"
                      />
                      <input
                        type="text"
                        value={bgColor}
                        onChange={(e) => setBgColor(e.target.value)}
                        placeholder="#ffffff"
                        className="flex-1 rounded-3xl border border-[#E5E7EB] bg-white px-4 py-3 text-sm text-[#000B18] placeholder:text-[#94a3b8] focus:border-[#000B18] focus:outline-none focus:ring-2 focus:ring-[#000B18]/10"
                      />
                    </div>
                  </div>
                </div>
              )}

              {sidebarTab === "details" && (
                <div className="mt-6 space-y-5">
                  <div>
                    <p className="text-sm font-semibold text-[#000B18] mb-3">{isHe ? "תיאור מפורט" : "Detailed Description"}</p>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder={isHe ? "תאר את התמונה הרצויה..." : "Describe the desired image..."}
                      rows={6}
                      className="w-full rounded-[24px] border border-[#E5E7EB] bg-white px-4 py-4 text-sm text-[#000B18] placeholder:text-[#94a3b8] focus:border-[#000B18] focus:outline-none focus:ring-2 focus:ring-[#000B18]/10"
                    />
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="w-full rounded-3xl border border-[#E5E7EB] bg-white px-5 py-4 text-sm font-semibold text-[#000B18] transition hover:border-[#000B18] hover:bg-[#F8F9FB]"
            >
              <Upload size={18} />
              <span className="ms-2">{isHe ? "העלה תמונת מקור (אופציונלי)" : "Upload source image (optional)"}</span>
            </button>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />
          </aside>
        </div>
      </div>

      {showAuthGuard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 py-6">
          <div className="relative w-full max-w-xl rounded-[28px] border border-white/10 bg-[#001830] p-8 shadow-2xl">
            <button
              onClick={() => setShowAuthGuard(false)}
              className="absolute right-4 top-4 rounded-full border border-white/20 p-2 text-[#F5F5DC] transition hover:bg-white/10"
              aria-label={isHe ? "סגור" : "Close"}
            >
              <X size={18} />
            </button>
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/15 bg-white/5 text-[#F5F5DC]">
                <ImageIcon size={28} />
              </div>
              <h2 className="text-2xl font-semibold text-[#F5F5DC]">
                {isHe ? "סטודיו התמונות זמין למנויים" : "Image Studio is available for members"}
              </h2>
              <p className="max-w-md text-sm leading-7 text-[#F5F5DC]/90">
                {isHe
                  ? "עדיין לא נרשמת למערכת. כדי להתחיל ליצור ולעצב תמונות עם בינה מלאכותית, יש להתחבר או ליצור חשבון."
                  : "You haven't signed up yet. To start creating and designing images with AI, please log in or create an account."}
              </p>
              <div className="mt-4 flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
                <Link
                  to="/auth"
                  onClick={() => setShowAuthGuard(false)}
                  className="inline-flex w-full items-center justify-center rounded-2xl bg-[#F5F5DC] px-5 py-3 text-sm font-semibold text-[#001830] transition hover:bg-[#fbf7e5] sm:w-auto"
                >
                  {isHe ? "ליצירת חשבון חדש" : "Create a new account"}
                </Link>
                <Link
                  to="/auth"
                  onClick={() => setShowAuthGuard(false)}
                  className="inline-flex w-full items-center justify-center rounded-2xl border border-white/20 bg-transparent px-5 py-3 text-sm font-semibold text-[#F5F5DC] transition hover:bg-white/10 sm:w-auto"
                >
                  {isHe ? "כבר יש לי חשבון" : "I already have an account"}
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {isLocked && (
        <div className="fixed inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-[32px] p-8 shadow-2xl border border-[#E5E7EB] max-w-md mx-4 text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-3xl bg-[#F8F9FB] text-[#000B18]">
              <Lock size={28} />
            </div>
            <h2 className="text-xl font-semibold text-[#000B18] mb-4">
              {isHe ? "הגעת למגבלה החודשית" : "You've reached your monthly limit"}
            </h2>
            <p className="text-sm leading-7 text-[#475569] mb-6">
              {isHe ? "שדרג עכשיו כדי להמשיך ליצור תמונות ללא הגבלה" : "Upgrade now to continue creating unlimited images."}
            </p>
            <Link
              to="/pricing"
              className="inline-block rounded-full bg-[#000B18] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#001830]"
            >
              {isHe ? "לשדרג כעת" : "Upgrade now"}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageStudioPage;
