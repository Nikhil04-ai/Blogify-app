import conf from "../conf/conf.js";
import { Client, Account, ID } from "appwrite";

// Converts raw network-level failures ("Failed to fetch") into a message
// that's actually useful to someone using the app — the technical cause
// (CORS / wrong endpoint / no internet) isn't something an end-user can act
// on, but "check your connection and try again" is.
function friendlyAuthError(error) {
    if (error?.message === 'Failed to fetch' || error?.name === 'TypeError') {
        return new Error('Unable to connect to the server. Please check your internet connection and try again.');
    }
    return error;
}

export class AuthService {
    client = new Client();
    account;

    constructor() {
        this.client
            .setEndpoint(conf.appwriteUrl)
            .setProject(conf.appwriteProjectId);
        this.account = new Account(this.client);
    }

    async createAccount({ email, password, name }) {
        try {
            const userAccount = await this.account.create(ID.unique(), email, password, name);
            if (userAccount) {
                return this.login({ email, password });
            }
            return userAccount;
        } catch (error) {
            throw friendlyAuthError(error);
        }
    }

    async login({ email, password }) {
        try {
            return await this.account.createEmailPasswordSession(email, password);
        } catch (error) {
            throw friendlyAuthError(error);
        }
    }

    async getCurrentUser() {
        try {
            return await this.account.get();
        } catch {
            // No active session — this is the expected, normal case for a
            // logged-out visitor, so it's silently treated as "not logged in"
            // rather than logged as an error.
            return null;
        }
    }

    async logout() {
        try {
            return await this.account.deleteSessions();
        } catch (error) {
            console.log("Appwrite :: logout :: error", error);
        }
    }

    // ── Email Verification ────────────────────────────────────────────────────

    async sendVerificationEmail() {
        try {
            const verifyUrl = `${window.location.origin}/verify-email`;
            return await this.account.createVerification(verifyUrl);
        } catch (error) {
            throw friendlyAuthError(error);
        }
    }

    async verifyEmail(userId, secret) {
        try {
            return await this.account.updateVerification(userId, secret);
        } catch (error) {
            throw friendlyAuthError(error);
        }
    }

    // ── Password Recovery ─────────────────────────────────────────────────────

    async sendPasswordReset(email) {
        try {
            const resetUrl = `${window.location.origin}/reset-password`;
            return await this.account.createRecovery(email, resetUrl);
        } catch (error) {
            throw friendlyAuthError(error);
        }
    }

    async resetPassword(userId, secret, password) {
        try {
            return await this.account.updateRecovery(userId, secret, password);
        } catch (error) {
            throw friendlyAuthError(error);
        }
    }
}

const authService = new AuthService();
export default authService;
