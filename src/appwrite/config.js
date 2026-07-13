import conf from '../conf/conf.js';
import { Client, ID, Databases, Storage, Query } from 'appwrite';

export class Service {
    client = new Client();
    databases;
    storage;

    constructor() {
        this.client
            .setEndpoint(conf.appwriteUrl)
            .setProject(conf.appwriteProjectId);
        this.databases = new Databases(this.client);
        this.storage   = new Storage(this.client);
    }

    // ─── POSTS ────────────────────────────────────────────────────────────────

    async createPost({ title, slug, content, featuredImage, status, userId, authorName, gallery = [], category, sentiment, tags = [] }) {
        try {
            return await this.databases.createDocument(
                conf.appwriteDatabaseId, conf.appwriteCollectionId, slug,
                { title, content, featuredImage, status, userId,
                  authorName: authorName || '',
                  gallery: gallery.filter(Boolean),
                  category: category || 'Other',
                  sentiment: sentiment || 'Neutral',
                  tags: (tags || []).filter(Boolean) }
            );
        } catch (e) { console.error("Appwrite :: createPost ::", e); }
    }

    async updatePost(slug, { title, content, featuredImage, status, gallery, category, sentiment, tags }) {
        try {
            return await this.databases.updateDocument(
                conf.appwriteDatabaseId, conf.appwriteCollectionId, slug,
                { title, content, featuredImage, status,
                  ...(gallery   !== undefined && { gallery: gallery.filter(Boolean) }),
                  ...(category  !== undefined && { category }),
                  ...(sentiment !== undefined && { sentiment }),
                  ...(tags      !== undefined && { tags: tags.filter(Boolean) }) }
            );
        } catch (e) { console.error("Appwrite :: updatePost ::", e); }
    }

    async deletePost(slug) {
        try {
            await this.databases.deleteDocument(conf.appwriteDatabaseId, conf.appwriteCollectionId, slug);
            return true;
        } catch (e) { console.error("Appwrite :: deletePost ::", e); return false; }
    }

    async getPost(slug) {
        try {
            return await this.databases.getDocument(conf.appwriteDatabaseId, conf.appwriteCollectionId, slug);
        } catch (e) { console.error("Appwrite :: getPost ::", e); return false; }
    }

    async getPosts(queries = [Query.equal("status", "active")]) {
        try {
            return await this.databases.listDocuments(conf.appwriteDatabaseId, conf.appwriteCollectionId, queries);
        } catch (e) { console.error("Appwrite :: getPosts ::", e); return false; }
    }

    async getPostsByUser(userId) {
        try {
            return await this.databases.listDocuments(
                conf.appwriteDatabaseId, conf.appwriteCollectionId,
                [Query.equal("userId", userId), Query.orderDesc("$createdAt")]
            );
        } catch (e) { console.error("Appwrite :: getPostsByUser ::", e); return false; }
    }

    // ─── FILES ────────────────────────────────────────────────────────────────

    async uploadFile(file) {
        try { return await this.storage.createFile(conf.appwriteBucketId, ID.unique(), file); }
        catch (e) { console.error("Appwrite :: uploadFile ::", e); return false; }
    }

    async deleteFile(fileId) {
        try { await this.storage.deleteFile(conf.appwriteBucketId, fileId); return true; }
        catch (e) { console.error("Appwrite :: deleteFile ::", e); return false; }
    }

    getFilePreview(fileId) {
        if (!fileId) return "";
        return `${conf.appwriteUrl}/storage/buckets/${conf.appwriteBucketId}/files/${fileId}/view?project=${conf.appwriteProjectId}`;
    }

    // ─── LIKES ────────────────────────────────────────────────────────────────

    async likePost(postId, currentLikes) {
        return this.updateLikes(postId, (currentLikes || 0) + 1);
    }

    async updateLikes(postId, newCount) {
        try {
            return await this.databases.updateDocument(
                conf.appwriteDatabaseId, conf.appwriteCollectionId, postId,
                { likes: Math.max(0, newCount) }
            );
        } catch (e) { console.error("Appwrite :: updateLikes ::", e); return false; }
    }

    async updateDislikes(postId, newCount) {
        try {
            return await this.databases.updateDocument(
                conf.appwriteDatabaseId, conf.appwriteCollectionId, postId,
                { dislikes: Math.max(0, newCount) }
            );
        } catch (e) { console.error("Appwrite :: updateDislikes ::", e); return false; }
    }

    // ─── VIEWS ────────────────────────────────────────────────────────────────

    async incrementViews(postId, currentViews) {
        try {
            return await this.databases.updateDocument(
                conf.appwriteDatabaseId, conf.appwriteCollectionId, postId,
                { views: (currentViews || 0) + 1 }
            );
        } catch (e) { console.error("Appwrite :: incrementViews ::", e); return false; }
    }

    // ─── COMMENTS ─────────────────────────────────────────────────────────────

    async getComments(postId) {
        try {
            return await this.databases.listDocuments(
                conf.appwriteDatabaseId, conf.appwriteCommentsCollectionId,
                [Query.equal("postId", postId), Query.orderDesc("$createdAt")]
            );
        } catch (e) { console.error("Appwrite :: getComments ::", e); return false; }
    }

    async addComment({ postId, userId, userName, content }) {
        try {
            return await this.databases.createDocument(
                conf.appwriteDatabaseId, conf.appwriteCommentsCollectionId, ID.unique(),
                { postId, userId, userName, content }
            );
        } catch (e) { console.error("Appwrite :: addComment ::", e); return false; }
    }

    async deleteComment(commentId) {
        try {
            await this.databases.deleteDocument(conf.appwriteDatabaseId, conf.appwriteCommentsCollectionId, commentId);
            return true;
        } catch (e) { console.error("Appwrite :: deleteComment ::", e); return false; }
    }

    // ─── FOLLOWS ──────────────────────────────────────────────────────────────

    async followUser(followerId, followingId) {
        try {
            return await this.databases.createDocument(
                conf.appwriteDatabaseId, conf.appwriteFollowsCollectionId, ID.unique(),
                { followerId, followingId }
            );
        } catch (e) { console.error("Appwrite :: followUser ::", e); return false; }
    }

    async unfollowUser(followDocId) {
        try {
            await this.databases.deleteDocument(conf.appwriteDatabaseId, conf.appwriteFollowsCollectionId, followDocId);
            return true;
        } catch (e) { console.error("Appwrite :: unfollowUser ::", e); return false; }
    }

    async isFollowing(followerId, followingId) {
        try {
            const result = await this.databases.listDocuments(
                conf.appwriteDatabaseId, conf.appwriteFollowsCollectionId,
                [Query.equal("followerId", followerId), Query.equal("followingId", followingId)]
            );
            return result.documents.length > 0 ? result.documents[0] : null;
        } catch (e) { console.error("Appwrite :: isFollowing ::", e); return null; }
    }

    async getFollowing(followerId) {
        try {
            return await this.databases.listDocuments(
                conf.appwriteDatabaseId, conf.appwriteFollowsCollectionId,
                [Query.equal("followerId", followerId)]
            );
        } catch (e) { console.error("Appwrite :: getFollowing ::", e); return false; }
    }

    async getFollowerCount(userId) {
        try {
            const r = await this.databases.listDocuments(
                conf.appwriteDatabaseId, conf.appwriteFollowsCollectionId,
                [Query.equal("followingId", userId), Query.limit(1)]
            );
            return r?.total || 0;
        } catch (e) { console.error("Appwrite :: getFollowerCount ::", e); return 0; }
    }

    async getFollowingCount(userId) {
        try {
            const r = await this.databases.listDocuments(
                conf.appwriteDatabaseId, conf.appwriteFollowsCollectionId,
                [Query.equal("followerId", userId), Query.limit(1)]
            );
            return r?.total || 0;
        } catch (e) { console.error("Appwrite :: getFollowingCount ::", e); return 0; }
    }
}

const service = new Service();
export default service;
