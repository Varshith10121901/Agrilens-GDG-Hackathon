import { useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

function UrgencyBadge({ level }) {
  const config = {
    'act now': { className: 'badge-red', dot: 'status-dot-red' },
    'monitor': { className: 'badge-yellow', dot: 'status-dot-yellow' },
    'routine': { className: 'badge-green', dot: 'status-dot-green' },
  };
  const c = config[level?.toLowerCase()] || config['routine'];
  return (
    <span className={`badge ${c.className}`}>
      <span className={`status-dot ${c.dot}`} />
      {level}
    </span>
  );
}

function SeverityBadge({ severity }) {
  const config = {
    'severe': 'badge-red',
    'moderate': 'badge-yellow',
    'mild': 'badge-yellow',
    'none': 'badge-green',
  };
  return (
    <span className={`badge ${config[severity?.toLowerCase()] || 'badge-green'}`}>
      {severity}
    </span>
  );
}

function PesticideCard({ pesticide }) {
  return (
    <div className="pesticide-card">
      <div className="pesticide-header">
        <h4 className="pesticide-name">{pesticide.name}</h4>
        {pesticide.is_toxic && (
          <span className="pesticide-toxic-badge">Toxic</span>
        )}
      </div>
      <div className="pesticide-details">
        <div className="pesticide-detail-row">
          <span className="pesticide-detail-label">Type:</span>
          <span style={{ textTransform: 'capitalize' }}>{pesticide.type}</span>
        </div>
        <div className="pesticide-detail-row">
          <span className="pesticide-detail-label">Dosage:</span>
          <span className="pesticide-dosage">{pesticide.dosage}</span>
        </div>
        <div className="pesticide-detail-row">
          <span className="pesticide-detail-label">Apply:</span>
          <span>{pesticide.application_method}</span>
        </div>
        <div className="pesticide-detail-row">
          <span className="pesticide-detail-label">Frequency:</span>
          <span>{pesticide.frequency}</span>
        </div>
        {pesticide.precautions && (
          <div className="pesticide-precaution">
            Warning: {pesticide.precautions}
          </div>
        )}
      </div>
    </div>
  );
}

export default function CropReport({ data, imageUrl }) {
  const reportRef = useRef(null);

  const handleDownloadImage = async () => {
    if (!reportRef.current) return;
    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        backgroundColor: '#FAFAF9',
        useCORS: true,
      });
      const link = document.createElement('a');
      link.download = `agrilens-report-${data.crop_name || 'crop'}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('Download error:', err);
    }
  };

  const handleDownloadPDF = async () => {
    if (!reportRef.current) return;
    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        backgroundColor: '#FAFAF9',
        useCORS: true,
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= 297;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= 297;
      }

      pdf.save(`agrilens-report-${data.crop_name || 'crop'}.pdf`);
    } catch (err) {
      console.error('PDF download error:', err);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `AgriLens Report: ${data.crop_name}`,
          text: `Crop: ${data.crop_name}\nDisease: ${data.disease_detected}\nUrgency: ${data.urgency_level}\n\nAnalyzed by AgriLens`,
        });
      } catch (err) {
        if (err.name !== 'AbortError') console.error('Share error:', err);
      }
    } else {
      const text = `AgriLens Report\nCrop: ${data.crop_name}\nDisease: ${data.disease_detected}\nSeverity: ${data.disease_severity}\nUrgency: ${data.urgency_level}`;
      navigator.clipboard.writeText(text);
      alert('Report summary copied to clipboard!');
    }
  };

  if (!data) return null;

  return (
    <div className="page-transition">
      {/* Action Buttons */}
      <div className="report-actions">
        <button onClick={handleDownloadImage} className="btn-secondary" style={{ fontSize: '0.75rem', padding: '0.5rem 0.75rem' }}>
          Save as Image
        </button>
        <button onClick={handleDownloadPDF} className="btn-secondary" style={{ fontSize: '0.75rem', padding: '0.5rem 0.75rem' }}>
          Download PDF
        </button>
        <button onClick={handleShare} className="btn-secondary" style={{ fontSize: '0.75rem', padding: '0.5rem 0.75rem' }}>
          Share
        </button>
      </div>

      {/* Report Content */}
      <div ref={reportRef} className="space-y-4">
        {/* Header Card */}
        <div className="glass-card report-header-card">
          <div className="report-header-content">
            {imageUrl && (
              <img src={imageUrl} alt="Scanned crop" className="report-header-image" />
            )}
            <div style={{ flex: 1 }}>
              <div className="report-badges">
                <h2 className="report-crop-name">{data.crop_name}</h2>
                <UrgencyBadge level={data.urgency_level} />
              </div>
              <div className="report-badges">
                <span className="badge badge-blue">{data.crop_age_estimate}</span>
                <SeverityBadge severity={data.disease_severity} />
              </div>
              <p className="report-disease-desc">{data.disease_description}</p>
            </div>
          </div>
        </div>

        {/* Disease & Treatment */}
        {data.disease_detected?.toLowerCase() !== 'healthy' && (
          <div className="glass-card report-section">
            <h3 className="section-title mb-4" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              Disease Detected:
              <span style={{ color: data.disease_severity === 'severe' ? 'var(--danger-600)' : 'var(--bronze-600)' }}>
                {data.disease_detected}
              </span>
            </h3>

            <div className="mb-4">
              <h4 style={{ fontWeight: '600', color: 'var(--stone-700)', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Treatment Plan</h4>
              <div>
                {data.treatment_plan?.map((step, i) => (
                  <div key={i} className="report-treatment-step">
                    <span className="report-step-number gradient-primary">{i + 1}</span>
                    <span className="report-step-text">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Pesticides */}
        {data.recommended_pesticides?.length > 0 && (
          <div className="glass-card report-section">
            <h3 className="section-title mb-4">Recommended Pesticides</h3>
            <div className="pesticide-grid">
              {data.recommended_pesticides.map((p, i) => (
                <PesticideCard key={i} pesticide={p} />
              ))}
            </div>
          </div>
        )}

        {/* Organic Alternatives */}
        {data.organic_alternatives?.length > 0 && (
          <div className="glass-card report-section">
            <h3 className="section-title mb-3">Organic Alternatives</h3>
            <div>
              {data.organic_alternatives.map((alt, i) => (
                <div key={i} className="list-item">
                  <span className="list-item-icon">›</span>
                  <span>{alt}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Fertilizer Suggestions */}
        {data.fertilizer_suggestions && (
          <div className="glass-card report-section">
            <h3 className="section-title mb-3">Fertilizer Suggestions</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--stone-700)', lineHeight: '1.6' }}>{data.fertilizer_suggestions}</p>
          </div>
        )}

        {/* General Tips */}
        {data.general_crop_tips?.length > 0 && (
          <div className="glass-card report-section">
            <h3 className="section-title mb-3">Crop Care Tips</h3>
            <div className="tips-grid">
              {data.general_crop_tips.map((tip, i) => (
                <div key={i} className="list-item-bg">
                  <div className="list-item">
                    <span className="list-item-icon">•</span>
                    <span>{tip}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="report-footer">
          Analyzed by AgriLens AI — {new Date().toLocaleDateString()}
        </div>
      </div>
    </div>
  );
}
