import React, { useState } from 'react';
import { Search, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { receipts } from '../data/mockReceipts';
import ReceiptPreviewModal from './ReceiptPreviewModal';

const ReceiptsList = () => {
  const [selectedReceipt, setSelectedReceipt] = useState(null);

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
    <main className="md:ml-64 mt-16 p-container-padding min-h-screen bg-surface text-on-surface">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-section-margin gap-gutter">
        <h1 className="font-display-lg text-display-lg text-on-surface">Receipts</h1>
        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" size={20} />
          <input 
            className="w-full pl-10 pr-4 py-2 border border-outline-variant rounded bg-white text-body-md font-body-md focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" 
            placeholder="Search by name, date, or amount..." 
            type="text" 
          />
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white border border-outline-variant rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-surface-container-low border-b border-outline-variant">
              <tr>
                <th className="px-gutter py-3 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Thumbnail</th>
                <th className="px-gutter py-3 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Receipt Name</th>
                <th className="px-gutter py-3 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Upload Date</th>
                <th className="px-gutter py-3 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Status</th>
                <th className="px-gutter py-3 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {receipts.map((receipt) => (
                <tr 
                  key={receipt.id} 
                  className="hover:bg-surface-container-lowest cursor-pointer transition-colors"
                  onClick={() => setSelectedReceipt(receipt)}
                >
                  <td className="px-gutter py-4">
                    <div className="w-12 h-16 bg-surface-container-highest rounded border border-outline-variant overflow-hidden">
                      <img className="w-full h-full object-cover" src={receipt.thumbnail} alt={receipt.name} />
                    </div>
                  </td>
                  <td className="px-gutter py-4 font-body-md text-body-md text-primary font-medium">{receipt.name}</td>
                  <td className="px-gutter py-4 font-body-md text-body-md text-on-surface-variant">{receipt.date}</td>
                  <td className="px-gutter py-4">
                    <span className={`px-2 py-1 font-label-sm text-label-sm rounded uppercase tracking-wide ${getStatusColor(receipt.status)}`}>
                      {receipt.status}
                    </span>
                  </td>
                  <td className="px-gutter py-4 text-right">
                    <button className="text-on-surface-variant hover:text-error transition-colors" onClick={(e) => e.stopPropagation()}>
                      <Trash2 size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-gutter py-3 bg-surface-container-low border-t border-outline-variant flex justify-between items-center">
          <span className="text-label-sm font-label-sm text-on-surface-variant">Showing {receipts.length} of {receipts.length} receipts</span>
          <div className="flex gap-unit">
            <button className="p-1 border border-outline-variant rounded hover:bg-surface-container-high text-on-surface-variant transition-colors">
              <ChevronLeft size={20} />
            </button>
            <button className="p-1 border border-outline-variant rounded hover:bg-surface-container-high text-on-surface-variant transition-colors">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>

      <ReceiptPreviewModal 
        receipt={selectedReceipt} 
        onClose={() => setSelectedReceipt(null)} 
      />
    </main>
  );
};

export default ReceiptsList;
