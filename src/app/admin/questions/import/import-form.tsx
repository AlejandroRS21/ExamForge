"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getStatusToneClasses } from "@/lib/design-tokens";

interface ImportError {
  row: number;
  message: string;
}

export function ImportForm() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<{ success: number; failed: number } | null>(null);
  const [errors, setErrors] = useState<ImportError[]>([]);
  const [message, setMessage] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      setMessage("Please select a CSV file");
      return;
    }

    setLoading(true);
    setMessage("");
    setErrors([]);
    setSuccess(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/admin/questions/import", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || "Import failed");
        return;
      }

      setSuccess({ success: data.success, failed: data.failed });
      setErrors(data.errors || []);
      setMessage(data.message);

      // Reset file input
      setFile(null);
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) fileInput.value = "";

      // Refresh questions list after short delay
      if (data.success > 0) {
        setTimeout(() => {
          router.refresh();
        }, 1000);
      }
    } catch (error) {
      setMessage(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="rounded-xl border border-dashed p-8 space-y-2 text-center">
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            disabled={loading}
            className="block w-full"
          />
          {file && (
            <p className="text-sm text-foreground">
              Selected: <strong>{file.name}</strong>
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={!file || loading}
          className="w-full px-4 py-3 bg-primary text-primary-foreground font-semibold rounded-lg disabled:opacity-50"
        >
          {loading ? "Uploading..." : "Import Questions"}
        </button>
      </form>

      {message && (
        <div
          className={`rounded-xl p-4 ${
            success
              ? getStatusToneClasses("success", "surface")
              : errors.length > 0
                ? getStatusToneClasses("warning", "surface")
                : getStatusToneClasses("error", "surface")
          }`}
        >
          <p className="font-semibold">{message}</p>
        </div>
      )}

      {errors.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-semibold text-foreground">Validation Errors:</h3>
          <div className="space-y-1 max-h-96 overflow-y-auto">
            {errors.map((err, idx) => (
              <div key={idx} className="text-sm p-2 bg-muted rounded">
                <strong>Row {err.row}:</strong> {err.message}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
