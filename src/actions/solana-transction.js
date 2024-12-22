import {
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
  clusterApiUrl,
} from "@solana/web3.js";

import {
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  createTransferInstruction,
} from "@solana/spl-token";

async function createBatchTransaction({ network, fundsToDistribute }) {
  const generatedSolanaPublicKey = new PublicKey(publicKey);

  const solanaConnection = new Connection(clusterApiUrl(network), "confirmed");

  const { blockhash } = await solanaConnection.getLatestBlockhash();

  const solanaTransaction = new Transaction();

  fundsToDistribute.forEach((fundObj) => {
    const receiverPublicKey = new PublicKey(fundObj.address);

    solanaTransaction.add(
      SystemProgram.transfer({
        fromPubkey: generatedSolanaPublicKey,
        toPubkey: receiverPublicKey,
        lamports: fundObj.amount,
      }),
    );
  });
  solanaTransaction.feePayer = generatedSolanaPublicKey;

  solanaTransaction.recentBlockhash = blockhash;

  const serializedTransaction = solanaTransaction
    .serialize({
      requireAllSignatures: false, // should be false as we're not signing the message
      verifySignatures: false, // should be false as we're not signing the message
    })
    .toString("base64");

  const litTransaction = {
    serializedTransaction,
    chain: network,
  };
  return litTransaction;
}

const createSignatureWithAction = async (unsignedTransaction) => {
  const response = await Lit.Actions.call({
    ipfsId: "QmR1nPG2tnmC72zuCEMZUZrrMEkbDiMPNHW45Dsm2n7xnk", // Lit Action for signing on Solana
    params: {
      accessControlConditions,
      ciphertext,
      dataToEncryptHash,
      unsignedTransaction,
      broadcast,
    },
  });

  return response;
};

const distributeSolanaFunds = async () => {
  const fundsToDistribute = [
    {
      address: "BTBPKRJQv7mn2kxBBJUpzh3wKN567ZLdXDWcxXFQ4KaV",
      amount: 0.004 * Math.pow(10, 9),
    },
    {
      address: "6r61rYYUxF24dXzms9GECWa5mt41PwH5U56nKnUmr6Fw",
      amount: 0.006 * Math.pow(10, 9),
    },
    {
      address: "J5HvPHYHsWQeHdYaTzXTRr5Cx1t6SAqvacFMsvcxgPi3",
      amount: 0.009 * Math.pow(10, 9),
    },
  ];

  const transaction = await createBatchTransaction({
    network: "devnet",
    fundsToDistribute,
  });

  const response = await createSignatureWithAction(transaction);

  return response;
};

const go = async () => {
  const process = await distributeSolanaFunds();

  Lit.Actions.setResponse({ response: JSON.stringify(process) });
};

go();
