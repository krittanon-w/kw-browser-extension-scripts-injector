import { useEffect, useRef } from 'react';
import { EditorState } from '@codemirror/state';
import { EditorView, keymap, lineNumbers, highlightActiveLineGutter } from '@codemirror/view';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { bracketMatching, indentOnInput } from '@codemirror/language';
import { javascript } from '@codemirror/lang-javascript';
import { css } from '@codemirror/lang-css';
import { oneDark } from '@codemirror/theme-one-dark';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: 'css' | 'js' | 'text';
  readOnly?: boolean;
}

export function CodeEditor({ value, onChange, language, readOnly = false }: CodeEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const isExternalUpdate = useRef(false);

  useEffect(() => {
    if (!editorRef.current) return;

    const extensions = [
      lineNumbers(),
      highlightActiveLineGutter(),
      history(),
      bracketMatching(),
      indentOnInput(),
      keymap.of([...defaultKeymap, ...historyKeymap]),
      EditorView.lineWrapping,
      oneDark,
      EditorState.readOnly.of(readOnly),
      EditorView.editable.of(!readOnly),
      EditorView.updateListener.of((update) => {
        // Only trigger onChange if the document actually changed AND we're not in read-only mode
        // AND it wasn't an external value prop update
        if (update.docChanged && !readOnly && !isExternalUpdate.current) {
          onChangeRef.current(update.state.doc.toString());
        }
      }),
    ];

    if (language === 'js') extensions.push(javascript());
    if (language === 'css') extensions.push(css());

    const startState = EditorState.create({
      doc: value,
      extensions: extensions,
    });

    const view = new EditorView({
      state: startState,
      parent: editorRef.current,
    });

    viewRef.current = view;

    return () => {
      view.destroy();
    };
  }, [language, readOnly]);

  // Update editor content if value prop changes from outside
  useEffect(() => {
    if (viewRef.current && value !== viewRef.current.state.doc.toString()) {
      isExternalUpdate.current = true;
      viewRef.current.dispatch({
        changes: { from: 0, to: viewRef.current.state.doc.length, insert: value }
      });
      isExternalUpdate.current = false;
    }
  }, [value]);

  return <div ref={editorRef} className="cm-wrapper" />;
}
