import { describe, it, expect } from "vitest";
import path from "path";
import { fileURLToPath } from "url";
import { loadScenarios } from "./scenario-loader.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const shopifyDir = path.resolve(__dirname, "../scenarios/shopify");

describe("bundled scenarios", () => {
  it("all shopify scenarios validate against the schema", () => {
    // Throws with the offending file + errors if any scenario is invalid,
    // which is exactly what breaks every production scan if it ships.
    const scenarios = loadScenarios(shopifyDir);
    expect(scenarios.length).toBeGreaterThan(0);
  });

  it("includes the policies-check scenario", () => {
    const scenarios = loadScenarios(shopifyDir);
    expect(scenarios.map((s) => s.name)).toContain("shopify-policies-check");
  });
});
