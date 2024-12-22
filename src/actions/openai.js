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
      const distribution = await this.calculateDistribution(
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

  async calculateDistribution(tweetData, totalAmount) {
    const systemPrompt = `You are a crypto distribution calculator.
      Analyze the tweet data and allocate amounts to influencers based on their engagement and impact.
      The total amount to distribute is ${totalAmount}.
      Consider impressions, likes, retweets and overall reach.
      Return ONLY a JSON array of objects with username and amount fields.
      The result should be fair and square. No negative amounts.

      Example format: [{"username": "user1", "amount": 100}, {"username": "user2", "amount": 200}].
      The key of JSON will be distributions`;

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
      if (totalCalculated > totalAmount) {
        throw new Error("Distribution exceeds match total amount");
      }

      return result;
    } catch (error) {
      console.error("Error calculating distribution:", error);
      throw error;
    }
  }
}

async function testTweetAnalyzer() {
  try {
    const analyzer = new TweetAnalyzer(testTweets, totalAmount, openaiApiKey);
    const result = await analyzer.process();
    console.log("Distribution Result:", result);
  } catch (error) {
    console.error("Test Error:", error);
  }
}

testTweetAnalyzer();
