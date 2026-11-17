import React, { useState, useEffect, useRef } from "react";
import Editor from "@monaco-editor/react";
import "./CodeEditor.css";

const LANGUAGE_OPTIONS = [
  { label: "Java", value: "java", monaco: "java" },
  { label: "Python", value: "python", monaco: "python" },
  { label: "JavaScript", value: "javascript", monaco: "javascript" },
  { label: "C", value: "c", monaco: "cpp" },
];

const STARTER_CODE = {
  java: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        // Write your solution here
        return new int[]{};
    }
}`,
  python: `class Solution:
    def twoSum(self, nums, target):
        # Write your solution here
        pass`,
  javascript: `function twoSum(nums, target) {
    // Write your solution here
    return [];
}`,
  c: `#include <stdio.h>

int main() {
    // Write your solution here
    return 0;
}`,
};

const CodeEditor = ({
  challengeId = "two-sum",
  initialCode,
  onRun,
  onSubmit,
  onExecute,
}) => {
  const [language, setLanguage] = useState("java");
  const [fontSize, setFontSize] = useState(14);
  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");
  const [outputType, setOutputType] = useState("info");
  const [loading, setLoading] = useState(false);
  const [operation, setOperation] = useState("");
  const [saveStatus, setSaveStatus] = useState("Saved");

  const editorRef = useRef(null);
  const saveTimeout = useRef(null);

  const storageKey = `codyyy-${challengeId}-${language}`;

  // Load saved code whenever language or challenge changes.
  useEffect(() => {
    const savedCode = localStorage.getItem(storageKey);

    setCode(
      savedCode !== null
        ? savedCode
        : initialCode || STARTER_CODE[language]
    );

    setOutput("");
    setOutputType("info");
  }, [language, challengeId, initialCode, storageKey]);

  // Auto-save code.
  useEffect(() => {
    if (!code) return;

    setSaveStatus("Saving...");
    clearTimeout(saveTimeout.current);

    saveTimeout.current = setTimeout(() => {
      localStorage.setItem(storageKey, code);
      setSaveStatus("Auto-saved");
    }, 700);

    return () => clearTimeout(saveTimeout.current);
  }, [code, storageKey]);

  // Clear pending save timer on unmount.
  useEffect(() => {
    return () => clearTimeout(saveTimeout.current);
  }, []);

  // Monaco theme.
  const handleEditorMount = (editor, monaco) => {
    editorRef.current = editor;

    monaco.editor.defineTheme("codyyy-dark", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "keyword", foreground: "FF5263" },
        { token: "string", foreground: "E9BF32" },
        { token: "number", foreground: "69DDA0" },
        {
          token: "comment",
          foreground: "8C817B",
          fontStyle: "italic",
        },
      ],
      colors: {
        "editor.background": "#10090B",
        "editor.foreground": "#FFF0D7",
        "editorLineNumber.foreground": "#766B69",
        "editorLineNumber.activeForeground": "#E9BF32",
        "editorCursor.foreground": "#E9BF32",
        "editor.selectionBackground": "#65303B",
        "editor.lineHighlightBackground": "#28151B",
        "editorGutter.background": "#10090B",
      },
    });

    monaco.editor.setTheme("codyyy-dark");
  };

  const handleLanguageChange = (event) => {
    localStorage.setItem(storageKey, code);
    setLanguage(event.target.value);
  };

  const changeFontSize = (amount) => {
    setFontSize((current) =>
      Math.min(24, Math.max(10, current + amount))
    );
  };

  const displayResult = (result) => {
    if (typeof result === "string") {
      setOutput(result);
      setOutputType("success");

      if (onExecute) {
        onExecute({
          compileStatus: "SUCCESS",
          executionStatus: "COMPLETED",
          results: [],
          errorMessage: result,
        });
      }
      return;
    }

    const message =
      result?.stdout ||
      result?.output ||
      result?.message ||
      result?.stderr ||
      result?.error ||
      JSON.stringify(result, null, 2);

    const hasCompileError =
      result?.compileStatus?.toUpperCase() === "FAILED" ||
      Boolean(result?.compileError);

    const hasRuntimeOrTestError =
      Boolean(result?.stderr || result?.error) ||
      result?.status === "error" ||
      result?.status === "failed" ||
      result?.executionStatus?.toUpperCase() === "FAILED" ||
      (Array.isArray(result?.results) &&
        result.results.some((test) => test.status === "failed"));

    const hasError = hasCompileError || hasRuntimeOrTestError;

    setOutput(message || "Operation completed.");
    setOutputType(hasError ? "error" : "success");

    // Forward execution outcome to CodingArena -> TestResults
    if (onExecute) {
      onExecute({
        compileStatus: hasCompileError ? "FAILED" : "SUCCESS",
        executionStatus: hasCompileError
          ? "NOT RUN"
          : hasRuntimeOrTestError
          ? "FAILED"
          : "COMPLETED",
        results: result?.results || [],
        errorMessage: message || "Operation completed.",
      });
    }
  };

  // Run code through the existing backend callback.
  const handleRun = async () => {
    if (!code.trim()) {
      const msg = "Please write some code before running.";
      setOutput(msg);
      setOutputType("error");

      if (onExecute) {
        onExecute({
          compileStatus: "FAILED",
          executionStatus: "FAILED",
          results: [],
          errorMessage: msg,
        });
      }
      return;
    }

    if (!onRun) {
      setOutput(
        "Run API is not connected yet. Backend integration is pending."
      );
      setOutputType("info");
      return;
    }

    try {
      setLoading(true);
      setOperation("run");
      setOutput("Executing your code...");
      setOutputType("info");

      const result = await onRun({
        code,
        language,
        challengeId,
      });

      displayResult(result);
    } catch (error) {
      const errMsg = error.message || "Code execution failed.";
      setOutput(errMsg);
      setOutputType("error");

      if (onExecute) {
        onExecute({
          compileStatus: "FAILED",
          executionStatus: "FAILED",
          results: [],
          errorMessage: errMsg,
        });
      }
    } finally {
      setLoading(false);
      setOperation("");
    }
  };

  // Submit solution through the existing backend callback.
  const handleSubmit = async () => {
    if (!code.trim()) {
      const msg = "Please write your solution before submitting.";
      setOutput(msg);
      setOutputType("error");

      if (onExecute) {
        onExecute({
          compileStatus: "FAILED",
          executionStatus: "FAILED",
          results: [],
          errorMessage: msg,
        });
      }
      return;
    }

    if (!onSubmit) {
      setOutput(
        "Submit API is not connected yet. Backend integration is pending."
      );
      setOutputType("info");
      return;
    }

    try {
      setLoading(true);
      setOperation("submit");
      setOutput("Evaluating your solution...");
      setOutputType("info");

      const result = await onSubmit({
        code,
        language,
        challengeId,
      });

      displayResult(result);
    } catch (error) {
      const errMsg = error.message || "Submission failed.";
      setOutput(errMsg);
      setOutputType("error");

      if (onExecute) {
        onExecute({
          compileStatus: "FAILED",
          executionStatus: "FAILED",
          results: [],
          errorMessage: errMsg,
        });
      }
    } finally {
      setLoading(false);
      setOperation("");
    }
  };

  const selectedLanguage = LANGUAGE_OPTIONS.find(
    (item) => item.value === language
  );

  const fileExtension = {
    java: "java",
    python: "py",
    javascript: "js",
    c: "c",
  }[language];

  return (
    <div className="retro-editor">

      {/* RETRO COMPUTER FRAME */}
      <div className="retro-computer-frame">

        {/* MONITOR SCREEN OPENING */}
        <div className="retro-monitor-window">

          {/* TOOLBAR INSIDE THE MONITOR */}
          <div className="retro-editor-toolbar">

            <div className="retro-file-tab">
              <span className="retro-file-icon" />
              <span>Solution.{fileExtension}</span>
            </div>

            <div className="retro-toolbar-controls">

              <div className="retro-language-select">
                <span className="retro-language-symbol">
                  {language === "javascript"
                    ? "JS"
                    : language.toUpperCase()}
                </span>

                <select
                  value={language}
                  onChange={handleLanguageChange}
                  aria-label="Select programming language"
                >
                  {LANGUAGE_OPTIONS.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="retro-font-controls">
                <button
                  type="button"
                  onClick={() => changeFontSize(-1)}
                  aria-label="Decrease font size"
                >
                  A−
                </button>

                <span>{fontSize}</span>

                <button
                  type="button"
                  onClick={() => changeFontSize(1)}
                  aria-label="Increase font size"
                >
                  A+
                </button>
              </div>

              <div className="retro-save-status">
                <span
                  className={`save-dot ${
                    saveStatus === "Auto-saved" ? "saved" : ""
                  }`}
                />
                {saveStatus}
              </div>

            </div>
          </div>

          {/* MONACO EDITOR DISPLAY */}
          <div className="retro-monitor-screen">
            <Editor
              height="100%"
              language={selectedLanguage.monaco}
              value={code}
              onChange={(value) => setCode(value ?? "")}
              onMount={handleEditorMount}
              theme="codyyy-dark"
              options={{
                fontSize,
                fontFamily: "Consolas, 'Courier New', monospace",
                lineNumbers: "on",
                minimap: { enabled: false },
                automaticLayout: true,
                scrollBeyondLastLine: false,
                wordWrap: "on",
                tabSize: 4,
                insertSpaces: true,
                padding: { top: 14, bottom: 14 },
                renderLineHighlight: "all",
                cursorBlinking: "smooth",
                smoothScrolling: true,
                bracketPairColorization: { enabled: true },
                suggestOnTriggerCharacters: true,
              }}
            />
          </div>

        </div>

        {/* RUN AND SUBMIT BUTTONS ON COMPUTER BODY */}
        <div className="retro-computer-actions">
          <button
            type="button"
            className="retro-run-button"
            onClick={handleRun}
            disabled={loading}
          >
            <span>▶</span>
            {loading && operation === "run" ? "RUNNING..." : "RUN CODE"}
          </button>

          <button
            type="button"
            className="retro-submit-button"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading && operation === "submit"
              ? "SUBMITTING..."
              : "SUBMIT SOLUTION"}
          </button>
        </div>

      </div>

      {/* CONSOLE BELOW THE COMPUTER */}
      <div className={`retro-output-panel ${outputType}`}>
        <div className="retro-output-icon">
          {outputType === "error"
            ? "!"
            : outputType === "success"
            ? "✓"
            : "›"}
        </div>

        <div className="retro-output-content">
          <strong>
            {outputType === "error"
              ? "ERROR DETECTED!"
              : outputType === "success"
              ? "EXECUTION RESULT"
              : "CONSOLE"}
          </strong>

          <pre>
            {output || "Your execution output will appear here."}
          </pre>
        </div>
      </div>

    </div>
  );
};

export default CodeEditor;