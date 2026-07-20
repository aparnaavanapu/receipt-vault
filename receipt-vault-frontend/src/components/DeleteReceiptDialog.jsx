import { useEffect } from "react";

const DeleteReceiptDialog = ({ receipt, isDeleting, onCancel, onConfirm }) => {
  useEffect(() => {
    const closeOnEscape = (event) => {
      if (!isDeleting && receipt && event.key === "Escape") onCancel();
    };

    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [isDeleting, onCancel, receipt]);

  if (!receipt) return null;

  const handleBackdropClick = () => {
    if (!isDeleting) onCancel();
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-container-padding bg-black/40 backdrop-blur-sm fade-in" onClick={handleBackdropClick} role="presentation">
      <div className="w-full max-w-md rounded bg-white p-section-margin modal-shadow" role="dialog" aria-modal="true" aria-labelledby="delete-receipt-title" onClick={(event) => event.stopPropagation()}>
        <h2 id="delete-receipt-title" className="font-headline-sm text-headline-sm text-on-surface">Delete receipt?</h2>
        <p className="mt-3 font-body-md text-body-md text-on-surface-variant">Are you sure you want to delete this receipt?</p>
        <div className="mt-section-margin flex justify-end gap-gutter">
          <button type="button" onClick={onCancel} disabled={isDeleting} className="px-5 py-2 border border-outline-variant text-on-surface font-label-md text-label-md rounded hover:bg-surface-container-high transition-colors disabled:cursor-not-allowed disabled:opacity-60">Cancel</button>
          <button type="button" onClick={onConfirm} disabled={isDeleting} className="min-w-20 px-5 py-2 bg-error text-white font-label-md text-label-md rounded hover:bg-error/90 transition-colors disabled:cursor-not-allowed disabled:opacity-70">
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteReceiptDialog;
