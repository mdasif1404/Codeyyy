import "dotenv/config";
import { executeCode } from "./services/judge0.service.js";

console.log("Testing Java...");

const result = await executeCode({
  language: "java",
  sourceCode: `
public class Main {
    public static void main(String[] args) {
        System.out.println("Java works");
    }
}
`,
});

console.log("Full Judge0 response:");
console.log(JSON.stringify(result, null, 2));