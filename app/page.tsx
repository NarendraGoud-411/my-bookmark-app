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

  useEffect(() => {
    const fetchUserAndData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) fetchBookmarks();
    };
    fetchUserAndData();

    const channel = supabase
      .channel('realtime-bookmarks')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookmarks' }, () => {
        fetchBookmarks();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel) };
  }, []);

  const fetchBookmarks = async () => {
    const { data } = await supabase.from("bookmarks").select("*").order("created_at", { ascending: false });
    setBookmarks(data || []);
  };

  const login = () => supabase.auth.signInWithOAuth({ 
    provider: 'google', 
    options: { redirectTo: `${window.location.origin}/auth/callback` } 
  });

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const { error } = await supabase.from("bookmarks").insert([{ title, url, user_id: user.id }]);
    if (!error) { setTitle(""); setUrl(""); }
  };

  const handleDelete = async (id: string) => {
    await supabase.from("bookmarks").delete().eq("id", id);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <nav className="bg-white border-b px-6 py-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <button onClick={() => window.location.href = '/'} className="flex items-center gap-2">
            <div className="bg-blue-600 p-1.5 rounded">
               <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                 <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
               </svg>
            </div>
            <span className="font-bold text-xl">BookmarkApp</span>
          </button>
          
          {user ? (
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500 hidden sm:block">{user.email}</span>
              <button onClick={() => supabase.auth.signOut().then(() => window.location.reload())} className="text-sm font-medium hover:text-red-600">Logout</button>
            </div>
          ) : (
            <button onClick={login} className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-semibold">Sign Up / Sign in</button>
          )}
        </div>
      </nav>

      <main className="max-w-4xl mx-auto p-6">
        {!user ? (
          <div className="mt-20 text-center bg-white border p-12 rounded-xl shadow-sm">
            <h1 className="text-3xl font-bold mb-2">Welcome to BookmarkApp</h1>
            <p className="text-gray-600 mb-8">Save your links securely and access them anywhere.</p>
            <button onClick={login} className="bg-gray-900 text-white px-6 py-3 rounded-lg font-semibold transition hover:bg-gray-800">Get Started Now</button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl border shadow-sm">
              <h2 className="text-lg font-semibold mb-4">Add New Bookmark</h2>
              <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-3">
                <input required className="flex-1 border px-4 py-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" placeholder="Website Title" value={title} onChange={e => setTitle(e.target.value)} />
                <input required className="flex-1 border px-4 py-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" placeholder="https://example.com" value={url} onChange={e => setUrl(e.target.value)} />
                <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold">Save</button>
              </form>
            </div>

            <div className="grid gap-3">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Your Saved Links</h3>
              {bookmarks.map(b => (
                <div key={b.id} className="bg-white p-4 rounded-lg border flex justify-between items-center hover:shadow-md transition">
                  <div className="truncate pr-4">
                    <a href={b.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-blue-600 hover:underline">{b.title}</a>
                    <p className="text-xs text-gray-400 truncate mt-0.5">{b.url}</p>
                  </div>
                  <button onClick={() => handleDelete(b.id)} className="text-gray-400 hover:text-red-500 p-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}