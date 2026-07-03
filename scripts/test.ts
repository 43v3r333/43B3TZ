import { runTestSuite } from "../server/tests/core.test";

console.log("----------------------------------------------------------------");
console.log("Executing Enterprise Test Suite...");
console.log("----------------------------------------------------------------");

runTestSuite()
  .then(() => {
    console.log("Success: All core platform services passed verification checks.");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Failure: Core platform tests encountered error conditions:", err);
    process.exit(1);
  });
