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

async function createSerializedLitTxn({
  toAddress,
  amount,
  network,
  flag,
  tokenMintAddress,
}) {
  const generatedSolanaPublicKey = new PublicKey(publicKey);

  const receiverPublicKey = new PublicKey(toAddress);

  const solanaConnection = new Connection(clusterApiUrl(network), "confirmed");

  const { blockhash } = await solanaConnection.getLatestBlockhash();

  if (flag == "SOL") {
    const solanaTransaction = new Transaction();
    solanaTransaction.add(
      SystemProgram.transfer({
        fromPubkey: generatedSolanaPublicKey,
        toPubkey: receiverPublicKey,
        lamports: amount,
      }),
    );
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
  } else if (flag == "CUSTOM") {
    if (tokenMintAddress == undefined) {
      console.error(
        "Token mint address is required for custom token transfer txn",
      );
      return;
    }

    const tokenAccount = await getAssociatedTokenAddress(
      new PublicKey(tokenMintAddress),
      generatedSolanaPublicKey,
    );

    const destinationAccount = await getAssociatedTokenAddress(
      new PublicKey(tokenMintAddress),
      receiverPublicKey,
    );

    const transaction = new Transaction();

    // Check if destination token account exists
    const destinationAccountInfo =
      await solanaConnection.getAccountInfo(destinationAccount);
    if (!destinationAccountInfo) {
      transaction.add(
        createAssociatedTokenAccountInstruction(
          generatedSolanaPublicKey,
          destinationAccount,
          receiverPublicKey,
          new PublicKey(tokenMintAddress),
        ),
      );
    }

    // Add transfer instruction
    transaction.add(
      createTransferInstruction(
        tokenAccount,
        destinationAccount,
        generatedSolanaPublicKey,
        amount,
      ),
    );

    transaction.feePayer = generatedSolanaPublicKey;

    const { blockhash } = await solanaConnection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;

    const serializedTransaction = transaction
      .serialize({
        requireAllSignatures: false,
        verifySignatures: false,
      })
      .toString("base64");

    const litTransaction = {
      serializedTransaction,
      chain: network,
    };

    return litTransaction;
  } else {
    console.error("Invalid flag for Lit Transaction");
  }
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
  console.log(response);
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

  const start = performance.now();
  // Your function or code here

  const transactions = await Promise.all(
    fundsToDistribute.map(async (fundObj) => {
      return await createSerializedLitTxn({
        toAddress: fundObj.address,
        amount: fundObj.amount,
        network: "devnet",
        flag: "SOL",
      });
    }),
  );
  const end = performance.now();

  const executionTime = end - start;

  console.log(`Execution time transactions: ${executionTime} milliseconds`);

  const startRes = performance.now();

  const responses = await Promise.all(
    transactions.map(async (t) => {
      return await createSignatureWithAction(t);
    }),
  );

  const endRes = performance.now();

  const executionTimeres = endRes - startRes;

  console.log(`Execution time executionTimeres: ${executionTimeres} milliseconds`);

  return responses;
};

const go = async () => {
  const process = await distributeSolanaFunds();

  Lit.Actions.setResponse({ response: JSON.stringify(process) });
};

go();
