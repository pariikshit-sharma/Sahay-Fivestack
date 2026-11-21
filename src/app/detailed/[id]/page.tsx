"use client";

import React from "react";
import Link from "next/link";
import { useParams, notFound } from "next/navigation";
import { useApp } from "@/core/context/AppContext";
import { VERIFIED_NATIONAL_SCHEMES } from "@/core/schemes/verified-seeds";
import { ReadAloudButton } from "@/components/voice/ReadAloudButton";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatINR } from "@/lib/utils";
import {
  ArrowLeft,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  FileText,
  Landmark,
  Scale,
  Calendar,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import {
  getSchemeTitle,
  getSchemeSummary,
  getSchemeDepartment,
  getSchemeBenefitDescription,
  getDocumentName,
  getRuleExplanation,
} from "@/core/languages/scheme-localization";

export default function SchemeDetailPage() {
  const params = useParams();
  const { t, language } = useApp();
  const id = params?.id as string;

  const scheme = VERIFIED_NATIONAL_SCHEMES.find(
    (s) => s.slug === id || s.id === id || s.officialCode?.toLowerCase() === id?.toLowerCase()
  );

  if (!scheme) {
    return (
      <div className="max-w-3xl mx-auto py-16 px-4 text-center space-y-4">
        <h1 className="text-2xl font-bold text-sahay-navy-950">
          {language === "hi" ? "योजना नहीं मिली" : "Scheme Not Found"}
        </h1>
        <p className="text-sm text-sahay-warm-800">
          {language === "hi"
            ? "यह योजना वर्तमान में सत्यापित सूची में उपलब्ध नहीं है।"
            : "This scheme record is not available in the verified directory."}
        </p>
        <Link href="/detailed">
          <Button variant="primary" size="md">
            {language === "hi" ? "सभी योजनाएं देखें" : "View All Schemes"}
          </Button>
        </Link>
      </div>
    );
  }

  const titleLocalized = getSchemeTitle(scheme, language);
  const summaryLocalized = getSchemeSummary(scheme, language);
  const benefitDescLocalized = getSchemeBenefitDescription(scheme, language);
  const deptLocalized = getSchemeDepartment(scheme, language);

  const textToRead = `${titleLocalized}। ${summaryLocalized}। ${benefitDescLocalized}`;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1 space-y-8">
      {/* Back button */}
      <div>
        <Link
          href="/detailed"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-sahay-navy-800 hover:text-sahay-navy-950 p-2 -ml-2 rounded-xl"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t.common.back}</span>
        </Link>
      </div>

      {/* Scheme Header Banner */}
      <Card variant="default" className="border-2 border-sahay-warm-300 p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-sahay-navy-100 text-sahay-navy-900">
                {scheme.officialCode}
              </span>
              <Badge variant="navy" size="sm">
                {scheme.level === "central" ? t.common.centralScheme : t.common.stateScheme}
              </Badge>
              <Badge variant="success" size="sm">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Verified Official Scheme</span>
              </Badge>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-sahay-navy-950">
              {titleLocalized}
            </h1>
            <p className="text-xs sm:text-sm font-medium text-sahay-warm-800">
              {deptLocalized}
            </p>
          </div>

          <ReadAloudButton textToRead={textToRead} />
        </div>

        {/* Benefit Summary Card */}
        <div className="p-4 rounded-xl bg-sahay-green-50 border border-sahay-green-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="text-xs font-bold text-sahay-green-950 uppercase tracking-wider">
              {language === "en" ? "Government Benefit & Entitlement" : "सरकारी लाभ एवं विवरण"}
            </div>
            <div className="text-sm font-medium text-sahay-green-900 mt-0.5">
              {benefitDescLocalized}
            </div>
          </div>
          {scheme.benefitAmountMax && (
            <div className="text-2xl font-black text-sahay-green-800 flex-shrink-0">
              {formatINR(scheme.benefitAmountMax)}
            </div>
          )}
        </div>

        {/* Detailed Summary */}
        <div className="space-y-2">
          <h2 className="text-xs font-bold text-sahay-navy-950 uppercase tracking-wider">
            {language === "en" ? "Scheme Overview & Objectives" : "योजना का उद्देश्य व परिचय"}
          </h2>
          <p className="text-base text-sahay-navy-900 leading-relaxed">
            {summaryLocalized}
          </p>
        </div>
      </Card>

      {/* Deterministic Eligibility Rules Matrix */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Scale className="w-5 h-5 text-sahay-navy-800" />
          <h2 className="text-xl font-bold text-sahay-navy-950">
            {t.detailedMode.eligibilityBreakdown}
          </h2>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-sahay-warm-300 bg-white shadow-sm">
          <table className="w-full text-left text-sm text-sahay-navy-950">
            <thead className="bg-sahay-warm-100 border-b border-sahay-warm-300 text-xs font-bold text-sahay-warm-800 uppercase tracking-wider">
              <tr>
                <th className="p-4">{language === "en" ? "Criterion" : "पात्रता शर्त"}</th>
                <th className="p-4">{language === "en" ? "Rule Condition" : "सरकारी नियम"}</th>
                <th className="p-4">{language === "en" ? "Requirement" : "प्रकार"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sahay-warm-200">
              {scheme.rules.map((rule) => (
                <tr key={rule.id} className="hover:bg-sahay-warm-50/50">
                  <td className="p-4 font-semibold">
                    {getRuleExplanation(rule, language)}
                  </td>
                  <td className="p-4 font-mono text-xs text-sahay-navy-800">
                    {rule.criterionKey} {rule.operator} {JSON.stringify(rule.targetValue)}
                  </td>
                  <td className="p-4">
                    {rule.isMandatory ? (
                      <Badge variant="navy" size="sm">
                        {language === "en" ? "Mandatory" : "अनिवार्य"}
                      </Badge>
                    ) : (
                      <Badge variant="subtle" size="sm">
                        {language === "en" ? "Optional" : "वैकल्पिक"}
                      </Badge>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Required Document Checklist Matrix */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-sahay-navy-800" />
          <h2 className="text-xl font-bold text-sahay-navy-950">
            {t.detailedMode.documentsRequired}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {scheme.documents.map((doc) => (
            <div
              key={doc.id}
              className="p-4 rounded-xl border border-sahay-warm-300 bg-white space-y-1.5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-sahay-warm-700">
                  {doc.documentCode}
                </span>
                {doc.isMandatory && (
                  <Badge variant="warning" size="sm">
                    {language === "en" ? "Mandatory" : "अनिवार्य"}
                  </Badge>
                )}
              </div>
              <h3 className="text-base font-bold text-sahay-navy-950">
                {getDocumentName(doc, language)}
              </h3>
              {doc.issuingAuthority && (
                <p className="text-xs text-sahay-warm-700">
                  <strong>{language === "en" ? "Issuing Authority:" : "जारीकर्ता:"}</strong>{" "}
                  {doc.issuingAuthority}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Official Sources & Direct Government Portal */}
      <Card variant="warm" className="p-6 space-y-4">
        <div className="flex items-center gap-2 text-sahay-navy-950 font-bold text-base">
          <ShieldCheck className="w-5 h-5 text-sahay-green-700" />
          <span>
            {language === "en" ? "Official Source & Provenance" : "आधिकारिक स्रोत व सत्यापन स्थिति"}
          </span>
        </div>

        <div className="text-xs text-sahay-warm-800 space-y-1">
          <div>
            <strong>{language === "en" ? "Verified Source:" : "सत्यापित संदर्भ:"}</strong>{" "}
            {scheme.sources[0]?.sourceTitle || "Official Portal"}
          </div>
          <div>
            <strong>{language === "en" ? "Last Verified:" : "सत्यापन तिथि:"}</strong>{" "}
            <span className="font-mono">{scheme.verifiedAt?.split("T")[0] || "2026-08-15"}</span>
          </div>
          <div>
            <strong>{language === "en" ? "Verified By:" : "सत्यापन कर्ता:"}</strong>{" "}
            {scheme.verifiedBy || "SAHAY Official Standards Review"}
          </div>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-sahay-warm-300">
          <span className="text-xs text-sahay-warm-700">
            {language === "en"
              ? "Always apply directly on the official .gov.in government website."
              : "हमेशा केवल आधिकारिक सरकारी पोर्टल (.gov.in) पर ही आवेदन करें।"}
          </span>
          <a
            href={scheme.officialPortalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto"
          >
            <Button variant="primary" size="lg" className="w-full sm:w-auto flex items-center gap-2">
              <span>{t.detailedMode.officialWebsite}</span>
              <ExternalLink className="w-4 h-4" />
            </Button>
          </a>
        </div>
      </Card>
    </div>
  );
}
