import "dotenv/config";
import mongoose from "mongoose";
import Challenge from "./models/Challenge.js";
import User from "./models/User.js";

const seedChallenge = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URL);
    console.log("MongoDB Connected");

    // Find an existing admin user
    const admin = await User.findOne({ role: "admin" });

    if (!admin) {
      throw new Error(
        "No admin user found. Assign admin role to an account first."
      );
    }

    // Create test challenge
    const challenge = await Challenge.create({
      title: "Add Two Numbers",

      description:
        "Given two integers A and B, calculate and print their sum.",

      difficulty: "Easy",

      inputFormat:
        "A single line containing two space-separated integers.",

      outputFormat:
        "Print the sum of the two integers.",

      constraints: [
        "-100000 <= A, B <= 100000"
      ],

      examples: [
        {
          input: "5 7",
          expectedOutput: "12",
          explanation: "5 + 7 = 12"
        }
      ],

      testCases: [
        {
          input: "5 7",
          expectedOutput: "12",
          isHidden: false
        },
        {
          input: "10 20",
          expectedOutput: "30",
          isHidden: false
        },
        {
          input: "-5 8",
          expectedOutput: "3",
          isHidden: true
        },
        {
          input: "0 0",
          expectedOutput: "0",
          isHidden: true
        },
        {
          input: "100 200",
          expectedOutput: "300",
          isHidden: true
        }
      ],

      starterCode: {
        c: "#include <stdio.h>\nint main() {\n    // Write your code here\n    return 0;\n}",
        python: "# Write your code here\n",
        java: "import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Write your code here\n    }\n}",
        javascript: "// Write your code here\n"
      },

      points: 100,

      timeLimit: 5,

      memoryLimit: 128000,

      createdBy: admin._id,

      isPublished: true,

      category: "Mathematics",

      isActive: true
    });

    console.log("\nChallenge created successfully!");
    console.log("Challenge ID:", challenge._id);
    console.log("Title:", challenge.title);
    console.log("Difficulty:", challenge.difficulty);
    console.log("Test cases:", challenge.testCases.length);

  } catch (error) {
    console.error("Challenge creation failed:", error.message);
  } finally {
    await mongoose.disconnect();
    console.log("MongoDB Disconnected");
  }
};

seedChallenge();
