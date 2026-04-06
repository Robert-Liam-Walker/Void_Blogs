# Void Blogs

Void Blogs is a small serverless blogging app with a React frontend and an AWS backend built from API Gateway, Lambda, and DynamoDB.

## Repo Layout

- `src/` and `public/`: React frontend
- `backend/lambdas/`: Lambda handlers and Lambda-side dependencies
- `infra/template.yaml`: AWS SAM template for the backend

## What Is In The Stack

- Frontend: React 18, Create React App
- API: API Gateway REST endpoints for list, get, create, and delete
- Compute: Node.js 18 Lambda functions
- Data: DynamoDB table `VoidBlogsPosts`

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/posts` | List all posts |
| `GET` | `/posts/{postId}` | Get a single post |
| `POST` | `/posts` | Create a post |
| `DELETE` | `/posts/{postId}` | Delete a post |

### Example POST body

```json
{
  "title": "first post into the void",
  "content": "hello? is anyone there?",
  "author": "liam",
  "tags": ["intro", "void"]
}
```

## Local Development

```bash
npm install
npm start
```

To point the frontend at a deployed API, create a `.env` file from `.env.example`:

```bash
cp .env.example .env
```

Then set:

```bash
REACT_APP_API_URL=https://YOUR_API_ID.execute-api.us-east-1.amazonaws.com/prod
```

## Backend Deploy With AWS SAM

### Prerequisites

- Node.js 18+
- AWS CLI v2
- AWS SAM CLI
- An AWS login session and region configured

### 1. Sign in to AWS CLI

This repo does not include credentials. On a fresh machine, run either:

```bash
aws configure
```

or, if you use AWS IAM Identity Center / SSO:

```bash
aws configure sso
aws sso login --profile YOUR_PROFILE
```

Confirm your session:

```bash
aws sts get-caller-identity
```

If you do not have a default region configured, use `--region us-east-1` on AWS CLI commands or set one with:

```bash
aws configure set region us-east-1
```

### 2. Build and deploy the backend

```bash
cd infra
sam build
sam deploy --guided
```

Recommended first-time answers:

- Stack name: `void-blogs`
- Region: `us-east-1`
- Confirm changes before deploy: `Y`
- Allow SAM CLI IAM role creation: `Y`
- Save arguments to config file: `Y`

After deploy, capture the `ApiUrl` output and use it in the frontend `.env`.

### 3. Inspect deployed resources with AWS CLI

Once logged in, these commands are useful for understanding the current backend state:

```bash
aws cloudformation describe-stacks --stack-name void-blogs --region us-east-1
aws dynamodb describe-table --table-name VoidBlogsPosts --region us-east-1
aws dynamodb scan --table-name VoidBlogsPosts --region us-east-1
aws lambda list-functions --region us-east-1
```

## Frontend Build and Static Hosting

```bash
npm run build
```

To host the built frontend on S3:

```bash
aws s3 mb s3://void-blogs-frontend-YOUR_ACCOUNT_ID --region us-east-1
aws s3 sync build/ s3://void-blogs-frontend-YOUR_ACCOUNT_ID --delete --region us-east-1
```

If you want website hosting behavior:

```bash
aws s3 website s3://void-blogs-frontend-YOUR_ACCOUNT_ID \
  --index-document index.html \
  --error-document index.html
```

CloudFront is still the better production choice for HTTPS and caching.

## DynamoDB Schema

**Table:** `VoidBlogsPosts`

| Attribute | Type | Notes |
|-----------|------|-------|
| `postId` | String | Partition key |
| `title` | String | Required |
| `content` | String | Required |
| `author` | String | Defaults to `anonymous` |
| `tags` | List | Array of strings |
| `createdAt` | String | ISO 8601 |
| `updatedAt` | String | ISO 8601 |

## Notes From Current Repo Inspection

- The frontend is in the repo root, not a `frontend/` folder.
- The SAM template now points to `../backend/lambdas/`, which matches the actual repo structure.
- Live AWS inspection requires credentials; on this machine the AWS CLI was installed but not authenticated when this repo was reviewed.
