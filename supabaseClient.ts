
import { createClient } from '@supabase/supabase-js';

// Tenta pegar das variáveis de ambiente (Configuradas no painel do Netlify)
// Se não encontrar, usa as strings fornecidas (Fallback)
const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL || 'https://ksvgskudcoftkccfjygy.supabase.co';
const supabaseKey = (import.meta as any).env.VITE_SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtzdmdza3VkY29mdGtjY2ZqeWd5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU3MjgyNzUsImV4cCI6MjA4MTMwNDI3NX0.lh8Vs41jsZ2h278i1huGhjkSqxRedvZVmbt6ZH2lwrk';

export const supabase = createClient(supabaseUrl, supabaseKey);
