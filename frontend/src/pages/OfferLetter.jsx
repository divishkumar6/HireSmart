import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Download, Upload, Image, X, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';

export default function OfferLetter() {
  const { candidateId } = useParams();
  const navigate = useNavigate();
  const letterRef = useRef(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [logoDataUrl, setLogoDataUrl] = useState('');
  const [printing, setPrinting] = useState(false);

  useEffect(() => {
    api.get('/offers/' + candidateId + '/generate')
      .then(({ data: res }) => { setData(res.offerData); setLoading(false); })
      .catch(err => {
        toast.error(err.response?.data?.message || 'Cannot generate offer letter');
        navigate(-1);
      });
  }, [candidateId]);

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return toast.error('Please upload an image file');
    if (file.size > 2 * 1024 * 1024) return toast.error('Logo must be under 2MB');
    const reader = new FileReader();
    reader.onload = (ev) => setLogoDataUrl(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handlePrint = () => {
    setPrinting(true);
    setTimeout(() => { window.print(); setPrinting(false); }, 200);
  };

  if (loading) return (
    <div className="flex justify-center items-center py-24">
      <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--accent)' }} />
    </div>
  );

  const d = data;
  const logoSrc = logoDataUrl || d.companyLogo || '';

  return (
    <>
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #offer-letter, #offer-letter * { visibility: visible !important; }
          #offer-letter { position: fixed; top: 0; left: 0; width: 100%; }
          .no-print { display: none !important; }
          @page { margin: 0; size: A4; }
        }
      `}</style>

      <div className="max-w-4xl mx-auto space-y-5">
        {/* Controls */}
        <div className="flex items-center justify-between gap-4 flex-wrap no-print">
          <button onClick={() => navigate(-1)} className="btn-ghost py-2 px-3 flex items-center gap-2 text-sm">
            <ArrowLeft size={15} /> Back
          </button>
          <div className="flex items-center gap-3">
            {/* Logo uploader */}
            <div className="flex items-center gap-2">
              {logoDataUrl ? (
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
                  style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}>
                  <img src={logoDataUrl} alt="logo" className="h-6 object-contain rounded" />
                  <span className="text-xs font-medium" style={{ color: '#10b981' }}>Logo set</span>
                  <button onClick={() => setLogoDataUrl('')} className="hover:text-red-400 transition-colors" style={{ color: '#10b981' }}>
                    <X size={13} />
                  </button>
                </div>
              ) : (
                <label className="btn-ghost flex items-center gap-2 text-sm cursor-pointer">
                  <Image size={14} /> Upload Logo
                  <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                </label>
              )}
            </div>
            <button onClick={handlePrint} disabled={printing} className="btn-primary flex items-center gap-2 text-sm">
              <Download size={15} /> {printing ? 'Preparing...' : 'Download / Print'}
            </button>
          </div>
        </div>

        {/* Status badge */}
        <div className="flex items-center gap-3 no-print">
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl"
            style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}>
            <CheckCircle size={16} style={{ color: '#10b981' }} />
            <span className="text-sm font-semibold" style={{ color: '#10b981' }}>
              Offer Letter — {d.candidateName}
            </span>
          </div>
          {!logoSrc && (
            <span className="text-xs px-3 py-1 rounded-full" style={{ background: 'rgba(245,158,11,0.1)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.2)' }}>
              ↑ Upload company logo to personalise
            </span>
          )}
        </div>

        {/* THE OFFER LETTER */}
        <motion.div id="offer-letter" ref={letterRef}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl overflow-hidden shadow-2xl"
          style={{ background: '#ffffff', color: '#1a1a2e', fontFamily: '"Georgia", "Times New Roman", serif' }}
        >
          {/* Header */}
          <div style={{ background: 'linear-gradient(135deg,#0f0c29,#302b63,#24243e)', padding: '40px 56px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
            <div style={{ position: 'absolute', bottom: -30, left: 180, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.03)' }} />
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', position: 'relative', gap: 20 }}>
              <div>
                {logoSrc ? (
                  <div style={{ marginBottom: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ background: 'rgba(255,255,255,0.12)', borderRadius: 10, padding: '8px 16px', backdropFilter: 'blur(8px)' }}>
                      <img src={logoSrc} alt={d.company}
                        style={{ height: 48, maxWidth: 160, objectFit: 'contain', display: 'block' }}
                        onError={e => { e.target.style.display = 'none'; }} />
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                    <div style={{ width: 52, height: 52, borderRadius: 12, background: 'rgba(255,255,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ color: 'white', fontSize: 24, fontWeight: 800 }}>{d.company?.charAt(0)}</span>
                    </div>
                  </div>
                )}
                <h1 style={{ color: 'white', fontSize: 30, fontWeight: 700, margin: 0, letterSpacing: '-0.5px' }}>{d.company}</h1>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, marginTop: 5 }}>{d.offerDate}</p>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ display: 'inline-block', background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 8, padding: '8px 20px' }}>
                  <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 11, letterSpacing: '2.5px', textTransform: 'uppercase', margin: 0, fontFamily: '"Arial", sans-serif' }}>
                    Offer of Employment
                  </p>
                </div>
                <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12, marginTop: 8, fontFamily: '"Arial", sans-serif' }}>
                  Ref: SH-{candidateId?.slice(-6).toUpperCase()}
                </p>
              </div>
            </div>
          </div>

          {/* Gold line */}
          <div style={{ height: 4, background: 'linear-gradient(90deg,#f59e0b,#f97316,#f59e0b)' }} />

          {/* Body */}
          <div style={{ padding: '48px 56px', background: '#ffffff' }}>
            <p style={{ color: '#64748b', fontSize: 13, marginBottom: 32, fontFamily: '"Arial", sans-serif' }}>{d.offerDate}</p>
            <div style={{ marginBottom: 32 }}>
              <p style={{ fontWeight: 700, fontSize: 17, color: '#0f172a', margin: 0 }}>{d.candidateName}</p>
              {d.college && <p style={{ color: '#64748b', fontSize: 13, margin: '4px 0 0', fontFamily: '"Arial", sans-serif' }}>{d.college}{d.branch ? ' · ' + d.branch : ''}</p>}
              <p style={{ color: '#64748b', fontSize: 13, margin: '2px 0 0', fontFamily: '"Arial", sans-serif' }}>{d.candidateEmail}</p>
            </div>

            <p style={{ fontSize: 15, color: '#0f172a', lineHeight: 1.8, marginBottom: 18 }}>Dear <strong>{d.candidateName}</strong>,</p>

            <p style={{ fontSize: 14, color: '#334155', lineHeight: 1.9, marginBottom: 18, fontFamily: '"Arial", sans-serif' }}>
              We are pleased to extend this formal offer of employment to you at <strong style={{ color: '#0f172a' }}>{d.company}</strong> following
              your successful completion of the <strong style={{ color: '#0f172a' }}>{d.driveName}</strong> selection process.
              After careful evaluation of your qualifications and performance, we are confident that you will be a
              valuable addition to our team.
            </p>

            <p style={{ fontSize: 14, color: '#334155', lineHeight: 1.9, marginBottom: 36, fontFamily: '"Arial", sans-serif' }}>
              This letter confirms our offer for the position of <strong style={{ color: '#0f172a' }}>{d.jobRole}</strong>,
              subject to the terms and conditions outlined herein.
            </p>

            {/* Terms table */}
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'hidden', marginBottom: 32 }}>
              <div style={{ background: 'linear-gradient(135deg,#0f0c29,#302b63)', padding: '16px 24px' }}>
                <h3 style={{ color: 'white', fontSize: 13, fontWeight: 600, margin: 0, letterSpacing: '1px', textTransform: 'uppercase', fontFamily: '"Arial", sans-serif' }}>
                  Employment Terms &amp; Conditions
                </h3>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
                {[
                  ['Position', d.jobRole],
                  ['Annual CTC', d.package || 'As discussed'],
                  ['Date of Joining', d.startDate],
                  ['Work Mode', d.offerDetails?.workMode || 'Hybrid'],
                  ['Work Location', d.offerDetails?.workLocation || 'To be communicated'],
                  ['Probation Period', d.offerDetails?.probationPeriod || '6 months'],
                ].map(([label, value], i) => (
                  <div key={label} style={{ padding: '16px 24px', borderBottom: i < 4 ? '1px solid #e2e8f0' : 'none', borderRight: i % 2 === 0 ? '1px solid #e2e8f0' : 'none', background: i % 4 < 2 ? '#f8fafc' : '#ffffff' }}>
                    <p style={{ fontSize: 10, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 4px', fontFamily: '"Arial", sans-serif' }}>{label}</p>
                    <p style={{ fontSize: 14, fontWeight: 600, color: '#0f172a', margin: 0 }}>{value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Performance highlight */}
            <div style={{ background: 'linear-gradient(135deg,rgba(16,185,129,0.07),rgba(34,211,238,0.05))', border: '1px solid rgba(16,185,129,0.18)', borderRadius: 10, padding: '16px 20px', marginBottom: 28, display: 'flex', alignItems: 'flex-start', gap: 14 }}>
              <div style={{ fontSize: 24, flexShrink: 0, marginTop: 2 }}>🏆</div>
              <div>
                <p style={{ fontWeight: 700, color: '#065f46', fontSize: 13, margin: '0 0 4px', fontFamily: '"Arial", sans-serif' }}>Selection Performance</p>
                <p style={{ color: '#047857', fontSize: 13, margin: 0, lineHeight: 1.7, fontFamily: '"Arial", sans-serif' }}>
                  You achieved a weighted evaluation score of <strong>{d.finalScore?.toFixed(1)}/100</strong> and an
                  ATS compatibility score of <strong>{d.atsScore}/100</strong>, placing you among the top candidates for this drive.
                </p>
              </div>
            </div>

            <p style={{ fontSize: 14, color: '#334155', lineHeight: 1.9, marginBottom: 18, fontFamily: '"Arial", sans-serif' }}>
              Your compensation package of <strong style={{ color: '#0f172a' }}>{d.package || 'as mutually agreed'}</strong> includes
              base salary, applicable allowances, and benefits as per Company policy. A detailed salary structure
              will be provided upon onboarding.
            </p>

            <p style={{ fontSize: 14, color: '#334155', lineHeight: 1.9, marginBottom: 18, fontFamily: '"Arial", sans-serif' }}>
              This offer is contingent upon satisfactory background verification, submission of all required
              academic and identity documents, and acceptance of the Company's Code of Conduct and
              confidentiality policies.
            </p>

            <p style={{ fontSize: 14, color: '#334155', lineHeight: 1.9, marginBottom: 40, fontFamily: '"Arial", sans-serif' }}>
              Please confirm your acceptance <strong style={{ color: '#0f172a' }}>by {d.acceptanceDeadline}</strong> by signing
              and returning this letter to HR. Report for duty on <strong style={{ color: '#0f172a' }}>{d.startDate}</strong>.
            </p>

            {/* Signatures */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, paddingTop: 32, borderTop: '2px solid #e2e8f0' }}>
              <div>
                <div style={{ height: 1, background: '#0f172a', width: '80%', marginBottom: 8 }} />
                <p style={{ fontWeight: 700, color: '#0f172a', fontSize: 14, margin: 0 }}>{d.hrName}</p>
                <p style={{ color: '#64748b', fontSize: 13, margin: '3px 0 0', fontFamily: '"Arial", sans-serif' }}>Human Resources</p>
                <p style={{ color: '#64748b', fontSize: 13, margin: '2px 0 0', fontFamily: '"Arial", sans-serif' }}>{d.company}</p>
                <p style={{ color: '#6272f1', fontSize: 12, margin: '4px 0 0', fontFamily: '"Arial", sans-serif' }}>{d.hrEmail}</p>
              </div>
              <div>
                <div style={{ height: 1, background: '#e2e8f0', width: '80%', marginBottom: 8 }} />
                <p style={{ fontWeight: 700, color: '#0f172a', fontSize: 14, margin: 0 }}>Candidate Acceptance</p>
                <p style={{ color: '#64748b', fontSize: 13, margin: '3px 0 0', fontFamily: '"Arial", sans-serif' }}>{d.candidateName}</p>
                <p style={{ color: '#64748b', fontSize: 13, margin: '12px 0 0', fontFamily: '"Arial", sans-serif' }}>Date: ___________________</p>
                <p style={{ color: '#64748b', fontSize: 13, margin: '12px 0 0', fontFamily: '"Arial", sans-serif' }}>Signature: ___________________</p>
              </div>
            </div>

            {/* Footer note */}
            <div style={{ marginTop: 40, paddingTop: 20, borderTop: '1px solid #e2e8f0', textAlign: 'center' }}>
              <p style={{ color: '#94a3b8', fontSize: 11, margin: 0, fontFamily: '"Arial", sans-serif', lineHeight: 1.7 }}>
                This offer letter is confidential and intended solely for <strong>{d.candidateName}</strong>.
                Managed by <strong>SmartHire</strong> — AI-Powered Recruitment Intelligence.
              </p>
              <p style={{ color: '#cbd5e1', fontSize: 11, margin: '6px 0 0', fontFamily: '"Arial", sans-serif' }}>
                {d.company} · {d.offerDate} · Ref: SH-{candidateId?.slice(-6).toUpperCase()}
              </p>
            </div>
          </div>

          {/* Footer band */}
          <div style={{ background: 'linear-gradient(135deg,#0f0c29,#302b63)', padding: '18px 56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12, margin: 0, fontFamily: '"Arial", sans-serif' }}>Powered by SmartHire · AI Recruitment</p>
            <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 12, margin: 0, fontFamily: '"Arial", sans-serif' }}>Confidential Document</p>
          </div>
        </motion.div>
      </div>
    </>
  );
}
