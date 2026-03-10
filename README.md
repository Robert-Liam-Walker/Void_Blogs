# Void Blogs — AWS Deployment Guide

Stack: React (S3 + CloudFront) → API Gateway → Lambda → DynamoDB

---

## Prerequisites

- AWS CLI configured (`aws configure`)
- AWS SAM CLI installed (`brew install aws-sam-cli` or https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html)
- Node.js 18+

---

## 1. Deploy the Backend (Lambda + DynamoDB + API Gateway)

```bash
cd infra/

# Build the SAM app
sam build

# Deploy (first time — walks you through setup)
sam deploy --guided
# Stack name:        void-blogs
# Region:            us-east-1  (or your preferred region)
# Confirm changes:   Y
# Allow IAM:         Y
# Save config:       Y

# After deploy, note the ApiUrl output — you'll need it next
```

---

## 2. Configure the Frontend

```bash
cd frontend/

# In your React app root, create .env
echo "REACT_APP_API_URL=https://YOUR_API_ID.execute-api.us-east-1.amazonaws.com/prod" > .env

# Install deps & build
npm install
npm run build
```

---

## 3. Deploy Frontend to S3 + CloudFront

```bash
# Create an S3 bucket (must be globally unique)
aws s3 mb s3://void-blogs-frontend-YOUR_ACCOUNT_ID

# Enable static website hosting
aws s3 website s3://void-blogs-frontend-YOUR_ACCOUNT_ID \
  --index-document index.html \
  --error-document index.html

# Upload build
aws s3 sync build/ s3://void-blogs-frontend-YOUR_ACCOUNT_ID --delete

# Make public (for static hosting — or use CloudFront OAC instead)
aws s3api put-bucket-policy \
  --bucket void-blogs-frontend-YOUR_ACCOUNT_ID \
  --policy '{
    "Version":"2012-10-17",
    "Statement":[{
      "Effect":"Allow",
      "Principal":"*",
      "Action":"s3:GetObject",
      "Resource":"arn:aws:iam::s3:::void-blogs-frontend-YOUR_ACCOUNT_ID/*"
    }]
  }'
```

### Optional: Add CloudFront (recommended for HTTPS + CDN)

```bash
# Create CloudFront distribution pointing to your S3 bucket
# Easiest via AWS Console: CloudFront → Create Distribution → Origin = your S3 website endpoint
```

---

## API Endpoints

| Method | Path             | Description       |
|--------|------------------|-------------------|
| GET    | /posts           | List all posts    |
| GET    | /posts/{postId}  | Get single post   |
| POST   | /posts           | Create post       |
| DELETE | /posts/{postId}  | Delete post       |

### Example POST body:
```json
{
  "title": "first post into the void",
  "content": "hello? is anyone there?",
  "author": "liam",
  "tags": ["intro", "void"]
}
```

---

## DynamoDB Schema

**Table:** `VoidBlogsPosts`  
**Billing:** PAY_PER_REQUEST (free tier friendly)

| Attribute  | Type   | Notes                  |
|------------|--------|------------------------|
| postId     | String | Partition key (UUID)   |
| title      | String |                        |
| content    | String |                        |
| author     | String | defaults to "anonymous"|
| tags       | List   | array of strings       |
| createdAt  | String | ISO 8601               |
| updatedAt  | String | ISO 8601               |

---

## Cost Estimate

At hobby/personal blog traffic this stack is **effectively $0/month**:
- DynamoDB: free tier (25GB, 25 RCU/WCU)
- Lambda: free tier (1M requests/month)
- API Gateway: ~$3.50/million requests
- S3: pennies for static files
- CloudFront: free tier (1TB transfer/month)
