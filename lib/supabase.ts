
// Arquivo neutralizado para modo Frontend-Only (Offline)
// O aplicativo está rodando com dados locais (Mock) e LocalStorage.

export const supabase = {
  // Mock methods para evitar crash caso algo ainda tente importar este arquivo
  from: () => ({
    select: () => Promise.resolve({ data: [], error: null }),
    insert: () => Promise.resolve({ data: [], error: null }),
  }),
  auth: {
    getSession: () => Promise.resolve({ data: { session: null } }),
    signInWithPassword: () => Promise.resolve({ data: {}, error: null }),
    signOut: () => Promise.resolve(),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
  }
};
