export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      vendors: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          user_id: string
          business_name: string
          contact_number: string
          status: 'pending' | 'approved' | 'rejected' | 'deactivated'
          stall_id: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id: string
          business_name: string
          contact_number: string
          status?: 'pending' | 'approved' | 'rejected' | 'deactivated'
          stall_id?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id?: string
          business_name?: string
          contact_number?: string
          status?: 'pending' | 'approved' | 'rejected' | 'deactivated'
          stall_id?: string | null
        }
      }
      stalls: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          stall_number: string
          location: string
          status: 'available' | 'occupied' | 'maintenance'
          vendor_id: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          stall_number: string
          location: string
          status?: 'available' | 'occupied' | 'maintenance'
          vendor_id?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          stall_number?: string
          location?: string
          status?: 'available' | 'occupied' | 'maintenance'
          vendor_id?: string | null
        }
      }
      admin_profiles: {
        Row: {
          id: string
          auth_user_id: string
          first_name: string | null
          last_name: string | null
          email: string
          phone_number: string | null
          username: string | null
          role: string
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          auth_user_id: string
          first_name?: string | null
          last_name?: string | null
          email: string
          phone_number?: string | null
          username?: string | null
          role?: string
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          auth_user_id?: string
          first_name?: string | null
          last_name?: string | null
          email?: string
          phone_number?: string | null
          username?: string | null
          role?: string
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
