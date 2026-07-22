const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/$/, "");

const getErrorMessage = async (response) => {
  try {
    const data = await response.json();
    return data.message || data.error || "Unable to load receipts.";
  } catch {
    return "Unable to load receipts.";
  }
};

export const getReceipts = async (
  accessToken,
  fromDate,
  toDate
) => {
  const params = new URLSearchParams();

  if (fromDate) {
    params.append("from", fromDate);
  }

  if (toDate) {
    params.append("to", toDate);
  }

  const url = params.toString()
    ? `${apiBaseUrl}/receipts?${params.toString()}`
    : `${apiBaseUrl}/receipts`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  return await response.json();
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
