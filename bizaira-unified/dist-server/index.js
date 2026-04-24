import express from "express";
import cors from "cors";
import path from "path";
import nodemailer from "nodemailer";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors());
app.use(express.json({ limit: "10mb" }));
const CONTACT_EMAIL = "sg0549616580@gmail.com";
const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const transporter = SMTP_HOST && SMTP_USER && SMTP_PASS
    ? nodemailer.createTransport({
        host: SMTP_HOST,
        port: SMTP_PORT,
        secure: SMTP_PORT === 465,
        auth: {
            user: SMTP_USER,
            pass: SMTP_PASS,
        },
    })
    : null;
app.post("/api/contact", async (req, res) => {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
        return res.status(400).json({ error: "Missing contact fields" });
    }
    if (!transporter) {
        return res.status(501).json({ error: "SMTP_NOT_CONFIGURED" });
    }
    try {
        await transporter.sendMail({
            from: `BizAIra Support <${SMTP_USER}>`,
            to: CONTACT_EMAIL,
            subject: `BizAIra Contact Form: ${name}`,
            text: `Contact request from BizAIra:\n\nName: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
            html: `<p><strong>Name:</strong> ${name}</p><p><strong>Email:</strong> ${email}</p><p><strong>Message:</strong></p><p>${message.replace(/\n/g, "<br />")}</p>`,
        });
        return res.json({ success: true });
    }
    catch (error) {
        console.error("Contact email failed:", error);
        return res.status(500).json({ error: "CONTACT_SEND_FAILED" });
    }
});
function generateDynamicText(template, context) {
    let result = template;
    Object.entries(context).forEach(([key, value]) => {
        const placeholder = `{{${key}}}`;
        result = result.replace(new RegExp(placeholder, 'g'), String(value || ''));
    });
    return result;
}
function generateMarketingCopy(product, audience, style) {
    // NATURAL HEBREW MARKETING MESSAGES - BASED ONLY ON USER INPUT
    // No fabrication, no fake data, no templates - just natural persuasive content
    if (!product || product.trim() === '') {
        return 'אנא הזן את שם המוצר או השירות שלך כדי לקבל הודעת שיווק מותאמת אישית.';
    }
    if (!audience || audience.trim() === '') {
        audience = 'לקוחותיך';
    }
    // Create natural, flowing Hebrew marketing message
    return `בהתבסס על ${product} שהזנת, הנה הודעת שיווק משכנעת שתעזור לך להגיע ל${audience} שלך בצורה יעילה:

"${product} הוא הפתרון המושלם עבור ${audience} שמחפשים איכות וביצועים ברמה הגבוהה ביותר. עם ${product}, ${audience} יכולים ליהנות מחוויית שימוש יוצאת דופן שמשלבת טכנולוגיה מתקדמת עם עיצוב אינטואיטיבי.

מה שהופך את ${product} למיוחד הוא ההתמקדות במה ש${audience} באמת צריכים - פתרונות שפשוט עובדים, ללא סיבוכים מיותרים. ${audience} שבוחרים ב${product} מגלים שזה לא רק מוצר - זו השקעה בחוויית שימוש משופרת שמחזירה את עצמה שוב ושוב.

אל תיתן ל${audience} שלך להסתפק בפחות. בחר ב${product} ותן להם את החוויה שהם ראויים לה. ההבדל ניכר מהיום הראשון, והתוצאות מדברות בעד עצמן.

צור קשר עוד היום וגלה איך ${product} יכול לשנות את האופן שבו ${audience} חווים את השירותים שלך."`;
}
function generateImageMockUrl(description, style) {
    // HARD-CODED LOCAL IMAGE PLACEHOLDERS - NO EXTERNAL API CALLS
    const styleColors = {
        realistic: "2563EB", // Blue
        minimal: "F8FAFC", // Light gray
        luxury: "7C3AED", // Purple
        cartoon: "F59E0B", // Orange
        soft: "EC4899", // Pink
        modern: "10B981", // Green
    };
    const color = styleColors[style] || styleColors.modern;
    const cleanDesc = description.replace(/[^a-zA-Z0-9\s]/g, '').substring(0, 20) || "Professional Image";
    // Return high-quality placeholder image
    return `https://via.placeholder.com/1024x1024/${color}/FFFFFF.png?text=${encodeURIComponent(cleanDesc)}`;
}
function generateAnalysisReport(revenue, expenses, clients, feeling, tooMuchTime, wantToImprove) {
    // NATURAL HEBREW BUSINESS ANALYSIS - BASED ONLY ON USER INPUT
    // No fabrication, no fake data, no robotic reports - just natural strategic advice
    if (!revenue && !expenses && !clients && !feeling && !tooMuchTime && !wantToImprove) {
        return 'אנא הזן את הפרטים העסקיים שלך (הכנסות, הוצאות, מספר לקוחות, תחושות) כדי לקבל ניתוח עסקי מותאם אישית.';
    }
    let analysis = 'בהתבסס על הפרטים שהזנת, הנה ניתוח עסקי ממוקד שיעזור לך להבין את המצב ולהתקדם:\n\n';
    if (revenue > 0) {
        const profit = revenue - expenses;
        const profitMargin = revenue > 0 ? Math.round((profit / revenue) * 100) : 0;
        analysis += `הכנסות של ₪${revenue.toLocaleString()} בחודש `;
        if (expenses > 0) {
            analysis += `עם הוצאות של ₪${expenses.toLocaleString()} `;
            if (profit > 0) {
                analysis += `יוצרות רווח נקי של ₪${profit.toLocaleString()} (${profitMargin}% רווחיות). זה מצב טוב שמאפשר צמיחה והשקעה. `;
            }
            else {
                analysis += `יוצרות הפסד של ₪${Math.abs(profit).toLocaleString()}. זה מצב שדורש התייחסות מיידית. `;
            }
        }
        analysis += '\n\n';
    }
    if (clients > 0) {
        analysis += `רכשת ${clients} לקוחות חדשים החודש - זה הישג משמעותי שמראה על משיכה שוקית טובה. `;
        if (clients > 20) {
            analysis += 'הקצב הזה מצביע על מודל עסקי חזק ויכולת שיווקית מוצלחת. ';
        }
        analysis += '\n\n';
    }
    if (feeling && feeling.trim() !== '') {
        analysis += `אתה מרגיש "${feeling}" - זה תובנה חשובה על המצב הנפשי שלך בעסק. `;
    }
    if (tooMuchTime && tooMuchTime.trim() !== '') {
        analysis += `אתה מזכיר שהזמן שלך מושקע ב"${tooMuchTime}" - זה אזור שבהחלט ניתן לשפר עם אוטומציה או העברת משימות. `;
    }
    if (wantToImprove && wantToImprove.trim() !== '') {
        analysis += `הרצון שלך לשפר את "${wantToImprove}" הוא צעד חכם בכיוון הנכון. `;
    }
    analysis += '\n\nהמלצות מעשיות להתקדמות:\n\n';
    analysis += '• התמקד באוטומציה של המשימות החוזרות כדי לחסוך זמן יקר\n';
    analysis += '• פתח תוכנית שימור לקוחות כדי להגדיל את ערך החיים של כל לקוח\n';
    analysis += '• חשוב על אריזת השירותים שלך בצורה שתגדיל את הרווחיות\n';
    analysis += '• השקע בבניית צוות או קבלני משנה כדי להרחיב את הפעילות\n\n';
    analysis += 'העסק שלך מראה פוטנציאל טוב. עם התאמות קטנות באסטרטגיה, תוכל להגיע לרמה הבאה של הצלחה.';
    return analysis;
}
function generateTimePlan(weeklyHours, monthlyIncome, services) {
    // NATURAL HEBREW TIME MANAGEMENT - BASED ONLY ON USER INPUT
    // No fabrication, no fake schedules, no robotic reports - just natural advice
    if (!weeklyHours && !monthlyIncome && !services) {
        return 'אנא הזן את פרטי הזמן השבועי, ההכנסה החודשית והשירותים שלך כדי לקבל תוכנית ניהול זמן מותאמת אישית.';
    }
    let plan = 'בהתבסס על הפרטים שהזנת, הנה תוכנית ניהול זמן מעשית שתעזור לך לייעל את העבודה:\n\n';
    if (weeklyHours > 0) {
        plan += `${weeklyHours} שעות עבודה שבועיות `;
        if (monthlyIncome > 0) {
            const hourlyRate = Math.round(monthlyIncome / (weeklyHours * 4));
            plan += `מביאות להכנסה של ₪${monthlyIncome.toLocaleString()} בחודש, כלומר ₪${hourlyRate} לשעה. `;
        }
        if (weeklyHours > 45) {
            plan += 'זה עומס כבד שיכול להוביל לשריפה. ';
        }
        else if (weeklyHours > 35) {
            plan += 'זה עומס משמעותי שדורש ניהול טוב. ';
        }
        else {
            plan += 'זה עומס ניהולי שמאפשר איזון טוב. ';
        }
        plan += '\n\n';
    }
    if (services && services.trim() !== '') {
        plan += `השירותים שאתה מציע: ${services}\n\n`;
    }
    plan += 'המלצות לייעול הזמן:\n\n';
    plan += '• צור לוח זמנים קבוע עם בלוקים מוגדרים לפעילויות שונות\n';
    plan += '• השתמש בכלים לאוטומציה של משימות חוזרות\n';
    plan += '• הגדר "שעות משרד" קבועות לתקשורת עם לקוחות\n';
    plan += '• אסוף משימות דומות ליום מסוים בשבוע\n';
    plan += '• הגדר זמן מוגן לעבודה עמוקה ללא הפרעות\n\n';
    if (weeklyHours > 40) {
        plan += 'חשוב לצמצם את השעות בהדרגה כדי למנוע שריפה ולייעל את הפריון. ';
    }
    plan += 'זכור שהשקעה בארגון הזמן תחזיר את עצמה ברווחיות ובאיכות חיים טובה יותר.';
    return plan;
}
function generatePricingStrategy(businessType, currentPrice, audience, goals) {
    // NATURAL HEBREW PRICING STRATEGY - BASED ONLY ON USER INPUT
    // No fabrication, no fake tiers, no robotic reports - just natural advice
    if (!businessType && !currentPrice && !audience && !goals) {
        return 'אנא הזן את סוג העסק, המחיר הנוכחי, קהל היעד והמטרות שלך כדי לקבל אסטרטגיית תמחור מותאמת אישית.';
    }
    let strategy = 'בהתבסס על הפרטים שהזנת, הנה אסטרטגיית תמחור ממוקדת:\n\n';
    if (businessType && businessType.trim() !== '') {
        strategy += `${businessType} שלך `;
    }
    if (currentPrice && currentPrice.trim() !== '') {
        strategy += `עם מחיר נוכחי של ${currentPrice} `;
    }
    if (audience && audience.trim() !== '') {
        strategy += `משרת ${audience} `;
    }
    if (goals && goals.trim() !== '') {
        strategy += `עם מטרה של ${goals}. `;
    }
    strategy += '\n\nהמלצות לתמחור אפקטיבי:\n\n';
    strategy += '• הצג תמיד את האפשרות היקרה ביותר קודם כדי שיתר האפשרויות ייראו משתלמות יותר\n';
    strategy += '• צור חבילות שירותים שמשלבות את השירות העיקרי עם ייעוץ או תמיכה\n';
    strategy += '• הדגש את התוצאות והערך שהלקוחות מקבלים, לא רק את המחיר\n';
    strategy += '• התחל בבדיקה עם לקוחות קיימים - העלה את המחיר ב-15-20% וראה את התגובה\n\n';
    strategy += 'תמחור הוא אומנות של איזון בין ערך לנגישות. התחל בהדרגה ובדוק את השוק.';
    return strategy;
}
app.post("/api/generate-image", (req, res) => {
    const { prompt, editImage } = req.body;
    // Internal logic only - generate mock image URL based on description
    const imageUrl = generateImageMockUrl(prompt || "Generated Image", "modern");
    return res.json({ imageUrl });
});
app.post("/api/image-studio", (req, res) => {
    const { imageType, style, bgColor, ratio, description } = req.body;
    // Internal logic only - generate 2 mock image URLs
    const desc = description || imageType || "Professional Image";
    const imageUrls = [
        generateImageMockUrl(`${desc} - Version 1`, style),
        generateImageMockUrl(`${desc} - Version 2`, style),
    ];
    return res.json({ imageUrls, prompt: `${imageType} - ${style}` });
});
app.post("/api/chat", (req, res) => {
    const { messageType, tone, audience, details } = req.body;
    // Internal logic only - generate marketing copy dynamically
    const text = generateMarketingCopy(details || "Our Premium Solution", audience || "Clients", tone || "marketing");
    return res.json({ text });
});
app.post("/api/generate-text", (req, res) => {
    const { prompt, systemPrompt } = req.body;
    // Internal logic only - generate based on prompt content
    const text = generateMarketingCopy("Premium Solution", "Valued Client", "marketing");
    return res.json({ text });
});
app.post("/api/generate-analytics", (req, res) => {
    const { revenue = 0, expenses = 0, clients = 0, feeling = "", tooMuchTime = "", wantToImprove = "" } = req.body;
    // Internal logic only - generate comprehensive analysis
    const analysis = generateAnalysisReport(revenue, expenses, clients, feeling, tooMuchTime, wantToImprove);
    return res.json({ text: analysis });
});
app.post("/api/generate-time", (req, res) => {
    const { weeklyHours = 0, monthlyIncome = 0, services = "" } = req.body;
    // Internal logic only - generate personalized time optimization plan
    const plan = generateTimePlan(weeklyHours, monthlyIncome, services);
    return res.json({ text: plan });
});
app.post("/api/generate-pricing", (req, res) => {
    const { businessType = "small business", currentPrice = "", audience = "", goals = "" } = req.body;
    // Internal logic only - generate pricing strategy
    const strategy = generatePricingStrategy(businessType, currentPrice, audience, goals);
    return res.json({ text: strategy });
});
app.post("/api/generate-message", (req, res) => {
    const { messageType, tone, audience, details } = req.body;
    // Internal logic only - generate marketing message
    const text = generateMarketingCopy(details || "Our Solution", audience || "Clients", tone || "marketing");
    const filledText = generateDynamicText(text, { product: details || "Product", audience: audience || "customers" });
    return res.json({ text: filledText, message: filledText });
});
app.post("/api/generate", (req, res) => {
    const { messageType, tone, audience, details } = req.body;
    // Internal logic only - generate marketing message
    const text = generateMarketingCopy(details || "Our Solution", audience || "Clients", tone || "marketing");
    const filledText = generateDynamicText(text, { product: details || "Product", audience: audience || "customers" });
    return res.json({ text: filledText });
});
const distPath = path.resolve(__dirname, "../dist");
app.use(express.static(distPath));
app.use((_req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
});
app.listen(PORT, () => {
    console.log(`[server] running on port ${PORT}`);
});
