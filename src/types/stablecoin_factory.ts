// src/types/stablecoin_factory.ts
export type StablecoinFactory = {
    "version": "0.1.0",
    "name": "stablecoin_factory",
    "instructions": [
        {
            "name": "initialize_stablecoin",
            "accounts": [
                {
                    "name": "authority",
                    "isMut": true,
                    "isSigner": true
                },
                {
                    "name": "stablecoin",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "mint",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "stablebondMint",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "priceFeed",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "mintAuthority",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "systemProgram",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "tokenProgram",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "rent",
                    "isMut": false,
                    "isSigner": false
                }
            ],
            "args": [
                {
                    "name": "name",
                    "type": "string"
                },
                {
                    "name": "symbol",
                    "type": "string"
                },
                {
                    "name": "targetCurrency",
                    "type": "string"
                }
            ]
        },
        // ... other instructions
    ],
    "accounts": [
        {
            "name": "StablecoinData",
            "type": {
                "kind": "struct",
                "fields": [
                    {
                        "name": "authority",
                        "type": "publicKey"
                    },
                    {
                        "name": "mint",
                        "type": "publicKey"
                    },
                    {
                        "name": "name",
                        "type": "string"
                    },
                    {
                        "name": "symbol",
                        "type": "string"
                    },
                    {
                        "name": "targetCurrency",
                        "type": "string"
                    },
                    {
                        "name": "totalSupply",
                        "type": "u64"
                    },
                    {
                        "name": "collateralRatio",
                        "type": "u64"
                    },
                    {
                        "name": "stablebondMint",
                        "type": "publicKey"
                    },
                    {
                        "name": "priceFeed",
                        "type": "publicKey"
                    }
                ]
            }
        }
    ],
    "errors": [
        {
            "code": 6000,
            "name": "MathOverflow",
            "msg": "Math operation overflowed"
        }
    ]
};

export const IDL: StablecoinFactory = {
    "version": "0.1.0",
    "name": "stablecoin_factory",
    "instructions": [
        {
            "name": "initialize_stablecoin",
            "accounts": [
                {
                    "name": "authority",
                    "isMut": true,
                    "isSigner": true
                },
                {
                    "name": "stablecoin",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "mint",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "stablebondMint",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "priceFeed",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "mintAuthority",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "systemProgram",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "tokenProgram",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "rent",
                    "isMut": false,
                    "isSigner": false
                }
            ],
            "args": [
                {
                    "name": "name",
                    "type": "string"
                },
                {
                    "name": "symbol",
                    "type": "string"
                },
                {
                    "name": "targetCurrency",
                    "type": "string"
                }
            ]
        },
        // ... other instructions
    ],
    "accounts": [
        {
            "name": "StablecoinData",
            "type": {
                "kind": "struct",
                "fields": [
                    {
                        "name": "authority",
                        "type": "publicKey"
                    },
                    {
                        "name": "mint",
                        "type": "publicKey"
                    },
                    {
                        "name": "name",
                        "type": "string"
                    },
                    {
                        "name": "symbol",
                        "type": "string"
                    },
                    {
                        "name": "targetCurrency",
                        "type": "string"
                    },
                    {
                        "name": "totalSupply",
                        "type": "u64"
                    },
                    {
                        "name": "collateralRatio",
                        "type": "u64"
                    },
                    {
                        "name": "stablebondMint",
                        "type": "publicKey"
                    },
                    {
                        "name": "priceFeed",
                        "type": "publicKey"
                    }
                ]
            }
        }
    ],
    "errors": [
        {
            "code": 6000,
            "name": "MathOverflow",
            "msg": "Math operation overflowed"
        }
    ]
};