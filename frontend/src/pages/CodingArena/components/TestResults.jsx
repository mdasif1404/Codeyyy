import React, { useState } from "react";
import { Bug } from "lucide-react";
import "./TestResults.css";

const defaultTests = [
  { id: 1, name: "Sample 1", hidden: false },
  { id: 2, name: "Sample 2", hidden: false },
  { id: 3, name: "Sample 3", hidden: false },
  { id: 4, name: "Hidden 1", hidden: true },
  { id: 5, name: "Hidden 2", hidden: true },
];

const TestResults = ({
  results = [],
  compileStatus = "NOT RUN",
  executionStatus = "NOT STARTED",
  errorMessage = "Your test results will appear here.",
}) => {
  const [selectedTest, setSelectedTest] = useState(0);

  const passedCount = results.filter(
    (test) => test.status === "passed"
  ).length;

  const totalTests = defaultTests.length;
  const progress = (passedCount / totalTests) * 100;

  const selectedResult = results[selectedTest];

  const hasError =
    compileStatus?.toUpperCase() === "FAILED" ||
    executionStatus?.toUpperCase() === "FAILED" ||
    results.some((test) => test.status === "failed");

  const getStatus = (index) => {
    if (!results[index]) return "pending";
    return results[index].status || "pending";
  };

  return (
    <section className="usb-results">

      {/* USB IMAGE */}
      <img
        src="/assets/pendrive.jpg"
        alt="Codyyy test results USB"
        className="usb-results-image"
      />

      {/* RESULTS CONTENT OVER USB BODY */}
      <div className="usb-results-content">

        <div className="usb-results-header">
          <span className="usb-results-kicker">
            CODYyy // TEST RESULTS
          </span>

          <div className="usb-results-header-right">
            {hasError && (
              <div
                className="usb-bug-indicator"
                title="Error detected in your code"
                aria-label="Code execution error"
              >
                <Bug size={21} strokeWidth={2.5} />
              </div>
            )}

            <span
              className={`usb-results-live-dot ${hasError ? "error-dot" : ""}`}
            ></span>
          </div>
        </div>

        <div className="usb-results-score-row">
          <div className="usb-results-score">
            <strong>{passedCount}</strong>
            <span>/ {totalTests}</span>
          </div>

          <span className="usb-results-score-label">
            TEST CASES PASSED
          </span>
        </div>

        <div className="usb-results-status">
          <span className={compileStatus?.toUpperCase() === "FAILED" ? "failed" : ""}>
            COMPILE: {compileStatus}
          </span>

          <span className={executionStatus?.toUpperCase() === "FAILED" ? "failed" : ""}>
            EXEC: {executionStatus}
          </span>
        </div>

        <div
          className="usb-results-progress"
          role="progressbar"
          aria-valuenow={passedCount}
          aria-valuemin={0}
          aria-valuemax={totalTests}
        >
          <div
            className="usb-results-progress-fill"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="usb-test-list">
          {defaultTests.map((test, index) => {
            const status = getStatus(index);

            return (
              <button
                key={test.id}
                type="button"
                className={`usb-test-item ${status} ${
                  selectedTest === index ? "active" : ""
                }`}
                disabled={test.hidden}
                onClick={() => setSelectedTest(index)}
                title={
                  test.hidden
                    ? "Hidden test case"
                    : `View ${test.name}`
                }
              >
                <span className="usb-test-checkbox">
                  {test.hidden
                    ? "🔒"
                    : status === "passed"
                    ? "✓"
                    : status === "failed"
                    ? "×"
                    : ""}
                </span>

                <span>{test.name}</span>
              </button>
            );
          })}
        </div>

        <div className="usb-results-message">
          <span className="usb-message-label">
            {selectedResult?.status === "failed"
              ? "TEST CASE FAILED"
              : selectedResult?.status === "passed"
              ? "TEST CASE PASSED"
              : "EXECUTION DETAILS"}
          </span>

          <p>
            {selectedResult?.message ||
              selectedResult?.output ||
              errorMessage}
          </p>
        </div>

      </div>
    </section>
  );
};

export default TestResults;