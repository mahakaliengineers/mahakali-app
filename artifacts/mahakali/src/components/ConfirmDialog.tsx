import { createContext, useCallback, useContext, useRef, useState } from "react";

interface ConfirmOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
}

type ConfirmFn = (opts: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmFn>(() => Promise.resolve(false));

export function useConfirm(): ConfirmFn {
  return useContext(ConfirmContext);
}

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<(ConfirmOptions & { visible: boolean }) | null>(null);
  const resolveRef = useRef<((v: boolean) => void) | null>(null);

  const confirm: ConfirmFn = useCallback((opts) => {
    return new Promise<boolean>((resolve) => {
      resolveRef.current = resolve;
      setState({ ...opts, visible: true });
    });
  }, []);

  function handleResult(result: boolean) {
    setState(null);
    resolveRef.current?.(result);
    resolveRef.current = null;
  }

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {state?.visible && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => handleResult(false)}
          />
          {/* Dialog */}
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Top accent */}
            <div className={`h-1 w-full ${state.danger ? "bg-red-500" : "bg-[hsl(352,83%,50%)]"}`} />
            <div className="p-6">
              {/* Icon */}
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${state.danger ? "bg-red-50" : "bg-amber-50"}`}>
                {state.danger ? (
                  <svg viewBox="0 0 24 24" className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" className="w-6 h-6 text-amber-500" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                  </svg>
                )}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{state.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed mb-6">{state.message}</p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => handleResult(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  {state.cancelLabel ?? "Cancel"}
                </button>
                <button
                  onClick={() => handleResult(true)}
                  className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors shadow-sm ${
                    state.danger
                      ? "bg-red-500 hover:bg-red-600"
                      : "bg-[hsl(352,83%,50%)] hover:opacity-90"
                  }`}
                >
                  {state.confirmLabel ?? "Confirm"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}
