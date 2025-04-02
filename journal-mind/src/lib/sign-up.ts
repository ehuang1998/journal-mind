import {authClient} from "@/lib/auth-client"; //import the auth client

// const email = "user@example.com"; // Replace with actual user input
// const name = "John Doe"; // Replace with actual user input
// const password = "securePassword123"; 


async function handleSignUp(email: string, password: string, name: string) {
  const { data, error } = await authClient.signUp.email(
    {
      email,
      password,
      name : "John", // optional
    },
    {
      onRequest: (ctx) => {
        console.log("Signup request started", ctx);
      },
      onSuccess: (ctx) => {
        console.log("Signup success", ctx);
        // e.g., redirect to login or dashboard
      },
      onError: (ctx) => {
        console.error("Signup failed", ctx.error.message);
        alert(ctx.error.message);
      },
    }
  );

  if (error) {
    console.error("Signup error:", error);
    return;
  }

  console.log("Signup response data:", data);
}
