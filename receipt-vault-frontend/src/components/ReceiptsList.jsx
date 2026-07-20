import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "react-oidc-context";
import { LoaderCircle, Search, Trash2, ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";
import ReceiptPreviewModal from "./ReceiptPreviewModal";
import DeleteReceiptDialog from "./DeleteReceiptDialog";
import { deleteReceipt, getReceipts } from "../services/receiptService";
import { formatUploadDate, getStatusColor } from "../utils/receiptFormatters";

const ReceiptsList = () => {
  const auth = useAuth();
  const [receipts, setReceipts] = useState([]);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [receiptToDelete, setReceiptToDelete] = useState(null);
  const [deletingReceiptId, setDeletingReceiptId] = useState(null);
  const fetchedAccessTokenRef = useRef(null);

  const fetchReceipts = useCallback(async ({ showLoading = true } = {}) => {
    const accessToken = auth.user?.access_token;
    if (!accessToken) {
      setError("Your session has expired. Please sign in again.");
      if (showLoading) setIsLoading(false);
      return;
    }

    if (showLoading) setIsLoading(true);
    setError("");

    try {
      setReceipts(await getReceipts(accessToken));
    } catch (requestError) {
      console.error("Unable to load receipts:", requestError);
      setError(requestError.message || "Unable to load receipts. Please try again.");
    } finally {
      if (showLoading) setIsLoading(false);
    }
  }, [auth.user?.access_token]);

  useEffect(() => {
    const accessToken = auth.user?.access_token;
    if (!accessToken || fetchedAccessTokenRef.current === accessToken) return;

    fetchedAccessTokenRef.current = accessToken;
    void Promise.resolve().then(fetchReceipts);
  }, [auth.user?.access_token, fetchReceipts]);

  const handleDelete = (receipt) => {
    if (!deletingReceiptId) setReceiptToDelete(receipt);
  };

  const handleConfirmDelete = async () => {
    if (!receiptToDelete || deletingReceiptId) return;

    const accessToken = auth.user?.access_token;
    if (!accessToken) {
      setError("Failed to delete receipt. Please try again.");
      setReceiptToDelete(null);
      return;
    }

    const { receiptId } = receiptToDelete;
    setDeletingReceiptId(receiptId);
    setError("");

    try {
      await deleteReceipt({ receiptId, accessToken });
      setReceipts((currentReceipts) => currentReceipts.filter((receipt) => receipt.receiptId !== receiptId));
      setSelectedReceipt((currentReceipt) => currentReceipt?.receiptId === receiptId ? null : currentReceipt);
      setReceiptToDelete(null);
      await fetchReceipts({ showLoading: false });
    } catch (deleteError) {
      console.error("Unable to delete receipt:", deleteError);
      setError("Failed to delete receipt. Please try again.");
    } finally {
      setDeletingReceiptId(null);
    }
  };

  const filteredReceipts = receipts.filter((receipt) => (
    receipt.receiptName?.toLowerCase().includes(searchQuery.trim().toLowerCase())
  ));

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
            placeholder="Search by receipt name..." 
            type="text" 
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
        </div>
      </div>

      {error && receipts.length > 0 && !isLoading && (
        <div className="mb-gutter rounded border border-error/30 bg-error/10 px-gutter py-3 font-body-md text-body-md text-error" role="alert">
          {error}
        </div>
      )}

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
              {!isLoading && filteredReceipts.map((receipt) => (
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
                      className="text-on-surface-variant hover:text-error transition-colors disabled:cursor-not-allowed disabled:opacity-60"
                      onClick={() => handleDelete(receipt)}
                      disabled={deletingReceiptId === receipt.receiptId}
                      aria-label={`Delete ${receipt.receiptName}`}
                    >
                      {deletingReceiptId === receipt.receiptId ? <LoaderCircle size={20} className="animate-spin" /> : <Trash2 size={20} />}
                    </button>
                  </td>
                </tr>
              ))}
              {!isLoading && error && receipts.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-gutter py-section-margin text-center">
                    <p className="text-error font-body-md text-body-md mb-4">{error}</p>
                    <button type="button" onClick={fetchReceipts} className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded font-label-md text-label-md hover:bg-primary/90">
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
              {!isLoading && !error && receipts.length > 0 && filteredReceipts.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-gutter py-section-margin text-center">
                    <p className="font-headline-sm text-headline-sm text-on-surface">No matching receipts found.</p>
                    <p className="mt-2 font-body-md text-body-md text-on-surface-variant">Try a different receipt name.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-gutter py-3 bg-surface-container-low border-t border-outline-variant flex justify-between items-center">
          <span className="text-label-sm font-label-sm text-on-surface-variant">Showing {isLoading ? "Loading" : filteredReceipts.length} of {isLoading ? "Loading" : receipts.length} receipts</span>
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
      <DeleteReceiptDialog
        receipt={receiptToDelete}
        isDeleting={Boolean(deletingReceiptId)}
        onCancel={() => setReceiptToDelete(null)}
        onConfirm={handleConfirmDelete}
      />
    </main>
  );
};

export default ReceiptsList;
