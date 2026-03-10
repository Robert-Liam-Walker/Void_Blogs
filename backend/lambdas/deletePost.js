const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, DeleteCommand } = require("@aws-sdk/lib-dynamodb");

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
    await docClient.send(
      new DeleteCommand({
        TableName: process.env.TABLE_NAME || "VoidBlogsPosts",
        Key: { postId },
      })
    );

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: "Post deleted" }),
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Failed to delete post" }),
    };
  }
};
