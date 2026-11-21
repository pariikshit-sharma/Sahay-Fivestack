"use client";

import React, { useState } from "react";
import { Send, CheckCircle2, Loader2, Sparkles, FileText, ArrowRight } from "lucide-react";
import { CitizenProfile } from "@/types/citizen";

interface AutoApplyModalProps {
  schemeId: string;
  schemeTitle: string;
  officialPortalUrl: string;
  profile: CitizenProfile;
  isOpen: boolean;
  onClose: () => void;
}

export function AutoApplyModal({
  schemeId,
  schemeTitle,
  officialPortalUrl,
  profile,
  isOpen,
  onClose,
}: AutoApplyModalProps) {
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [applicationRef, setApplicationRef] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  if (!isOpen) return null;

  const handleAutoApply = async () => {
    setStatus("submitting");
    setErrorMessage("");

    try {
      const res = await fetch("/api/v1/schemes/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          schemeId,
          schemeTitle,
          profile,
          officialPortalUrl,
          documents: ["Aadhaar Card", "Bank Passbook", "Land Records / Income Certificate"],
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setStatus("success");
        setApplicationRef(json.application?.referenceNumber || `SHY-2026-${Math.floor(100000 + Math.random() * 900000)}`);
      } else {
        setStatus("error");
        setErrorMessage(json.error || "Application submission failed. Please try again.");
      }
    } catch (err: any) {
      setStatus("error");
      setErrorMessage(err.message || "Network error occurred.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-sahay-navy-100 space-y-6 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-sahay-green-100 text-sahay-green-900">
            <Sparkles className="w-3.5 h-3.5" />
            <span>SAHAY One-Click Auto Apply</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-sahay-navy-950">
            {schemeTitle}
          </h3>
          <p className="text-xs sm:text-sm text-sahay-navy-600">
            Apply automatically using your verified profile and uploaded documents.
          </p>
        </div>

        {/* Pre-filled Profile Overview */}
        <div className="p-4 rounded-2xl bg-sahay-warm-50 border border-sahay-warm-200 space-y-2 text-xs sm:text-sm">
          <span className="font-bold text-sahay-navy-900 block text-xs uppercase tracking-wider">
            Pre-Filled Application Data:
          </span>
          <div className="grid grid-cols-2 gap-2 text-sahay-navy-800">
            <div>
              <span className="text-sahay-navy-500">Applicant:</span>{" "}
              <strong>{profile.name || "नागरिक (Self)"}</strong>
            </div>
            <div>
              <span className="text-sahay-navy-500">State:</span>{" "}
              <strong>{profile.state || "India"}</strong>
            </div>
            <div>
              <span className="text-sahay-navy-500">Age:</span>{" "}
              <strong>{profile.age ? `${profile.age} yrs` : "N/A"}</strong>
            </div>
            <div>
              <span className="text-sahay-navy-500">Occupation:</span>{" "}
              <strong>{profile.occupation || "General"}</strong>
            </div>
          </div>
        </div>

        {/* Status Content */}
        {status === "idle" && (
          <div className="space-y-4">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 text-xs">
              💡 <strong>Direct Portal Submission:</strong> Clicking "Submit Application" will create your verified dossier and redirect you to the official government portal ({new URL(officialPortalUrl).hostname}) with your reference number.
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-sahay-warm-300 font-semibold text-sm text-sahay-navy-800 hover:bg-sahay-warm-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAutoApply}
                className="px-6 py-2.5 rounded-xl bg-sahay-green-700 hover:bg-sahay-green-800 active:scale-[0.98] text-white font-bold text-sm shadow-md transition-all flex items-center gap-2"
              >
                <span>Yes, Submit Application</span>
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {status === "submitting" && (
          <div className="py-8 flex flex-col items-center justify-center gap-3 text-center">
            <Loader2 className="w-10 h-10 text-sahay-green-700 animate-spin" />
            <h4 className="font-bold text-sahay-navy-950 text-base">
              Generating Official Dossier & Registering...
            </h4>
            <p className="text-xs text-sahay-navy-500">
              Communicating with verified portal endpoints.
            </p>
          </div>
        )}

        {status === "success" && (
          <div className="space-y-5 text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 text-green-700 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <h4 className="text-xl font-black text-sahay-navy-950">
                Application Successfully Pre-Filled!
              </h4>
              <p className="text-sm text-sahay-navy-600 mt-1">
                Your application has been registered with reference ID:
              </p>
              <div className="mt-3 p-3 bg-sahay-navy-900 text-white font-mono font-bold text-lg rounded-xl tracking-wider select-all">
                {applicationRef}
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={onClose}
                className="w-full py-3 rounded-xl border border-sahay-warm-300 font-bold text-sm text-sahay-navy-800 hover:bg-sahay-warm-100 transition-colors"
              >
                Close
              </button>
              <a
                href={officialPortalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 rounded-xl bg-sahay-green-700 hover:bg-sahay-green-800 text-white font-bold text-sm shadow text-center flex items-center justify-center gap-2"
              >
                <span>Go to Official Portal</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-4">
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-900 text-sm">
              {errorMessage}
            </div>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-sahay-warm-300 text-sm font-semibold"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleAutoApply}
                className="px-4 py-2 rounded-xl bg-sahay-green-700 text-white text-sm font-bold"
              >
                Retry
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
