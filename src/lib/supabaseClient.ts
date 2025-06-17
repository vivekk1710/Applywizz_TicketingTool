import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ogwiuvxvhblhqmdsncyg.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9nd2l1dnh2aGJsaHFtZHNuY3lnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3MDM3MzQsImV4cCI6MjA2NTI3OTczNH0.fpP1T3XBupE84mhgWloydPRoOe6GwZ-uE6Htqz89RQQ'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

