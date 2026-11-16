import Match from "../models/Match.js";
import {
  runCode,
  submitCode
} from "../services/execution.service.js";

// RUN: Execute code with custom input
export const runCodeController = async (req, res) => {
  try {
    const { matchId, sourceCode, language, stdin = "" } = req.body;

    if (!matchId || !sourceCode || !language) {
      return res.status(400).json({
        success: false,
        message: "Match ID, source code and language are required"
      });
    }

    // Verify match
    const match = await Match.findById(matchId);

    if (!match || match.status !== "running") {
      return res.status(404).json({
        success: false,
        message: "Active match not found"
      });
    }

    // Verify participant
    const isParticipant = match.participants.some(
      (participant) =>
        participant.user.toString() === req.user.id
    );

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: "You are not a participant in this match"
      });
    }

    const result = await runCode({
      sourceCode,
      language,
      stdin
    });

    return res.status(200).json({
      success: true,
      message: "Code executed successfully",
      data: result
    });

  } catch (error) {
    console.error("Run code error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Code execution failed"
    });
  }
};


// SUBMIT: Evaluate code against challenge test cases
export const submitCodeController = async (req, res) => {
  try {
    const { matchId, sourceCode, language } = req.body;

    if (!matchId || !sourceCode || !language) {
      return res.status(400).json({
        success: false,
        message: "Match ID, source code and language are required"
      });
    }

    const result = await submitCode({
      matchId,
      userId: req.user.id,
      sourceCode,
      language,
      io: req.app.get("io")
    });

    return res.status(200).json({
      success: true,
      message: "Code evaluation completed",
      data: result
    });

  } catch (error) {
    console.error("Submit code error:", error.message);

    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};
