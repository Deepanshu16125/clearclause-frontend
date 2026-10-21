"use client";

import React, { useState } from "react";
import { Upload, FileText, ShieldCheck, AlertCircle, Loader2, X } from "lucide-react";

interface ClauseAnalysis {
  category: string;
  original_text: string;
  risk_level: "HIGH" | "MEDIUM" | "LOW";
  plain_english: string;
  negotiation_tip: string;
}

interface AnalysisResult {
  fairness_score: number;
  summary: string;
  clauses: ClauseAnalysis[];
}

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
      setResult(null);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setError(null);
    setResult(null);
    // Reset file input value
    const inputElement = document.getElementById("file-upload") as HTMLInputElement;
    if (inputElement) inputElement.value = "";
  };

  const handleAnalyze = async () => {
    if (!file) {
      setError("Please select a PDF document to analyze.");
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://localhost:8000/api/analyze-pdf", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.detail || "Failed to analyze document.");
      }

      const data: AnalysisResult = await response.json();
      setResult(data);
    } catch (err: any) {
      if (err.message === "Failed to fetch") {
        setError("Backend server is offline. Make sure FastAPI is running on http://localhost:8000");
      } else {
        setError(err.message || "An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  const getRiskBadge = (level: "HIGH" | "MEDIUM" | "LOW") => {
    switch (level) {
      case "HIGH":
        return <span className="bg-red-100 text-red-700 font-bold px-3 py-1 rounded-full text-xs">HIGH RISK</span>;
      case "MEDIUM":
        return <span className="bg-amber-100 text-amber-700 font-bold px-3 py-1 rounded-full text-xs">MEDIUM RISK</span>;
      case "LOW":
        return <span className="bg-green-100 text-green-700 font-bold px-3 py-1 rounded-full text-xs">LOW RISK</span>;
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 p-6 md:p-12">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
            Clear<span className="text-blue-600">Clause</span>
          </h1>
          <p className="text-slate-600">
            Upload any lease, employment contract, or terms of service to instantly spot hidden traps and fine print.
          </p>
        </div>

        {/* Upload Box */}
        <div className="bg-white border-2 border-dashed border-slate-300 rounded-xl p-8 text-center space-y-4 hover:border-blue-500 transition-colors">
          <div className="flex justify-center">
            <Upload className="h-12 w-12 text-slate-400" />
          </div>
          <div>
            <label htmlFor="file-upload" className="cursor-pointer font-semibold text-blue-600 hover:text-blue-500">
              Choose a PDF contract
            </label>
            <input id="file-upload" type="file" accept=".pdf" className="hidden" onChange={handleFileChange} />
            <p className="text-xs text-slate-500 mt-1">PDF format supported (up to 15MB)</p>
          </div>
          
          {/* Selected File Box with Remove Option */}
          {file && (
            <div className="flex items-center justify-between gap-3 text-sm text-slate-700 bg-slate-100 py-2 px-4 rounded-lg max-w-md mx-auto border border-slate-200">
              <div className="flex items-center gap-2 truncate">
                <FileText className="h-4 w-4 text-blue-600 flex-shrink-0" />
                <span className="truncate font-medium">{file.name}</span>
              </div>
              <button
                onClick={handleRemoveFile}
                className="text-slate-400 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-slate-200"
                title="Remove file"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          <div>
            <button
              onClick={handleAnalyze}
              disabled={loading || !file}
              className="bg-blue-600 text-white font-medium px-6 py-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 mx-auto"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Analyzing Contract...
                </>
              ) : (
                "Scan Contract"
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg flex items-center gap-3">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Results View */}
        {result && (
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-slate-900">Executive Summary</h2>
                <p className="text-slate-600 text-sm leading-relaxed">{result.summary}</p>
              </div>
              
              <div className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-xl border border-slate-100 min-w-[140px]">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Fairness Score</span>
                <span className={`text-4xl font-extrabold ${result.fairness_score > 70 ? "text-green-600" : result.fairness_score > 40 ? "text-amber-500" : "text-red-600"}`}>
                  {result.fairness_score}/100
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-900">Flagged Fine Print & Clauses</h3>
              {result.clauses.map((clause, index) => (
                <div key={index} className="bg-white border border-slate-200 rounded-xl p-6 space-y-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-700">{clause.category}</span>
                    {getRiskBadge(clause.risk_level)}
                  </div>

                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <p className="text-xs font-mono text-slate-600 italic">"{clause.original_text}"</p>
                  </div>

                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-slate-500 uppercase">What This Actually Means:</h4>
                    <p className="text-sm text-slate-800 font-medium">{clause.plain_english}</p>
                  </div>

                  <div className="bg-blue-50 border border-blue-100 p-3 rounded-lg flex items-start gap-2">
                    <ShieldCheck className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-blue-900">Negotiation Advice:</h4>
                      <p className="text-xs text-blue-800">{clause.negotiation_tip}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </main>
  );
}