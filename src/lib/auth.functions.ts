import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

// Public registration endpoint: creates a Supabase Auth user, mints the role-specific
// display ID (PAT1001/DOC1001/...), inserts the profile + user_roles rows.
// Uses supabaseAdmin (service role) because the underlying tables are locked to
// authenticated users only; ID minting requires the SECURITY DEFINER counter
// function which is server-only.
//
// Email format is synthetic: `<id>@documed.local`. The user logs in with their
// display ID + chosen password; the client maps ID -> email before signInWithPassword.

const ROLE_PREFIX: Record<string, string> = {
  Patient: "PAT",
  Doctor: "DOC",
  "Laboratory Staff": "LAB",
  "Medical Records Staff": "MRS",
};
const ROLE_KEY: Record<string, string> = {
  Patient: "patient",
  Doctor: "doctor",
  "Laboratory Staff": "lab",
  "Medical Records Staff": "mrs",
};
const ROLE_ENUM: Record<string, "patient" | "doctor" | "lab" | "mrs"> = {
  Patient: "patient",
  Doctor: "doctor",
  "Laboratory Staff": "lab",
  "Medical Records Staff": "mrs",
};

const RegisterSchema = z.object({
  role: z.enum([
    "Patient",
    "Doctor",
    "Laboratory Staff",
    "Medical Records Staff",
  ]),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().min(1),
  mobile: z.string().optional(),
  dob: z.string().optional(),
  gender: z.string().optional(),
  address: z.string().optional(),
  reg_number: z.string().optional(),
  hospital: z.string().optional(),
  email: z.string().optional(),
  lab_name: z.string().optional(),
  org: z.string().optional(),
});

export const registerUser = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => RegisterSchema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );

    // 1. Mint next ID atomically via SECURITY DEFINER function
    const { data: nextNum, error: rpcErr } = await supabaseAdmin.rpc(
      "get_next_id" as never,
      { role_key: ROLE_KEY[data.role] } as never,
    );
    if (rpcErr) throw new Error(`Could not allocate ID: ${rpcErr.message}`);

    const displayId = `${ROLE_PREFIX[data.role]}${nextNum}`;
    const syntheticEmail = `${displayId.toLowerCase()}@documed.local`;

    // 2. Create the auth user (admin API, auto-confirmed)
    const { data: authData, error: authErr } =
      await supabaseAdmin.auth.admin.createUser({
        email: syntheticEmail,
        password: data.password,
        email_confirm: true,
        user_metadata: { display_id: displayId, role: data.role },
      });
    if (authErr || !authData.user) {
      throw new Error(authErr?.message || "Could not create account");
    }
    const authUserId = authData.user.id;

    try {
      // 3. Insert profile row
      const profileRow: Record<string, unknown> = {
        id: displayId,
        role: data.role,
        auth_user_id: authUserId,
        name: data.name,
        mobile: data.mobile ?? null,
        dob: data.dob ?? null,
        gender: data.gender ?? null,
        address: data.address ?? null,
        reg_number: data.reg_number ?? null,
        hospital: data.hospital ?? null,
        email: data.email ?? null,
        lab_name: data.lab_name ?? null,
        org: data.org ?? null,
      };
      const { error: profErr } = await supabaseAdmin
        .from("users" as never)
        .insert(profileRow as never);
      if (profErr) throw profErr;

      // 4. Assign role
      const { error: roleErr } = await supabaseAdmin
        .from("user_roles" as never)
        .insert({ user_id: authUserId, role: ROLE_ENUM[data.role] } as never);
      if (roleErr) throw roleErr;

      return { id: displayId, email: syntheticEmail };
    } catch (e) {
      // Roll back the auth user so the display ID can be retried
      await supabaseAdmin.auth.admin.deleteUser(authUserId).catch(() => {});
      throw e;
    }
  });
