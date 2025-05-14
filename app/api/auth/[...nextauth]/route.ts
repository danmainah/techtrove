import NextAuth from "../../../../auth";

export async function GET(request: unknown, response: unknown) {
  return NextAuth(request, response);
}

export async function POST(request: unknown, response: unknown) {
  return NextAuth(request, response);
}