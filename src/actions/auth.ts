"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { sendOtpEmail } from "@/lib/email";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export async function loginAction(formData: FormData) {
  console.log("=== LOGIN ACTION START ===");
  
  const data = loginSchema.parse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  console.log("Login attempt:", { email: data.email });

  const supabase = await createClient();

  // Verify password
  console.log("Verifying password...");
  const { error: passwordError } = await supabase.auth.signInWithPassword({
    email: data.email,
    password: data.password,
  });

  if (passwordError) {
    console.error("Password verification failed:", passwordError.message);
    return { error: passwordError.message };
  }

  console.log("Password verified, signing out...");
  // Sign out immediately (we'll sign in again after OTP)
  await supabase.auth.signOut();

  // Generate and send OTP
  console.log("Generating OTP...");
  const adminClient = createAdminClient();
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // Delete old OTP codes
  console.log("Deleting old OTP codes...");
  await adminClient.from("otp_codes").delete().eq("email", data.email);

  // Insert new OTP
  console.log("Inserting new OTP...");
  const { error: otpError } = await adminClient.from("otp_codes").insert({
    email: data.email,
    code,
    expires_at: expiresAt.toISOString(),
    verified: false,
  });

  if (otpError) {
    console.error("OTP insert failed:", otpError);
    return { error: "Failed to send OTP" };
  }

  // Send OTP email
  console.log("Sending OTP email...");
  try {
    await sendOtpEmail(data.email, code);
    console.log("OTP email sent successfully");
  } catch (emailError) {
    console.error("Email send failed:", emailError);
  }

  console.log("=== LOGIN ACTION SUCCESS ===");
  return { success: true };
}

const loginVerifyOtpSchema = z.object({
  email: z.string().email(),
  code: z.string().length(6),
});

export async function loginVerifyOtpAction(formData: FormData) {
  console.log("=== LOGIN VERIFY OTP START ===");
  
  const data = loginVerifyOtpSchema.parse({
    email: formData.get("email"),
    code: formData.get("token"),
  });

  console.log("OTP verification:", { email: data.email, code: data.code });

  const adminClient = createAdminClient();

  // Verify OTP
  console.log("Checking OTP in database...");
  const { data: otpData, error: otpError } = await adminClient
    .from("otp_codes")
    .select("*")
    .eq("email", data.email)
    .eq("code", data.code)
    .eq("verified", false)
    .single();

  if (otpError || !otpData) {
    console.error("OTP not found:", otpError);
    return { error: "Invalid or expired OTP code" };
  }

  // Check expiry
  console.log("Checking expiry:", otpData.expires_at);
  if (new Date(otpData.expires_at) < new Date()) {
    console.error("OTP expired");
    return { error: "OTP code has expired" };
  }

  // Mark as verified
  console.log("Marking OTP as verified...");
  await adminClient
    .from("otp_codes")
    .update({ verified: true })
    .eq("id", otpData.id);

  // Get user
  console.log("Finding user...");
  const { data: userData } = await adminClient.auth.admin.listUsers();
  const user = userData?.users.find((u) => u.email === data.email);

  if (!user) {
    console.error("User not found");
    return { error: "User not found" };
  }

  console.log("User found:", user.id);

  // Sign in the user directly using admin
  console.log("Signing in user...");
  
  // Generate a one-time sign-in link
  const { data: linkData, error: linkError } = await adminClient.auth.admin.generateLink({
    type: "magiclink",
    email: data.email,
  });

  if (linkError || !linkData) {
    console.error("Link generation failed:", linkError);
    return { error: "Failed to create session" };
  }

  console.log("=== LOGIN VERIFY OTP SUCCESS ===");
  
  // Redirect to the action link which will create the session
  redirect(linkData.properties.action_link);
}

const sendOtpSchema = z.object({
  email: z.string().email(),
});

export async function sendOtpAction(formData: FormData) {
  console.log("📧 [sendOtpAction] Starting OTP send process");

  const data = sendOtpSchema.parse({
    email: formData.get("email"),
  });

  console.log("📧 [sendOtpAction] Email:", data.email);

  const supabase = await createClient();
  const adminClient = createAdminClient();

  // Generate 6-digit OTP
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  console.log("📧 [sendOtpAction] Generated OTP code:", code);

  // Delete old OTP codes for this email
  await adminClient.from("otp_codes").delete().eq("email", data.email);

  console.log("🗑️ [sendOtpAction] Deleted old OTP codes");

  // Insert new OTP
  const { error: otpError } = await adminClient.from("otp_codes").insert({
    email: data.email,
    code,
    expires_at: expiresAt.toISOString(),
    verified: false,
  });

  if (otpError) {
    console.error("❌ [sendOtpAction] Database error:", otpError);
    return { error: otpError.message };
  }

  console.log("✅ [sendOtpAction] OTP saved to database");

  // Send OTP email
  try {
    await sendOtpEmail(data.email, code);
    console.log("✅ [sendOtpAction] Email sent successfully");
  } catch (emailError) {
    console.error("❌ [sendOtpAction] Email error:", emailError);
    return { error: "Failed to send verification email" };
  }

  return { success: true };
}

const verifyOtpSchema = z.object({
  email: z.string().email(),
  token: z.string().length(6),
});

export async function verifyOtpAction(formData: FormData) {
  console.log("🔐 [verifyOtpAction] Starting OTP verification");

  const data = verifyOtpSchema.parse({
    email: formData.get("email"),
    token: formData.get("token"),
  });

  console.log("🔐 [verifyOtpAction] Email:", data.email, "Token:", data.token);

  const adminClient = createAdminClient();

  // Verify OTP
  const { data: otpData, error: otpError } = await adminClient
    .from("otp_codes")
    .select("*")
    .eq("email", data.email)
    .eq("code", data.token)
    .eq("verified", false)
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (otpError || !otpData) {
    console.error("❌ [verifyOtpAction] Invalid OTP:", otpError);
    return { error: "Invalid or expired code" };
  }

  console.log("✅ [verifyOtpAction] OTP verified, marking as used");

  // Mark OTP as verified
  await adminClient
    .from("otp_codes")
    .update({ verified: true })
    .eq("id", otpData.id);

  console.log("✅ [verifyOtpAction] Verification complete");

  return { success: true, email: data.email };
}

const completeProfileSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  username: z.string().min(3).max(50),
  phone: z.string().optional(),
  country: z.string().min(2),
  state: z.string().optional(),
  city: z.string().optional(),
  address: z.string().optional(),
  password: z.string().min(8),
});

export async function completeProfileAction(formData: FormData) {
  console.log("👤 [completeProfileAction] Starting profile completion");

  const data = completeProfileSchema.parse({
    email: formData.get("email"),
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    username: formData.get("username"),
    phone: formData.get("phone"),
    country: formData.get("country"),
    state: formData.get("state"),
    city: formData.get("city"),
    address: formData.get("address"),
    password: formData.get("password"),
    captchaToken: formData.get("captchaToken"),
  });

  console.log(
    "👤 [completeProfileAction] Email:",
    data.email,
    "Username:",
    data.username,
  );

  const adminClient = createAdminClient();

  // Check if user already exists
  const { data: existingUser } = await adminClient.auth.admin.listUsers();
  const user = existingUser?.users.find((u) => u.email === data.email);

  if (user) {
    console.log(
      "⚠️ [completeProfileAction] User already exists, updating profile",
    );

    // Update user metadata and password
    await adminClient.auth.admin.updateUserById(user.id, {
      password: data.password,
      user_metadata: {
        first_name: data.firstName,
        last_name: data.lastName,
        username: data.username,
        phone: data.phone || "",
        country: data.country,
        state: data.state || "",
        city: data.city || "",
        address: data.address || "",
      },
    });

    // Update profiles table directly
    const { error: profileError } = await adminClient
      .from("profiles")
      .update({
        username: data.username,
        first_name: data.firstName,
        last_name: data.lastName,
        phone: data.phone || "",
        country: data.country,
        state: data.state || "",
        city: data.city || "",
        address: data.address || "",
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (profileError) {
      console.error(
        "❌ [completeProfileAction] Profile update error:",
        profileError,
      );
      return { error: profileError.message };
    }

    console.log("✅ [completeProfileAction] User updated, signing in");

    // Sign in the user with captcha token
    const supabase = await createClient();
    const { error: signInError } =
      await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

    if (signInError) {
      console.error("❌ [completeProfileAction] Sign in error:", signInError);
      return { error: signInError.message };
    }

    console.log("✅ [completeProfileAction] Sign in successful, redirecting");
    redirect("/dashboard");
    return { success: true };
  }

  // Create user account with Supabase Auth
  const { data: authData, error: authError } =
    await adminClient.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true, // Skip email verification since we already verified via OTP
      user_metadata: {
        first_name: data.firstName,
        last_name: data.lastName,
        username: data.username,
        phone: data.phone || "",
        country: data.country,
        state: data.state || "",
        city: data.city || "",
        address: data.address || "",
      },
    });

  if (authError) {
    console.error("❌ [completeProfileAction] User creation error:", authError);
    return { error: authError.message };
  }

  console.log("✅ [completeProfileAction] User created, signing in");

  // Sign in the newly created user with captcha token
  const supabase = await createClient();
  const signInOptions: any = {
    email: data.email,
    password: data.password,
  };

  const { error: signInError } =
    await supabase.auth.signInWithPassword(signInOptions);

  if (signInError) {
    console.error("❌ [completeProfileAction] Sign in error:", signInError);
    return { error: signInError.message };
  }

  console.log(
    "✅ [completeProfileAction] Sign in successful, sending welcome email",
  );

  // Send welcome email
  try {
    const { sendWelcomeEmail } = await import("@/lib/email");
    await sendWelcomeEmail(data.email, data.firstName);
    console.log("✅ [completeProfileAction] Welcome email sent");
  } catch (emailError) {
    console.error(
      "⚠️ [completeProfileAction] Failed to send welcome email:",
      emailError,
    );
    // Don't fail the registration if email fails
  }

  redirect("/onboarding/kyc-advanced");
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export async function forgotPasswordAction(formData: FormData) {
  const data = forgotPasswordSchema.parse({
    email: formData.get("email"),
  });

  const supabase = await createClient();

  const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`,
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

const resetPasswordSchema = z.object({
  password: z.string().min(8),
});

export async function resetPasswordAction(formData: FormData) {
  const data = resetPasswordSchema.parse({
    password: formData.get("password"),
  });

  const supabase = await createClient();

  const { error } = await supabase.auth.updateUser({
    password: data.password,
  });

  if (error) {
    return { error: error.message };
  }

  redirect("/login");
}

const updateProfileSchema = z.object({
  firstName: z.string().min(2).optional(),
  lastName: z.string().min(2).optional(),
  phone: z.string().optional(),
  country: z.string().min(2).optional(),
  state: z.string().optional(),
  city: z.string().optional(),
  address: z.string().optional(),
});

export async function updateProfileAction(formData: FormData) {
  const data = updateProfileSchema.parse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    phone: formData.get("phone"),
    country: formData.get("country"),
    state: formData.get("state"),
    city: formData.get("city"),
    address: formData.get("address"),
  });

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      first_name: data.firstName,
      last_name: data.lastName,
      phone: data.phone,
      country: data.country,
      state: data.state,
      city: data.city,
      address: data.address,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/account");
  return { success: true };
}
