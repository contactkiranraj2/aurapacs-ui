const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";

interface LoginResponse {
  message: string;
  user: Record<string, unknown>; // Define a more specific type for user
  tenant: Record<string, unknown>; // Define a more specific type for tenant
  role: string | null;
}

interface RegisterResponse {
  message: string;
  tenantId: string;
  userId: string | null;
}

export const loginUser = async (
  email: string,
  password: string,
): Promise<LoginResponse> => {
  const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "An unknown error occurred during login.");
  }

  return data;
};

export const registerUser = async (registrationData: {
  email?: string;
  password?: string;
  accountType: "individual" | "institution";
  orgName?: string;
}): Promise<RegisterResponse> => {
  const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(registrationData),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(
      data.error || "An unknown error occurred during registration.",
    );
  }

  return data;
};
