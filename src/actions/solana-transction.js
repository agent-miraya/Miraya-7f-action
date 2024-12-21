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

const publicKey = "AfmomJij2VYEd5kWnpQiEhdfonQhk2gAANKmrYz4JC4u";

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

const go = async () => {
  const transactionObject = await createSerializedLitTxn({
    toAddress: "BTBPKRJQv7mn2kxBBJUpzh3wKN567ZLdXDWcxXFQ4KaV",
    amount: 0.004 * Math.pow(10, 9),
    network: "mainnet-beta",
    flag: "SOL",
  });

  console.log("transactionObject", transactionObject);
};

go();
