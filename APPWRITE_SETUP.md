# Appwrite Setup Guide — Blogify

Run through this checklist in your Appwrite Console for every feature to work correctly.

---

## 1. Posts Collection — Add These Attributes

Appwrite Console → Databases → Your Database → Posts Collection → Attributes tab

| Field Name   | Type           | Default  | Required |
|--------------|----------------|----------|----------|
| `likes`      | Integer        | `0`      | No       |
| `views`      | Integer        | `0`      | No       |
| `dislikes`   | Integer        | `0`      | No       |
| `authorName` | String (100)   | —        | No       |
| `gallery`    | String (Array) | —        | No       |
| `category`   | String (50)    | `Other`  | No       |
| `sentiment`  | String (20)    | `Neutral`| No       |
| `tags`       | String (Array) | —        | No       |

---

## 2. Comments Collection (New)

Appwrite Console → Databases → Create Collection → Name: `comments`

Copy the **Collection ID** — you'll need it for `.env`.

| Field Name | Type   | Size | Required |
|------------|--------|------|----------|
| `postId`   | String | 36   | Yes      |
| `userId`   | String | 36   | Yes      |
| `userName` | String | 100  | Yes      |
| `content`  | String | 5000 | Yes      |

**Permissions:** Add role `users` → allow `create`, `read`, `delete`
**Realtime:** Enable Realtime events on this collection (needed for live comments).

---

## 3. Follows Collection (New)

Appwrite Console → Databases → Create Collection → Name: `follows`

Copy the **Collection ID**.

| Field Name    | Type   | Size | Required |
|---------------|--------|------|----------|
| `followerId`  | String | 36   | Yes      |
| `followingId` | String | 36   | Yes      |

**Permissions:** Add role `users` → allow `create`, `read`, `delete`

---

## 4. .env File

```bash
# Existing Appwrite config
VITE_APPWRITE_URL=https://cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=your_project_id
VITE_APPWRITE_DATABASE_ID=your_database_id
VITE_APPWRITE_COLLECTION_ID=your_posts_collection_id
VITE_APPWRITE_BUCKET_ID=your_bucket_id

# New collections
VITE_APPWRITE_COMMENTS_COLLECTION_ID=your_comments_collection_id
VITE_APPWRITE_FOLLOWS_COLLECTION_ID=your_follows_collection_id

# Gemini API key — powers YouTube import, performance predictor,
# semantic search, and the new category/sentiment classifier
VITE_GEMINI_API_KEY=your_gemini_api_key
```

Get a free Gemini key at **aistudio.google.com** (no credit card required).

---

## 5. Email Verification & Password Reset

Appwrite Console → Auth → make sure **Email/Password** is enabled.
Redirect URLs are generated automatically from `window.location.origin` — no manual config needed, but make sure **localhost** (or your deployed domain) is in the allowed platforms list.

---

## Feature Checklist

| Feature                          | Status                              |
|-----------------------------------|--------------------------------------|
| Dark Mode                        | ✅ No setup needed                   |
| Clap / Like / Dislike             | ✅ After Step 1                      |
| View Counter                     | ✅ After Step 1                      |
| Real-time Comments               | ✅ After Step 2                      |
| Follow Authors                   | ✅ After Step 3                      |
| Highlight & Share Quotes         | ✅ No setup needed                   |
| Analytics Dashboard              | ✅ After Step 1                      |
| Email Verification               | ✅ No setup needed (built into Appwrite)|
| Forgot / Reset Password          | ✅ No setup needed                   |
| YouTube → Blog Generator          | ✅ Needs Gemini key                  |
| Trending Topics Sidebar          | ✅ No setup needed (Hacker News API) |
| Performance Predictor            | ✅ Needs Gemini key                  |
| Semantic Search                  | ✅ Needs Gemini key (falls back to plain search) |
| **Category + Sentiment Classification** | ✅ After Step 1 + Gemini key  |
| **Category Filter Dropdown**     | ✅ Works automatically once posts have categories |
| Multiple Gallery Images          | ✅ After Step 1                      |
| Saved Posts                      | ✅ No setup needed (localStorage)    |
