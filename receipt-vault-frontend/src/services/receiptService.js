const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/$/, "");

const getErrorMessage = async (response) => {
  try {
    const data = await response.json();
    return data.message || data.error || "Unable to load receipts.";
  } catch {
    return "Unable to load receipts.";
  }
};

export const getReceipts = async (accessToken) => {
  const response = await fetch(`${apiBaseUrl}/receipts`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  const receipts = await response.json();
  if (!Array.isArray(receipts)) {
    throw new Error("The receipts response is invalid.");
  }

  return receipts;
};

export const deleteReceipt = async ({ receiptId, accessToken }) => {
  const response = await fetch(`${apiBaseUrl}/receipts/${encodeURIComponent(receiptId)}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (response.status !== 204) {
    throw new Error(await getErrorMessage(response));
  }
};
