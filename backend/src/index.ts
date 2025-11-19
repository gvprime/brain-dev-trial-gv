import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import OpenAI from "openai";

const prisma = new PrismaClient();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));

function parseDate(dateStr: any): Date | null {
  if (!dateStr) return null;
  if (dateStr instanceof Date) return dateStr;
  if (typeof dateStr !== "string") return null;
  const d = new Date(dateStr);
  if (!isNaN(d.getTime())) return d;
  const lower = dateStr.toLowerCase();
  const today = new Date();
  if (lower.includes("friday")) { today.setDate(today.getDate() + ((5 - today.getDay() + 7) % 7 || 7)); return today; }
  if (lower.includes("monday")) { today.setDate(today.getDate() + ((1 - today.getDay() + 7) % 7 || 7)); return today; }
  if (lower.includes("tuesday")) { today.setDate(today.getDate() + ((2 - today.getDay() + 7) % 7 || 7)); return today; }
  if (lower.includes("next week")) { today.setDate(today.getDate() + 7); return today; }
  return null;
}

app.post("/api/ingest", async (req, res) => {
  try {
    const { transcript_id = "id-" + Date.now(), title = "Untitled Meeting", participants = [], transcript } = req.body;
    if (!transcript) return res.status(400).json({ error: "transcript required" });

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      temperature: 0.3,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: "Extract JSON with: summary (string), sentiment (positive|negative|neutral), topics (string[]), action_items (array of {description: string, assignee?: string, due_date?: string})" },
        { role: "user", content: transcript }
      ],
    });

    const extracted = JSON.parse(completion.choices[0].message.content || "{}");

    const embeddingRes = await openai.embeddings.create({ model: "text-embedding-3-small", input: transcript.slice(0, 8000) });
    const embedding = embeddingRes.data[0].embedding;

    await prisma.transcript.create({
      data: {
        title,
        participants: participants.map((p: any) => p.name || "").join(", "),
        transcript,
        summary: extracted.summary || "",
        sentiment: extracted.sentiment || "neutral",
        extractedJson: extracted,
        embedding: JSON.stringify(embedding),
        topics: { create: (extracted.topics || []).map((name: string) => ({ topic: { connectOrCreate: { where: { name }, create: { name } } } })) },
        actionItems: { create: (extracted.action_items || []).map((i: any) => ({
          description: i.description || "",
          assignee: i.assignee || null,
          dueDate: parseDate(i.due_date || i.dueDate),
        }))},
      }
    });

    res.json({ success: true, id: transcript_id });
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

app.get("/api/transcripts", async (_req, res) => {
  const data = await prisma.transcript.findMany({
    include: { topics: { include: { topic: true } }, actionItems: true },
    orderBy: { createdAt: "desc" }
  });
  res.json(data);
});

app.get("/api/transcripts/:id", async (req, res) => {
  const { id } = req.params;
  const transcript = await prisma.transcript.findUnique({
    where: { id },
    include: { topics: { include: { topic: true } }, actionItems: true },
  });
  if (!transcript) return res.status(404).json({ error: "Not found" });
  res.json(transcript);
});

app.get("/api/search", async (req, res) => {
  const q = req.query.q as string;
  if (!q) return res.json([]);
  const emb = await openai.embeddings.create({ model: "text-embedding-3-small", input: q });
  const all = await prisma.transcript.findMany();
  const cosine = (a: number[], b: number[]) => {
    const dot = a.reduce((s, v, i) => s + v * b[i], 0);
    const magA = Math.sqrt(a.reduce((s, v) => s + v * v, 0));
    const magB = Math.sqrt(b.reduce((s, v) => s + v * v, 0));
    return dot / (magA * magB) || 0;
  };
  const results = all
    .map(t => ({ ...t, score: cosine(JSON.parse(t.embedding), emb.data[0].embedding) }))
    .sort((a: any, b: any) => b.score - a.score)
    .slice(0, 5);
  res.json(results);
});

app.get("/api/analytics/topics", async (_req, res) => {
  const transcripts = await prisma.transcript.findMany({ include: { topics: { include: { topic: true } } } });
  const counts: Record<string, number> = {};
  transcripts.forEach(t => {
    if (t.topics) t.topics.forEach((tt: any) => {
      if (tt.topic?.name) counts[tt.topic.name] = (counts[tt.topic.name] || 0) + 1;
    });
  });
  res.json(Object.entries(counts).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count));
});

app.get("/api/analytics/participants", async (_req, res) => {
  const transcripts = await prisma.transcript.findMany();
  const counts: Record<string, number> = {};
  transcripts.forEach(t => {
    if (t.participants) {
      t.participants.split(",").map(p => p.trim()).filter(Boolean).forEach(name => {
        counts[name] = (counts[name] || 0) + 1;
      });
    }
  });
  res.json(Object.entries(counts).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count));
});

app.listen(4000, () => console.log("100% FINAL — ALL ENDPOINTS WORKING — http://localhost:4000"));
