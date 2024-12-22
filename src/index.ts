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

const testTweets = [
  {
    username: "crypto_whale",
    message: "Just discovered this amazing new DeFi project! #crypto #defi",
    impressions: 25000,
    likes: 450,
    retweets: 120,
    followers: 50000,
    timestamp: "2024-01-15T10:30:00Z",
    publicKey: "BTBPKRJQv7mn2kxBBJUpzh3wKN567ZLdXDWcxXFQ4KaV",
  },
  {
    username: "blockchain_guru",
    message: "Great analysis on the latest market trends. Must read! #bitcoin",
    impressions: 15000,
    likes: 280,
    retweets: 85,
    followers: 30000,
    timestamp: "2024-01-15T11:00:00Z",
    publicKey: "6r61rYYUxF24dXzms9GECWa5mt41PwH5U56nKnUmr6Fw",
  },
  {
    username: "defi_expert",
    message: "This project is revolutionizing the space! 🚀 #cryptocurrency",
    impressions: 18000,
    likes: 320,
    retweets: 95,
    followers: 35000,
    timestamp: "2024-01-15T09:45:00Z",
    publicKey: "J5HvPHYHsWQeHdYaTzXTRr5Cx1t6SAqvacFMsvcxgPi3",
  }
];
const totalAmount = 0.1;

async function createLitActionAndSignSolanaTxn() {
  // const litActionCode = await getBundledAction("solana-transction");
  const litActionCode = await getBundledAction("distribute-funds");

  // const response = await litWrapper.createSolanaWK(LIT_EVM_PRIVATE_KEY);

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

  console.log({ response });

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
      openaiApiKey: OPENAI_API_KEY,
      publicKey: response?.wkInfo.generatedPublicKey,
      testTweets,
      totalAmount,
    },
  });

  console.log("Action is: ", actionResult);
}

createLitActionAndSignSolanaTxn().then(() => console.log("completed"));
