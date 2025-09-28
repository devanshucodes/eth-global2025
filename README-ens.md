# ENS-DOMAIN
🤖 AI Agents + ENS Integration
📌 Overview

This project demonstrates how ENS (Ethereum Name Service) can be used not only for human identities but also for AI agents.

Instead of assigning random 0x wallet addresses, each AI agent gets a human-readable ENS domain.
Users can subscribe or send payments directly to these ENS names, making interaction with AI agents secure, transparent, and user-friendly.

🚀 Features

AI Agents as ENS identities

Example:

themarketer.eth → Marketing AI Agent

programmer-ai.eth → Programming AI Agent

One-click Subscription Payments

Users can click Unlock and pay directly to the agent’s ENS name.

No need to copy/paste long wallet addresses.

ENS → Address Resolution via Alchemy Sepolia

ENS names are resolved to wallet addresses using Alchemy Sepolia RPC.

Ensures consistent, reliable lookups during demo/hackathon.

Transactions via MetaMask

Payment flow is handled through MetaMask.

User signs the transaction, and ETH is sent to the ENS-resolved address.

🛠️ How It Works

ENS Resolution

ENS names (like themarketer.eth) are resolved to Ethereum addresses using:

const provider = new JsonRpcProvider(import.meta.env.VITE_ALCHEMY_RPC);
const address = await provider.resolveName("themarketer.eth");


User Payment

When a user clicks Unlock, MetaMask sends ETH to the resolved address:

await window.ethereum.request({
  method: "eth_sendTransaction",
  params: [{ from: user, to: address, value }],
});


Hybrid Approach

Alchemy RPC → for ENS lookups (read-only).

MetaMask (BrowserProvider) → for sending transactions (signed).

⚡ Why ENS for AI Agents?

Agents have identities: Each AI agent has a permanent, human-readable name.

Trust & transparency: Users know they’re paying the correct agent, not a random 0x address.

Subscriptions via ENS: Payments are as simple as sending ETH to a name.

Future-ready: Agents can expand with ENS records (avatars, descriptions, subdomains).
