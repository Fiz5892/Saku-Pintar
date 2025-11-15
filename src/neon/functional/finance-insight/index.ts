interface FinancialData {
  totalIncome: number;
  totalExpense: number;
  categories: Array<{
    category: string;
    amount: number;
  }>;
}

export const generateFinancialInsights = async (data: FinancialData) => {
  try {
    const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
    
    if (!GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY not configured");
    }

    const { totalIncome, totalExpense, categories } = data;
    const balance = totalIncome - totalExpense;
    const savingsRate =
      totalIncome > 0 ? ((balance / totalIncome) * 100).toFixed(1) : 0;

    // Find top spending category
    const topCategory =
      categories.length > 0
        ? categories.reduce((prev, curr) =>
            curr.amount > prev.amount ? curr : prev
          )
        : null;

    const categoriesText = categories
      .map((cat) => `${cat.category}: Rp ${cat.amount.toLocaleString("id-ID")}`)
      .join(", ");

    const prompt = `Kamu adalah Financial Assistant dari aplikasi Saku Pintar.
    
Analisis data keuangan berikut dan berikan insight singkat, jelas, dan mudah dipahami dalam Bahasa Indonesia:
- Total Pemasukan: Rp ${totalIncome.toLocaleString("id-ID")}
- Total Pengeluaran: Rp ${totalExpense.toLocaleString("id-ID")}
- Saldo: Rp ${balance.toLocaleString("id-ID")}
- Tingkat Tabungan: ${savingsRate}%
${topCategory ? `- Pengeluaran Terbesar: ${topCategory.category} (Rp ${topCategory.amount.toLocaleString("id-ID")})` : ""}
${categories.length > 0 ? `- Detail Pengeluaran: ${categoriesText}` : ""}

Berikan:
1. Analisis singkat kondisi keuangan (2-3 kalimat)
2. Rekomendasi praktis untuk perbaikan (2-3 poin)
3. Tips budgeting yang relevan (1-2 tips)

Format dalam paragraf yang mudah dibaca, tidak perlu bullet points.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1000,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const result = await response.json();
    const insight = result.candidates?.[0]?.content?.parts?.[0]?.text || 
      "Unable to generate insights";

    return { insight, error: null };
  } catch (error: any) {
    console.error("Generate insights error:", error);
    
    if (error.message?.includes("429")) {
      return {
        insight: null,
        error: "Terlalu banyak permintaan. Coba lagi nanti.",
      };
    }
    
    if (error.message?.includes("403")) {
      return {
        insight: null,
        error: "API key tidak valid. Periksa konfigurasi.",
      };
    }

    return {
      insight: null,
      error: "Gagal membuat insight keuangan",
    };
  }
};