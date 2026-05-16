"use client";

import { useEffect, useRef } from "react";

export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open) dialog.showModal();
    else dialog.close();
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="fixed inset-0 z-50 w-full max-w-lg rounded-xl border border-zinc-200 bg-white p-0 shadow-2xl backdrop:bg-black/50 dark:border-zinc-700 dark:bg-zinc-900"
    >
      <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4 dark:border-zinc-700">
        <h2 className="text-xl font-bold">{title}</h2>
        <button
          onClick={onClose}
          className="rounded-full p-1 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
        >
          &#10005;
        </button>
      </div>
      <div className="p-6">{children}</div>
    </dialog>
  );
}
