
import React from "react";
import ArenaNavbar from "./components/ArenaNavbar";
import "./CodingArena.css";

const CodingArena = () => {
  return (
    <div className="coding-arena">

      {/* NAVBAR */}
      <ArenaNavbar
        roomCode="XY82KQ"
        players={4}
      />

      {/* ARENA HEADING */}
      <div className="arena-heading">
        <h1>THE CODING ARENA</h1>
        <p>ROOM NAME - ROUND 01</p>
      </div>

      {/* MAIN WORKSPACE */}
      <main className="arena-workspace">

        {/* LEFT: PROBLEM STATEMENT */}
        <section className="problem-panel">
          <div className="panel-heading">
            <h2>PROBLEM STATEMENT</h2>
            <span>01 / 05</span>
          </div>

          <div className="panel-content">
            <h3>Two Sum</h3>

            <p>
              Given an array of integers and a target value,
              return the indices of the two numbers that add
              up to the target.
            </p>

            <h4>Example</h4>

            <pre>
{`Input: nums = [2, 7, 11, 15], target = 9
Output: [0, 1]`}
            </pre>

            <h4>Constraints</h4>

            <p>
              2 ≤ nums.length ≤ 10⁴
            </p>
          </div>
        </section>

        {/* RIGHT: CODE EDITOR PLACEHOLDER */}
        <section className="editor-panel">
          <div className="panel-heading">
            <h2>CODE EDITOR</h2>
            <span>JAVA</span>
          </div>

          <div className="editor-placeholder">
            <p>Your code editor will appear here.</p>
          </div>

          <div className="editor-actions">
            <button className="run-btn" disabled>
              RUN CODE
            </button>

            <button className="submit-btn" disabled>
              SUBMIT
            </button>
          </div>
        </section>

      </main>

    </div>
  );
};

export default CodingArena;
