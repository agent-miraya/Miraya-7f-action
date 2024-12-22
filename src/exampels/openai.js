import "dotenv/config";

const openaiApiKey = process.env.OPENAI_API_KEY;

const apiUrl = "https://api.openai.com/v1/chat/completions";

async function calculateDistribution(tweetData, totalAmount) {
  const systemPrompt = `You are a crypto distribution calculator. Analyze the tweet data and allocate amounts to influencers based on their engagement and impact. The total amount to distribute is ${totalAmount}. Consider impressions, likes, retweets and overall reach. Return ONLY a JSON array of objects with username and amount fields. Example format: [{"username": "user1", "amount": 100}, {"username": "user2", "amount": 200}]. the key of JSON will be distributions`;

  const userPrompt = `Tweet Data: ${JSON.stringify(tweetData)}. Total Amount to Distribute: ${totalAmount}`;


  try {
    const requestData = {
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.3,
      max_tokens: 1000,
      response_format: { type: "json_object" },
    };

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + openaiApiKey,
      },
      body: JSON.stringify(requestData),
    }).then((response) => response.json());

    const res = JSON.parse(response.choices[0].message.content);
    const result = res?.distributions

    console.log("result", result)

    // Validate response format
    if (!Array.isArray(result)) {
      throw new Error("Invalid response format from OpenAI");
    }

    // Validate total amount matches
    const totalCalculated = result.reduce((acc, curr) => acc + curr.amount, 0);
    if (Math.abs(totalCalculated - totalAmount) > 0.01) {
      throw new Error("Distribution amounts do not match total amount");
    }

    return result;
  } catch (error) {
    console.error("Error calculating distribution:", error);
    throw error;
  }
}

class TweetAnalyzer {
  constructor(tweets, totalAmount) {
    this.tweets = tweets;
    this.totalAmount = totalAmount;
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
      const distribution = await calculateDistribution(
        processedData,
        this.totalAmount,
      );

      // Post-process and validate distribution
      const validatedDistribution = this.validateDistribution(distribution);

      return validatedDistribution;
    } catch (error) {
      console.error("Error in tweet analysis:", error);
      throw error;
    }
  }

  validateDistribution(distribution) {
    // Ensure all tweets have corresponding distribution
    const validatedDist = distribution.filter((dist) => {
      return this.tweets.some((tweet) => tweet.username === dist.username);
    });

    // Ensure no negative amounts
    validatedDist.forEach((dist) => {
      if (dist.amount < 0) dist.amount = 0;
    });

    return validatedDist;
  }
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
  },
  {
    username: "blockchain_guru",
    message: "Great analysis on the latest market trends. Must read! #bitcoin",
    impressions: 15000,
    likes: 280,
    retweets: 85,
    followers: 30000,
    timestamp: "2024-01-15T11:00:00Z",
  },
  {
    username: "defi_expert",
    message: "This project is revolutionizing the space! 🚀 #cryptocurrency",
    impressions: 18000,
    likes: 320,
    retweets: 95,
    followers: 35000,
    timestamp: "2024-01-15T09:45:00Z",
  },
  {
    username: "nft_collector",
    message: "Check out this innovative approach to DeFi! #web3 #defi",
    impressions: 12000,
    likes: 180,
    retweets: 60,
    followers: 25000,
    timestamp: "2024-01-15T12:15:00Z",
  },
];

// Test implementation
async function testTweetAnalyzer() {
  try {
    const totalAmount = 1000; // Amount to distribute (e.g., 1000 tokens)
    const analyzer = new TweetAnalyzer(testTweets, totalAmount);
    const result = await analyzer.process();
    console.log("Distribution Result:", result);
  } catch (error) {
    console.error("Test Error:", error);
  }
}

testTweetAnalyzer();
