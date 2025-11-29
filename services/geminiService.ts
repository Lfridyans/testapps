
import { GoogleGenAI, Modality } from "@google/genai";
import { getAirportData, getAirportStats, getAirportName } from '../data/nataruData';
import { PredictionRequest, PredictionResult, TrafficType, ExecutiveData, GroundingSource, EventIntelligence } from '../types';
import { PDF_STYLE_REFERENCE } from '../data/executiveData';

// Helper to strictly parse JSON from AI response
const parseAIResponse = (text: string) => {
  try {
    if (!text) return null;
    
    let cleanText = text;

    // 1. Remove Markdown Code Blocks (```json ... ```)
    const markdownRegex = /```(?:json)?([\s\S]*?)```/;
    const match = markdownRegex.exec(text);
    if (match) {
        cleanText = match[1].trim();
    }

    // 2. Try parsing the cleaned text directly first
    try {
        return JSON.parse(cleanText);
    } catch (e) {
        // Continue to extraction strategies
    }

    // 3. ROBUST ARRAY EXTRACTION STRATEGY
    // Look for '[' followed immediately by a '{' (ignoring whitespace).
    // This prevents capturing conversational text like "Here is the [list] of events:"
    const arrayStartRegex = /\[\s*\{/;
    const startMatch = arrayStartRegex.exec(cleanText);
    const endArr = cleanText.lastIndexOf(']');
    
    if (startMatch && endArr !== -1 && endArr > startMatch.index) {
        const jsonStr = cleanText.substring(startMatch.index, endArr + 1);
        try {
            return JSON.parse(jsonStr);
        } catch (e) {
            // If strict parsing fails, try to fix common trailing comma issues
            try {
               const fixedStr = jsonStr.replace(/,\s*]/g, ']').replace(/,\s*}/g, '}');
               return JSON.parse(fixedStr);
            } catch (e2) {
               console.warn("Regex extraction failed, trying simple bracket search.");
            }
        }
    }

    // 4. Fallback: Simple bracket finding (Old method, but strictly for the last ']')
    const startArr = cleanText.indexOf('[');
    if (startArr !== -1 && endArr !== -1 && endArr > startArr) {
        try {
            const jsonStr = cleanText.substring(startArr, endArr + 1);
            return JSON.parse(jsonStr);
        } catch (e) {
            // Ignore
        }
    }

    // 5. Object Extraction Strategy
    const startObj = cleanText.indexOf('{');
    const endObj = cleanText.lastIndexOf('}');
    if (startObj !== -1 && endObj !== -1) {
        try {
            return JSON.parse(cleanText.substring(startObj, endObj + 1));
        } catch (e) {
            // Ignore
        }
    }

    return null;
  } catch (e) {
    console.error("JSON Parse Failed. Raw Text:", text);
    return null;
  }
};

export const getPrediction = async (request: PredictionRequest): Promise<PredictionResult> => {
  const apiKey = getApiKey();
  const ai = new GoogleGenAI({ apiKey });
  
  // 1. Get the correct dataset based on Airport Code
  const selectedData = getAirportData(request.airportCode as any);
  const selectedStats = getAirportStats(request.airportCode as any);
  const airportName = getAirportName(request.airportCode as any);

  // 2. Check if we have exact data for context (Baseline)
  const exactMatch = selectedData.find(d => d.date === request.date);
  
  // 3. Prepare Context
  const dataContext = JSON.stringify(selectedData);
  
  // 4. Construct Agentic Prompt
  const isAuto = request.scenario === 'AUTO';
  
  const systemInstruction = `
    Anda adalah "Autonomous Traffic Prediction Agent" untuk Bandara.
    
    TUGAS ANDA:
    1. Menganalisis tanggal target: ${request.date} untuk Bandara ${airportName}.
    2. ${isAuto ? 'AUTONOMOUS STEP (WAJIB): Gunakan Google Search untuk mencari berita/event/cuaca spesifik pada tanggal tersebut.' : 'Gunakan skenario manual yang diberikan user.'}
    3. Tentukan "Scenario" yang paling relevan.
       - Jika ditemukan Konser/Libur Panjang/Event Olahraga -> Scenario: "High Demand Event".
       - Jika ditemukan Prediksi Badai/Banjir -> Scenario: "Weather Disruption".
       - Jika tidak ada berita signifikan -> Scenario: "Normal Operations".
    4. Hitung prediksi trafik berdasarkan Scenario tersebut dari data baseline JSON.

    ATURAN KALKULASI:
    - Normal: Gunakan tren historis.
    - Weather Disruption: Kurangi trafik 10-20% (pax no-show / flight cancel).
    - High Demand Event: Naikkan trafik 5-15%.

    FORMAT OUTPUT (STRICT JSON ONLY, NO MARKDOWN):
    {
      "detectedEvent": "string (Contoh: 'Konser Coldplay' atau 'Peringatan Hujan Badai' atau 'Tidak ada event khusus')",
      "appliedScenario": "string (Scenario final yang Anda putuskan)",
      "predictedValue": number,
      "reasoning": "string (Jelaskan 'chain of thought' Anda: Dari search X, saya memutuskan Y, sehingga angka menjadi Z)",
      "comprehensiveAnalysis": "string (Saran operasional spesifik untuk Manajer Bandara)"
    }
  `;

  const prompt = `
    REQUEST PARAMETERS:
    Tanggal: ${request.date}
    Tipe: ${request.type}
    Bandara: ${airportName}
    Mode Input User: ${request.scenario}

    DATA HISTORIS (Baseline): ${dataContext}
    
    ${isAuto ? 'INSTRUKSI AUTO: Cari di Google "Events/Weather in [Location] on [Date]". Jika ada hal besar, override baseline. Jika sepi, gunakan baseline.' : `INSTRUKSI MANUAL: User memaksa simulasi "${request.scenario}". Abaikan fakta real-time jika bertentangan, ikuti kemauan user.`}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        tools: [{ googleSearch: {} }] 
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    const parsed = parseAIResponse(text);

    // EXTRACT GROUNDING METADATA
    let sources: GroundingSource[] = [];
    const candidate = response.candidates?.[0];
    if (candidate?.groundingMetadata?.groundingChunks) {
        sources = candidate.groundingMetadata.groundingChunks
            .map((chunk: any) => {
                if (chunk.web) {
                    return { title: chunk.web.title, uri: chunk.web.uri };
                }
                return null;
            })
            .filter((s: any) => s !== null);
    }

    return {
      predictedValue: parsed?.predictedValue || (exactMatch ? (request.type === TrafficType.PASSENGER ? exactMatch.passengers : exactMatch.flights) : 0),
      confidence: parsed?.appliedScenario !== 'Normal Operations' ? 'High (Agent Adjusted)' : 'Medium (Baseline)',
      reasoning: parsed?.reasoning || "Analisis otomatis.",
      comprehensiveAnalysis: parsed?.comprehensiveAnalysis || "Tidak ada analisis.",
      context: exactMatch || null,
      airportCode: request.airportCode,
      sources: sources,
      appliedScenario: parsed?.appliedScenario || "Normal",
      detectedEvent: parsed?.detectedEvent || "None"
    };

  } catch (error) {
    console.error("Gemini Error:", error);
    if (exactMatch) {
       const baseVal = request.type === TrafficType.PASSENGER ? exactMatch.passengers : exactMatch.flights;
       return {
         predictedValue: baseVal,
         confidence: "Low (Offline)",
         reasoning: "Gagal melakukan autonomous search. Menggunakan data statis.",
         comprehensiveAnalysis: "Koneksi AI terputus.",
         context: exactMatch,
         airportCode: request.airportCode,
         sources: [],
         appliedScenario: "Offline Fallback",
         detectedEvent: "Connection Error"
       }
    }
    throw error;
  }
};

export const getExecutiveAnalysis = async (data: ExecutiveData): Promise<string> => {
    const apiKey = getApiKey();
    const ai = new GoogleGenAI({ apiKey });

    const systemInstruction = `
        Anda adalah AI Analyst Strategis untuk Direksi PT Angkasa Pura Indonesia.
        Tugas Anda adalah membuat "Executive Report" berdasarkan data Posko Nataru yang diberikan.
        Gunakan tag HTML murni (<h3>, <p>, <b>, <ul>, <li>) tanpa Markdown.
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
    const ai = new GoogleGenAI({ apiKey });

    const rawText = htmlContent.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim();

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
        return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    } catch (e) {
        console.error("TTS Error:", e);
        throw e;
    }
}

// === NEW FEATURE: AUTONOMOUS EVENT INTELLIGENCE ===

// Helper to get API key with better error handling
const getApiKey = (): string => {
  // Try multiple env var names
  let apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY || '';
  
  // Trim whitespace
  apiKey = apiKey.trim();
  
  // Check for empty or placeholder values
  if (!apiKey || 
      apiKey === 'YOUR_NEW_API_KEY_HERE' || 
      apiKey === 'AIzaSyABC123xyz789...' ||
      apiKey === '') {
    throw new Error("API Key not found or invalid. Please set GEMINI_API_KEY in .env.local file or GitHub Secrets. Get your API key from: https://aistudio.google.com/apikey");
  }
  
  // Check if API key ends with ... (placeholder)
  if (apiKey.endsWith('...')) {
    throw new Error("API key appears to be a placeholder ending with '...'. Please replace with your actual complete API key from https://aistudio.google.com/apikey");
  }
  
  // Basic validation - API key should start with AIza
  if (!apiKey.startsWith('AIza')) {
    throw new Error("Invalid API key format. API key should start with 'AIza'. Please check your API key from https://aistudio.google.com/apikey");
  }
  
  // Check minimum length (real API keys are usually 39+ characters)
  if (apiKey.length < 30) {
    throw new Error(`API key seems too short (${apiKey.length} characters). Please ensure you copied the complete API key from Google AI Studio. API keys are usually 39+ characters.`);
  }
  
  return apiKey;
};

export const scanEventIntelligence = async (startDateInput?: string): Promise<EventIntelligence[]> => {
  const apiKey = getApiKey();
  const ai = new GoogleGenAI({ apiKey });

  // CALCULATE DATE RANGE (7 DAYS)
  const start = new Date(startDateInput || new Date().toISOString());
  const end = new Date(start);
  end.setDate(start.getDate() + 7);
  
  const startDateStr = start.toISOString().split('T')[0];
  const endDateStr = end.toISOString().split('T')[0];
  const targetYear = start.getFullYear();

  // Define valid airports for proper mapping
  const VALID_IATA_CODES = "CGK, DPS, SUB, UPG, KNO, BPN, YIA, SRG, SOC, BDO, HLP, BTJ, PDG, PLM, PKU, BTH, TNJ, PGK, TJQ, BKS, DJB, BWX, PNK, BDJ, PKY, TRK, LOP, KOE, LBJ, MDC, GTO, PLW, KDI, LUW, AMQ, TTE, DJJ, SOQ, MKW, TIM, BIK, MKQ";

  const systemInstruction = `
    Anda adalah "Airport Operations Intelligence Chief" (AOCC Lead) untuk InJourney Airports.
    
    *** TUGAS UTAMA: EXHAUSTIVE ENVIRONMENTAL SCANNING (RAW DATA LISTING) ***
    Cari SELURUH dinamika eksternal yang berdampak pada operasional bandara Indonesia antara ${startDateStr} s.d ${endDateStr}.
    
    *** ATURAN KUOTA (QUOTA ENFORCEMENT): ***
    - WAJIB MENGEMBALIKAN MINIMAL 25-30 ITEM EVENT UNIK.
    - DILARANG MERANGKUM/GROUPING. (Contoh SALAH: "Konser Musik di Jakarta". BENAR: "Konser A", "Konser B", "Konser C" sebagai item terpisah).
    - Jika event besar sedikit, MASUKKAN MICRO-EVENTS (Pameran, Wisuda Universitas Besar, Event Olahraga Lokal, Kepadatan Hotel).

    *** 1. STRICT JURISDICTION BOUNDARY (WEWENANG PENGELOLA BANDARA) ***
    - Anda adalah OPERATOR BANDARA, BUKAN Event Organizer, BUKAN Polisi Lalu Lintas Kota, BUKAN Tim SAR Bencana.
    - Action Plan WAJIB hanya mencakup kegiatan di dalam area bandara (Airside, Terminal, Landside Perimeter).
    - CONTOH SALAH: "Evakuasi warga desa terdampak", "Atur panggung konser", "Hubungi artis".
    - CONTOH BENAR: "Siapkan parking stand khusus pesawat VVIP", "Penebalan petugas AVSEC di Curbside", "Aktivasi Posko Nataru".

    *** 2. STRICT AIRPORT OPERATIONAL UNITS ONLY ***
    Rencana mitigasi ("mitigationPlan") WAJIB menggunakan terminologi unit bandara berikut:
    - "AOCC" (Command Center/Koordinasi Lintas Unit)
    - "AMC" (Apron Movement Control - Parking Stand, Marshaller, FOD Check)
    - "AVSEC" (Aviation Security - SCP, Perimeter, Crowd Control, VVIP Access)
    - "TERMINAL OPS" (Check-in counter, Ruang Tunggu, Flow Pax, Kebersihan)
    - "LANDSIDE OPS" (Parkir, Traffic Drop-off, Taksi, Shuttle Bus Bandara)
    - "ARFF" (PKP-PK - Fire Fighting/Rescue/Paper Test/Hazard Management)
    - "TEKNIK" (Listrik/Genset/Drainase Airside/AC/Fasilitas)
    - "CUSTOMER SERVICE" (Information Desk, Announcement, Handling Complain)

    *** 3. LOGIKA MITIGASI BERBASIS KATEGORI (CONTEXTUAL INTELLIGENCE) ***
    
    A. IF Category == 'Concert' / 'Holiday' (Crowd Surge):
       - IMPACT: Penumpukan penumpang di Terminal & Macet di Drop-off.
       - MITIGASI (Valid): "LANDSIDE OPS: Koordinasi rekayasa lalin drop-off zone", "AVSEC: Penebalan personel di SCP 1", "TERMINAL OPS: Buka semua counter check-in".
       - DILARANG: "Cek drainase/pompa air" (Kecuali hujan), "Siapkan panggung".

    B. IF Category == 'Weather' (Hujan/Badai):
       - IMPACT: Genangan airside, Slippery Runway, Delay penerbangan.
       - MITIGASI (Valid): "TEKNIK: Siapkan pompa sump pit & genset backup", "ARFF: Standby rescue boat", "TERMINAL OPS: Siapkan snack box delay management".

    C. IF Category == 'Disaster' (Gunung Meletus):
       - IMPACT: Abu vulkanik (Volcanic Ash), Penutupan Bandara (Aerodrome Closed).
       - MITIGASI (Valid): "ARFF/AMC: Lakukan Paper Test per 30 menit", "AOCC: Terbitkan NOTAM Closure", "TERMINAL OPS: Siapkan area refund tiket & penumpukan pax".

    D. IF Category == 'Disaster' (Banjir):
       - IMPACT: Akses bandara terputus, Fasilitas terendam.
       - MITIGASI (Valid): "TEKNIK: Pastikan tanggul banjir aman", "LANDSIDE OPS: Arahkan kendaraan ke jalur alternatif tinggi".

    *** 4. STRICT GEO-MAPPING & SURGE LOGIC ***
    - "affectedAirport": Bandara TUJUAN / LOKASI KEJADIAN. (Wajib salah satu dari 37 Bandara InJourney).
    - "potentialOrigins": Bandara ASAL penumpang. Gunakan IATA 3 Huruf (CGK, SUB, dll).
    - RULE HUB: Jika Event di LOMBOK (LOP), Origins = CGK, SUB, DPS.
    - RULE HUB: Jika Event di MEDAN (KNO), Origins = CGK, BTH, KUL.
    - RULE ANTI-LOOP: Origin TIDAK BOLEH sama dengan Affected Airport.

    *** 5. VALIDASI WAKTU (TEMPORAL) ***
    - VERIFIKASI TANGGAL: Jangan laporkan berita usang. Jika User meminta 25 Des 2025, berita dari Maret/Juli 2025 dianggap INVALID kecuali artikel tersebut secara spesifik memprediksi Desember.

    OUTPUT JSON FORMAT (Array):
    [
      {
        "id": "1",
        "title": "Judul Event",
        "date": "YYYY-MM-DD",
        "location": "Nama Kota",
        "category": "Concert" | "Weather" | "Disaster" | "Holiday" | "VVIP" | "Logistics" | "Micro",
        "impactLevel": "HIGH" | "MEDIUM" | "LOW",
        "description": "Deskripsi singkat padat.",
        "affectedAirport": "IATA Code (e.g., KNO)",
        "potentialOrigins": ["CGK", "BTH"], 
        "mitigationPlan": [{ "action": "Detail teknis kesiapan petugas...", "department": "AVSEC" }],
        "imageUrl": "URL",
        "sourceUrl": "URL" 
      }
    ]
  `;

  // FORCE YEAR IN QUERY to filter out old news at search engine level
  const queryDate = start.toLocaleString('id-ID', { month: 'long', year: 'numeric' });
  
  // REGIONAL BREAKDOWN FOR EXHAUSTIVE COVERAGE
  const prompt = `
    Lakukan "Deep Web Scan" secara masif per region untuk periode ${startDateStr} sampai ${endDateStr}.
    
    SAYA BUTUH MINIMAL 25 ITEM EVENT VALID. JANGAN DI-MERGE. PECAH SEMUA EVENT.
    
    Gunakan query berikut secara terpisah untuk menjaring event kecil & besar:
    1. REGION SUMATERA (KNO, BTH, PDG, PLM): "Berita Event, Konser & Cuaca Sumatera ${startDateStr} ${endDateStr}"
    2. REGION JAWA (CGK, SUB, YIA, SRG, SOC): "Jadwal Konser, Pameran, Wisata, Demo, Wisuda Jawa ${queryDate}"
    3. REGION BALI & NUSA TENGGARA (DPS, LOP, LBJ): "Event Wisata Bali Lombok NTT ${startDateStr} ${endDateStr}"
    4. REGION KALIMANTAN & SULAWESI (BPN, UPG, MDC): "Berita Viral, Event & Cuaca Kalimantan Sulawesi ${queryDate}"
    5. NASIONAL (MACRO): "Status Gunung Api, Tiket Pesawat, Libur Nasional, Kepadatan Lalu Lintas ${queryDate}"
    6. MICRO EVENTS: "Hotel Occupancy rate, Local Festivals, University Graduation Schedule near Airports ${queryDate}"
    
    Pastikan setiap region terwakili. Jika ada event lokal (Pameran UMKM, Festival Adat) yang ramai, masukkan saja sebagai "Micro" event.
  `;

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: prompt,
        config: {
            systemInstruction: systemInstruction,
            responseMimeType: "application/json",
            tools: [{ googleSearch: {} }] 
        }
    });

    const text = response.text;
    if (!text) return [];
    
    let events: any[] = [];
    try {
        const parsed = parseAIResponse(text);
        if (Array.isArray(parsed)) {
            events = parsed;
        } else if (parsed && typeof parsed === 'object') {
             const keys = Object.keys(parsed);
             for(const key of keys) {
                 if (Array.isArray(parsed[key])) {
                     events = parsed[key];
                     break;
                 }
             }
        }
    } catch (e) {
        console.error("Scan Event Parse Error", e);
        return [];
    }

    if (!Array.isArray(events) || events.length === 0) return [];

    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const validWebChunks = chunks.filter((c: any) => c.web && c.web.uri && c.web.title);

    const processedEvents = events.map(ev => {
        if (!ev.title) return null;

        // --- POST-PROCESSING LOGIC FIXES ---

        // 1. Fix Origins Circular Logic
        if (ev.potentialOrigins && Array.isArray(ev.potentialOrigins)) {
            const validCodesSet = new Set(VALID_IATA_CODES.split(', '));
            ev.potentialOrigins = ev.potentialOrigins
                .map((code: string) => code.toUpperCase().substring(0, 3))
                .filter((code: string) => validCodesSet.has(code) && code !== ev.affectedAirport); // REMOVE SELF
            
            // If empty after filtering, assign default major hubs based on destination
            if (ev.potentialOrigins.length === 0) {
                if (['CGK', 'DPS'].includes(ev.affectedAirport)) {
                    // Major Hubs fed by Regional Hubs
                    ev.potentialOrigins = ['SUB', 'KNO', 'UPG']; 
                } else {
                    // Regional Airports fed by Major Hubs
                    ev.potentialOrigins = ['CGK', 'DPS', 'SUB']; 
                }
            }
        }

        // 2. Strict Link Validation (Smart Domain Matching)
        let bestMatch = null;
        let maxScore = 0;
        
        const stopWords = ['di', 'dan', 'ke', 'dari', 'yang', 'pada', 'untuk', 'jakarta', 'indonesia', '2025', '2026', 'warning', 'peringatan', 'status', 'level'];
        const evTokens = ev.title.toLowerCase()
            .replace(/[^\w\s]/g, '')
            .split(/\s+/)
            .filter((w: string) => w.length > 2 && !stopWords.includes(w));

        for (const chunk of validWebChunks) {
            const chunkTitle = (chunk.web.title || '').toLowerCase();
            const chunkUrl = (chunk.web.uri || '').toLowerCase();
            let score = 0;
            
            // Basic Token Match
            for (const token of evTokens) {
                if (chunkTitle.includes(token)) score += 3;
                if (chunkUrl.includes(token)) score += 1;
            }

            // Entity Verification (Crucial for Disasters)
            const entities = ['lewotobi', 'merapi', 'semeru', 'sinabung', 'marapi', 'ibu', 'coldplay', 'banjir', 'presiden', 'konser', 'festival'];
            for (const entity of entities) {
                if (ev.title.toLowerCase().includes(entity)) {
                    // If AI claims "Merapi", but source doesn't mention "Merapi", penalize heavily
                    if (chunkTitle.includes(entity) || chunkUrl.includes(entity)) {
                        score += 10;
                    } else {
                        score -= 10; 
                    }
                }
            }
            
            // Year Verification in Source Title (Anti-Old News)
            if (chunkTitle.includes(targetYear.toString())) {
                score += 5;
            }

            if (score > maxScore) {
                maxScore = score;
                bestMatch = chunk;
            }
        }

        if (bestMatch && maxScore > 5) { 
            ev.sourceUrl = bestMatch.web.uri;
        } else {
            // Smart Fallback only if we are somewhat confident, else drop for disasters
            if (ev.category === 'Disaster' && maxScore < 0) {
                 console.warn(`Dropped unverified disaster event: ${ev.title}`);
                 return null;
            }
            
            // Generate valid Google Search link
            const query = encodeURIComponent(`${ev.title} ${targetYear} news`);
            ev.sourceUrl = `https://www.google.com/search?q=${query}`;
        }
        
        return ev;
    }).filter(Boolean);

    // DEDUPLICATION
    const uniqueEvents = processedEvents.filter((v, i, a) => a.findIndex(t => (t.title === v.title)) === i);

    return uniqueEvents;

  } catch (error) {
    console.error("Event Scan Error:", error);
    return [];
  }
}

// NEW: Generate Sidebar Summary from Events
export const generateEventSummary = async (events: EventIntelligence[]): Promise<string> => {
    if (events.length === 0) return "<p>No significant events detected in this period.</p>";

    try {
        const apiKey = getApiKey();
        const ai = new GoogleGenAI({ apiKey });

        const systemInstruction = `
            Anda adalah "Chief Strategy Officer" Bandara. 
            Buatlah "Strategic Intelligence Brief" singkat dalam format HTML (tanpa Markdown, gunakan <h4>, <p>, <ul>, <li>, <strong>) untuk sidebar dashboard.
            
            FOKUS:
            1. Ringkasan Ancaman: Seberapa tinggi risiko operasional minggu ini?
            2. Event Highlight: Sebutkan 1-2 event paling kritikal saja.
            3. Rekomendasi Kunci: Satu kalimat rekomendasi strategis (Gunakan istilah: AOCC, AMC, AVSEC).
            
            Gunakan bahasa Indonesia yang profesional, padat, dan *action-oriented*.
            Jangan terlalu panjang, maksimal 150 kata.
        `;

        const prompt = `
            DATA EVENTS MINGGU INI:
            ${JSON.stringify(events.map(e => ({ title: e.title, category: e.category, impact: e.impactLevel, location: e.location })))}
            
            Buat ringkasan sidebar HTML.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: prompt,
            config: { systemInstruction }
        });
        return response.text || "";
    } catch (e) {
        console.error("Event Summary Error:", e);
        return "<p>Analysis unavailable.</p>";
    }
}
