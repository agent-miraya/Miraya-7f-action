const go = async () => {
  const apiUrl = "https://api.openai.com/v1/chat/completions";
  const prompt = "Once upon a time";

  const requestData = {
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: "Say this is a test!" }],
    temperature: 0.7,
  };

  const resp = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + openaiApiKey,
    },
    body: JSON.stringify(requestData),
  }).then((response) => response.json());

  const answer = resp?.choices?.[0]?.message?.content;

  console.log(answer);
};

go();
