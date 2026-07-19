import React from 'react';
import { X, Download, Edit } from 'lucide-react';

const ReceiptPreviewModal = ({ receipt, onClose }) => {
  if (!receipt) return null;

  const getStatusColor = (status) => {
    switch (status) {
      case 'Uploaded': return 'bg-primary/10 text-primary';
      case 'Processing': return 'bg-tertiary/10 text-tertiary';
      case 'Completed': return 'bg-green-500/10 text-green-700';
      case 'Failed': return 'bg-error/10 text-error';
      default: return 'bg-primary/10 text-primary';
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-container-padding bg-black/40 backdrop-blur-sm fade-in">
      <div className="bg-white w-full max-w-4xl max-h-[921px] rounded shadow-2xl overflow-hidden flex flex-col md:flex-row modal-shadow">
        {/* Close Button (Mobile) */}
        <button 
          className="absolute top-4 right-4 md:hidden text-white bg-black/50 p-2 rounded-full" 
          onClick={onClose}
        >
          <X size={24} />
        </button>

        {/* Large Receipt Image */}
        <div className="w-full md:w-1/2 bg-surface-container-highest flex items-center justify-center p-gutter">
          <div className="relative w-full aspect-[3/4] max-h-[716px] shadow-lg border border-outline-variant bg-white">
            <img 
              src={receipt.thumbnail} 
              alt={receipt.name} 
              className="w-full h-full object-contain p-4" 
            />
          </div>
        </div>

        {/* Details Section */}
        <div className="w-full md:w-1/2 p-section-margin flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-gutter">
              <div>
                <h3 className="font-headline-md text-headline-md text-on-surface">{receipt.name}</h3>
                <p className="text-label-md font-label-md text-on-surface-variant">Uploaded on {receipt.date}</p>
              </div>
              <button 
                className="hidden md:block text-outline hover:text-on-surface transition-colors" 
                onClick={onClose}
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4 mb-section-margin">
              <div className="p-4 bg-surface-container-low rounded border border-outline-variant">
                <span className="text-label-sm font-label-sm text-on-surface-variant block mb-1">Status</span>
                <span className={`px-2 py-1 font-label-sm text-label-sm rounded uppercase tracking-wide inline-block ${getStatusColor(receipt.status)}`}>
                  {receipt.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-gutter">
                <div>
                  <span className="text-label-sm font-label-sm text-on-surface-variant block">Category</span>
                  <span className="font-body-md text-body-md text-on-surface">Meals & Entertainment</span>
                </div>
                <div>
                  <span className="text-label-sm font-label-sm text-on-surface-variant block">Total Amount</span>
                  <span className="font-body-md text-body-md text-on-surface">$24.50</span>
                </div>
                <div>
                  <span className="text-label-sm font-label-sm text-on-surface-variant block">Tax Paid</span>
                  <span className="font-body-md text-body-md text-on-surface">$1.96</span>
                </div>
                <div>
                  <span className="text-label-sm font-label-sm text-on-surface-variant block">Payment Method</span>
                  <span className="font-body-md text-body-md text-on-surface">Visa ending in 4242</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-gutter">
            <button className="flex-1 bg-primary text-white py-2 font-label-md text-label-md rounded hover:bg-primary/90 transition-colors flex items-center justify-center gap-unit">
              <Download size={16} />
              Download PDF
            </button>
            <button className="flex-1 border border-outline-variant text-on-surface py-2 font-label-md text-label-md rounded hover:bg-surface-container-high transition-colors flex items-center justify-center gap-unit">
              <Edit size={16} />
              Edit Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReceiptPreviewModal;
