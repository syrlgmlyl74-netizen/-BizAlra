import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: "10mb" }));

app.post("/api/generate-image", async (req, res) => {
  const { prompt, editImage } = req.body;
  const API_KEY = process.env.OPENAI_API_KEY || process.env.AI_API_KEY;

  if (!API_KEY) {
    return res.status(500).json({ error: "OPENAI_API_KEY or AI_API_KEY is not configured on the server" });
  }

  try {
    const body: any = {
      prompt,
      model: "dall-e-3",
      size: "1024x1024",
      quality: "standard",
      n: 1,
    };

    if (editImage) {
      body.prompt = `Reference image style: ${prompt}`;
    }

    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const status = response.status;
      const text = await response.text();
      console.error("OpenAI image error:", status, text);
      if (status === 429) return res.status(429).json({ error: "Rate limit exceeded. Please try again in a moment." });
      if (status === 402) return res.status(402).json({ error: "OpenAI credits exhausted. Please add funds." });
      return res.status(500).json({ error: `OpenAI image error (${status})` });
    }

    const data = await response.json();
    const imageUrl = data.data?.[0]?.url;
    if (!imageUrl) return res.status(500).json({ error: "No image was generated" });

    return res.json({ imageUrl });
  } catch (e: any) {
    console.error("generate-image error:", e);
    return res.status(500).json({ error: e?.message || "Unknown error" });
  }
});

const buildImageStudioPrompt = (payload: any) => {
  const typeMap: Record<string, string> = {
    product: "Create a professional product photograph",
    logo: "Create a modern clean logo design",
    profile: "Create a polished business profile portrait",
    banner: "Create an attractive marketing banner image",
  };

  const styleMap: Record<string, string> = {
    realistic: "photorealistic, high-end studio quality",
    minimal: "minimalist, clean lines, lots of whitespace",
    luxury: "luxury premium, elegant, sophisticated",
    cartoon: "modern illustration style, clean vectors",
    soft: "soft, gentle, warm and dreamy aesthetic",
    modern: "contemporary modern, bold and crisp",
  };

  const ratioMap: Record<string, string> = {
    "1:1": "square format",
    "4:3": "classic 4:3 composition",
    "9:16": "portrait-oriented 9:16 composition",
    "16:9": "wide 16:9 composition",
  };

  const { imageType, style, bgColor, ratio, description, editImage } = payload;
  const subject = (description || "").trim();
  const itemLabel = typeMap[imageType] || typeMap.product;
  const styleLabel = styleMap[style] || styleMap.modern;
  const ratioLabel = ratioMap[ratio] || "well-balanced composition";
  const descriptionLabel = subject ? `${subject}.` : "A polished final design.";
  const referenceLabel = editImage
    ? "Use the uploaded reference image as a style guide while still creating an original composition."
    : "";

  return `${itemLabel} ${descriptionLabel} Style: ${styleLabel}. Background color: ${bgColor}. Aspect ratio: ${ratioLabel}. ${referenceLabel} High-resolution, professional quality, detailed rendering.`.trim();
};

app.post("/api/image-studio", async (req, res) => {
  const { imageType, style, bgColor, ratio, description, editImage } = req.body;
  const API_KEY = process.env.OPENAI_API_KEY || process.env.AI_API_KEY;

  if (!API_KEY) {
    return res.status(500).json({ error: "OPENAI_API_KEY or AI_API_KEY is not configured on the server" });
  }

  const prompt = buildImageStudioPrompt({ imageType, style, bgColor, ratio, description, editImage });

  try {
    const body: any = {
      prompt,
      model: "dall-e-3",
      size: "1024x1024",
      n: 2,
    };

    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const status = response.status;
      const text = await response.text();
      console.error("OpenAI image studio error:", status, text);
      if (status === 429) return res.status(429).json({ error: "Rate limit exceeded. Please try again in a moment." });
      if (status === 402) return res.status(402).json({ error: "OpenAI credits exhausted. Please add funds." });
      return res.status(500).json({ error: `OpenAI image error (${status})` });
    }

    const data = await response.json();
    const imageUrls = Array.isArray(data.data)
      ? data.data.map((item: any) => item.url).filter(Boolean)
      : [];

    if (!imageUrls.length) {
      return res.status(500).json({ error: "No images were generated" });
    }

    return res.json({ imageUrls, prompt });
  } catch (e: any) {
    console.error("image-studio error:", e);
    return res.status(500).json({ error: e?.message || "Unknown error" });
  }
});

app.post("/api/chat", async (req, res) => {
  const { messageType, tone, audience, details } = req.body;
  const API_KEY = process.env.OPENAI_API_KEY || process.env.AI_API_KEY;

  if (!API_KEY) {
    return res.status(500).json({ error: "OPENAI_API_KEY or AI_API_KEY is not configured on the server" });
  }

  const systemPrompt = `You are a professional marketing copywriter. Create high-converting marketing messages in Hebrew that match the selected message type, tone, and target audience. Use the details provided, keep the copy persuasive, clear, and engaging, and avoid mentioning that this text was generated by AI.`;
  const userPrompt = `Create a ${messageType} for the target audience: ${audience || "general audience"}. Tone: ${tone}. ${details ? `Include these details: ${details}.` : ""} Provide the final message in Hebrew.`.trim();

  try {
    const text = await requestTextCompletion([
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ], "gpt-4");

    if (!text) {
      return res.status(500).json({ error: "No text was generated" });
    }

    return res.json({ text });
  } catch (e: any) {
    console.error("chat generation error:", e);
    const message = e?.message || "Unknown error";
    const status = message.includes("Rate limit") ? 429 : message.includes("credits") ? 402 : 500;
    return res.status(status).json({ error: message });
  }
});

const buildTextRequest = (messages: any[], model?: string) => {
  const openaiApiKey = process.env.OPENAI_API_KEY;
  const gatewayApiKey = process.env.AI_API_KEY;

  if (openaiApiKey) {
    return {
      url: "https://api.openai.com/v1/chat/completions",
      headers: {
        Authorization: `Bearer ${openaiApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ model: model || "gpt-3.5-turbo", messages, temperature: 0.8, max_tokens: 350 }),
    };
  }

  if (gatewayApiKey) {
    return {
      url: "https://ai.gateway.lovable.dev/v1/chat/completions",
      headers: {
        Authorization: `Bearer ${gatewayApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ model: "google/gemini-3-flash-preview", messages, temperature: 0.8, max_tokens: 350 }),
    };
  }

  return null;
};

const requestTextCompletion = async (messages: any[], model?: string) => {
  const requestConfig = buildTextRequest(messages, model);
  if (!requestConfig) {
    throw new Error("AI_API_KEY or OPENAI_API_KEY is not configured on the server");
  }

  const response = await fetch(requestConfig.url, {
    method: "POST",
    headers: requestConfig.headers,
    body: requestConfig.body,
  });

  if (!response.ok) {
    const status = response.status;
    const text = await response.text();
    console.error("Text generation error:", status, text);
    const error = status === 429 ? "Rate limit exceeded. Please try again in a moment." : status === 402 ? "AI credits exhausted. Please add funds." : `Text generation error (${status})`;
    throw new Error(error);
  }

  const data = await response.json();
  return data?.choices?.[0]?.message?.content?.trim();
};

app.post("/api/generate-text", async (req, res) => {
  const { prompt, systemPrompt } = req.body;
  const messages: any[] = [];
  if (systemPrompt) messages.push({ role: "system", content: systemPrompt });
  messages.push({ role: "user", content: prompt });

  try {
    const text = await requestTextCompletion(messages);
    if (!text) return res.status(500).json({ error: "No text was generated" });
    return res.json({ text });
  } catch (e: any) {
    console.error("generate-text error:", e);
    const message = e?.message || "Unknown error";
    const status = message.includes("Rate limit") ? 429 : message.includes("credits") ? 402 : 500;
    return res.status(status).json({ error: message });
  }
});

const handleDomainText = async (req: any, res: any, buildSystemPrompt: (lang: string) => string, buildUserPrompt: (lang: string) => string) => {
  const { language } = req.body;
  const isHebrew = language === "hebrew" || language === "he";
  const normalized = isHebrew ? "hebrew" : "english";
  const systemPrompt = buildSystemPrompt(normalized);
  const userPrompt = buildUserPrompt(normalized);

  try {
    const message = await requestTextCompletion([
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ]);
    if (!message) return res.status(500).json({ error: "No text was generated" });
    return res.json({ text: message });
  } catch (e: any) {
    console.error("domain text error:", e);
    const message = e?.message || "Unknown error";
    const status = message.includes("Rate limit") ? 429 : message.includes("credits") ? 402 : 500;
    return res.status(status).json({ error: message });
  }
};

app.post("/api/generate-analytics", async (req, res) => {
  const { revenue = 0, expenses = 0, clients = 0, feeling = "", tooMuchTime = "", wantToImprove = "", question = "" } = req.body;

  await handleDomainText(req, res,
    (lang) => lang === "hebrew"
      ? `אתה יועץ עסקי חכם המתמחה בעסקים קטנים. נתח את הנתונים והצע תובנות מהירות, המלצות לפעולה ותובנות עסקיות ברורות.`
      : `You are a smart business advisor for small businesses. Analyze the information and provide concise insights, business recommendations, and one practical action step.`,
    (lang) => {
      const currency = lang === "hebrew" ? "₪" : "₪";
      const labels = {
        revenue: lang === "hebrew" ? `הכנסות חודשיות ${currency}${revenue}` : `monthly revenue ${currency}${revenue}`,
        expenses: lang === "hebrew" ? `הוצאות חודשיות ${currency}${expenses}` : `monthly expenses ${currency}${expenses}`,
        profit: lang === "hebrew" ? `רווח נקי ${currency}${revenue - expenses}` : `net profit ${currency}${revenue - expenses}`,
        clients: lang === "hebrew" ? `${clients} לקוחות חדשים` : `${clients} new clients`,
      };
      const context = lang === "hebrew"
        ? `
הרגשה: ${feeling || "לא צוין"}.
האם העסק לוקח יותר מדי זמן: ${tooMuchTime || "לא צוין"}.
מה רוצה לשפר: ${wantToImprove || "לא צוין"}.`
        : `
Feeling: ${feeling || "not specified"}.
Does the business take too much time: ${tooMuchTime || "not specified"}.
What the business owner wants to improve: ${wantToImprove || "not specified"}.`;
      return `${lang === "hebrew" ? "ענה בעברית" : "Answer in English"}. ${labels.revenue}, ${labels.expenses}, ${labels.profit}, ${labels.clients}.${context}

${question ? `${lang === "hebrew" ? "שאלה" : "Question"}: ${question}` : ""}

${lang === "hebrew" ? "הצע 3 תובנות קצרות וצעדים אופרטיביים." : "Offer 3 short insights and actionable steps."}`;
    }
  );
});

app.post("/api/generate-time", async (req, res) => {
  const { weeklyHours = 0, monthlyIncome = 0, services = "", language = "english" } = req.body;

  await handleDomainText(req, res,
    (lang) => lang === "hebrew"
      ? "אתה יועץ ניהול זמן מקצועי לעסקים קטנים. הצע תכנית שבועית שמאזנת עבודה ומניעת שחיקה."
      : "You are a time management consultant for small businesses. Propose a balanced weekly schedule that prevents burnout and improves focus.",
    (lang) => {
      const incomeLabel = lang === "hebrew" ? `הכנסה חודשית ${monthlyIncome}₪` : `monthly income ₪${monthlyIncome}`;
      const serviceLabel = services ? services : lang === "hebrew" ? "כללי" : "general";
      return `${lang === "hebrew" ? "כתוב תוכנית שבועית מאוזנת" : "Write a balanced weekly schedule"} עבור עסק קטן עם ${weeklyHours} שעות עבודה שבועיות, ${incomeLabel}, שירותים: ${serviceLabel}. ${lang === "hebrew" ? "הדגש חלוקה חכמה לימים עמוסים וקלים, כולל עצות למניעת שחיקה." : "Emphasize smart splits between busy and lighter days, including burnout prevention advice."}`;
    }
  );
});

app.post("/api/generate-pricing", async (req, res) => {
  const { businessType = "small business", currentPrice = "", audience = "", goals = "", language = "english" } = req.body;

  await handleDomainText(req, res,
    (lang) => lang === "hebrew"
      ? "אתה יועץ תמחור חכם לעסקים קטנים. הצע אסטרטגיית תמחור שמגבירה רווחיות ולקוח צודק."
      : "You are a smart pricing advisor for small businesses. Recommend a pricing approach that improves profitability and matches the right clients.",
    (lang) => {
      const typeLabel = lang === "hebrew" ? `עסק: ${businessType}` : `business type: ${businessType}`;
      const priceLabel = currentPrice ? `${lang === "hebrew" ? "מחיר נוכחי" : "current price"}: ${currentPrice}` : "";
      const audienceLabel = audience ? `${lang === "hebrew" ? "קהל יעד" : "audience"}: ${audience}` : "";
      const goalLabel = goals ? `${lang === "hebrew" ? "מטרות" : "goals"}: ${goals}` : "";
      return `${lang === "hebrew" ? "כתוב המלצת תמחור קצרה" : "Write a short pricing recommendation"} עבור ${typeLabel}. ${priceLabel} ${audienceLabel} ${goalLabel}`.trim();
    }
  );
});

const generateMessageHandler = async (req: any, res: any) => {
  const { messageType, tone, audience, details, language, modifier } = req.body;
  const normalizedLanguage = language === "hebrew" || language === "he" ? "Hebrew" : "English";
  const systemPrompt = normalizedLanguage === "Hebrew"
    ? "אתה קופירייטר מקצועי שכותב הודעות שיווקיות לעסקים קטנים בישראל. כתוב הודעה בעברית בלבד. אל תוסיף הסברים — רק את ההודעה עצמה."
    : "You are a professional copywriter writing marketing messages for small businesses. Write only the final message, no explanations.";

  const userPrompt = `${normalizedLanguage === "Hebrew" ? "כתוב" : "Write"} a ${messageType} in ${normalizedLanguage === "Hebrew" ? "עברית" : "English"} with a ${tone} tone. Audience: ${audience || (normalizedLanguage === "Hebrew" ? "לקוחות" : "clients")}.${details ? ` Include details: ${details}.` : ""}${modifier ? ` ${modifier}` : ""}`;

  try {
    const message = await requestTextCompletion([
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ]);
    if (!message) return res.status(500).json({ error: "No message was generated" });
    return res.json({ message });
  } catch (e: any) {
    console.error("generate-message error:", e);
    const message = e?.message || "Unknown error";
    const status = message.includes("Rate limit") ? 429 : message.includes("credits") ? 402 : 500;
    return res.status(status).json({ error: message });
  }
};

app.post("/api/generate-message", generateMessageHandler);
app.post("/api/generate", generateMessageHandler);

const distPath = path.resolve(__dirname, "../dist");
app.use(express.static(distPath));
app.use((_req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

app.listen(PORT, () => {
  console.log(`[server] running on port ${PORT}`);
});
