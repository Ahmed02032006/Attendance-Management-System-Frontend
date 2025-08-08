import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://dixdinpmggqvsygiglrg.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpeGRpbnBtZ2dxdnN5Z2lnbHJnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mzk1Nzk2NiwiZXhwIjoyMDY5NTMzOTY2fQ.tmLhysQEyT_hOtkJGbM4Vs6akzL4hHMaP9d7bu4WyWQ'

export const supabase = createClient(supabaseUrl, supabaseKey)