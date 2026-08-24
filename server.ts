import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: "50mb" }));

// Lazy init for Gemini
let aiClient: GoogleGenAI | null = null;
function getAI(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is missing.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// AI Card Generator Endpoint
app.post("/api/generate-cards", async (req, res) => {
  try {
    const { theme, count = 5, tone = "acolhedor e reflexivo", cardType = "terapia_integrativa", language = "pt-BR" } = req.body;

    if (!theme) {
      return res.status(400).json({ error: "Tema é obrigatório." });
    }

    const ai = getAI();
    const prompt = `Você é um especialista em psicologia clínica, terapias integrativas, mindfulness e desenvolvimento pessoal.
Gere exatamente ${Math.min(Math.max(Number(count) || 5, 1), 30)} cartas terapêuticas profissionais para um baralho no tema: "${theme}".
Tom desejado: ${tone}.
Tipo de abordagem: ${cardType}.
Idioma: ${language}.

Cada carta deve ser profunda, poética, acolhedora e com embasamento reflexivo sólido.
Estruture cada carta com:
1. number: número sequencial formatado como string com 2 dígitos (ex: "01", "02")
2. title: Nome ou tema central da carta em MAIÚSCULAS (ex: "ACEITAÇÃO", "AUTOCOMPAIXÃO", "LIMITES SAUDÁVEIS", "CORAGEM DE SENTIR")
3. affirmation: Uma afirmação ou mantra poderoso em 1ª pessoa ("Eu me permito...", "Reconheço que...", "Honro meu...")
4. reflection: Uma reflexão terapêutica profunda e acolhedora em 2 a 4 frases (aprofundando a psicologia do tema)
5. soulQuestion: Uma "Pergunta da Alma" (pergunta poderosa aberta para o paciente refletir profundamente)
6. actionPrompt: Uma pequena prática ou micro-exercício para o momento (ex: "Coloque a mão no peito e faça 3 respirações profundas...")
7. category: Categoria da carta (ex: "Emoções", "Presença", "Cura da Criança Interior", "Relacionamentos", "Coragem")
8. quote: Uma citação curta inspiradora ou sabedoria ancestral relacionada`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            deckTitle: { type: Type.STRING, description: "Título sugerido para o baralho" },
            deckSubtitle: { type: Type.STRING, description: "Subtítulo ou citação do verso do baralho" },
            cards: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  number: { type: Type.STRING },
                  title: { type: Type.STRING },
                  affirmation: { type: Type.STRING },
                  reflection: { type: Type.STRING },
                  soulQuestion: { type: Type.STRING },
                  actionPrompt: { type: Type.STRING },
                  category: { type: Type.STRING },
                  quote: { type: Type.STRING },
                },
                required: ["number", "title", "affirmation", "reflection", "soulQuestion"],
              },
            },
          },
          required: ["deckTitle", "cards"],
        },
      },
    });

    const text = response.text || "{}";
    const data = JSON.parse(text);
    res.json(data);
  } catch (error: any) {
    console.error("Erro ao gerar cartas com IA:", error);
    res.status(500).json({ error: error.message || "Falha ao gerar cartas terapêuticas." });
  }
});

// AI Card Enhancer Endpoint
app.post("/api/enhance-card", async (req, res) => {
  try {
    const { card, instruction = "Tornar mais poético e terapeuticamente profundo" } = req.body;
    if (!card) {
      return res.status(400).json({ error: "Dados da carta são obrigatórios." });
    }

    const ai = getAI();
    const prompt = `Aprimore o conteúdo desta carta terapêutica de acordo com a instrução: "${instruction}".
Carta atual:
Título: ${card.title || ""}
Afirmação: ${card.affirmation || ""}
Reflexão: ${card.reflection || ""}
Pergunta da Alma: ${card.soulQuestion || ""}
Prática/Ação: ${card.actionPrompt || ""}

Mantenha a essência terapêutica, elevando o vocabulário para torná-lo acolhedor, elegante e transformador.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            affirmation: { type: Type.STRING },
            reflection: { type: Type.STRING },
            soulQuestion: { type: Type.STRING },
            actionPrompt: { type: Type.STRING },
            category: { type: Type.STRING },
          },
          required: ["title", "affirmation", "reflection", "soulQuestion"],
        },
      },
    });

    const data = JSON.parse(response.text || "{}");
    res.json(data);
  } catch (error: any) {
    console.error("Erro ao aprimorar carta:", error);
    res.status(500).json({ error: error.message || "Falha ao aprimorar carta." });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
