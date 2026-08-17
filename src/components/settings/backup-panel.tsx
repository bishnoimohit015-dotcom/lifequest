"use client";
import {
  Check,
  ClipboardCopy,
  Download,
  FileUp,
  Smartphone,
  Upload,
} from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { backupFilename } from "@/lib/storage";
import { useApp } from "@/state/app-store";

/**
 * Device-to-device transfer + safety net. localStorage is per-browser, so
 * this is the supported way to move a profile from desktop to phone (and to
 * survive iOS Safari clearing site data).
 */
export function BackupPanel() {
  const { actions } = useApp();
  const fileRef = useRef<HTMLInputElement>(null);
  const [pasteOpen, setPasteOpen] = useState(false);
  const [pasted, setPasted] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const download = () => {
    const blob = new Blob([actions.exportBackup()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = backupFilename();
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(actions.exportBackup());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Clipboard blocked — use Download instead.");
    }
  };

  const restore = (json: string) => {
    const result = actions.importBackup(json);
    if (result.ok) {
      setPasteOpen(false);
      setPasted("");
      setError(null);
    } else {
      setError(result.error ?? "Import failed.");
    }
  };

  const onFile = (file: File | undefined) => {
    if (!file) return;
    file
      .text()
      .then(restore)
      .catch(() => setError("Could not read that file."));
  };

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <Button variant="soft" onClick={download}>
          <Download size={15} aria-hidden="true" />
          Download backup
        </Button>
        <Button variant="outline" onClick={copy}>
          {copied ? (
            <Check size={15} aria-hidden="true" />
          ) : (
            <ClipboardCopy size={15} aria-hidden="true" />
          )}
          {copied ? "Copied" : "Copy backup"}
        </Button>
        <Button variant="outline" onClick={() => fileRef.current?.click()}>
          <FileUp size={15} aria-hidden="true" />
          Restore from file
        </Button>
        <Button variant="outline" onClick={() => setPasteOpen(true)}>
          <Upload size={15} aria-hidden="true" />
          Paste backup
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          className="sr-only"
          aria-label="Choose a LifeQuest backup file"
          onChange={(e) => {
            onFile(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
      </div>

      {error && (
        <p role="alert" className="mt-3 text-xs font-bold text-danger">
          {error}
        </p>
      )}

      <p className="mt-4 flex items-start gap-2 rounded-lg bg-surface px-3.5 py-3 text-[11px] leading-relaxed font-semibold text-ink-faint">
        <Smartphone size={13} className="mt-0.5 shrink-0" aria-hidden="true" />
        Progress is saved per browser, so your phone starts fresh. To move this
        profile: tap <strong className="font-bold">Copy backup</strong> here,
        send the text to your phone (Messages, Notes, AirDrop), then use{" "}
        <strong className="font-bold">Paste backup</strong> there. Worth
        exporting occasionally — iOS can clear site data for websites you
        haven&apos;t opened in a while.
      </p>

      <Modal
        open={pasteOpen}
        onClose={() => setPasteOpen(false)}
        title="Paste a backup"
      >
        <p className="mb-3 text-sm text-ink-soft">
          Paste the JSON you copied from another device. This replaces
          everything currently stored in this browser.
        </p>
        <textarea
          value={pasted}
          onChange={(e) => setPasted(e.target.value)}
          rows={8}
          placeholder='{ "version": 1, "habits": [ ... ] }'
          aria-label="Backup JSON"
          className="w-full resize-y rounded-lg border border-line-strong bg-surface px-3 py-2.5 font-mono text-xs placeholder:text-ink-faint focus:border-moss"
        />
        {error && (
          <p role="alert" className="mt-2 text-xs font-bold text-danger">
            {error}
          </p>
        )}
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setPasteOpen(false)}>
            Cancel
          </Button>
          <Button
            disabled={pasted.trim().length === 0}
            onClick={() => restore(pasted)}
          >
            Restore
          </Button>
        </div>
      </Modal>
    </>
  );
}
