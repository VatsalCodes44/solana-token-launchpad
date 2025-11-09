
# 💠 Solana Token Creator

A fully functional **no-code Solana SPL Token Creator** built using **Next.js**, **TypeScript**, **Solana Kit SDK** and **AWS S3 (presigned url)**.  
This decentralized application allows users to create, mint, and customize Solana tokens seamlessly — without any prior coding experience.

> ⚠️ **Note:** This project interacts exclusively with the **Solana Devnet** and does **not** distribute real $SOL or mainnet tokens.

---

## 📸 Project Preview

<div align="center">
  <img src="https://github.com/VatsalCodes44/solana-token-launchpad/blob/main/public/image.png" alt="Solana Token Creator Screenshot" width="700" />
  <p><i>Create, customize, and mint your own Solana SPL Token with a modern UI.</i></p>
</div>

---

## 🧩 Overview

The **Solana Token Creator** provides a user-friendly interface to create new SPL tokens, upload metadata, and configure token authorities.  
Users can connect their preferred Solana wallet, define token parameters, attach media, and deploy tokens directly on the blockchain.

This project demonstrates advanced integration between **Solana SDKs**, **Metaplex metadata standards**, and **Next.js** frontend capabilities.

---

## 🚀 Key Features

| Feature | Description |
|----------|-------------|
| 🪙 **Token Creation** | Instantly generate Solana SPL tokens with custom name, symbol, decimals, and total supply. |
| 🖼️ **Metadata Upload** | Add a token image, description, and metadata stored on AWS S3. |
| 🌐 **Social Integration** | Include links to Website, Telegram, Discord, and X (Twitter). |
| 🧾 **Authority Management** | Optionally revoke Mint, Freeze, and Update authorities for improved trust and decentralization. |
| 💼 **Wallet Integration** | Supports multiple Solana wallets via `@wallet-standard/react`. |
| ⚡ **Transaction Confirmation** | Confirms each blockchain interaction with real-time feedback. |
| 🧰 **Clean UI Components** | Built using **Tailwind CSS** and **shadcn/ui** for elegant, responsive design. |

---

## 🧠 Tech Stack

| Technology | Role |
|-------------|------|
| **Next.js (App Router)** | Frontend framework for server-rendered React |
| **React & TypeScript** | Type-safe UI and logic development |
| **Tailwind CSS + shadcn/ui** | Modern styling and pre-built UI components |
| **@solana/kit** | Core Solana RPC and transaction handling |
| **@wallet-standard/react** | Wallet integration (Phantom, Solflare, Backpack, etc.) |
| **@metaplex-foundation/mpl-token-metadata** | Token metadata creation and management |
| **AWS S3 (Presigned URLs)** | Secure image and metadata upload system |
| **Axios** | HTTP requests for file uploads |
| **Sonner** | User-friendly notifications and alerts |

---


---

## ⚙️ Installation & Setup

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/VatsalCodes44/solana-token-creator.git
cd solana-token-creator
```
### 2️⃣ Install Dependencies

`npm install`
 or
 `yarn install`

### 3️⃣ Configure Environment Variables

Create a `.env.local` file in the project root and add:

```
AWS_REGION=
AMPLIFY_BUCKET=
# Create a role for the client with restricted permissions
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
```
### 4️⃣ Run the Development Server

`npm run dev`
or 
`yarn dev`

## 🌟 Acknowledgements

-   [Solana Kit](https://www.solanakit.com/docs)
    
-   [Metaplex](https://www.metaplex.com/)
       
-   [Tailwind CSS](https://tailwindcss.com/)
    
-   [Shadcn UI](https://ui.shadcn.com/)
    

----------

## 💬 Feedback & Contributions

Contributions and suggestions are welcome!  
If you find this project helpful, please **⭐ star the repository**.

----------

<div align="center">
  <p><i>Made with ❤️ by <a href="https://github.com/VatsalCodes44">VatsalCodes44</a><br>
  Building the future of decentralized apps on Solana ⚡</i></p>
</div>
