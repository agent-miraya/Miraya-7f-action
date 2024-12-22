import {
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
  clusterApiUrl,
} from "@solana/web3.js";

class SolanAdapter {
  constructor(publicKey) {
    this.publicKey = publicKey;
  }

  async createBatchTransaction({ network, fundsToDistribute }) {
    const generatedSolanaPublicKey = new PublicKey(this.publicKey);

    const solanaConnection = new Connection(
      clusterApiUrl(network),
      "confirmed",
    );

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

  async createSignatureWithAction(unsignedTransaction) {
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
  }

  async distributeSolanaFunds(fundsToDistribute) {
    const transaction = await this.createBatchTransaction({
      network: "devnet",
      fundsToDistribute,
    });

    const response = await this.createSignatureWithAction(transaction);

    return response;
  }
}

const go = async () => {
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
  const solanaAdapter = new SolanAdapter(publicKey);
  const process = await solanaAdapter.distributeSolanaFunds(fundsToDistribute);

  Lit.Actions.setResponse({ response: JSON.stringify(process) });
};

go();
