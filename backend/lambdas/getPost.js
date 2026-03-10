const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, GetCommand } = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };

  const postId = event.pathParameters?.postId;

  if (!postId) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: "postId is required" }),
    };
  }

  try {
    const result = await docClient.send(
      new GetCommand({
        TableName: process.env.TABLE_NAME || "VoidBlogsPosts",
        Key: { postId },
      })
    );

    if (!result.Item) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: "Post not found" }),
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ post: result.Item }),
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Failed to fetch post" }),
    };
  }
};
