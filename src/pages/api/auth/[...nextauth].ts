import NextAuth, { AuthOptions, User } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { getSession } from 'next-auth/react'

export const authOptions: AuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
            clientSecret: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET!,
            authorization: {
                params: {
                    prompt: "consent",
                    access_type: "offline",
                    response_type: "code"
                }
            }
        })
    ],
    callbacks: {
        signIn: async ({ user, account }) => {
            // Allow sign in
            return true;
        },
        session: async ({ session, token }) => {
            // Include token information in the session

            return session;
        },
        jwt: async ({ token, account, user }) => {
            // Persist the OAuth access_token and id_token to the token right after signin
            if (account) {
                token.accessToken = account.access_token;
                token.idToken = account.id_token;
                token.refeshToken = account.refresh_token;
            }
            return token;
        }
    },
    secret: 'wferonvoerbnoeribe',
}

export default NextAuth(authOptions);