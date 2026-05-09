import { X } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HelpModal({ isOpen, onClose }: HelpModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 md:p-8 animate-in fade-in duration-200">
      {/* Semi full screen modal: 90vw width and 90vh height */}
      <div className="bg-surface-1 border border-border rounded-xl shadow-xl w-full max-w-[90vw] h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 px-6 border-b border-border bg-surface-2 rounded-t-xl shrink-0">
          <h2 className="text-xl font-semibold text-text-hi">Scripts Injector Documentation</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-surface-3 text-text-muted hover:text-text-hi transition-colors"
            title="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 md:p-10 overflow-y-auto flex-1 custom-scrollbar text-text text-base leading-relaxed">
          <div className="max-w-4xl mx-auto space-y-10">
            
            <section>
              <h2 className="text-2xl font-bold text-text-hi mb-2 pb-2 border-b border-border/50">Overview</h2>
              <p className="text-text-muted mb-4">
                This extension allows you to automatically inject custom CSS and JavaScript into specific websites based on URL match patterns.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-text-hi mb-3">URL Patterns</h3>
              <p className="mb-3">URL patterns determine exactly which websites your custom code will run on.</p>
              
              <div className="bg-surface-2 p-4 rounded-lg border border-border/50 mb-4 font-mono text-sm">
                <span className="text-text-muted">Format: </span> 
                <span className="text-primary">&lt;scheme&gt;://&lt;host&gt;&lt;path&gt;</span>
              </div>
              
              <h4 className="font-semibold text-text-hi mb-2">Common Examples:</h4>
              <ul className="list-disc pl-6 space-y-2 text-text-muted">
                <li><code className="text-primary bg-surface-3 px-1.5 py-0.5 rounded text-sm">*://*.google.com/*</code> - Matches any Google page (e.g., https://google.com, http://mail.google.com/mail).</li>
                <li><code className="text-primary bg-surface-3 px-1.5 py-0.5 rounded text-sm">https://github.com/*</code> - Matches any page on GitHub.</li>
                <li><code className="text-primary bg-surface-3 px-1.5 py-0.5 rounded text-sm">*://*/*</code> - Matches <strong>every</strong> website (use with caution).</li>
              </ul>
              <p className="mt-3 text-sm italic opacity-80">Note: You can specify multiple patterns, one per line.</p>
            </section>

            <hr className="border-border/50" />

            <section>
              <h3 className="text-xl font-semibold text-text-hi mb-3">Test URL Matching</h3>
              <p className="mb-3">Not sure if your pattern is correct? Use the Test URL Matching tool!</p>
              <ol className="list-decimal pl-6 space-y-2 text-text-muted">
                <li>Enter a full URL (e.g., <code className="text-text-hi bg-surface-3 px-1.5 py-0.5 rounded text-sm">https://github.com/krittanon-w</code>).</li>
                <li>The indicator will instantly show <strong className="text-success">MATCH</strong> or <strong className="text-danger">NO MATCH</strong> based on your configured URL Patterns above.</li>
              </ol>
            </section>

            <hr className="border-border/50" />

            <section>
              <h3 className="text-xl font-semibold text-text-hi mb-3">Custom CSS</h3>
              <p className="mb-3">
                Write standard CSS here. It will be automatically injected into the page as a 
                <code className="text-css bg-surface-3 px-1.5 py-0.5 rounded text-sm mx-1">&lt;style&gt;</code> 
                tag, overriding the site's default styles.
              </p>
              
              <h4 className="font-semibold text-text-hi mb-2">Example (Dark mode a site):</h4>
              <pre className="bg-[#1e1e2e] p-4 rounded-lg overflow-x-auto border border-border font-mono text-sm text-css">
{`body {
  background-color: #121212 !important;
  color: #ffffff !important;
}`}
              </pre>
            </section>

            <hr className="border-border/50" />

            <section>
              <h3 className="text-xl font-semibold text-text-hi mb-3">Custom JavaScript</h3>
              <p className="mb-3">
                Write vanilla JavaScript here. It runs directly on the page, allowing you to modify the DOM, add event listeners, or automate tasks.
              </p>
              
              <h4 className="font-semibold text-text-hi mb-2">Example (Hide a specific element):</h4>
              <pre className="bg-[#1e1e2e] p-4 rounded-lg overflow-x-auto border border-border font-mono text-sm text-js">
{`const adBanner = document.querySelector('.annoying-ad-banner');
if (adBanner) {
  adBanner.style.display = 'none';
}`}
              </pre>
            </section>

            <hr className="border-border/50" />

            <section>
              <h3 className="text-xl font-semibold text-text-hi mb-3">Injection Delay (ms)</h3>
              <p className="mb-3">
                Many modern websites (like React or Next.js apps) load content dynamically <em>after</em> the initial page load. 
                If your script tries to find an element before it exists, it won't work. Use the delay to wait before injecting:
              </p>
              <ul className="list-disc pl-6 space-y-3 text-text-muted">
                <li>
                  <strong className="text-text-hi">0 ms</strong>: Runs immediately. Good for static sites or basic CSS.
                </li>
                <li>
                  <strong className="text-text-hi">500 - 1000 ms</strong>: Good for single-page applications where elements render slightly after page load.
                </li>
              </ul>
            </section>
            
          </div>
        </div>
      </div>
    </div>
  );
}
