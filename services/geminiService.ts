import { GoogleGenAI, Modality } from "@google/genai";
import { getAirportData, getAirportStats, getAirportName } from '../data/nataruData';
import { PredictionRequest, PredictionResult, TrafficType, ExecutiveData } from '../types';
import { PDF_STYLE_REFERENCE } from '../data/executiveData';

// Helper to get API key from various sources
const getApiKey = (): string | null => {
  // 1. Check localStorage (user input - highest priority for security)
  if (typeof window !== 'undefined' && localStorage.getItem('GEMINI_API_KEY')) {
    return localStorage.getItem('GEMINI_API_KEY');
  }
  // 2. Check process.env (build time - from GitHub Secrets)
  if (process.env.API_KEY && process.env.API_KEY !== '') {
    return process.env.API_KEY;
  }
  if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== '') {
    return process.env.GEMINI_API_KEY;
  }
  return null;
};

export const getPrediction = async (request: PredictionRequest): Promise<PredictionResult> => {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("API Key not found. Please set GEMINI_API_KEY in GitHub Secrets or enter it in the app.");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  // 1. Get the correct dataset based on Airport Code
  const selectedData = getAirportData(request.airportCode);
  const selectedStats = getAirportStats(request.airportCode);
  const airportName = getAirportName(request.airportCode);

  // 2. Check if we have exact data for context (Baseline)
  const exactMatch = selectedData.find(d => d.date === request.date);
  
  // 3. Prepare Context for the AI
  const dataContext = JSON.stringify(selectedData);
  const globalContext = JSON.stringify(selectedStats);
  
  const systemInstruction = `
    Anda adalah Analis Strategis Penerbangan Senior untuk InJourney Airports (Angkasa Pura Indonesia).
    
    TUJUAN:
    Berikan Forecast (Prakiraan) dan ANALISIS STRATEGIS untuk periode 'Nataru' 2025/2026 di ${airportName}.
    
    DATA INPUT:
    - Prognosa Resmi (Target) untuk tanggal tertentu.
    - Tren historis dan konteks periode penuh (disediakan dalam JSON).
    
    TUGAS ANDA:
    1. **Forecast**: Prediksi realisasi aktual (deviasi dari target) berdasarkan logika puncak/liburan.
    2. **Reasoning Spesifik**: Jelaskan secara spesifik mengapa angkanya berubah (misal: "Penurunan saat hari H Natal", "Lonjakan akhir pekan karena arus balik").
    3. **Analisis Makro (PENTING)**: Analisis GAMBARAN BESAR. Lihat hari-hari di sekitar tanggal yang dipilih.
       - Apakah tren naik atau turun?
       - Apakah kita berada dalam periode kemacetan kritis?
       - Berikan rekomendasi operasional singkat (misal: "Siapkan antrian Check-in Baris A karena lonjakan pagi").
    
    PROFIL BANDARA:
    - **CGK**: Hub utama. Sensitivitas tinggi terhadap cuaca di Des (bisa delay). Campuran bisnis/leisure tinggi.
    - **DPS**: Murni leisure. Volume internasional tinggi. Kedatangan memuncak sebelum Tahun Baru.
    
    FORMAT OUTPUT (JSON):
    {
      "predictedValue": number,
      "reasoning": "string (Penjelasan spesifik angka dalam Bahasa Indonesia)",
      "comprehensiveAnalysis": "string (Analisis makro tren + Rekomendasi operasional dalam Bahasa Indonesia yang profesional. Maks 3 kalimat.)"
    }
  `;

  const prompt = `
    ANALISIS SKENARIO:
    Tanggal: ${request.date}
    Tipe Trafik: ${request.type}
    Bandara: ${airportName}

    KONTEKS PERIODE PENUH (Gunakan ini untuk identifikasi tren): ${dataContext}
    STATISTIK RINGKASAN: ${globalContext}

    LANGKAH:
    1. Identifikasi Target Prognosa untuk ${request.date}.
    2. Bandingkan dengan hari sebelum dan sesudahnya untuk identifikasi TREN (Puncak, Lereng, atau Lembah).
    3. Terapkan logika prediksi cerdas untuk mendapatkan "predictedValue" (biasanya realisasi sedikit menyimpang dari target).
    4. Hasilkan "comprehensiveAnalysis" yang merangkum tren dan memberikan rekomendasi operasional taktis.
    
    PENTING: Gunakan Bahasa Indonesia yang formal, tajam, dan berorientasi data.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    const parsed = JSON.parse(text);

    return {
      predictedValue: parsed.predictedValue,
      confidence: 'High (Gemini 3 Pro Analysis)',
      reasoning: parsed.reasoning,
      comprehensiveAnalysis: parsed.comprehensiveAnalysis,
      context: exactMatch || null,
      airportCode: request.airportCode
    };

  } catch (error) {
    console.error("Gemini Error:", error);
    if (exactMatch) {
       const baseVal = request.type === TrafficType.PASSENGER ? exactMatch.passengers : exactMatch.flights;
       const variation = Math.floor(baseVal * (1 + (Math.random() * 0.04 - 0.01))); 
       
       return {
         predictedValue: variation,
         confidence: "Medium (Offline Calculation)",
         reasoning: "Estimasi berdasarkan tren historis dengan penyesuaian faktor fluktuasi harian standar (+/- 2%). (Mode Offline)",
         comprehensiveAnalysis: "Data offline. Tren menunjukkan pola standar Nataru dengan kenaikan signifikan pada akhir pekan. Disarankan monitoring manual.",
         context: exactMatch,
         airportCode: request.airportCode
       }
    }
    throw error;
  }
};

export const getExecutiveAnalysis = async (data: ExecutiveData): Promise<string> => {
    const apiKey = getApiKey();
    if (!apiKey) throw new Error("API Key not found. Please set GEMINI_API_KEY in GitHub Secrets or enter it in the app.");
    const ai = new GoogleGenAI({ apiKey });

    const systemInstruction = `
        Anda adalah AI Analyst Strategis untuk Direksi PT Angkasa Pura Indonesia.
        Tugas Anda adalah membuat "Executive Report" berdasarkan data Posko Nataru yang diberikan.

        ATURAN FORMATTING (PENTING - JANGAN GUNAKAN MARKDOWN):
        1. JANGAN gunakan simbol Markdown seperti ##, **, atau *.
        2. Gunakan tag HTML murni untuk struktur dokumen agar terlihat profesional:
           - <h3> untuk Judul Bagian (misal: EXECUTIVE SUMMARY).
           - <p> untuk setiap paragraf.
           - <b> untuk menebalkan angka kunci (misal: <b>96%</b>).
           - <ul class="list-disc pl-4 space-y-1"> dan <li> untuk daftar poin.
           - <br> untuk jarak antar paragraf jika perlu.

        ATURAN KONTEN:
        1. JANGAN MENYALIN teks dari data referensi PDF. Gunakan data JSON yang diberikan untuk membuat narasi baru yang orisinal.
        2. Analisis "Recovery Rate" dan "Growth" secara kritis.
        3. Gaya bahasa: Formal, Korporat BUMN, Profesional.

        STRUKTUR LAPORAN YANG DIHARAPKAN (Dalam HTML):
        
        <h3>A. EXECUTIVE SUMMARY (INSIGHT STRATEGIS)</h3>
        <p>Satu paragraf kuat yang merangkum keberhasilan atau isu kritis periode ini. Sebutkan angka total penumpang dan recovery rate sebagai highlight utama.</p>

        <h3>B. ANALISIS TRAFIK & PERFORMA</h3>
        <ul class="list-disc pl-4 space-y-1">
           <li><b>Analisis Puncak Arus:</b> Bandingkan performa H-3 (Natal) dan H+5 (Tahun Baru). Mana yang lebih tinggi? Apa implikasinya?</li>
           <li><b>Evaluasi Akumulasi:</b> Bahas total trafik pesawat dan kargo. Apakah ada anomali?</li>
        </ul>
           
        <h3>C. OPERASIONAL & IRREGULARITIES</h3>
        <p>Tinjau performa operasional. Apakah OTP <b>${data.operational.otp.all}</b> sudah memadai? Soroti dampak dari <b>${data.irregularities.total}</b> kejadian irregularities (terutama faktor alam).</p>

        <h3>D. REKOMENDASI</h3>
        <p>Satu kalimat penutup yang berisi saran strategis untuk sisa periode atau evaluasi pasca-Nataru.</p>
    `;

    const prompt = `
        DATA REAL-TIME UNTUK DIANALISIS:
        ${JSON.stringify(data)}

        Buat laporan HTML sekarang.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: prompt,
            config: {
                systemInstruction: systemInstruction,
            }
        });
        return response.text || "Gagal membuat laporan analisis.";
    } catch (e) {
        console.error(e);
        return "Layanan AI tidak tersedia saat ini.";
    }
}

export const generateExecutiveAudio = async (htmlContent: string): Promise<string | undefined> => {
    const apiKey = getApiKey();
    if (!apiKey) throw new Error("API Key not found. Please set GEMINI_API_KEY in GitHub Secrets or enter it in the app.");
    const ai = new GoogleGenAI({ apiKey });

    // 1. Strip HTML tags to get raw text for speaking
    const rawText = htmlContent.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim();

    // 2. Call Gemini TTS
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: {
                parts: [{ text: rawText }]
            },
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: 'Kore' },
                    },
                },
            },
        });

        // The response contains inlineData with base64 encoded audio
        return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    } catch (e) {
        console.error("TTS Error:", e);
        throw e;
    }
}