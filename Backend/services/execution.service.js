import mongoose from "mongoose";
import Match from "../models/Match.js";
import Room from "../models/Room.js";
import Submission from "../models/Submission.js";
import { executeCode } from "./judge0.service.js";
import { RESULTS_DURATION } from "../Config/matchConfig.js";

// Execute code with custom input (RUN button)
export const runCode = async ({
  sourceCode,
  language,
  stdin = ""
}) => {

  // Validate input
  if (!sourceCode || !sourceCode.trim()) {
    throw new Error("Source code cannot be empty");
  }

  if (!language) {
    throw new Error("Programming language is required");
  }

  // Execute through Judge0
  const result = await executeCode({
    sourceCode,
    language,
    stdin
  });

  // Return execution details
  return {
    stdout: result.stdout,
    stderr: result.stderr,
    compileOutput: result.compile_output,
    status: result.status?.description,
    executionTime: result.time,
    executionMemory: result.memory
  };
};



export const submitCode = async ({
  matchId,
  userId,
  sourceCode,
  language,
  io
}) => {
  if (!sourceCode?.trim()) {
    throw new Error("Source code cannot be empty");
  }

  if (!language) {
    throw new Error("Programming language is required");
  }

  // 1. Verify match and participant
  const match = await Match.findById(matchId)
    .populate("challenge");

  if (!match) {
    throw new Error("Match not found");
  }

  if (match.status !== "running") {
    throw new Error("This match is not accepting submissions");
  }

  const participantExists = match.participants.some(
    participant => participant.user.toString() === userId.toString()
  );

  if (!participantExists) {
    throw new Error("You are not a participant in this match");
  }

  const challenge = match.challenge;

  if (!challenge) {
    throw new Error("Challenge not found");
  }

  const testCases = challenge.testCases;

  if (!testCases?.length) {
    throw new Error("No test cases available for evaluation");
  }

  // 2. Create submission
  const submission = await Submission.create({
    match: match._id,
    user: userId,
    language: language.toLowerCase(),
    sourceCode,
    executionStatus: "running",
    verdict: "pending",
    totalTests: testCases.length
  });

  let passedTests = 0;
  let visibleTestsPassed = 0;
  let hiddenTestsPassed = 0;

  let totalExecutionTime = 0;
  let maxExecutionMemory = 0;

  let finalVerdict = "accepted";

  try {
    // 3. Evaluate test cases
    for (const testCase of testCases) {
      const result = await executeCode({
        sourceCode,
        language,
        stdin: testCase.input,
        timeLimit: challenge.timeLimit,
        memoryLimit: challenge.memoryLimit
      });

      const statusId = result.status?.id;
      const statusDescription = result.status?.description || "";

      totalExecutionTime += Number(result.time || 0);

      maxExecutionMemory = Math.max(
        maxExecutionMemory,
        Number(result.memory || 0)
      );

      // Handle execution failures
      if (statusId !== 3) {
        if (
          statusId === 5 ||
          /time limit exceeded/i.test(statusDescription)
        ) {
          finalVerdict = "time-limit-exceeded";
        } else if (
          statusId === 6 ||
          /compilation error/i.test(statusDescription)
        ) {
          finalVerdict = "compilation-error";
        } else if (/memory limit exceeded/i.test(statusDescription)) {
          finalVerdict = "memory-limit-exceeded";
        } else {
          finalVerdict = "runtime-error";
        }

        break;
      }

      // 4. Compare output
      const actualOutput = (result.stdout || "").trim();
      const expectedOutput = (testCase.expectedOutput || "").trim();

      if (actualOutput === expectedOutput) {
        passedTests++;

        if (testCase.isHidden) {
          hiddenTestsPassed++;
        } else {
          visibleTestsPassed++;
        }
      } else {
        finalVerdict = "wrong-answer";
      }
    }

    // 5. Calculate latest submission base score
    const baseScore =
      visibleTestsPassed * 0.5 + hiddenTestsPassed;

    // 6. Save submission evaluation
    await Submission.findByIdAndUpdate(submission._id, {
      executionStatus: "completed",
      verdict: finalVerdict,
      passedTests,
      visibleTestsPassed,
      hiddenTestsPassed,
      baseScore,
      totalTests: testCases.length,
      executionTime: totalExecutionTime,
      executionMemory: maxExecutionMemory
    });

    // 7. Update player and check match completion
    const session = await mongoose.startSession();

    let matchCompleted = false;
    let results = null;

    try {
      await session.withTransaction(async () => {
        const currentMatch = await Match.findOne({
          _id: matchId,
          status: "running"
        }).session(session);

        if (!currentMatch) {
          throw new Error("Match is no longer accepting submissions");
        }

        const participant = currentMatch.participants.find(
          player => player.user.toString() === userId.toString()
        );

        if (!participant) {
          throw new Error("Participant not found in match");
        }

        // Latest submission determines current base score
        participant.visibleTestsPassed = visibleTestsPassed;
        participant.hiddenTestsPassed = hiddenTestsPassed;
        participant.baseScore = baseScore;
        participant.executionTime = totalExecutionTime;

        // Preserve the first fully accepted solve time
        if (
          finalVerdict === "accepted" &&
          !participant.solved
        ) {
          participant.solved = true;
          participant.firstSolvedAt = new Date();
        }

        // N-1 unique players must solve
        const requiredSolves = currentMatch.participants.length - 1;

        const solvedPlayers = currentMatch.participants.filter(
          player => player.solved
        ).length;

        // Complete the match when N-1 players solve
        if (solvedPlayers >= requiredSolves) {
          const completedAt = new Date();

          currentMatch.status = "completed";
          currentMatch.completedAt = completedAt;
          currentMatch.resultsExpireAt = new Date(
            completedAt.getTime() + RESULTS_DURATION
          );
          currentMatch.cleanupStatus = "pending";

          // Rank by base score, then first solve time
          const rankedPlayers = [...currentMatch.participants].sort(
            (a, b) => {
              if (b.baseScore !== a.baseScore) {
                return b.baseScore - a.baseScore;
              }

              if (a.firstSolvedAt && b.firstSolvedAt) {
                return a.firstSolvedAt - b.firstSolvedAt;
              }

              if (a.firstSolvedAt) return -1;
              if (b.firstSolvedAt) return 1;

              return 0;
            }
          );

          rankedPlayers.forEach((player, index) => {
            player.rank = index + 1;

            let bonus = 0;

            if (index === 0) {
              bonus = 20;
            } else if (
              index === 1 &&
              currentMatch.participants.length >= 3
            ) {
              bonus = 10;
            }

            player.score = player.baseScore + bonus;
            player.isWinner = index === 0;
          });

          currentMatch.winner =
            rankedPlayers[0]?.user || null;

          matchCompleted = true;

          results = {
            matchId: currentMatch._id,
            roomId: currentMatch.room,
            winner: currentMatch.winner,
            participants: currentMatch.participants,
            completedAt,
            resultsExpireAt: currentMatch.resultsExpireAt
          };
        }

        await currentMatch.save({ session });

        // Update room completion state
        if (matchCompleted) {
          await Room.updateOne(
            {
              _id: currentMatch.room,
              currentMatch: currentMatch._id
            },
            {
              $set: {
                matchStatus: "completed",
                endedAt: currentMatch.completedAt
              }
            },
            { session }
          );
        }
      });

    } finally {
      await session.endSession();
    }

    // Broadcast results only after the transaction commits
    if (matchCompleted && results) {
      io?.to(`room:${results.roomId}`).emit(
        "match:completed",
        results
      );
    }

    return {
      submissionId: submission._id,
      verdict: finalVerdict,
      passedTests,
      visibleTestsPassed,
      hiddenTestsPassed,
      totalTests: testCases.length,
      baseScore,
      executionTime: totalExecutionTime,
      executionMemory: maxExecutionMemory,
      matchCompleted,
      results
    };

  } catch (error) {
    await Submission.findByIdAndUpdate(submission._id, {
      executionStatus: "failed",
      verdict: "internal-error"
    });

    throw error;
  }
};
