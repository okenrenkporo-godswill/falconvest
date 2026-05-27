-- Simple Seed: Create traders from existing users
-- This will turn your first 10 users into traders

DO $$
DECLARE
  user_record RECORD;
  trader_names TEXT[] := ARRAY[
    'CryptoKing_99', 'SafeGrowth_LTD', 'Altcoin_Hunter', 'Technical_Master', 
    'Quantum_AI_Bot', 'Macro_Trends', 'DeFi_Wizard', 'Whale_Watcher',
    'Futures_Pro', 'Grid_Master'
  ];
  bios TEXT[] := ARRAY[
    'High-frequency Bitcoin scalper with strict risk management.',
    'Long-term ETH and SOL accumulation strategy. Low leverage.',
    'Hunting the next 100x gem. High volatility, high reward.',
    'Pure price action trading. No indicators, just market structure.',
    'Algorithmic trading bot powered by machine learning.',
    'Trading based on global macroeconomic trends and news.',
    'DeFi yield farming and liquidity provision expert.',
    'Following smart money and whale movements across chains.',
    'Perpetual futures specialist. Leverage trading.',
    'Grid trading bot specialist. Profits from volatility.'
  ];
  profits DECIMAL[] := ARRAY[452000, 125000, 89000, 320000, 65000, 180000, 275000, 145000, 210000, 95000];
  win_rates DECIMAL[] := ARRAY[88.5, 98.2, 65.4, 72.0, 92.5, 68.5, 75.8, 82.0, 70.5, 88.0];
  trades INT[] := ARRAY[3420, 1850, 2100, 4200, 8500, 1200, 980, 2400, 3100, 5200];
  risks INT[] := ARRAY[6, 2, 8, 5, 3, 7, 7, 4, 8, 4];
  followers INT[] := ARRAY[1250, 3200, 850, 1500, 2100, 900, 650, 1800, 1100, 750];
  i INT := 1;
BEGIN
  -- Loop through first 10 users from profiles
  FOR user_record IN 
    SELECT id FROM public.profiles 
    WHERE role = 'user' 
    LIMIT 10
  LOOP
    -- Check if user is already a trader
    IF NOT EXISTS (SELECT 1 FROM public.traders WHERE user_id = user_record.id) THEN
      INSERT INTO public.traders (
        user_id, display_name, bio, avatar_url, status, 
        total_followers, total_profit, win_rate, total_trades, 
        risk_score, min_copy_amount, commission_rate, approved_at
      ) VALUES (
        user_record.id,
        trader_names[i],
        bios[i],
        'https://api.dicebear.com/7.x/avataaars/svg?seed=' || trader_names[i],
        'active',
        followers[i],
        profits[i],
        win_rates[i],
        trades[i],
        risks[i],
        100.00,
        10.00,
        NOW()
      );
      
      RAISE NOTICE '✓ Created trader: % for user %', trader_names[i], user_record.id;
    END IF;
    
    i := i + 1;
    EXIT WHEN i > 10;
  END LOOP;
  
  IF i = 1 THEN
    RAISE NOTICE '❌ No users found. Create some users first via Supabase Dashboard.';
  ELSE
    RAISE NOTICE '✅ Created % traders successfully!', i - 1;
  END IF;
END $$;
