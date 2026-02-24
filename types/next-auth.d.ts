import NextAuth, { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface User {
    accessToken?: string;
    user?: any;
  }

  interface Session {
    accessToken?: string;
    user?: {
      id?: string;
      role?: string;
    } & DefaultSession['user'];
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken?: string;
    user?: any;
  }
}
