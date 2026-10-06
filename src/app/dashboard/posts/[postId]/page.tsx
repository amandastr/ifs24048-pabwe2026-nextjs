"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { asyncGetPostDetail } from "@/features/posts/states/postsSlice";
import { formatDate } from "@/helpers/toolsHelper";
import Link from "next/link";

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { post, isLoading, error } = useAppSelector((state) => state.posts);
  const postId = params.postId as string;

  useEffect(() => {
    if (postId) {
      dispatch(asyncGetPostDetail(postId));
    }
  }, [dispatch, postId]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500">
        Memuat detail...
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-red-500">{error || "Postingan tidak ditemukan"}</p>
        <Link href="/dashboard" className="text-teal-600 hover:underline">
          Kembali ke Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <button
          onClick={() => router.back()}
          className="text-sm text-teal-600 hover:underline"
        >
          ← Kembali
        </button>
      </header>

      <main className="max-w-2xl mx-auto p-4 md:p-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold text-lg">
              {post.author?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <div>
              <p className="font-semibold text-slate-800">
                {post.author?.name || "Pengguna"}
              </p>
              <p className="text-xs text-slate-400">
                {formatDate(post.created_at)}
              </p>
            </div>
          </div>

          {post.cover && (
            <img
              src={post.cover}
              alt="Cover"
              className="w-full rounded-lg mb-4 object-cover max-h-80"
            />
          )}

          <p className="text-slate-700 whitespace-pre-wrap mb-6">
            {post.description}
          </p>

          <div className="flex gap-6 text-sm text-slate-500 border-t border-slate-100 pt-4">
            <span>
              {Array.isArray(post.likes) ? post.likes.length : 0} suka
            </span>
            <span>
              {Array.isArray(post.comments) ? post.comments.length : 0} komentar
            </span>
          </div>

          {/* Daftar Komentar */}
          {Array.isArray(post.comments) && post.comments.length > 0 && (
            <div className="mt-6 space-y-3">
              <h3 className="font-semibold text-slate-800">Komentar</h3>
              {post.comments.map((c: any) => (
                <div
                  key={c.id}
                  className="bg-slate-50 rounded-lg p-3 text-sm"
                >
                  <p className="text-slate-700">{c.comment}</p>
                  <p className="text-xs text-slate-400 mt-1">
                    {formatDate(c.created_at)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}