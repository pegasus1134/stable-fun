stable-fun

Description
This repository is a hackathon-style project demonstrating a “stablecoin factory” on Solana, enabling users to create, mint, and redeem stablecoins backed by yield-bearing government bonds (Stablebonds). The idea is to allow anyone to spin up their own stablecoins pegged to various fiat currencies, earning yield from external debt instruments.

What’s Included

Solana Program (Anchor)
Located in programs/stablecoin-factory/
Written in Rust using Anchor.
Aims to provide initialize_stablecoin, mint_stablecoin, and redeem_stablecoin instructions, referencing Switchboard oracles for price data.
Frontend (React + Vite + Tailwind)
Located in the root folder (src/, vite.config.ts, etc.).
Allows users to:
Create new stablecoins by specifying name, symbol, target currency, and an icon.
View a dashboard of existing stablecoins.
Mint or redeem tokens with yield-bearing collateral (Stablebonds).
Store & Services
Uses a Zustand store (useStore.ts) to manage global state.
Uses a ProgramService class to interact with the on-chain program (mint, redeem, create, etc.).
Current Status

Frontend:
Buildable and deployable to Vercel, GitHub Pages, or other static hosting.
UI mostly works: you can navigate, fill out forms, and see placeholder or real data from oracles.
Mint/Redeem pages exist but rely on the on-chain program being deployed successfully.
On-chain Program:
The Anchor program is written, but there’s an issue compiling/deploying with certain Solana crate versions. Specifically, the solana-program-test crate for 1.17.x pins a yanked version of solana_rbpf (=0.8.0).
We have not fully resolved the mismatch between the “latest” Solana crates and the pinned RBPF version.
Known Issues

Yanked solana_rbpf = "=0.8.0"
The Solana 1.17.x line depends on a yanked RBPF version, causing build errors like failed to select a version for the requirement "solana_rbpf" ... version 0.8.0 is yanked.
Patching or overriding leads to “points to the same source” or “revspec not found” issues.
Workarounds include:
Downgrading all Solana crates to 1.16.x, or
Upgrading to a newer Solana version (e.g., 2.x) if it no longer pins the yanked version, or
Manually patching solana_rbpf from a GitHub commit that’s API-compatible.
Redeem Logic
The UI and program are structured for minting and redeeming stablecoins with stablebonds, but the redemption logic may need further testing to ensure correct pegging and collateral release flows.
Full Peg Enforcement
Currently, the program does not implement robust peg-maintenance or automatic rebalancing logic. This is still a minimal proof-of-concept.
