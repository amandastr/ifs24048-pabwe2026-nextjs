"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { asyncGetPosts } from "@/features/posts/states/postsSlice";
import { removeAccessToken } from "@/helpers/apiHelper";
import { showSuccessDialog, formatDate } from "@/helpers/toolsHelper";
import Link from "next/link";

export default function DashboardPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { posts, isLoading, error } = useAppSelector((state) => state.posts);
  const [isMe, setIsMe] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    dispatch(asyncGetPosts(isMe));
  }, [dispatch, isMe]);

  async function handleLogout() {
    removeAccessToken();
    await showSuccessDialog("Berhasil logout");
    router.replace("/auth/login");
  }

  const filteredPosts = posts.filter((post) =>
    post.description?.toLowerCase().includes(search.toLowerCase()) ||
    post.author?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <h1 className="text-xl font-bold text-slate-800">Delcom Posts</h1>
        <button
          onClick={handleLogout}
          className="px-4 py-2 text-sm bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition"
        >
          Logout
        </button>
      </header>

      <main className="max-w-3xl mx-auto p-4 md:p-6">
        {/* Filter & Search */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6 flex flex-col sm:flex-row gap-3">
          <div className="flex gap-2">
            <button
              onClick={() => setIsMe(false)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                !isMe
                  ? "bg-teal-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Semua
            </button>
            <button
              onClick={() => setIsMe(true)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                isMe
                  ? "bg-teal-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Postingan Saya
            </button>
          </div>
          <input
            type="text"
            placeholder="Cari postingan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
          />
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="text-center py-12 text-slate-500">
            Memuat postingan...
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-4 text-sm">
            {error}
          </div>
        )}

        {/* Empty */}
        {!isLoading && filteredPosts.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            Tidak ada postingan ditemukan.
          </div>
        )}

        {/* List Postingan */}
        <div className="space-y-4">
          {filteredPosts.map((post) => (
            <Link
              key={post.id}
              href={`/dashboard/posts/${post.id}`}
              className="block bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold">
                  {post.author?.name?.charAt(0)?.toUpperCase() || "U"}
                </div>
                <div>
                  <p className="font-semibold text-slate-800 text-sm">
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
                  className="w-full h-48 object-cover rounded-lg mb-3"
                />
              )}

              <p className="text-slate-700 text-sm line-clamp-3 mb-3">
                {post.description}
              </p>

              <div className="flex gap-4 text-xs text-slate-500">
                <span>
                  {Array.isArray(post.likes) ? post.likes.length : 0} suka
                </span>
                <span>
                  {Array.isArray(post.comments) ? post.comments.length : 0} komentar
                </span>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}