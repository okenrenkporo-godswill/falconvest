-- Seed staking pools with various assets and lock periods

INSERT INTO staking_pools (asset, name, apy, lock_period_days, min_stake_amount, max_stake_amount, status)
VALUES
  -- Bitcoin pools
  ('BTC', 'Bitcoin Flexible Staking', 3.5, 30, 0.001, NULL, 'active'),
  ('BTC', 'Bitcoin 60-Day Lock', 5.0, 60, 0.001, NULL, 'active'),
  ('BTC', 'Bitcoin 90-Day Lock', 7.5, 90, 0.001, NULL, 'active'),
  
  -- Ethereum pools
  ('ETH', 'Ethereum Flexible Staking', 4.0, 30, 0.01, NULL, 'active'),
  ('ETH', 'Ethereum 60-Day Lock', 6.0, 60, 0.01, NULL, 'active'),
  ('ETH', 'Ethereum 90-Day Lock', 8.5, 90, 0.01, NULL, 'active'),
  
  -- Solana pools
  ('SOL', 'Solana Flexible Staking', 5.0, 30, 1, NULL, 'active'),
  ('SOL', 'Solana 60-Day Lock', 7.5, 60, 1, NULL, 'active'),
  ('SOL', 'Solana 90-Day Lock', 10.0, 90, 1, NULL, 'active'),
  
  -- USDT pools
  ('USDT', 'USDT Flexible Staking', 6.0, 30, 100, NULL, 'active'),
  ('USDT', 'USDT 60-Day Lock', 9.0, 60, 100, NULL, 'active'),
  ('USDT', 'USDT 90-Day Lock', 12.0, 90, 100, NULL, 'active'),
  
  -- USDC pools
  ('USDC', 'USDC Flexible Staking', 5.5, 30, 100, NULL, 'active'),
  ('USDC', 'USDC 60-Day Lock', 8.5, 60, 100, NULL, 'active'),
  ('USDC', 'USDC 90-Day Lock', 11.5, 90, 100, NULL, 'active')
ON CONFLICT (asset, lock_period_days) DO NOTHING;
