
import api from "./api.js";

// Run code against custom input
export const runCode = async ({ matchId, code, language, stdin = "" }) => {
  const response = await api.post("/code/run", {
    matchId,
    sourceCode: code,
    language,
    stdin,
  });

  return response.data.data;
};

// Submit code against challenge test cases
export const submitCode = async ({ matchId, code, language }) => {
  const response = await api.post("/code/submit", {
    matchId,
    sourceCode: code,
    language,
  });

  return response.data.data;
};
