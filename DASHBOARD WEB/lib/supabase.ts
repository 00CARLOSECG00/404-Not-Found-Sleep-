import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Variables de entorno - Next.js reemplaza estas en tiempo de build
// Es importante leerlas directamente para que Next.js pueda inyectarlas correctamente
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Función para obtener el cliente de forma lazy
let supabaseClientInstance: SupabaseClient | null = null;

function getSupabaseClient(): SupabaseClient | null {
  // Debug: mostrar en consola si estamos en desarrollo y no hay credenciales
  if (typeof window !== 'undefined') {
    if (!supabaseUrl || !supabaseKey) {
      console.error('❌ Supabase credentials not found');
      console.error('Variables check:', {
        hasUrl: !!supabaseUrl,
        hasKey: !!supabaseKey,
        urlValue: supabaseUrl || 'EMPTY',
        keyPrefix: supabaseKey ? supabaseKey.substring(0, 20) + '...' : 'EMPTY',
      });
      console.error('💡 Make sure your .env.local file is in the DASHBOARD WEB directory');
      console.error('💡 The file should contain:');
      console.error('   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co');
      console.error('   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key');
      console.error('💡 RESTART your dev server after creating/updating .env.local');
      return null;
    }
  }
  
  if (!supabaseClientInstance) {
    // Si no hay credenciales, no crear el cliente (esto evitará errores de CORS)
    if (!supabaseUrl || !supabaseKey || supabaseUrl === '' || supabaseKey === '') {
      if (typeof window !== 'undefined') {
        console.error('❌ Supabase credentials not configured');
        console.error('📝 Create a .env.local file in DASHBOARD WEB/ with:');
        console.error('   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url');
        console.error('   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key');
      }
      // Retornar un cliente null en lugar de uno con valores dummy
      return null;
    }
    
    supabaseClientInstance = createClient(supabaseUrl, supabaseKey);
    
    if (typeof window !== 'undefined') {
      console.log('✅ Supabase client initialized successfully');
      if (process.env.NODE_ENV === 'development') {
        console.log('🔗 URL:', supabaseUrl.substring(0, 30) + '...');
      }
    }
  }
  return supabaseClientInstance;
}

// Función helper para crear objetos mock que simulan la API de Supabase sin hacer requests
function createMockSupabaseChain() {
  const errorResult = {
    data: null,
    error: {
      message: 'Supabase credentials not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file',
      code: 'CONFIG_ERROR',
      details: null,
      hint: 'Create a .env.local file in the DASHBOARD WEB directory with your Supabase credentials'
    }
  };

  const mockChain = {
    select: () => mockChain,
    eq: () => mockChain,
    order: () => mockChain,
    limit: () => Promise.resolve(errorResult),
    insert: () => mockChain,
    update: () => mockChain,
    execute: () => Promise.resolve(errorResult),
    single: () => Promise.resolve(errorResult),
    maybeSingle: () => Promise.resolve(errorResult)
  };

  return mockChain;
}

// Exportar como objeto proxy para acceso lazy
export const supabase = new Proxy({} as SupabaseClient, {
  get(target, prop) {
    const client = getSupabaseClient();
    
    // Si no hay cliente (sin credenciales), retornar un objeto que simula la API pero no hace requests
    if (!client) {
      // Retornar una función que simula la API pero muestra error
      if (prop === 'from') {
        return () => createMockSupabaseChain();
      }
      // Para otras propiedades, retornar null o función que no hace nada
      return null;
    }
    
    const value = client[prop as keyof SupabaseClient];
    if (typeof value === 'function') {
      return value.bind(client);
    }
    return value;
  }
});

// Tipos para las mediciones hidrológicas
export interface MedicionHidrologica {
  id: number;
  ts: string;
  nivel_m: number;
  lluvia_mm: number;
  base_level: number;
  delta_h: number;
  ror: number | null;
  intensidad_lluvia: number | null;
  proyeccion_30min: number | null;
  pendiente_hidraulica: number;
  persistencia: number;
  procesado_en: string;
  created_at?: string;
}

// Tipos para la comunidad
export interface Comunidad {
  comunidad_id?: number;
  nombre_completo: string;
  telefono: string;
  rol: 'Residente' | 'Centinela' | 'Admin_JAC' | 'Admin_Cabildo';
  direccion_notas?: string;
  es_arrendatario?: boolean;
  esta_activo?: boolean;
  created_at?: string;
}

