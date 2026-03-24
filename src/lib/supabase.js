import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://yidhgfkatedkugwyssiy.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_QWpxTXpVwqnQlq145MqGxg_Pes9Zjch'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
