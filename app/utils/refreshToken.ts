export default async function refreshToken() {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/refresh-token`,
    {
      method: "POST",
      credentials: "include",
    }
  );

  return response;
}
