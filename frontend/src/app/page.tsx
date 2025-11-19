"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

interface Transcript {
  id: string;
  title: string;
  summary: string;
  sentiment: string;
  topics: { topic: { name: string } }[];
  actionItems: { description: string; assignee?: string }[];
  createdAt: string;
}

export default function Home() {
  const [transcripts, setTranscripts] = useState<Transcript[]>([]);
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<Transcript[]>([]);
  const [transcript, setTranscript] = useState("");
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTranscripts();
  }, []);

  const fetchTranscripts = async () => {
    const res = await axios.get("http://localhost:4000/api/transcripts");
    setTranscripts(res.data);
  };

  const ingest = async () => {
    setLoading(true);
    await axios.post("http://localhost:4000/api/ingest", {
      title,
      participants: ["You"],
      transcript,
    });
    setTranscript("");
    setTitle("");
    fetchTranscripts();
    setLoading(false);
  };

  const searchTranscripts = async () => {
    const res = await axios.get(`http://localhost:4000/api/search?q=${search}`);
    setResults(res.data);
  };

  const topicData = transcripts
    .flatMap(t => t.topics.map(tt => tt.topic.name))
    .reduce((acc: any, name) => {
      acc[name] = (acc[name] || 0) + 1;
      return acc;
    }, {});

  const chartData = Object.entries(topicData).map(([name, count]) => ({ name, count }));

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Brain Dashboard</h1>

        {/* Ingest */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h2 className="text-2xl font-semibold mb-4">Add Transcript</h2>
          <input
            placeholder="Meeting Title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full p-3 border rounded mb-3"
          />
          <textarea
            placeholder="Paste transcript here..."
            value={transcript}
            onChange={e => setTranscript(e.target.value)}
            rows={6}
            className="w-full p-3 border rounded mb-3"
          />
          <button
            onClick={ingest}
            disabled={loading || !transcript}
            className="bg-blue-600 text-white px-6 py-3 rounded disabled:opacity-50"
          >
            {loading ? "Processing..." : "Ingest"}
          </button>
        </div>

        {/* Search */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h2 className="text-2xl font-semibold mb-4">Semantic Search</h2>
          <div className="flex gap-3">
            <input
              placeholder="Ask anything..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyPress={e => e.key === "Enter" && searchTranscripts()}
              className="flex-1 p-3 border rounded"
            />
            <button onClick={searchTranscripts} className="bg-green-600 text-white px-6 py-3 rounded">
              Search
            </button>
          </div>
          {results.length > 0 && (
            <div className="mt-4 space-y-3">
              {results.map(r => (
                <div key={r.id} className="p-4 border rounded bg-gray-50">
                  <p className="font-medium">{r.title}</p>
                  <p className="text-sm text-gray-600">{r.summary}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Analytics */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-semibold mb-4">Topic Frequency</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-semibold mb-4">Recent Transcripts</h2>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {transcripts.slice(0, 5).map(t => (
                <div key={t.id} className="p-3 border rounded">
                  <p className="font-medium">{t.title}</p>
                  <p className="text-sm text-gray-600">{new Date(t.createdAt).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

