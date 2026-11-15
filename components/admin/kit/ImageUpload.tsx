"use client";

import { useId, useRef, useState } from "react";
import { IMAGE_ACCEPT, uploadToMedia } from "./storage";

interface ImageUploadProps {
  id?: string;
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  label: string;
  invalid?: boolean;
  describedBy?: string;
}

/** Image field: pick from camera/gallery, upload to the "media" bucket, show a preview. */
export function ImageUpload({ id, value, onChange, folder, label, invalid, describedBy }: ImageUploadProps) {
  const auto = useId();
  const inputId = id ?? auto;
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const { url } = await uploadToMedia(file, folder);
      onChange(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed. Try again.");
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div className="a-image" data-invalid={invalid ? "true" : undefined}>
      <div className="a-image-preview" data-empty={value ? undefined : "true"}>
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt={`Preview: ${label}`} loading="lazy" />
        ) : (
          <span>No image yet</span>
        )}
      </div>
      <div className="a-image-side">
        <div className="a-actions">
          <button type="button" className="a-btn a-btn-ghost" onClick={() => fileRef.current?.click()} disabled={busy}>
            {busy ? "Uploading..." : value ? "Replace image" : "Upload image"}
          </button>
          {value ? (
            <button type="button" className="a-btn a-btn-quiet" onClick={() => onChange("")} disabled={busy}>
              Remove image
            </button>
          ) : null}
        </div>
        <input
          ref={fileRef}
          id={inputId}
          type="file"
          accept={IMAGE_ACCEPT}
          className="a-sr-only"
          aria-describedby={describedBy}
          onChange={(e) => void handleFile(e.target.files?.[0])}
        />
        <details className="a-details">
          <summary>Use an image link instead</summary>
          <input
            type="url"
            inputMode="url"
            className="a-input"
            value={value}
            placeholder="https://..."
            onChange={(e) => onChange(e.target.value)}
            aria-label={`${label} link`}
          />
        </details>
        {error ? (
          <p className="a-error" role="alert">{error}</p>
        ) : null}
      </div>
    </div>
  );
}
