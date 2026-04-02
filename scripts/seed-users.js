require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase environment variables.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function seedUsers() {
  const users = [
    {
      email: "admin@synctrade.com",
      password: "Admin123!",
      role: "admin",
      firstName: "System",
      lastName: "Admin",
      username: "admin",
    },
    {
      email: "user@synctrade.com",
      password: "User123!",
      role: "user",
      firstName: "Test",
      lastName: "User",
      username: "testuser",
    },
  ];

  console.log("🚀 Starting user seeding...");

  for (const userData of users) {
    console.log(`\nCreating user: ${userData.email}`);

    // 1. Create user in auth.users
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: userData.email,
      password: userData.password,
      email_confirm: true,
      user_metadata: {
        first_name: userData.firstName,
        last_name: userData.lastName,
        username: userData.username,
      },
    });

    if (authError) {
      if (authError.message.includes("already exists")) {
        console.log(`User ${userData.email} already exists in Auth. Checking profile...`);
        // We'll still try to update the role in case it's wrong
      } else {
        console.error(`Error creating auth user ${userData.email}:`, authError.message);
        continue;
      }
    }

    const userId = authData?.user?.id || (await getUserIdByEmail(userData.email));

    if (!userId) {
      console.error(`Could not find ID for user ${userData.email}`);
      continue;
    }

    // 2. Update role in profiles table
    // The trigger handle_new_user should have already created the profile
    const { error: profileError } = await supabase
      .from("profiles")
      .update({ role: userData.role })
      .eq("id", userId);

    if (profileError) {
      console.error(`Error updating profile role for ${userData.email}:`, profileError.message);
    } else {
      console.log(`✅ Successfully seeded ${userData.role}: ${userData.email}`);
    }
  }

  console.log("\n✨ Seeding complete.");
}

async function getUserIdByEmail(email) {
  const { data, error } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", email)
    .single();
  
  if (error || !data) return null;
  return data.id;
}

seedUsers();
