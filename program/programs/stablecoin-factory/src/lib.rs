use anchor_lang::prelude::*;
use anchor_spl::token::{self, Burn, Mint, MintTo, Token, TokenAccount, Transfer};
use switchboard_on_demand::on_demand::accounts::pull_feed::PullFeedAccountData;

declare_id!("6N65VrUdW3gjPDSikhBddRVvUNG6cWA13bh5NeLVYHQ7");

#[program]
pub mod stablecoin_factory {
    use super::*;

    /// Initialize a new stablecoin with name, symbol, icon, etc.
    #[access_control(validate_initialize_stablecoin(&name, &symbol))]
    pub fn initialize_stablecoin(
        ctx: Context<InitializeStablecoin>,
        name: String,
        symbol: String,
        target_currency: String,
        icon: String,
    ) -> Result<()> {
        let stablecoin = &mut ctx.accounts.stablecoin;
        stablecoin.authority = ctx.accounts.authority.key();
        stablecoin.mint = ctx.accounts.mint.key();
        stablecoin.name = name;
        stablecoin.symbol = symbol;
        stablecoin.target_currency = target_currency;
        stablecoin.icon = icon; // store the icon
        stablecoin.total_supply = 0;
        stablecoin.collateral_ratio = 10200; // e.g. 102%
        stablecoin.stablebond_mint = ctx.accounts.stablebond_mint.key();
        stablecoin.price_feed = ctx.accounts.price_feed.key();
        stablecoin.vault = ctx.accounts.vault.key();
        stablecoin.vault_authority = ctx.accounts.vault_authority.key();

        Ok(())
    }

    /// Mint stablecoins by depositing stablebond tokens into the vault.
    pub fn mint_stablecoin(ctx: Context<MintStablecoin>, amount: u64) -> Result<()> {
        let stablecoin = &mut ctx.accounts.stablecoin;

        // Get price from Switchboard feed
        let feed_account = ctx.accounts.price_feed.try_borrow_data()?;
        let feed = PullFeedAccountData::parse(&feed_account)
            .map_err(|_| StablecoinError::PriceFeedParseError)?;
        let price = feed.value();
        msg!("Oracle price: {}", price);

        // Collateral required
        let collateral_required = (amount as u128)
            .checked_mul(stablecoin.collateral_ratio as u128)
            .ok_or(StablecoinError::MathOverflow)?
            .checked_div(10000)
            .ok_or(StablecoinError::MathOverflow)? as u64;

        // Transfer stablebond from user to vault
        token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.user_stablebond.to_account_info(),
                    to: ctx.accounts.vault_stablebond.to_account_info(),
                    authority: ctx.accounts.authority.to_account_info(),
                },
            ),
            collateral_required,
        )?;

        // Mint stablecoins to user
        token::mint_to(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                MintTo {
                    mint: ctx.accounts.mint.to_account_info(),
                    to: ctx.accounts.user_stablecoin.to_account_info(),
                    authority: ctx.accounts.mint_authority.to_account_info(),
                },
                &[&[
                    b"mint-authority",
                    stablecoin.key().as_ref(),
                    &[ctx.bumps.mint_authority],
                ]],
            ),
            amount,
        )?;

        // Increase total supply
        stablecoin.total_supply = stablecoin
            .total_supply
            .checked_add(amount)
            .ok_or(StablecoinError::MathOverflow)?;

        Ok(())
    }

    /// Redeem stablecoins (burn them) and withdraw the stablebond collateral from the vault.
    pub fn redeem_stablecoin(ctx: Context<RedeemStablecoin>, amount: u64) -> Result<()> {
        let stablecoin = &mut ctx.accounts.stablecoin;

        // Get price from Switchboard feed
        let feed_account = ctx.accounts.price_feed.try_borrow_data()?;
        let feed = PullFeedAccountData::parse(&feed_account)
            .map_err(|_| StablecoinError::PriceFeedParseError)?;
        let price = feed.value();
        msg!("Oracle price: {}", price);

        // Burn stablecoins from user
        token::burn(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Burn {
                    from: ctx.accounts.user_stablecoin.to_account_info(),
                    mint: ctx.accounts.mint.to_account_info(),
                    authority: ctx.accounts.authority.to_account_info(),
                },
            ),
            amount,
        )?;

        // Decrease total supply
        stablecoin.total_supply = stablecoin
            .total_supply
            .checked_sub(amount)
            .ok_or(StablecoinError::MathOverflow)?;

        // Calculate how many stablebond tokens to return
        let collateral_to_return = (amount as u128)
            .checked_mul(stablecoin.collateral_ratio as u128)
            .ok_or(StablecoinError::MathOverflow)?
            .checked_div(10000)
            .ok_or(StablecoinError::MathOverflow)? as u64;

        // Transfer stablebond from vault to user
        token::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.vault_stablebond.to_account_info(),
                    to: ctx.accounts.user_stablebond.to_account_info(),
                    authority: ctx.accounts.vault_authority.to_account_info(),
                },
                &[&[
                    b"vault-authority",
                    stablecoin.key().as_ref(),
                    &[ctx.bumps.vault_authority],
                ]],
            ),
            collateral_to_return,
        )?;

        Ok(())
    }
}

/// Simple checks for name/symbol length
fn validate_initialize_stablecoin(name: &str, symbol: &str) -> Result<()> {
    require!(name.len() <= 32, StablecoinError::NameTooLong);
    require!(symbol.len() <= 8, StablecoinError::SymbolTooLong);
    Ok(())
}

#[derive(Accounts)]
#[instruction(name: String, symbol: String, target_currency: String, icon: String)]
pub struct InitializeStablecoin<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        init,
        payer = authority,
        space = 8 + StablecoinData::LEN
    )]
    pub stablecoin: Account<'info, StablecoinData>,

    #[account(
        init,
        payer = authority,
        mint::decimals = 6,
        mint::authority = mint_authority,
    )]
    pub mint: Account<'info, Mint>,

    /// The existing stablebond mint (government bond token)
    pub stablebond_mint: Account<'info, Mint>,

    /// CHECK: Switchboard feed
    pub price_feed: AccountInfo<'info>,

    /// The vault to hold stablebond collateral (must be same mint as stablebond_mint)
    #[account(
        init,
        payer = authority,
        token::mint = stablebond_mint,
        token::authority = vault_authority,
    )]
    pub vault: Account<'info, TokenAccount>,

    /// CHECK: PDA for vault authority
    #[account(
        seeds = [b"vault-authority", stablecoin.key().as_ref()],
        bump
    )]
    pub vault_authority: UncheckedAccount<'info>,

    /// CHECK: PDA for mint authority
    #[account(
        seeds = [b"mint-authority", stablecoin.key().as_ref()],
        bump
    )]
    pub mint_authority: UncheckedAccount<'info>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct MintStablecoin<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(mut)]
    pub stablecoin: Account<'info, StablecoinData>,

    #[account(mut)]
    pub mint: Account<'info, Mint>,

    /// User's stablecoin token account (where minted coins go)
    #[account(mut)]
    pub user_stablecoin: Account<'info, TokenAccount>,

    /// User's stablebond token account (collateral deposit)
    #[account(mut)]
    pub user_stablebond: Account<'info, TokenAccount>,

    /// Vault token account that holds stablebonds
    #[account(mut)]
    pub vault_stablebond: Account<'info, TokenAccount>,

    /// CHECK: Switchboard feed
    pub price_feed: AccountInfo<'info>,

    /// CHECK: Mint authority (PDA)
    #[account(
        seeds = [b"mint-authority", stablecoin.key().as_ref()],
        bump
    )]
    pub mint_authority: UncheckedAccount<'info>,

    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct RedeemStablecoin<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(mut)]
    pub stablecoin: Account<'info, StablecoinData>,

    #[account(mut)]
    pub mint: Account<'info, Mint>,

    /// User's stablecoin token account (burn from here)
    #[account(mut)]
    pub user_stablecoin: Account<'info, TokenAccount>,

    /// User's stablebond token account (redeem into here)
    #[account(mut)]
    pub user_stablebond: Account<'info, TokenAccount>,

    /// Vault token account (release collateral from here)
    #[account(mut)]
    pub vault_stablebond: Account<'info, TokenAccount>,

    /// CHECK: PDA that signs to release collateral
    #[account(
        seeds = [b"vault-authority", stablecoin.key().as_ref()],
        bump
    )]
    pub vault_authority: UncheckedAccount<'info>,

    /// CHECK: Switchboard feed
    pub price_feed: AccountInfo<'info>,

    pub token_program: Program<'info, Token>,
}

#[account]
pub struct StablecoinData {
    pub authority: Pubkey,
    pub mint: Pubkey,
    pub name: String,
    pub symbol: String,
    pub target_currency: String,
    pub icon: String, // <--- new field
    pub total_supply: u64,
    pub collateral_ratio: u64, // e.g. 10200 = 102%
    pub stablebond_mint: Pubkey,
    pub price_feed: Pubkey,
    pub vault: Pubkey,
    pub vault_authority: Pubkey,
}

impl StablecoinData {
    // Adjust space for your strings accordingly
    pub const LEN: usize = 32  // authority
        + 32  // mint
        + 36  // name
        + 12  // symbol
        + 36  // target_currency
        + 204 // icon (allow ~200 chars + prefix)
        + 8   // total_supply
        + 8   // collateral_ratio
        + 32  // stablebond_mint
        + 32  // price_feed
        + 32  // vault
        + 32; // vault_authority
}

#[error_code]
pub enum StablecoinError {
    #[msg("Math operation overflowed")]
    MathOverflow,
    #[msg("Name too long")]
    NameTooLong,
    #[msg("Symbol too long")]
    SymbolTooLong,
    #[msg("Could not parse Switchboard feed")]
    PriceFeedParseError,
}
