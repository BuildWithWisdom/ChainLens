import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private readonly logger = new Logger(SupabaseService.name);
  public readonly client: SupabaseClient;

  constructor(private configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('VITE_SUPABASE_URL');
    // Prefer the secret key (sb_secret_..., bypasses RLS for indexer writes).
    // Falls back to the legacy service_role key, then the publishable/anon key
    // (local dev without RLS).
    const secretKey = this.configService.get<string>('SUPABASE_SECRET_KEY');
    const serviceRoleKey = this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY');
    const anonKey = this.configService.get<string>('VITE_SUPABASE_KEY');
    const supabaseKey = secretKey || serviceRoleKey || anonKey;

    if (!supabaseUrl || !supabaseKey) {
      this.logger.error('Supabase URL or Key is not defined in environment variables!');
      throw new Error('Supabase URL and Key must be defined');
    }

    if (!secretKey && !serviceRoleKey) {
      this.logger.warn('SUPABASE_SECRET_KEY not set, using publishable key. Writes will fail if RLS is enabled.');
    }

    this.client = createClient(supabaseUrl, supabaseKey);
    this.logger.log('Supabase client initialized.');
  }
}