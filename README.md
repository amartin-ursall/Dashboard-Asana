# ZenDash: Intelligent Asana Dashboard

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/amartin-ursall/Dashboard-Asana)

ZenDash is a visually stunning and intelligent dashboard that transforms your Asana workspace into a clear, actionable command center. It provides powerful analytics, insightful AI-driven conversations, and a beautiful, intuitive interface to help teams achieve peak productivity and project clarity. The application securely integrates with the Asana API via a Cloudflare Worker acting as a Backend-For-Frontend (BFF), ensuring all sensitive credentials remain server-side. Key modules include a comprehensive Dashboard with interactive charts and KPIs, detailed Task and Project views with advanced filtering, and an integrated AI Chat assistant (powered by Cloudflare Agents) for natural language queries on your Asana data. The entire experience is wrapped in a meticulously crafted, responsive UI built with shadcn/ui and Tailwind CSS, prioritizing both aesthetic excellence and user productivity.

## Key Features

- **Secure Asana Integration**: Leverages a Cloudflare Worker as a Backend-For-Frontend (BFF) to handle OAuth 2.0 flow, keeping your `client_secret` and user tokens secure on the server-side.
- **Comprehensive Dashboard**: Get a high-level overview of workspace productivity with interactive charts, KPIs for tasks (total, completed, overdue), and project status summaries.
- **Detailed Task & Project Views**: Dive deep into your data with advanced filtering, searching, and sorting capabilities for all your Asana tasks and projects.
- **AI Chat Assistant**: Ask natural language questions about your Asana data and receive intelligent insights, powered by Cloudflare Agents.
- **Modern & Responsive UI**: A meticulously crafted, beautiful interface built with shadcn/ui and Tailwind CSS that looks and works great on any device.
- **Light & Dark Modes**: Seamlessly switch between themes to match your preference.

## Technology Stack

- **Frontend**: React, Vite, TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui, Radix UI
- **State Management**: Zustand (Global State), TanStack Query (Server State)
- **Animation & Icons**: Framer Motion, Lucide React
- **Data Visualization**: Recharts
- **Backend**: Cloudflare Workers, Hono
- **AI & Agents**: Cloudflare Agents

## Getting Started

Follow these instructions to get the project up and running on your local machine for development and testing purposes.

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later)
- [Bun](https://bun.sh/) package manager

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/zendash.git
    cd zendash
    ```

2.  **Install dependencies:**
    ```bash
    bun install
    ```

### Environment Variables

You need to configure your Asana OAuth credentials and Cloudflare AI settings.

1.  Create a `.dev.vars` file in the root of the project for local development:
    ```bash
    touch .dev.vars
    ```

2.  Add the following environment variables to your `.dev.vars` file. You can get these from your Asana developer console.

    ```ini
    # Asana OAuth Credentials
    VITE_ASANA_CLIENT_ID="YOUR_ASANA_CLIENT_ID"
    VITE_ASANA_CLIENT_SECRET="YOUR_ASANA_CLIENT_SECRET"
    VITE_ASANA_REDIRECT_URI="http://localhost:3000/auth/callback"

    # Cloudflare AI Gateway (for AI Chat feature)
    CF_AI_BASE_URL="https://gateway.ai.cloudflare.com/v1/YOUR_ACCOUNT_ID/YOUR_GATEWAY/openai"
    CF_AI_API_KEY="YOUR_CLOUDFLARE_API_KEY"
    ```

    **Important**: For local development, the `VITE_ASANA_REDIRECT_URI` must be set to `http://localhost:3000/auth/callback` and added to the allowed redirect URIs in your Asana App settings.

## Development

To run the application in development mode, which includes both the Vite frontend server and the local Cloudflare Worker, use the following command:

```bash
bun run dev
```

This will start the development server, typically at `http://localhost:3000`. The application will automatically reload if you make changes to the code.

## Deployment

This project is designed for seamless deployment to Cloudflare.

1.  **Login to Wrangler:**
    ```bash
    bunx wrangler login
    ```

2.  **Deploy the application:**
    ```bash
    bun run deploy
    ```

    This command will build the frontend application and deploy it along with the worker to your Cloudflare account.

3.  **Configure Production Environment Variables:**
    After deployment, you must set your environment variables as secrets in the Cloudflare dashboard for your worker.

    ```bash
    bunx wrangler secret put VITE_ASANA_CLIENT_ID
    bunx wrangler secret put VITE_ASANA_CLIENT_SECRET
    # ... and so on for all required variables.
    ```

    **Note**: Remember to update the `VITE_ASANA_REDIRECT_URI` in your Asana App settings to match your production Cloudflare URL.

Alternatively, you can deploy directly from your GitHub repository:

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/amartin-ursall/Dashboard-Asana)

## Project Structure

-   `src/`: Contains the frontend React application code.
    -   `components/`: Reusable UI components, including shadcn/ui primitives.
    -   `pages/`: Top-level page components for each view.
    -   `stores/`: Zustand stores for global state management.
    -   `lib/`: Utility functions and API clients.
-   `worker/`: Contains the backend Cloudflare Worker code built with Hono.
    -   `userRoutes.ts`: Defines the API endpoints, including the secure OAuth flow.
    -   `agent.ts`: The core Cloudflare Agent implementation for the AI Chat.

## Security

-   The Asana `client_secret` and user access tokens are **never** exposed to the browser.
-   All sensitive operations, including the OAuth token exchange, are handled securely within the Cloudflare Worker (BFF).
-   The frontend application only communicates with our own backend API, which then securely communicates with the Asana API.

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.