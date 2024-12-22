import {
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
  clusterApiUrl,
} from "@solana/web3.js";

class TweetAnalyzer {
  constructor(tweets, totalAmount, openaiApiKey) {
    this.tweets = tweets;
    this.totalAmount = totalAmount;
    this.OPENAI_URL = "https://api.openai.com/v1/chat/completions";
    this.openaiApiKey = openaiApiKey;
  }

  async process() {
    try {
      // Preprocess tweets to required format
      const processedData = this.tweets.map((tweet) => ({
        username: tweet.username,
        message: tweet.message,
        impressions: tweet.impressions,
        likes: tweet.likes,
        retweets: tweet.retweets,
        followers: tweet.followers,
        timestamp: tweet.timestamp,
      }));

      // Get distribution from OpenAI
      const distributions = await this.calculateDistribution(processedData);

      const amountResolved = this.tweets.map((tweet) => {
        const tweetDistribution = distributions.find(
          (t) => t.username === tweet.username,
        );

        const amount =
          ((tweetDistribution?.amount ?? 0) * this.totalAmount) / 100;

        return {
          username: tweet.username,
          amount: amount > 0 ? amount : 0,
          address: tweet.publicKey,
        };
      });

      return amountResolved;
    } catch (error) {
      console.error("Error in tweet analysis:", error);
      throw error;
    }
  }

  // I have used tokenAmount = 100 to make model more deterministic. I will use them as percentage to distribute among users. In case of amount iw was hacing issues such as sum != 100.
  async calculateDistribution(tweetData) {
    const systemPrompt = `
      You are a crypto distribution calculator.
      You have to distribute 100 tokens among the list of users tweets.
      Analyze the tweet data and allocate amounts to influencers based on their engagement and impact.
      The total tokens to distribute is 100.
      Consider impressions, likes, retweets and overall reach.
      Return ONLY a JSON array of objects with username and amount fields.
      The result should be fair and square. No negative tokens.
      Example output format: [{"username": "user1", "amount": 60}, {"username": "user2", "amount":  40}].
      The key of JSON will be distributions
    `;

    const userPrompt = `Tweet Data: ${JSON.stringify(tweetData)}. Total Tokens to Distribute: 100`;

    try {
      const requestData = {
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.4,
        max_tokens: 1000,
        response_format: { type: "json_object" },
      };

      const response = await fetch(this.OPENAI_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + this.openaiApiKey,
        },
        body: JSON.stringify(requestData),
      }).then((response) => response.json());

      const res = JSON.parse(response.choices[0].message.content);
      const result = res?.distributions;

      // Validate response format
      if (!Array.isArray(result)) {
        throw new Error("Invalid response format from OpenAI");
      }
      // Validate total amount matches
      const totalCalculated = result.reduce(
        (acc, curr) => acc + curr.amount,
        0,
      );
      if (totalCalculated > 100) {
        throw new Error("Distribution exceeds match total amount");
      }

      return result;
    } catch (error) {
      console.error("Error calculating distribution:", error);
      throw error;
    }
  }
}

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

async function distributeFunds() {
  try {
    const tweetAnalyzer = new TweetAnalyzer(
      testTweets,
      totalAmount,
      openaiApiKey,
    );

    const openAiInferenceResult = await tweetAnalyzer.process();

    const fundsToDistribute = openAiInferenceResult.map((result) => ({
      address: result.address,
      amount: result.amount * Math.pow(10, 9),
    }));

    console.log("fundsToDistribute: ", fundsToDistribute);

    const solanaAdapter = new SolanAdapter(publicKey);
    const process =
      await solanaAdapter.distributeSolanaFunds(fundsToDistribute);

    Lit.Actions.setResponse({ response: JSON.stringify(process) });
  } catch (error) {
    console.error("Test Error:", error);
  }
}

distributeFunds();
