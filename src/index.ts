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

  // const response = await litWrapper.createSolanaWK(LIT_EVM_PRIVATE_KEY);

  // const txn = await litWrapper.createSerializedLitTxn({
  //   wk: response?.wkInfo,
  //   toAddress: "BTBPKRJQv7mn2kxBBJUpzh3wKN567ZLdXDWcxXFQ4KaV",
  //   amount: 0.004 * Math.pow(10, 9),
  //   network: "mainnet-beta",
  //   flag: FlagForLitTxn.SOL,
  // });
  //

  const response = {
    pkpInfo: {
      tokenId:
        "0x2c9a8b4b7a2e02ebd2f78aca6856487a82a5d8f8ae2300af1088d59306ffea58",
      publicKey:
        "042a8867a3f9b7cc39b6b539aa9f8519952d4de6b654bec552f5be7f828a52c992ddf9062dcf5791e379d93c7428d4146b1cf194311f35e6d5f35ba4838101b2e6",
      ethAddress: "0x06f6859B8E9Aa3F2526dd85Ac3E1c7CFA558e1B1",
    },
    wkInfo: {
      pkpAddress: "0x06f6859B8E9Aa3F2526dd85Ac3E1c7CFA558e1B1",
      id: "b9fb1ae0-585b-4a09-8e6c-aee93cf2af06",
      generatedPublicKey: "4hG5zosn4gR6XaiXdkGCJyS84irGVpiHwa9PLToah91P",
    },
  };

  const txn = {
    serializedTransaction:
      "AQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAEDNuNZ4hcMzIQCLj8MBjbZbKj1O0HEIQkWyM5flchylUabSbZgxIicCBSbv2IV40NSqs7TwnLZxxm0IudTAQDPxgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVZ/kSfx+ePFTtxzU4c6ooFTU92P/ti+oASUKyVgO1UUBAgIAAQwCAAAAAAk9AAAAAAA=",
    chain: "mainnet-beta",
  };

  console.log({ txn, response });

  if (!response?.pkpInfo?.publicKey) {
    throw new Error("PKP public key not found in response");
  }

  // @ts-ignore
  const actionResult = await litWrapper.executeCustomActionOnSolana({
    userPrivateKey: LIT_EVM_PRIVATE_KEY,
    broadcastTransaction: true,
    litActionCode,
    pkp: response?.pkpInfo,
    wk: response?.wkInfo,
    params: {
      openaiApiKey: "OPENAI_API_KEY",
      publicKey: response?.wkInfo.generatedPublicKey,
    },
  });

  console.log("Action is: ", actionResult);

  // return;
  // const checkResult = await litWrapper.conditionalSigningOnSolana({
  //   userPrivateKey: LIT_EVM_PRIVATE_KEY,
  //   litTransaction: txn,
  //   conditionLogic: litActionCode,
  //   broadcastTransaction: true,
  //   wk: response?.wkInfo,
  //   pkp: response?.pkpInfo,
  //   params: {
  //     openaiApiKey: OPENAI_API_KEY,
  //   },
  // });
  // console.log(checkResult);
}

createLitActionAndSignSolanaTxn().then(() => console.log("completed"));
