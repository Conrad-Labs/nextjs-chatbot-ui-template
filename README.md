<a href="https://chat.vercel.ai/">
  <h1 align="center">Next.js AI Chatbot</h1>
</a>

<p align="center">
  An open-source AI chatbot app template built using Next.js, the Vercel AI SDK, OpenAI, Vercel KV, and Vercel Blob.
</p>

## Features

- [Next.js](https://nextjs.org) App Router
- React Server Components (RSCs), Suspense, and Server Actions
- [Vercel AI SDK](https://sdk.vercel.ai/docs) for streaming chat UI
- Support for OpenAI (default), Anthropic, Cohere, Hugging Face, or custom AI chat models and/or LangChain
- [shadcn/ui](https://ui.shadcn.com)
  - Styling with [Tailwind CSS](https://tailwindcss.com)
  - [Radix UI](https://radix-ui.com) for headless component primitives
  - Icons from [Phosphor Icons](https://phosphoricons.com)
- Stateful chat history, rate limiting, file analyses, and session storage with [Vercel KV](https://vercel.com/storage/kv) and [Vercel Blob](https://vercel.com/docs/storage/vercel-blob)
- Support for updating the vector store from within the app with OpenAI.
- [NextAuth.js](https://github.com/nextauthjs/next-auth) for authentication

## Model Providers

This template ships with OpenAI `gpt-3.5-turbo` as the default. However, thanks to the [Vercel AI SDK](https://sdk.vercel.ai/docs), you can switch LLM providers to [Anthropic](https://anthropic.com), [Cohere](https://cohere.com/), [Hugging Face](https://huggingface.co), or using [LangChain](https://js.langchain.com) with just a few lines of code.

## Creating a KV Database Instance

Follow the steps outlined in the [quick start guide](https://vercel.com/docs/storage/vercel-kv/quickstart#create-a-kv-database) provided by Vercel. This guide will assist you in creating and configuring your KV database instance on Vercel, enabling your application to interact with it. Choose the Vercel KV template from the marketplace (linked in the guide) for a quick and easy setup of your KV Database Instance.

Remember to update your environment variables (`KV_URL`, `KV_REST_API_URL`, `KV_REST_API_TOKEN`, `KV_REST_API_READ_ONLY_TOKEN`) in the `.env` file with the appropriate credentials provided during the KV database setup.

## Creating a Vercel Blob Instance

Similar to the KV database quickstart guide, Vercel outlines the steps required to create and configure your Vercel Blob in [this guide](https://vercel.com/docs/storage/vercel-blob/server-upload), thereby enabling your application to interact with it.

Remember to update the environment variable - `BLOB_READ_WRITE_TOKEN` - in the `.env` file with the appropriate credentials provided during the Vercel Blob setup.

## Running locally

To get started, create your vercel account and connect your project to it. Then, use the Vercel KV and Vercel Blob guides outlined above to setup storage for your application. Make sure that the KV database instance and the Blob instance are both connected to you project (you can confirm this in the Storage tab for your project).

You will need to use all the environment variables [defined in `.env.example`](.env.example) to run the Next.js AI Chatbot. It's recommended you use [Vercel Environment Variables](https://vercel.com/docs/projects/environment-variables) for this, but a `.env` file is all that is necessary.

> Note: You should not commit your `.env` file or it will expose secrets that will allow others to control access to your various OpenAI and authentication provider accounts.

1. Install Vercel CLI: `npm i -g vercel`
2. Link local instance with Vercel and GitHub accounts (creates `.vercel` directory): `vercel link`
3. Download your environment variables: `vercel env pull`

```bash
pnpm install
pnpm dev
```

Your app template should now be running on [localhost:3000](http://localhost:3000/).
