import esbuild from "esbuild";
import copyStaticFiles from "esbuild-copy-static-files";
import pino from "esbuild-plugin-pino";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import chokidar from "chokidar";

const argv = yargs(hideBin(process.argv))
  .option("watch", {
    alias: "w",
    description: "watch for changes",
    type: "boolean",
    default: false,
  })
  .help()
  .alias("help", "h").argv;

const build = () => {
  console.log("Building...");
  esbuild.build({
    entryPoints: ["./src/index.ts"],
    outdir: `./dist`,
    bundle: true,
    minify: true,
    sourcemap: true,
    platform: "node",
    target: "node20",
    logLevel: "info",
    color: true,
    plugins: [
      copyStaticFiles({
        src: "./templates",
        dest: `./dist/templates`,
        recursive: true,
      }),
      pino({ transports: ["pino-pretty"] }),
    ],
  });
};

build();
if (argv.watch) {
  console.log("Watching...");
  const watcher = chokidar.watch(["src", "templates", "static"], {
    ignored: /(^|[\/\\])\../,
    persistent: true,
  });

  watcher.on("change", () => build(argv.target));
}
