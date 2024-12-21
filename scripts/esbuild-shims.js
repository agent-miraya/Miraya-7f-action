import { Buffer } from "buffer";
globalThis.Buffer = Buffer;
globalThis.require = (name) => {
  if (name === "ethers") {
    return ethers;
  }
  throw new Error("unknown module " + name);
};
