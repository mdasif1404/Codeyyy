
import "dotenv/config";
import mongoose from "mongoose";

import Challenge from "./models/Challenge.js";
import User from "./models/User.js";

// Runnable starter templates.
// Players complete the TODO section for each challenge.
const createStarterCode = (hint) => ({
  c: `#include <stdio.h>
#include <string.h>
#include <stdlib.h>

int main() {
    // Read the input and solve the problem.
    // TODO: ${hint}

    return 0;
}`,
  python: `import sys

def solve():
    data = sys.stdin.read().strip().split()

    # TODO: ${hint}

if __name__ == "__main__":
    solve()
`,
  java: `import java.util.*;
import java.io.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);

        // TODO: ${hint}

        sc.close();
    }
}`,
  javascript: `const fs = require("fs");
const input = fs.readFileSync(0, "utf8").trim();

// TODO: ${hint}
`
});

const challenges = [
  // ================= EASY =================

  {
    title: "The Treasure Collector",
    difficulty: "Easy",
    category: "Mathematics",
    description: `Story:
Alex is exploring a mysterious island. He finds a treasure chest containing some gold coins. His friend gives him some additional coins.

Alex wants to know how many coins they have altogether.

Your Task:
Write a program that reads two integers and prints their sum.`,
    inputFormat: "Two integers A and B separated by a space.",
    outputFormat: "Print the sum of A and B.",
    constraints: ["0 <= A, B <= 100000"],
    examples: [{
      input: "15 25",
      expectedOutput: "40",
      explanation: "15 + 25 = 40 coins."
    }],
    testCases: [
      { input: "15 25", expectedOutput: "40", isHidden: false },
      { input: "10 20", expectedOutput: "30", isHidden: false },
      { input: "0 5", expectedOutput: "5", isHidden: true },
      { input: "999 1", expectedOutput: "1000", isHidden: true }
    ],
    starterCode: createStarterCode("Read two integers and print their sum."),
    points: 100
  },

  {
    title: "The Highest Game Score",
    difficulty: "Easy",
    category: "Mathematics",
    description: `Story:
Three friends participate in a gaming competition. Each player earns a different score.

The game organizer wants to announce the player with the highest score.

Your Task:
Read three integers and print the largest number.`,
    inputFormat: "Three integers A, B and C separated by spaces.",
    outputFormat: "Print the largest of the three integers.",
    constraints: ["-100000 <= A, B, C <= 100000"],
    examples: [{
      input: "45 89 67",
      expectedOutput: "89",
      explanation: "89 is the highest score."
    }],
    testCases: [
      { input: "45 89 67", expectedOutput: "89", isHidden: false },
      { input: "10 20 30", expectedOutput: "30", isHidden: false },
      { input: "-5 -2 -10", expectedOutput: "-2", isHidden: true },
      { input: "50 50 20", expectedOutput: "50", isHidden: true }
    ],
    starterCode: createStarterCode("Read three integers and print the largest."),
    points: 100
  },

  {
    title: "The Secret Message",
    difficulty: "Easy",
    category: "Strings",
    description: `Story:
Mia receives a secret message from her friend. Before sending it to the team, she wants to know how many vowels it contains.

Your Task:
Read a single word and count its vowels (a, e, i, o, u). Treat uppercase and lowercase letters equally.`,
    inputFormat: "A single word containing English letters.",
    outputFormat: "Print the number of vowels.",
    constraints: ["1 <= word length <= 1000"],
    examples: [{
      input: "Coding",
      expectedOutput: "2",
      explanation: "The vowels are o and i."
    }],
    testCases: [
      { input: "Coding", expectedOutput: "2", isHidden: false },
      { input: "HELLO", expectedOutput: "2", isHidden: false },
      { input: "sky", expectedOutput: "0", isHidden: true },
      { input: "education", expectedOutput: "5", isHidden: true }
    ],
    starterCode: createStarterCode("Read a word and count its vowels."),
    points: 100
  },

  {
    title: "The Backward Password",
    difficulty: "Easy",
    category: "Strings",
    description: `Story:
A security game gives players a word and asks them to reveal its backward version.

For example, the word CODE becomes EDOC.

Your Task:
Read a word and print it in reverse order.`,
    inputFormat: "A single word containing English letters or digits.",
    outputFormat: "Print the reversed word.",
    constraints: ["1 <= word length <= 1000"],
    examples: [{
      input: "CODE",
      expectedOutput: "EDOC",
      explanation: "Reading CODE backward gives EDOC."
    }],
    testCases: [
      { input: "CODE", expectedOutput: "EDOC", isHidden: false },
      { input: "hello", expectedOutput: "olleh", isHidden: false },
      { input: "12345", expectedOutput: "54321", isHidden: true },
      { input: "a", expectedOutput: "a", isHidden: true }
    ],
    starterCode: createStarterCode("Read a word and print it in reverse."),
    points: 100
  },

  // ================= MEDIUM =================

  {
    title: "The Runner-Up",
    difficulty: "Medium",
    category: "Arrays",
    description: `Story:
A school organizes a running competition. Many students participate, and each student receives a score.

The organizer wants to find the second-highest distinct score, not the second position in the list.

Your Task:
Read N scores and print the second-largest distinct score.`,
    inputFormat: "The first line contains N. The second line contains N space-separated integers.",
    outputFormat: "Print the second-largest distinct score. Print -1 if it does not exist.",
    constraints: ["2 <= N <= 100000", "0 <= score <= 1000000"],
    examples: [{
      input: "5\n10 20 20 8 15",
      expectedOutput: "15",
      explanation: "The largest score is 20 and the second-largest distinct score is 15."
    }],
    testCases: [
      { input: "5\n10 20 20 8 15", expectedOutput: "15", isHidden: false },
      { input: "4\n1 2 3 4", expectedOutput: "3", isHidden: false },
      { input: "3\n5 5 5", expectedOutput: "-1", isHidden: true },
      { input: "5\n100 90 80 90 70", expectedOutput: "90", isHidden: true }
    ],
    starterCode: createStarterCode("Read N scores and find the second-largest distinct value."),
    points: 200
  },

  {
    title: "The Delivery Line",
    difficulty: "Medium",
    category: "Sorting",
    description: `Story:
A delivery company receives packages with different priority numbers. The manager wants to arrange the packages from the lowest priority number to the highest.

Your Task:
Read N integers, sort them in ascending order, and print them.`,
    inputFormat: "The first line contains N. The second line contains N space-separated integers.",
    outputFormat: "Print the sorted integers in one line, separated by spaces.",
    constraints: ["1 <= N <= 100000", "-100000 <= value <= 100000"],
    examples: [{
      input: "5\n5 2 8 1 3",
      expectedOutput: "1 2 3 5 8",
      explanation: "The numbers are arranged from smallest to largest."
    }],
    testCases: [
      { input: "5\n5 2 8 1 3", expectedOutput: "1 2 3 5 8", isHidden: false },
      { input: "4\n9 7 5 3", expectedOutput: "3 5 7 9", isHidden: false },
      { input: "3\n2 2 1", expectedOutput: "1 2 2", isHidden: true },
      { input: "4\n-5 0 10 -2", expectedOutput: "-5 -2 0 10", isHidden: true }
    ],
    starterCode: createStarterCode("Read N integers, sort them in ascending order and print them."),
    points: 200
  },

  {
    title: "The Missing Inventory",
    difficulty: "Medium",
    category: "Arrays",
    description: `Story:
A shopkeeper checks the number of times a particular product appears in the inventory list.

He gives you a list of product numbers and one target number.

Your Task:
Count how many times the target number appears in the list.`,
    inputFormat: "The first line contains N. The second line contains N integers. The third line contains the target integer.",
    outputFormat: "Print the number of occurrences of the target.",
    constraints: ["1 <= N <= 100000", "0 <= array values <= 1000000"],
    examples: [{
      input: "6\n2 4 2 5 2 7\n2",
      expectedOutput: "3",
      explanation: "The number 2 appears three times."
    }],
    testCases: [
      { input: "6\n2 4 2 5 2 7\n2", expectedOutput: "3", isHidden: false },
      { input: "5\n1 2 3 4 5\n6", expectedOutput: "0", isHidden: false },
      { input: "4\n7 7 7 7\n7", expectedOutput: "4", isHidden: true },
      { input: "5\n1 1 2 2 3\n2", expectedOutput: "2", isHidden: true }
    ],
    starterCode: createStarterCode("Read the array and target number, then count target occurrences."),
    points: 200
  },

  {
    title: "The Safe Door",
    difficulty: "Medium",
    category: "Stacks",
    description: `Story:
A secret room has a special door. It opens only when every opening bracket has a matching closing bracket in the correct order.

For example, ()[]{} is valid, but ([)] is not.

Your Task:
Check whether the given bracket sequence is balanced. Print YES if it is balanced, otherwise print NO.`,
    inputFormat: "A string containing only (, ), [, ], { and }.",
    outputFormat: "Print YES or NO.",
    constraints: ["1 <= string length <= 100000"],
    examples: [{
      input: "({[]})",
      expectedOutput: "YES",
      explanation: "Every opening bracket has a matching closing bracket in the correct order."
    }],
    testCases: [
      { input: "({[]})", expectedOutput: "YES", isHidden: false },
      { input: "([)]", expectedOutput: "NO", isHidden: false },
      { input: "((()))", expectedOutput: "YES", isHidden: true },
      { input: "{[}", expectedOutput: "NO", isHidden: true }
    ],
    starterCode: createStarterCode("Read a bracket string and check whether it is balanced."),
    points: 200
  },

  // ================= HARD =================

  {
    title: "The Treasure Exchange",
    difficulty: "Hard",
    category: "Dynamic Programming",
    description: `Story:
A treasure trader has coins of different values. A customer wants to pay an exact amount.

The trader wants to use the smallest possible number of coins. He has an unlimited supply of each coin value.

Your Task:
Given the coin values and the target amount, find the minimum number of coins needed. Print -1 if the amount cannot be formed.`,
    inputFormat: "The first line contains N and X, where N is the number of coin types and X is the target amount. The second line contains N coin values.",
    outputFormat: "Print the minimum number of coins required, or -1 if impossible.",
    constraints: ["1 <= N <= 100", "1 <= X <= 10000", "1 <= coin value <= 10000"],
    examples: [{
      input: "3 6\n1 3 4",
      expectedOutput: "2",
      explanation: "The amount 6 can be made using two coins of value 3."
    }],
    testCases: [
      { input: "3 6\n1 3 4", expectedOutput: "2", isHidden: false },
      { input: "3 11\n1 5 7", expectedOutput: "3", isHidden: false },
      { input: "2 3\n2 4", expectedOutput: "-1", isHidden: true },
      { input: "1 10\n2", expectedOutput: "5", isHidden: true }
    ],
    starterCode: createStarterCode("Use dynamic programming to find the minimum number of coins."),
    points: 300
  },

  {
    title: "The Island Network",
    difficulty: "Hard",
    category: "Graphs",
    description: `Story:
A group of islands is connected by bridges. A traveler wants to move from one island to another using as few bridges as possible.

Every bridge connects two islands, and each bridge can be used in either direction.

Your Task:
Given the island connections, a starting island and a destination island, find the minimum number of bridges needed. Print -1 if no route exists.`,
    inputFormat: "The first line contains N and M. The next M lines each contain two integers U and V describing a bridge. The final line contains S and D, the starting and destination islands. Islands are numbered from 1 to N.",
    outputFormat: "Print the minimum number of bridges, or -1 if no route exists.",
    constraints: ["1 <= N <= 100000", "0 <= M <= 200000", "1 <= S, D, U, V <= N"],
    examples: [{
      input: "5 5\n1 2\n2 3\n3 4\n1 5\n5 4\n1 4",
      expectedOutput: "2",
      explanation: "The shortest route is 1 -> 5 -> 4, which uses two bridges."
    }],
    testCases: [
      { input: "5 5\n1 2\n2 3\n3 4\n1 5\n5 4\n1 4", expectedOutput: "2", isHidden: false },
      { input: "4 2\n1 2\n3 4\n1 4", expectedOutput: "-1", isHidden: false },
      { input: "3 2\n1 2\n2 3\n1 3", expectedOutput: "2", isHidden: true },
      { input: "4 4\n1 2\n1 3\n2 4\n3 4\n1 4", expectedOutput: "2", isHidden: true }
    ],
    starterCode: createStarterCode("Use breadth-first search (BFS) to find the shortest route."),
    points: 300
  }
];

const seedChallenges = async () => {
  try {
    if (!process.env.MONGO_URL) {
      throw new Error("MONGO_URL is missing from your .env file.");
    }

    await mongoose.connect(process.env.MONGO_URL);
    console.log("MongoDB Connected");

    const creator = await User.findOne({ isActive: true }).select("_id");

    if (!creator) {
      throw new Error("No active user found. Register a user before seeding challenges.");
    }

    let inserted = 0;
    let skipped = 0;

    for (const challengeData of challenges) {
      const existing = await Challenge.findOne({
        title: challengeData.title
      });

      if (existing) {
        console.log(`Skipped existing challenge: ${challengeData.title}`);
        skipped++;
        continue;
      }

      await Challenge.create({
        ...challengeData,
        createdBy: creator._id,
        isPublished: true,
        isActive: true,
        timeLimit: 5,
        memoryLimit: 128000
      });

      console.log(`Inserted: ${challengeData.title}`);
      inserted++;
    }

    console.log("\nChallenge seeding completed.");
    console.log(`Inserted: ${inserted}`);
    console.log(`Skipped: ${skipped}`);
    console.log(`Total defined in seed file: ${challenges.length}`);
  } catch (error) {
    console.error("Challenge seeding failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log("MongoDB disconnected");
  }
};

seedChallenges();
