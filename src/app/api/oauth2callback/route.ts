import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const state = searchParams.get("state");

  // Handle OAuth errors
  if (error) {
    console.error("OAuth error:", error);
    return NextResponse.json(
      { error: "OAuth authentication failed", details: error },
      { status: 400 },
    );
  }

  // Handle successful authorization
  if (code) {
    console.log("OAuth authorization code received:", code);

    // For now, just return the code - you can process it further as needed
    // In a real implementation, you'd exchange this code for tokens
    return NextResponse.json({
      success: true,
      message: "Authorization code received successfully",
      code: code,
      state: state,
    });
  }

  // No code or error - invalid request
  return NextResponse.json(
    { error: "Invalid OAuth callback - no code or error parameter" },
    { status: 400 },
  );
}
