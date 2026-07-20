import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "react-oidc-context";
import { Search, Trash2, ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";
import ReceiptPreviewModal from "./ReceiptPreviewModal";
import { getReceipts } from "../services/receiptService";
import { formatUploadDate, getStatusColor } from "../utils/receiptFormatters";

const ReceiptsList = () => {
  const auth = useAuth();
  const [receipts, setReceipts] = useState([]);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const fetchedAccessTokenRef = useRef(null);

  const loadReceipts = useCallback(async () => {
    const accessToken = auth.user?.access_token;
    if (!accessToken) {
      setError("Your session has expired. Please sign in again.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      setReceipts(await getReceipts(accessToken));
    } catch (requestError) {
      console.error("Unable to load receipts:", requestError);
      setError(requestError.message || "Unable to load receipts. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [auth.user?.access_token]);

  useEffect(() => {
    const accessToken = auth.user?.access_token;
    if (!accessToken || fetchedAccessTokenRef.current === accessToken) return;

    fetchedAccessTokenRef.current = accessToken;
    void Promise.resolve().then(loadReceipts);
  }, [auth.user?.access_token, loadReceipts]);

  const handleDelete = (receiptId) => {
    // Placeholder for the future DELETE /receipts/{receiptId} integration.
    console.info("Delete requested for receipt:", receiptId);
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
              {isLoading && Array.from({ length: 4 }).map((_, index) => (
                <tr key={`skeleton-${index}`} className="animate-pulse">
                  <td className="px-gutter py-4"><div className="w-12 h-16 rounded bg-surface-container-highest" /></td>
                  <td className="px-gutter py-4"><div className="h-4 w-40 rounded bg-surface-container-highest" /></td>
                  <td className="px-gutter py-4"><div className="h-4 w-28 rounded bg-surface-container-highest" /></td>
                  <td className="px-gutter py-4"><div className="h-6 w-20 rounded bg-surface-container-highest" /></td>
                  <td className="px-gutter py-4"><div className="ml-auto h-5 w-5 rounded bg-surface-container-highest" /></td>
                </tr>
              ))}
              {!isLoading && !error && receipts.map((receipt) => (
                <tr key={receipt.receiptId} className="hover:bg-surface-container-lowest transition-colors">
                  <td className="px-gutter py-4">
                    <button
                      type="button"
                      className="w-12 h-16 bg-surface-container-highest rounded border border-outline-variant overflow-hidden focus:outline-none focus:ring-2 focus:ring-primary"
                      onClick={() => setSelectedReceipt(receipt)}
                      aria-label={`Preview ${receipt.receiptName}`}
                    >
                      <img className="w-full h-full object-cover" src={receipt.thumbnailUrl} alt={receipt.receiptName} />
                    </button>
                  </td>
                  <td className="px-gutter py-4 font-body-md text-body-md text-primary font-medium">{receipt.receiptName}</td>
                  <td className="px-gutter py-4 font-body-md text-body-md text-on-surface-variant">{formatUploadDate(receipt.createdAt)}</td>
                  <td className="px-gutter py-4">
                    <span className={`px-2 py-1 font-label-sm text-label-sm rounded uppercase tracking-wide ${getStatusColor(receipt.status)}`}>
                      {receipt.status}
                    </span>
                  </td>
                  <td className="px-gutter py-4 text-right">
                    <button
                      type="button"
                      className="text-on-surface-variant hover:text-error transition-colors"
                      onClick={() => handleDelete(receipt.receiptId)}
                      aria-label={`Delete ${receipt.receiptName}`}
                    >
                      <Trash2 size={20} />
                    </button>
                  </td>
                </tr>
              ))}
              {!isLoading && error && (
                <tr>
                  <td colSpan="5" className="px-gutter py-section-margin text-center">
                    <p className="text-error font-body-md text-body-md mb-4">{error}</p>
                    <button type="button" onClick={loadReceipts} className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded font-label-md text-label-md hover:bg-primary/90">
                      <RefreshCw size={16} /> Try again
                    </button>
                  </td>
                </tr>
              )}
              {!isLoading && !error && receipts.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-gutter py-section-margin text-center">
                    <p className="font-headline-sm text-headline-sm text-on-surface">No receipts uploaded yet.</p>
                    <p className="mt-2 font-body-md text-body-md text-on-surface-variant">Upload a receipt to see it here.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-gutter py-3 bg-surface-container-low border-t border-outline-variant flex justify-between items-center">
          <span className="text-label-sm font-label-sm text-on-surface-variant">Showing {isLoading ? "Loading" : receipts.length} of {isLoading ? "Loading" : receipts.length} receipts</span>
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
