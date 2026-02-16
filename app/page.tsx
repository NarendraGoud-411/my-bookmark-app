"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

export default function Home() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [user, setUser] = useState<any>(null);
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(true);

  // ---------- AUTH + INIT ----------
  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) fetchBookmarks(user.id);
      setLoading(false);
    };
    init();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchBookmarks(session.user.id);
      else setBookmarks([]);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const fetchBookmarks = async (userId: string) => {
    const { data } = await supabase.from("bookmarks").select("*").eq("user_id", userId).order("created_at", { ascending: false });
    setBookmarks(data || []);
  };

  // ---------- LOGIN ----------
  const login = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  };

  // ---------- ADD ----------
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const { data, error } = await supabase.from("bookmarks").insert([{ title, url, user_id: user.id }]).select().single();
    if (!error && data) {
      setBookmarks(prev => [data, ...prev]);
      setTitle("");
      setUrl("");
    }
  };

  // ---------- DELETE ----------
  const handleDelete = async (id: string) => {
    await supabase.from("bookmarks").delete().eq("id", id);
    setBookmarks(prev => prev.filter(b => b.id !== id));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-100 text-gray-900">

      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 bg-white/70 backdrop-blur-lg border-b border-white/40 px-6 py-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-indigo-600 to-blue-500 p-2 rounded-2xl shadow-md">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
            </div>
            <span className="font-bold text-xl tracking-tight">Bookmark<span className="text-indigo-600">App</span></span>
          </div>

          {user ? (
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium">{user.email}</p>
                
              </div>
              <button onClick={() => supabase.auth.signOut()} className="px-4 py-2 rounded-xl bg-white border border-gray-200 shadow-sm hover:bg-red-50 hover:text-red-600 hover:border-red-200 hover:shadow-md transition-all duration-300 text-sm font-medium">Logout</button>
            </div>
          ) : (
            <button onClick={login} className="px-6 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-500 text-white font-semibold shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300">Sign Up / Sign in</button>
          )}
        </div>
      </nav>

      {/* MAIN */}
      <main className="max-w-6xl mx-auto px-6 py-14">

        {loading ? (
          <div className="text-center text-gray-500">Loading...</div>
        ) : !user ? (
          <div className="text-center mt-24 bg-white/70 backdrop-blur-xl border border-white/40 p-14 rounded-3xl shadow-xl">
            <h1 className="text-4xl font-bold mb-4">Save all your important links</h1>
            <p className="text-gray-600 mb-8">Simple, secure and accessible anywhere.</p>
            <button onClick={login} className="px-8 py-3 rounded-xl bg-indigo-600 text-white font-semibold shadow-lg hover:bg-indigo-700 hover:scale-105 transition-all duration-300">Get Started</button>
          </div>
        ) : (
          <div className="space-y-12">

            {/* ADD FORM */}
            <div className="bg-white/70 backdrop-blur-xl p-8 rounded-3xl shadow-xl border border-white/40">
              <h2 className="text-xl font-semibold mb-6">Add New Bookmark</h2>
              <form onSubmit={handleAdd} className="flex flex-col md:flex-row gap-4">
                <input required value={title} onChange={e => setTitle(e.target.value)} placeholder="Website Title" className="flex-1 px-4 py-3 rounded-xl bg-white/80 border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none transition" />
                <input required value={url} onChange={e => setUrl(e.target.value)} placeholder="https://example.com" className="flex-1 px-4 py-3 rounded-xl bg-white/80 border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none transition" />
                <button type="submit" className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-500 text-white font-semibold shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300">Save</button>
              </form>
            </div>

            {/* LIST */}
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                Your Saved Links
                <span className="bg-indigo-100 text-indigo-600 text-xs font-semibold px-2 py-0.5 rounded-full">{bookmarks.length}</span>
              </h3>

              {bookmarks.length === 0 ? (
                <div className="text-center py-16 text-gray-400 bg-white/60 rounded-2xl border border-white/40">
                  <p className="text-lg font-medium">No bookmarks yet</p>
                  <p className="text-sm mt-2">Start by adding your first link 🚀</p>
                </div>
              ) : (
                <div className="grid gap-5">
                  {bookmarks.map(b => (
                    <div key={b.id} className="group bg-white/80 backdrop-blur-lg border border-white/40 p-6 rounded-2xl shadow-md hover:shadow-2xl hover:-translate-y-1 active:scale-[0.98] transition-all duration-300 flex justify-between items-center">
                      <div className="truncate pr-4">
                        <a href={b.url} target="_blank" rel="noopener noreferrer" className="relative font-semibold text-indigo-600 after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 after:bg-indigo-600 after:transition-all after:duration-300 group-hover:after:w-full">{b.title}</a>
                        <p className="text-xs text-gray-400 truncate mt-1">{b.url}</p>
                      </div>
                      <button onClick={() => handleDelete(b.id)} className="opacity-0 group-hover:opacity-100 transition-all duration-300 bg-red-50 hover:bg-red-100 text-red-500 rounded-full p-2 hover:scale-110 active:scale-95">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}
      </main>
    </div>
  );
}
