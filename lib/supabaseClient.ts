import { createClient } from '@supabase/supabase-js';

// URL e Chave Pública (anônima) do seu projeto Supabase.
const supabaseUrl = 'https://gbdeohccvieaphzsowtq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdiZGVvaGNjdmllYXBoenNvd3RxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI1NTQ3NjYsImV4cCI6MjA3ODEzMDc2Nn0.lYOFI3cZcmzprszBTvYtHpFV2w1pw0F23wauJ3Zc9vE';

// Cria e exporta o cliente Supabase.
// Este cliente será usado em toda a aplicação para interagir com o banco de dados.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
