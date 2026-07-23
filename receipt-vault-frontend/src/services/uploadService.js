const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/$/, "");

const getErrorMessage = async (response) => {
  try {
    const data = await response.json();
    return data.message || data.error || "Unable to generate an upload URL.";
  } catch {
    return "Unable to generate an upload URL.";
  }
};

export const createUploadUrl = async ({ fileName, contentType, accessToken }) => {
  const response = await fetch(`${apiBaseUrl}/uploads`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ fileName, contentType }),
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  const uploadDetails = await response.json();
  if (!uploadDetails.uploadUrl || !uploadDetails.objectKey) {
    throw new Error("The upload URL response is incomplete.");
  }

  return uploadDetails;
};

export const uploadFileToS3 = async ({ uploadUrl, file}) => {
  const response = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
        "Content-Type": file.type,
        
    },
    body: file,
  });

  if (!response.ok) {
    throw new Error("Unable to upload the file to S3.");
  }
};
