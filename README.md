# Tinder API Reverse Engineering Project

## Project Overview

This project provides a backend service that reverse engineers Tinder's API to allow users to:

1. Fuzzy match names from scraped Tinder profiles
2. Match images of scraped profiles with a provided image using vector embeddings. We are using Pinecone for vector storage and an open source model hosted on Replicate for generating image embeddings.
3. Index/scrape locations on demand, with a 7-day caching mechanism
4. Care has been taken to avoid storing multiple entries for the same profile, even if they are scraped from different locations. This is done by using Tinder's id for each profile as an unique identifier.

The system works by using an authenticated Tinder token to access profiles. So users will have to manually provide their own token from their tinder network requests. The token is present in the `X-Auth-Token` header of requests made to Tinder's API.

## Current Architecture

### Technology Stack

- **Backend**: Node.js with Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Vector Database**: Pinecone for storing and querying image embeddings
- **Storage**: Cloudflare R2 (S3-compatible) for storing profile images
- **External Services**:
  - Replicate for generating image embeddings
  - Mapbox for geocoding locations
  - Tinder API for scraping profiles

### System Architecture Diagram

![system arch](image.png)

### Component Breakdown

1. **API Layer**:

   - Express server handling HTTP requests
   - Simple routing for job search endpoints

2. **Controllers**:

   - Handles request validation
   - Orchestrates the workflow between services
   - Manages location indexing and profile searching

3. **Services**:

   - `tinder.ts`: Makes authenticated requests to Tinder's API
   - `embedding.ts`: Interfaces with Replicate API for image embeddings
   - `pinecone.ts`: Manages vector database operations
   - `object-storage.ts`: Handles image storage in Cloudflare R2
   - `job.service.ts`: Coordinates the job search process, the real async fn

4. **Repositories**:

   - Database access layer for profiles, locations, and embeddings

5. **Utilities** (`lib/utils.ts`):
   - Helper functions for geolocation, distance calculation, and fuzzy search

## Setup Instructions

### Installation Steps

1. Clone the repository

   ```bash
   git clone <repository-url> .
   ```

2. Install dependencies

   ```bash
   npm install
   # or
   pnpm install
   ```

3. Configure environment variables by copying the example file

   ```bash
   cp .env.example .env
   ```

4. Fill in the environment variables in `.env` file:

   ```
   PORT=3000
   DATABASE_URL=postgresql://user:password@localhost:5432/mydb
   TINDER_AUTH_TOKEN=<your-tinder-auth-token>
   MAPBOX_ACCESS_TOKEN=<your-mapbox-access-token>
   CLOUDFLARE_ACCOUNT_ID=<your-cloudflare-account-id>
   CLOUDFLARE_ACCESS_KEY_ID=<your-cloudflare-access-key>
   CLOUDFLARE_SECRET_ACCESS_KEY=<your-cloudflare-secret-key>
   CLOUDFLARE_PUBLIC_URL=<your-cloudflare-public-url>
   PINECONE_API_KEY=<your-pinecone-api-key>
   REPLICATE_API_TOKEN=<your-replicate-token>
   ```

5. Convert the output to dist instead of src in schema.prisma file

6. Transpile the TypeScript code to JavaScript

   ```bash
   tsc -b
   ```

7. Run the local Postgresql db using docker compose

```bash
docker-compose up -d
```

8. Initialize the database with Prisma

   ```bash
   npx prisma db push
   ```

9. Start the server
   ```bash
   node dist/index.js
   ```

### Obtaining API Keys

- **Tinder Auth Token**: Need to extract this from your browser after logging into Tinder. It will be available as 'X-Auth-Token' in network requests.

## Functional Documentation

### Core Workflow

1. **Profile Search Request**:

   - User submits a name, location, and image url
   - System validates input and generates a jobId which it then returns to the user
   - The jobId is used to track the status of the search. New jobs for scraping typically takes 5-10mins to complete, while searching for existing profiles is almost instantaneous.

2. **Location Check and Processing**:

   - Geocode location name to coordinates
   - Check if location was recently indexed (within 7 days)
   - If not indexed, change Tinder location and scrape profiles.

3. **Profile Retrieval and Storage**:

   - When indexing a location, fetch profiles from Tinder
   - Download and store images in Cloudflare R2
   - Generate and store embeddings for each profile image
   - Store profile (and image) metadata in PostgreSQL as well as the vector database (Pinecone)

4. **Search**:
   - Fuzzy text search using the name against indexed profiles
   - Vector similarity search using image embedding
   - Return combined results

## Challenges Faced

### Technical Challenges

1. **Tinder API Reverse Engineering**:

   - I am new to reverse engineering APIs, so this was a learning experience for me.
   - Finding correct endpoints was tricky, especially for changing locations. Had to find it out with a vpn and a lot of trial and error.
   - Figuring out the x-auth-token was not hard but I still don't understand how often it expires.

2. **Rate Limiting**:

   - Tinder must have rate limits on their API so I had to be careful with the number of requests made in a short time.
   - Implemented random delays (1-4s every time) and retry mechanisms to avoid detection.
   - Used randomized pass/like interactions to mimic human behavior.

3. **Embedding images for vector similarity search**:

   - This was again a new concept for me, so I had to learn how the vector embeddings work and how to use them for image similarity search.

4. **Location check**:

   - Currently I have set my Tinder to recommend me with profiles within a 160km radius. Had to ensure no blind spots exist in the scraping process, so the scraper scrapes locations above 100km radius.

### Unaddressed Challenges

1. **Authentication Longevity**:

   - Tinder auth tokens expire periodically
   - No automatic refresh mechanism implemented
   - Manual token updates required periodically

2. **Tinder API Changes**:

   - Tinder may change their API without notice
   - No version tracking or detection mechanism implemented
   - Not all errors may be handled gracefully, since I did not encounter many during development. However this won't be the case in production.

3. **Location Barrier**:

   - Currently limited to a single location at a time. We should not use the same account for multiple locations in a very short time frame, as Tinder may detect this and ban the account.
   - We need a session management system to handle multiple locations and accounts. We need to randomize the accounts used for scraping and searching.

## Future Improvements

1. **System Robustness**:

   - Implement a token rotation and automatic refresh/token retrieval mechanism. Have to look into captcha solving/other common issues if we use something like Puppeteer to automate the login process.
   - Add comprehensive error handling and recovery
   - Include logging and monitoring for better observability

2. **Performance Enhancements**:

   - Add caching layers for frequently accessed data.
   - Implement background workers and queues since this is mainly an async process.
   - Optimize database queries. Currently we are querying the database a lot, which is not ideal.

3. **Feature Considerations**:

   - Need to use proxies to avoid IP bans from Tinder. According to my research, Tinder also bans IP addresses of cloud providers easily, so if this is hosted, they need to be residential IPs. Or proxies that are not easily detected.
   - Tinder gives us coordinates for faces in users' profile images. Instead of embedding the whole image like we are doing now, we can use these coordinates to only embed the face. This will increase efficiency.

4. **Frontend Development**:
   - Improve the frontend UI/UX for better user experience.
   - Add visualization features for search results.
   - User authentication and profile management.
   - Implement real-time status updates during indexing (like websockets).

### Proposed Scalability Solutions

1. **Distributed Architecture**:

   - Implement a queue-based system.
   - Distribute load across multiple instances.

2. **Multiple Tinder Accounts**:

   - Rotate between multiple authenticated accounts.
   - Implement token management system.
   - Distribute requests across different IPs. Mostly residential IPs.

3. **Parallel Processing**:

   - Process multiple locations concurrently, using worker threads or child processes.
   - Use worker threads for CPU-intensive tasks.
   - Implement batch processing for database operations.
