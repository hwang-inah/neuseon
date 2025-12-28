// // 로그인/로그아웃

// "use client";

// import { useEffect, useState } from "react";
// import { supabase } from "@/lib/supabase";

// export function useAuth() {
//   const [user, setUser] = useState(null);
//   const [authLoading, setAuthLoading] = useState(true);

//   useEffect(() => {
//     let mounted = true;

//     async function init() {
//       const { data } = await supabase.auth.getUser();
//       if (!mounted) return;
//       setUser(data.user ?? null);
//       setAuthLoading(false);
//     }

//     init();

//     const { data: sub } = supabase.auth.onAuthStateChange(async () => {
//       const { data } = await supabase.auth.getUser();
//       if (!mounted) return;
//       setUser(data.user ?? null);
//       setAuthLoading(false);
//     });

//     return () => {
//       mounted = false;
//       sub.subscription.unsubscribe();
//     };
//   }, []);

//   return { user, authLoading };
// }
