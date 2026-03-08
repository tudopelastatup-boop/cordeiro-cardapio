import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://jyaltcyjuwqvjxntipcz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp5YWx0Y3lqdXdxdmp4bnRpcGN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5NzQ2MzMsImV4cCI6MjA4ODU1MDYzM30.gEmtGN9cHYngFVzepa3vUvhPs3fBAxOKF45VFCvgDdc';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
