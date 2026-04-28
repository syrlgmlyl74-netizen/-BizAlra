// Retry utility for API calls
async function retryApiCall<T>(
  apiCall: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await apiCall();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.warn(`API call failed (attempt ${attempt}/${maxRetries}):`, lastError.message);

      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, delay * attempt));
      }
    }
  }

  throw lastError!;
}

export async function generateImage(prompt: string, editImage?: string): Promise<string> {
  try {
    const response = await fetch("/api/generate-image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, editImage }),
    });

    const data = await response.json();
    if (!response.ok || data?.error) throw new Error(data?.error || "Image generation failed");
    if (!data?.imageUrl) throw new Error("No image returned");

    return data.imageUrl;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : "Network error generating image");
  }
}

export interface GenerateStudioImagePayload {
  imageType: string;
  style: string;
  bgColor: string;
  ratio: string;
  description?: string;
  editImage?: string;
}

export async function generateStudioImage(payload: GenerateStudioImagePayload): Promise<string[]> {
  try {
    const response = await fetch("/api/image-studio", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok || data?.error) throw new Error(data?.error || "Image Studio generation failed");
    if (!Array.isArray(data?.imageUrls) || data.imageUrls.length === 0) throw new Error("No images returned");

    return data.imageUrls;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : "Network error generating studio image");
  }
}

export async function generateText(prompt: string, systemPrompt?: string): Promise<string> {
  try {
    const response = await fetch("/api/generate-text", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, systemPrompt }),
    });

    const data = await response.json();
    if (!response.ok || data?.error) throw new Error(data?.error || "Text generation failed");
    if (!data?.text) throw new Error("No text returned");

    return data.text;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : "Network error generating text");
  }
}
export interface GenerateMessagePayload {
  messageType: string;
  tone: string;
  audience: string;
  details: string;
  language?: string;
  modifier?: string;
}

export async function generateMessage(payload: GenerateMessagePayload): Promise<string> {
  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok || data?.error) {
      const errorText = data?.error || "Message generation failed";
      throw new Error(errorText);
    }
    if (!data?.text) throw new Error("No message was generated");

    return data.text;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : "Network error generating message");
  }
}

export interface GenerateAnalyticsPayload {
  revenue: number;
  expenses: number;
  clients: number;
  feeling?: string;
  tooMuchTime?: string;
  wantToImprove?: string;
  question?: string;
  language?: string;
}

export async function generateAnalytics(payload: GenerateAnalyticsPayload): Promise<string> {
  return retryApiCall(async () => {
    const response = await fetch("/api/generate-analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok || data?.error) {
      const errorText = data?.error || "Analytics generation failed";
      throw new Error(errorText);
    }
    if (!data?.text) throw new Error("No analytics text returned");
    return data.text;
  });
}

export interface GenerateTimePlanPayload {
  weeklyHours: number;
  monthlyIncome: number;
  services?: string;
  language?: string;
}

export async function generateTimePlan(payload: GenerateTimePlanPayload): Promise<string> {
  return retryApiCall(async () => {
    const response = await fetch("/api/generate-time", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok || data?.error) {
      const errorText = data?.error || "Time optimization failed";
      throw new Error(errorText);
    }
    if (!data?.text) throw new Error("No time plan text returned");
    return data.text;
  });
}

export interface GeneratePricingPayload {
  businessType?: string;
  currentPrice?: string;
  audience?: string;
  goals?: string;
  language?: string;
}

export async function generatePricing(payload: GeneratePricingPayload): Promise<string> {
  try {
    const response = await fetch("/api/generate-pricing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok || data?.error) {
      const errorText = data?.error || "Pricing generation failed";
      throw new Error(errorText);
    }
    if (!data?.text) throw new Error("No pricing text returned");
    return data.text;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : "Network error generating pricing");
  }
}
