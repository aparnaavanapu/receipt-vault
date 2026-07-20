import { useEffect } from "react";
import { X } from "lucide-react";
import { formatFileSize, formatUploadDate, getStatusColor } from "../utils/receiptFormatters";

const ReceiptPreviewModal = ({ receipt, onClose }) => {
  useEffect(() => {
    const closeOnEscape = (event) => {
      if (receipt && event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [onClose, receipt]);

  if (!receipt) return null;

  const metadata = [
    ["Receipt Name", receipt.receiptName],
    ["Upload Date", formatUploadDate(receipt.createdAt)],
    ["Status", receipt.status],
    ["Checksum", receipt.checksum || "Not available"],
    ["Width", Number.isFinite(receipt.width) ? `${receipt.width} px` : "Not available"],
    ["Height", Number.isFinite(receipt.height) ? `${receipt.height} px` : "Not available"],
    ["File Size", formatFileSize(receipt.fileSize)],
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-container-padding bg-black/40 backdrop-blur-sm fade-in" onClick={onClose} role="presentation">
      <div className="bg-white w-full max-w-5xl max-h-[90vh] rounded shadow-2xl overflow-hidden flex flex-col md:flex-row modal-shadow" role="dialog" aria-modal="true" aria-label={`Receipt details for ${receipt.receiptName}`} onClick={(event) => event.stopPropagation()}>
        {/* Close Button (Mobile) */}
        <button 
          className="absolute top-4 right-4 md:hidden text-white bg-black/50 p-2 rounded-full" 
          onClick={onClose}
        >
          <X size={24} />
        </button>

        {/* Large Receipt Image */}
        <div className="w-full md:w-3/5 min-h-[18rem] bg-surface-container-highest overflow-auto p-gutter">
          <div className="min-h-full flex items-center justify-center">
            <img 
              src={receipt.originalUrl} 
              alt={receipt.receiptName} 
              className="max-w-full h-auto max-h-[70vh] object-contain shadow-lg border border-outline-variant bg-white" 
            />
          </div>
        </div>

        {/* Details Section */}
        <div className="w-full md:w-2/5 p-section-margin overflow-y-auto">
          <div>
            <div className="flex justify-between items-start mb-gutter">
              <div>
                <h3 className="font-headline-md text-headline-md text-on-surface break-words">{receipt.receiptName}</h3>
                <p className="text-label-md font-label-md text-on-surface-variant">Uploaded on {formatUploadDate(receipt.createdAt)}</p>
              </div>
              <button 
                className="hidden md:block text-outline hover:text-on-surface transition-colors" 
                onClick={onClose}
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-3">
              {metadata.map(([label, value]) => (
                <div key={label} className="grid grid-cols-[minmax(6rem,auto)_1fr] gap-3 border-b border-outline-variant pb-3 last:border-0">
                  <span className="text-label-sm font-label-sm text-on-surface-variant">{label}</span>
                  {label === "Status" ? (
                    <span className={`w-fit px-2 py-1 font-label-sm text-label-sm rounded uppercase tracking-wide ${getStatusColor(value)}`}>{value}</span>
                  ) : (
                    <span className="font-body-md text-body-md text-on-surface break-all">{value}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReceiptPreviewModal;
