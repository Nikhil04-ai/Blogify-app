import React, { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { Input, RTE, Select } from "..";
import appwriteService from "../../appwrite/config";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import classifyPost from "../../utils/classifyPost";

export default function PostForm({ post }) {
    const { register, handleSubmit, watch, setValue, control, getValues } = useForm({
        defaultValues: {
            title:   post?.title   || "",
            slug:    post?.$id     || "",
            content: post?.content || "",
            status:  post?.status  || "active",
        },
    });

    const navigate  = useNavigate();
    const userData  = useSelector((state) => state.auth.userData);
    const isEditing = !!(post && post.$id);
    const [analyzing, setAnalyzing] = useState(false);
    const [publishing, setPublishing] = useState(false);

    const submit = async (data) => {
        // ── Step 1: AI classifies category + sentiment + tags ──────────────
        setAnalyzing(true);
        const classification = await classifyPost(data.title, data.content);
        setAnalyzing(false);
        setPublishing(true);

        if (isEditing) {
            const file = data.image[0]
                ? await appwriteService.uploadFile(data.image[0])
                : null;
            if (file) appwriteService.deleteFile(post.featuredImage);

            let galleryIds = post?.gallery || [];
            if (data.galleryImages && data.galleryImages.length > 0) {
                const uploads = await Promise.all(
                    Array.from(data.galleryImages).map(f => appwriteService.uploadFile(f))
                );
                galleryIds = [...galleryIds, ...uploads.filter(Boolean).map(f => f.$id)];
            }

            const dbPost = await appwriteService.updatePost(post.$id, {
                ...data,
                featuredImage: file ? file.$id : post.featuredImage,
                gallery: galleryIds,
                category: classification.category,
                sentiment: classification.sentiment,
                tags: classification.tags,
            });
            setPublishing(false);
            if (dbPost) navigate(`/post/${dbPost.$id}`);

        } else {
            const file = await appwriteService.uploadFile(data.image[0]);
            if (!file) { setPublishing(false); return; }

            let galleryIds = [];
            if (data.galleryImages && data.galleryImages.length > 0) {
                const uploads = await Promise.all(
                    Array.from(data.galleryImages).map(f => appwriteService.uploadFile(f))
                );
                galleryIds = uploads.filter(Boolean).map(f => f.$id);
            }

            const dbPost = await appwriteService.createPost({
                ...data,
                featuredImage: file.$id,
                userId:        userData.$id,
                authorName:    userData?.name || "",
                gallery:       galleryIds,
                category:      classification.category,
                sentiment:     classification.sentiment,
                tags:          classification.tags,
            });
            setPublishing(false);
            if (dbPost) navigate(`/post/${dbPost.$id}`);
        }
    };

    const slugTransform = useCallback((value) => {
        if (value && typeof value === "string")
            return value.trim().toLowerCase()
                .replace(/[^a-zA-Z\d\s]+/g, "-")
                .replace(/\s/g, "-");
        return "";
    }, []);

    React.useEffect(() => {
        const sub = watch((value, { name }) => {
            if (name === "title") {
                setValue("slug", slugTransform(value.title), { shouldValidate: true });
            }
        });
        return () => sub.unsubscribe();
    }, [watch, slugTransform, setValue]);

    const isBusy = analyzing || publishing;

    return (
        <form onSubmit={handleSubmit(submit)} className="flex flex-wrap">
            {/* ── Left column ── */}
            <div className="w-2/3 px-2">
                <Input label="Title :" placeholder="Title" className="mb-4"
                    {...register("title", { required: true })}/>
                <Input label="Slug :" placeholder="Slug" className="mb-4"
                    {...register("slug", { required: true })}
                    onInput={(e) => setValue("slug", slugTransform(e.currentTarget.value), { shouldValidate: true })}
                />
                <RTE label="Content :" name="content" control={control} defaultValue={getValues("content")}/>
            </div>

            {/* ── Right column ── */}
            <div className="w-1/3 px-2">
                <Input label="Featured Image :" type="file" className="mb-4"
                    accept="image/png, image/jpg, image/jpeg, image/gif"
                    {...register("image", { required: !isEditing })}
                />

                {isEditing && post.featuredImage && (
                    <div className="w-full mb-4">
                        <img src={appwriteService.getFilePreview(post.featuredImage)}
                            alt={post.title} className="rounded-xl w-full"/>
                    </div>
                )}

                <div className="mb-4">
                    <label className="block mb-1.5 pl-1 text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Gallery Images (optional, multiple):
                    </label>
                    <input type="file" multiple accept="image/png, image/jpg, image/jpeg, image/gif"
                        className="px-3 py-2 rounded-xl bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200
                            text-sm w-full border border-gray-200 dark:border-gray-700 outline-none
                            focus:ring-2 focus:ring-violet-400 transition-all file:mr-3 file:text-sm
                            file:border-0 file:bg-violet-50 file:text-violet-600 file:rounded-lg file:px-3 file:py-1
                            dark:file:bg-violet-900/30 dark:file:text-violet-400"
                        {...register("galleryImages")}
                    />
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 pl-1">
                        Select multiple images — shown as a gallery below the post
                    </p>
                </div>

                {isEditing && post?.gallery?.length > 0 && (
                    <div className="mb-4">
                        <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
                            Current Gallery ({post.gallery.length} images):
                        </p>
                        <div className="grid grid-cols-3 gap-1">
                            {post.gallery.map((id, i) => (
                                <img key={i} src={appwriteService.getFilePreview(id)}
                                    className="w-full aspect-square object-cover rounded-md" alt={`gallery ${i + 1}`}/>
                            ))}
                        </div>
                    </div>
                )}

                <Select options={["active", "inactive"]} label="Status" className="mb-4"
                    {...register("status", { required: true })}
                />

                {/* ── AI classification note ── */}
                <div className="mb-4 px-3 py-2.5 bg-violet-50 dark:bg-violet-900/15 rounded-xl
                    border border-violet-100 dark:border-violet-800/30">
                    <p className="text-xs text-violet-600 dark:text-violet-400 leading-relaxed">
                        ✨ AI will automatically detect the category, sentiment, and tags for your post on submit.
                    </p>
                </div>

                <button type="submit" disabled={isBusy}
                    className="w-full py-2.5 rounded-xl font-semibold text-sm text-white
                        transition-all duration-200 active:scale-95 disabled:opacity-70
                        shadow-sm hover:shadow-lg btn-shine flex items-center justify-center gap-2"
                    style={{ background: isEditing
                        ? 'linear-gradient(135deg, #22c55e, #16a34a)'
                        : 'linear-gradient(135deg, #7C3AED, #EC4899)' }}>
                    {analyzing && (
                        <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/> Analyzing content…</>
                    )}
                    {publishing && !analyzing && (
                        <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/> {isEditing ? 'Updating…' : 'Publishing…'}</>
                    )}
                    {!isBusy && (isEditing ? 'Update' : 'Submit')}
                </button>
            </div>
        </form>
    );
}
