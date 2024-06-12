# NexiRSS

NexiRSS is an  RSS feed aggregator. It allows you to manage RSS feeds, including podcasts, track your progress on audio content, and includes a future plan to integrate AI triggers for notifications.

### Try demo here: https://nexirss.netlify.app/ 

## Features

| Feature                    | Description                                                                               | Status             |
|----------------------------|-------------------------------------------------------------------------------------------|--------------------|
| Add RSS Feed               | Add new RSS feeds to the system.                                                          | ✅ Implemented      |
| Fetch RSS Feed             | Fetch and save items from RSS feeds and create embeddings.                                | ✅ Implemented      |
| Update RSS feeds           | Fetch feeds for new content.                                                              | 🛠️ Working on it  |
| List Feeds                 | Retrieve a list of available RSS feeds.                                                   | ✅ Implemented      |
| Get Feed Items             | Retrieve items from a specific feed.                                                      | ✅ Implemented      |
| Get All Items              | Retrieve all items, with pagination support.                                              | ✅ Implemented      |
| Delete RSS Feed            | Delete an RSS feed and its items.                                                         | ✅ Implemented      |
| Search Items               | Search items using vector search for similar content.                                     | ✅ Implemented      |
| Handle Podcasts            | Save audio information for podcasts, including playback position.                         | ✅ Implemented      |
| Category                   | Add category to feeds.                                                                    | ✅ Implemented      |
| Audio Playback (UI)        | Play podcasts directly in the UI and save playback position.                              | ✅ Implemented      |
| Search Bar (UI)            | Search for items with real-time suggestions.                                              | ✅ Implemented      |
| Infinite Scroll (UI)       | Infinite scroll for loading more items.                                                   | ✅ Implemented      |
| Dark Mode (UI)             | Modern UI with a dark theme.                                                              | ✅ Implemented      |
| AI Content Analysis        | Use AI to analyze new articles.                                                           | ❌ Not Implemented  |
| Automated AI Notifications | Automatically send notifications when triggers apply. (The trigger is a prompt to the AI) | ❌ Not Implemented  |
| Users                      | Google auth                                                                               | ✅ Implemented  |
| Save items                 |                                                                                           | ❌ Not Implemented  |
| History                    |                                                                                           | ❌ Not Implemented  |
| Main feed                  |                                                                                           | 🛠️ Working on it  |
| TTS                        | text to speech with OpenAI                                                                | ✅ Implemented   |

## Getting Started

### Prerequisites

- Node.js
- Atlas MongoDB  https://www.mongodb.com/docs/atlas/atlas-vector-search/vector-search-overview/
   - Add search index ```  {
     "mappings": {
     "dynamic": true,
     "fields": {
     "plot_embedding": {
     "type": "knnVector",
     "dimensions": 1536,
     "similarity": "cosine"
     }
     }
     }
     }```
### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/MaurerKrisztian/NexiRSS.git
   cd NexiRSS
   ```
2. Install dependencies for the API:
    - create .env file based on .env-template (generate push notification keys via `npx web-push generate-vapid-keys`)
    ```bash
      cd nexirrs-api
      npm install
      npm run start
    ```

3. Install dependencies for the UI:
    ```bash
      cd nexirrs-ui
      npm install
      npm start
    ```
