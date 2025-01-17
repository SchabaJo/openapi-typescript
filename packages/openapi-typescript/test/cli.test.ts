import { execa } from "execa";
import fs from "node:fs";
import { URL, fileURLToPath } from "node:url";
import os from "node:os";

const root = new URL("../", import.meta.url);
const cwd = os.platform() === "win32" ? fileURLToPath(root) : root; // execa bug: fileURLToPath required on Windows
const cmd = "./bin/cli.js";
const TIMEOUT = 90000;

describe("CLI", () => {
  // note: the snapshots in index.test.ts test the Node API; these test the CLI
  describe("snapshots", () => {
    test(
      "GitHub API",
      async () => {
        const { stdout } = await execa(cmd, ["./examples/github-api.yaml"], { cwd });
        expect(stdout).toMatchFileSnapshot(fileURLToPath(new URL("./examples/github-api.ts", root)));
      },
      TIMEOUT,
    );
    test(
      "GitHub API (next)",
      async () => {
        const { stdout } = await execa(cmd, ["./examples/github-api-next.yaml"], { cwd });
        expect(stdout).toMatchFileSnapshot(fileURLToPath(new URL("./examples/github-api-next.ts", root)));
      },
      TIMEOUT,
    );
    test(
      "Octokit GHES 3.6 Diff to API",
      async () => {
        const { stdout } = await execa(cmd, ["./examples/octokit-ghes-3.6-diff-to-api.json"], { cwd });
        expect(stdout).toMatchFileSnapshot(fileURLToPath(new URL("./examples/octokit-ghes-3.6-diff-to-api.ts", root)));
      },
      TIMEOUT,
    );
    test(
      "Stripe API",
      async () => {
        const { stdout } = await execa(cmd, ["./examples/stripe-api.yaml"], { cwd });
        expect(stdout).toMatchFileSnapshot(fileURLToPath(new URL("./examples/stripe-api.ts", root)));
      },
      TIMEOUT,
    );
    // this test runs too slowly on macos / windows in GitHub Actions (but not natively)
    test.skipIf(process.env.CI_ENV === "macos" || process.env.CI_ENV === "windows")(
      "DigitalOcean API (remote $refs)",
      async () => {
        const { stdout } = await execa(cmd, ["./examples/digital-ocean-api/DigitalOcean-public.v2.yaml"], {
          cwd,
        });
        expect(stdout).toMatchFileSnapshot(fileURLToPath(new URL("./examples/digital-ocean-api.ts", root)));
      },
      TIMEOUT,
    );
    test(
      "stdin",
      async () => {
        const input = fs.readFileSync(new URL("./examples/stripe-api.yaml", root));
        const { stdout } = await execa(cmd, { input });
        expect(stdout).toMatchFileSnapshot(fileURLToPath(new URL("./examples/stripe-api.ts", root)));
      },
      TIMEOUT,
    );
  });

  describe("flags", () => {
    test("--help", async () => {
      const { stdout } = await execa(cmd, ["--help"], { cwd });
      expect(stdout).toEqual(expect.stringMatching(/^Usage\n\s+\$ openapi-typescript \[input\] \[options\]/));
    });

    test("--version", async () => {
      const { stdout } = await execa(cmd, ["--version"], { cwd });
      expect(stdout).toEqual(expect.stringMatching(/^v[\d.]+(-.*)?$/));
    });
  });
});
