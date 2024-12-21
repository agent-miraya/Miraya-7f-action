import { LitWrapper } from "lit-wrapper-sdk";
import { FlagForLitTxn } from "lit-wrapper-sdk/types";
import { getBundledAction } from "./utils";
import "dotenv/config";

const litWrapper = new LitWrapper("datil-dev");

const LIT_EVM_PRIVATE_KEY = process.env.LIT_EVM_PRIVATE_KEY as string;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY as string;

if (!LIT_EVM_PRIVATE_KEY) {
  throw new Error("LIT_EVM_PRIVATE_KEY is required");
}

async function createLitActionAndSignSolanaTxn() {
  const litActionCode = await getBundledAction("solana-transction");

  const response = await litWrapper.createSolanaWK(LIT_EVM_PRIVATE_KEY);

  const txn = await litWrapper.createSerializedLitTxn({
    wk: response?.wkInfo,
    toAddress: "BTBPKRJQv7mn2kxBBJUpzh3wKN567ZLdXDWcxXFQ4KaV",
    amount: 0.004 * Math.pow(10, 9),
    network: "mainnet-beta",
    flag: FlagForLitTxn.SOL,
  });

  console.log({ txn, response });

  const checkResult = await litWrapper.conditionalSigningOnSolana({
    userPrivateKey: LIT_EVM_PRIVATE_KEY,
    litTransaction: txn,
    conditionLogic: litActionCode,
    broadcastTransaction: true,
    wk: response?.wkInfo,
    pkp: response?.pkpInfo,
    params: {
      openaiApiKey: OPENAI_API_KEY,
    },
  });
  console.log(checkResult);
}

createLitActionAndSignSolanaTxn();
