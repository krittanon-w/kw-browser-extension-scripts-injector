import { X } from "lucide-react";

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HelpModal({ isOpen, onClose }: HelpModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 md:p-8 animate-in fade-in duration-200">
      {/* Semi full screen modal */}
      <div className="bg-surface-1 border border-border rounded-xl shadow-xl w-[1000px] min-w-[1000px] max-w-[95vw] h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 px-6 border-b border-border bg-surface-2 rounded-t-xl shrink-0">
          <h2 className="text-xl font-semibold text-text-hi">
            Scripts Injector Documentation
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-surface-3 text-text-muted hover:text-text-hi transition-colors"
            title="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 md:p-10 lg:p-12 overflow-y-auto flex-1 custom-scrollbar">
          <div className="max-w-3xl mx-auto text-text-muted pb-10">
            <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl text-text-hi mb-6">
              Injector Documentation
            </h1>
            <p className="leading-7 [&:not(:first-child)]:mt-6">
              This extension allows you to automatically inject custom CSS and
              JavaScript into specific websites based on URL match patterns. Use it to customize appearance, automate tasks, or hide elements.
            </p>

            <h2 className="scroll-m-20 border-b border-border/50 pb-2 text-3xl font-semibold tracking-tight transition-colors first:mt-0 mt-10 mb-6 text-text-hi">
              URL Patterns
            </h2>
            <p className="leading-7 [&:not(:first-child)]:mt-6">
              URL patterns determine exactly which websites your custom code
              will run on. They must strictly follow the required format to be valid.
            </p>

            <blockquote className="mt-6 border-l-2 border-text-muted/30 pl-6 italic text-text-muted/80">
              "A perfectly written script is useless if it's injected on the wrong domain."
              <br/>
              <span className="not-italic font-mono text-sm mt-2 block text-primary">Format: &lt;scheme&gt;://&lt;host&gt;&lt;path&gt;</span>
            </blockquote>

            <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight mt-8 mb-4 text-text-hi">
              Common Examples
            </h3>
            <ul className="my-6 ml-6 list-disc [&>li]:mt-2">
              <li>
                <code className="relative rounded bg-surface-3 px-[0.3rem] py-[0.2rem] font-mono text-sm text-primary">
                  *://*.google.com/*
                </code>{" "}
                - Matches any Google page (e.g., https://google.com,
                http://mail.google.com).
              </li>
              <li>
                <code className="relative rounded bg-surface-3 px-[0.3rem] py-[0.2rem] font-mono text-sm text-primary">
                  https://github.com/*
                </code>{" "}
                - Matches any page on GitHub.
              </li>
              <li>
                <code className="relative rounded bg-surface-3 px-[0.3rem] py-[0.2rem] font-mono text-sm text-primary">
                  *://*/*
                </code>{" "}
                - Matches <strong>every</strong> website (use with caution).
              </li>
            </ul>
            <p className="leading-7 [&:not(:first-child)]:mt-6 text-sm italic opacity-80">
              Note: You can specify multiple patterns, one per line.
            </p>

            <h2 className="scroll-m-20 border-b border-border/50 pb-2 text-3xl font-semibold tracking-tight transition-colors first:mt-0 mt-10 mb-6 text-text-hi">
              Test URL Matching
            </h2>
            <p className="leading-7 [&:not(:first-child)]:mt-6">
              Not sure if your pattern is correct? Use the built-in URL matching
              tool to verify before injecting.
            </p>
            <ol className="my-6 ml-6 list-decimal [&>li]:mt-2">
              <li>
                Enter a full URL (e.g.,{" "}
                <code className="relative rounded bg-surface-3 px-[0.3rem] py-[0.2rem] font-mono text-sm text-text-hi">
                  https://github.com/krittanon-w
                </code>
                ).
              </li>
              <li>
                The indicator will instantly show{" "}
                <strong className="text-success font-semibold">MATCH</strong> or{" "}
                <strong className="text-danger font-semibold">NO MATCH</strong> based on
                your configured URL Patterns.
              </li>
            </ol>

            <h2 className="scroll-m-20 border-b border-border/50 pb-2 text-3xl font-semibold tracking-tight transition-colors first:mt-0 mt-10 mb-6 text-text-hi">
              Custom Scripts & Styles
            </h2>

            <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight mt-8 mb-4 text-text-hi">
              CSS Example
            </h3>
            <p className="leading-7 [&:not(:first-child)]:mt-6 mb-4">
              Write standard CSS. It will be injected as a{" "}
              <code className="relative rounded bg-surface-3 px-[0.3rem] py-[0.2rem] font-mono text-sm text-css">
                &lt;style&gt;
              </code>{" "}
              tag. Example (Dark mode a site):
            </p>
            <pre className="mb-4 mt-6 overflow-x-auto rounded-lg border border-border bg-[#1e1e2e] p-4 font-mono text-sm text-css shadow-sm">
              {`body {
  background-color: #121212 !important;
  color: #ffffff !important;
}`}
            </pre>

            <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight mt-8 mb-4 text-text-hi">
              JavaScript Example
            </h3>
            <p className="leading-7 [&:not(:first-child)]:mt-6 mb-4">
              Write vanilla JavaScript to interact directly with the DOM. Example (Hide an element):
            </p>
            <pre className="mb-4 mt-6 overflow-x-auto rounded-lg border border-border bg-[#1e1e2e] p-4 font-mono text-sm text-js shadow-sm">
              {`const adBanner = document.querySelector('.annoying-ad-banner');
if (adBanner) {
  adBanner.style.display = 'none';
}`}
            </pre>

            <h2 className="scroll-m-20 border-b border-border/50 pb-2 text-3xl font-semibold tracking-tight transition-colors first:mt-0 mt-10 mb-6 text-text-hi">
              Injection Delay
            </h2>
            <p className="leading-7 [&:not(:first-child)]:mt-6">
              Modern websites (React, Next.js, etc.) often load content dynamically.
              If your script tries to find an element before it exists, it will fail.
            </p>
            <ul className="my-6 ml-6 list-disc [&>li]:mt-2">
              <li>
                <strong className="text-text-hi font-semibold">0 ms</strong>: Runs
                immediately. Good for static sites or basic CSS.
              </li>
              <li>
                <strong className="text-text-hi font-semibold">500 - 1000 ms</strong>: Good
                for single-page applications where elements render slightly
                after page load.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
