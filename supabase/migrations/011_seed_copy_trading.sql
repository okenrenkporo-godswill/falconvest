-- Seed data for copy trading system

-- Insert traders (these are user accounts that became traders)
INSERT INTO public.traders (id, user_id, display_name, bio, avatar_url, status, total_followers, total_profit, win_rate, total_trades, risk_score, min_copy_amount, commission_rate)
VALUES
  (
    'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
    'f47ac10b-58cc-4372-a567-0e02b2c3d479', -- Replace with actual user_id from auth.users
    'CryptoKing_99',
    'High-frequency Bitcoin scalper with strict risk management. 5+ years experience.',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=CryptoKing',
    'active',
    1250,
    452000.00,
    88.5,
    3420,
    6,
    100.00,
    10.00
  ),
  (
    'b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e',
    'f47ac10b-58cc-4372-a567-0e02b2c3d480',
    'SafeGrowth_LTD',
    'Long-term ETH and SOL accumulation strategy. Low leverage, high win rate.',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=SafeGrowth',
    'active',
    3200,
    125000.00,
    98.2,
    1850,
    2,
    500.00,
    8.00
  ),
  (
    'c3d4e5f6-a7b8-4c5d-0e1f-2a3b4c5d6e7f',
    'f47ac10b-58cc-4372-a567-0e02b2c3d481',
    'Altcoin_Hunter',
    'Hunting the next 100x gem. High volatility, high reward. Not for the faint-hearted.',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=AltcoinHunter',
    'active',
    850,
    89000.50,
    65.4,
    2100,
    8,
    50.00,
    15.00
  ),
  (
    'd4e5f6a7-b8c9-4d5e-1f2a-3b4c5d6e7f8a',
    'f47ac10b-58cc-4372-a567-0e02b2c3d482',
    'Technical_Master',
    'Pure price action trading. No indicators, just market structure and volume.',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=TechnicalMaster',
    'active',
    1500,
    320000.00,
    72.0,
    4200,
    5,
    200.00,
    12.00
  ),
  (
    'e5f6a7b8-c9d0-4e5f-2a3b-4c5d6e7f8a9b',
    'f47ac10b-58cc-4372-a567-0e02b2c3d483',
    'Quantum_AI_Bot',
    'Algorithmic trading bot powered by machine learning. Fully automated 24/7.',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=QuantumBot',
    'active',
    2100,
    65000.00,
    92.5,
    8500,
    3,
    100.00,
    5.00
  ),
  (
    'f6a7b8c9-d0e1-4f5a-3b4c-5d6e7f8a9b0c',
    'f47ac10b-58cc-4372-a567-0e02b2c3d484',
    'Macro_Trends',
    'Trading based on global macroeconomic trends and news events.',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=MacroTrader',
    'active',
    900,
    180000.00,
    68.5,
    1200,
    7,
    300.00,
    10.00
  ),
  (
    'a7b8c9d0-e1f2-4a5b-4c5d-6e7f8a9b0c1d',
    'f47ac10b-58cc-4372-a567-0e02b2c3d485',
    'DeFi_Wizard',
    'DeFi yield farming and liquidity provision expert. Maximizing APY across protocols.',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=DeFiWizard',
    'active',
    650,
    275000.00,
    75.8,
    980,
    7,
    1000.00,
    20.00
  ),
  (
    'b8c9d0e1-f2a3-4b5c-5d6e-7f8a9b0c1d2e',
    'f47ac10b-58cc-4372-a567-0e02b2c3d486',
    'Whale_Watcher',
    'Following smart money and whale movements across chains. On-chain analysis expert.',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=WhaleWatcher',
    'active',
    1800,
    145000.00,
    82.0,
    2400,
    4,
    150.00,
    10.00
  ),
  (
    'c9d0e1f2-a3b4-4c5d-6e7f-8a9b0c1d2e3f',
    'f47ac10b-58cc-4372-a567-0e02b2c3d487',
    'Futures_Pro',
    'Perpetual futures specialist. Leverage trading with tight stop losses.',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=FuturesPro',
    'active',
    1100,
    210000.00,
    70.5,
    3100,
    8,
    250.00,
    12.00
  ),
  (
    'd0e1f2a3-b4c5-4d6e-7f8a-9b0c1d2e3f4a',
    'f47ac10b-58cc-4372-a567-0e02b2c3d488',
    'Grid_Master',
    'Grid trading bot specialist. Profits from market volatility in ranging markets.',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=GridMaster',
    'active',
    750,
    95000.00,
    88.0,
    5200,
    4,
    100.00,
    8.00
  );

-- Note: The user_id values above are placeholders. 
-- You need to replace them with actual user IDs from your auth.users table
-- or create new users first using the script below.
