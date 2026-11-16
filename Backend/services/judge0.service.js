const JUDGE0_URL = process.env.JUDGE0_URL || "http://localhost:2358";

// Language IDs verified from your Judge0 installation
export const LANGUAGE_IDS = {
  c: 50,
  python: 71,
  java: 62,
  javascript: 63,
};

// Language-specific execution limits
const LANGUAGE_LIMITS = {
  c: {
    cpuTimeLimit: 5,
    wallTimeLimit: 10,
  },
  python: {
    cpuTimeLimit: 5,
    wallTimeLimit: 10,
  },
  java: {
    cpuTimeLimit: 15,
    wallTimeLimit: 20,
  },
  javascript: {
    cpuTimeLimit: 5,
    wallTimeLimit: 10,
  },
};

export const executeCode = async ({
  sourceCode,
  language,
  stdin = "",
  expectedOutput,
  timeLimit,
  memoryLimit = 128000,
}) => {
  const normalizedLanguage = language?.toLowerCase();
  const languageId = LANGUAGE_IDS[normalizedLanguage];
  const limits = LANGUAGE_LIMITS[normalizedLanguage];

  if (!sourceCode || !sourceCode.trim()) {
    throw new Error("Source code cannot be empty");
  }

  if (!languageId) {
    throw new Error(`Unsupported language: ${language}`);
  }

  const cpuTimeLimit = timeLimit ?? limits.cpuTimeLimit;
  const wallTimeLimit = limits.wallTimeLimit;

  let response;

  try {
    response = await fetch(
      `${JUDGE0_URL}/submissions?base64_encoded=false&wait=true`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          source_code: sourceCode,
          language_id: languageId,
          stdin,
          cpu_time_limit: cpuTimeLimit,
          wall_time_limit: wallTimeLimit,
          memory_limit: memoryLimit,
        }),
      }
    );
  } catch (error) {
    throw new Error(`Unable to connect to Judge0: ${error.message}`);
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Judge0 API error: ${errorText}`);
  }

  return await response.json();
};
