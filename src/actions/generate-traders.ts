"use server";

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const adminSupabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const firstNames = ['Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Avery', 'Quinn', 'Sage', 'River'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
const countries = ['US', 'UK', 'CA', 'AU', 'DE', 'FR', 'JP', 'SG', 'NL', 'CH'];
const traderNames = ['CryptoKing', 'MoonShot', 'DiamondHands', 'BullRun', 'BearSlayer', 'WhaleHunter', 'DeFiMaster', 'NFTGuru', 'AltcoinPro', 'BitcoinMaxi'];
const traderSuffixes = ['_99', '_Pro', '_Elite', '_Master', '_Wizard', '_Legend', '_Trader', '_Investor', '_Genius', '_Expert'];

function random(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min: number, max: number, decimals = 2) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

function randomItem<T>(array: T[]): T {
  return array[random(0, array.length - 1)];
}

export async function generateTestTraders(count: number) {
  const results = { success: 0, failed: 0, errors: [] as string[] };

  for (let i = 0; i < count; i++) {
    try {
      const firstName = randomItem(firstNames);
      const lastName = randomItem(lastNames);
      const username = `${firstName.toLowerCase()}${lastName.toLowerCase()}${random(100, 999)}`;
      const email = `${username}@test.com`;
      const password = 'Test123456!';

      // Create auth user
      const { data: authData, error: authError } = await adminSupabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

      if (authError) {
        results.failed++;
        results.errors.push(`${email}: ${authError.message}`);
        continue;
      }

      const userId = authData.user.id;

      // Create profile
      await adminSupabase.from('profiles').insert({
        id: userId,
        email,
        username,
        first_name: firstName,
        last_name: lastName,
        country: randomItem(countries),
        role: 'user',
        kyc_status: 'manually_verified',
      });

      // Add balance
      await adminSupabase.from('balances').insert({
        user_id: userId,
        asset: 'USDT',
        amount: randomFloat(5000, 50000, 2),
        account_type: 'trading',
      });

      // Create trader
      const traderName = `${randomItem(traderNames)}${randomItem(traderSuffixes)}`;
      await adminSupabase.from('traders').insert({
        user_id: userId,
        display_name: traderName,
        bio: `Professional crypto trader with ${random(1, 10)} years of experience.`,
        avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${traderName}`,
        status: 'active',
        total_followers: random(0, 5000),
        total_profit: randomFloat(-50000, 500000, 2),
        win_rate: randomFloat(50, 99, 1),
        total_trades: random(100, 10000),
        risk_score: random(1, 10),
        min_copy_amount: [50, 100, 200, 500, 1000][random(0, 4)],
        commission_rate: randomFloat(5, 20, 1),
        approved_at: new Date().toISOString(),
      });

      results.success++;
    } catch (error: any) {
      results.failed++;
      results.errors.push(error.message);
    }
  }

  return results;
}
