"use client";

import { useMemo, useState } from "react";
import type { Attachment } from "./mvp-data";

interface AttachmentUploaderProps {
  documentId: string;
  initialAttachments: Attachment[];
}

export function AttachmentUploader({
  documentId,
  initialAttachments,
}: AttachmentUploaderProps) {
  const [attachments, setAttachments] = useState<Attachment[]>(initialAttachments);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [status, setStatus] = useState<string>("");

  const inputId = useMemo(() => `attachment-input-${documentId}`, [documentId]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPendingFiles(Array.from(event.target.files ?? []));
    setStatus("");
  };

  const handleUpload = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (pendingFiles.length === 0) {
      setStatus("Select at least one file.");
      return;
    }

    const timestamp = Date.now();
    const newAttachments = pendingFiles.map((file, index) => ({
      id: `upload-${documentId}-${timestamp}-${index}`,
      name: file.name,
      uploadedAt: new Date().toISOString(),
      ocrText: "OCR queued (MVP placeholder).",
    }));

    setAttachments((current) => [...current, ...newAttachments]);
    setPendingFiles([]);
    setStatus(`${newAttachments.length} attachment(s) added.`);

    const input = document.getElementById(inputId) as HTMLInputElement | null;
    if (input) {
      input.value = "";
    }
  };

  return (
    <div className="stack-md">
      <h2 style={{ margin: 0 }}>Attachments</h2>
      <form className="stack-sm" onSubmit={handleUpload}>
        <label htmlFor={inputId} className="label">
          Upload file(s)
        </label>
        <input
          id={inputId}
          className="file-input"
          type="file"
          multiple
          onChange={handleFileChange}
        />
        <div className="section-row">
          <span className="muted">
            {pendingFiles.length > 0
              ? `${pendingFiles.length} file(s) selected`
              : "No files selected"}
          </span>
          <button className="btn" type="submit">
            Add attachment
          </button>
        </div>
      </form>

      {status ? <p className="status-text">{status}</p> : null}

      {attachments.length === 0 ? (
        <div className="empty-state">No attachments yet.</div>
      ) : (
        <ul className="attachments-list">
          {attachments.map((attachment) => (
            <li key={attachment.id} className="attachment-item">
              <div className="section-row">
                <strong>{attachment.name}</strong>
                <span className="chip">
                  {new Intl.DateTimeFormat("de-DE", { dateStyle: "medium" }).format(
                    new Date(attachment.uploadedAt),
                  )}
                </span>
              </div>
              <p className="search-snippet">{attachment.ocrText ?? "No OCR text available."}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
