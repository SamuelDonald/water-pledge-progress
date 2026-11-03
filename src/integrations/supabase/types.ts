export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      buyer_requests: {
        Row: {
          additional_notes: string | null
          admin_notes: string
          annual_income_range: string | null
          assigned_to: string | null
          buying_journey: string
          contact_consent: boolean
          contact_email: string
          contact_name: string
          contact_phone: string
          created_at: string
          credit_score_range: string | null
          down_payment_range: string
          employment_situation: string | null
          home_type: string
          id: string
          intended_use: string
          military_branch: string | null
          military_status: string
          opportunity_path: string
          preferred_area: string | null
          preferred_city: string | null
          preferred_markets: string[]
          price_range: string
          status: string
          timeline: string
          updated_at: string
        }
        Insert: {
          additional_notes?: string | null
          admin_notes?: string
          annual_income_range?: string | null
          assigned_to?: string | null
          buying_journey: string
          contact_consent?: boolean
          contact_email: string
          contact_name: string
          contact_phone: string
          created_at?: string
          credit_score_range?: string | null
          down_payment_range: string
          employment_situation?: string | null
          home_type: string
          id?: string
          intended_use: string
          military_branch?: string | null
          military_status: string
          opportunity_path: string
          preferred_area?: string | null
          preferred_city?: string | null
          preferred_markets?: string[]
          price_range: string
          status?: string
          timeline: string
          updated_at?: string
        }
        Update: {
          additional_notes?: string | null
          admin_notes?: string
          annual_income_range?: string | null
          assigned_to?: string | null
          buying_journey?: string
          contact_consent?: boolean
          contact_email?: string
          contact_name?: string
          contact_phone?: string
          created_at?: string
          credit_score_range?: string | null
          down_payment_range?: string
          employment_situation?: string | null
          home_type?: string
          id?: string
          intended_use?: string
          military_branch?: string | null
          military_status?: string
          opportunity_path?: string
          preferred_area?: string | null
          preferred_city?: string | null
          preferred_markets?: string[]
          price_range?: string
          status?: string
          timeline?: string
          updated_at?: string
        }
        Relationships: []
      }
      campaign_media: {
        Row: {
          campaign_id: string
          caption_en: string
          caption_es: string
          created_at: string
          id: string
          is_published: boolean
          media_type: string
          sort_order: number
          url: string
        }
        Insert: {
          campaign_id: string
          caption_en?: string
          caption_es?: string
          created_at?: string
          id?: string
          is_published?: boolean
          media_type?: string
          sort_order?: number
          url: string
        }
        Update: {
          campaign_id?: string
          caption_en?: string
          caption_es?: string
          created_at?: string
          id?: string
          is_published?: boolean
          media_type?: string
          sort_order?: number
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_media_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_updates: {
        Row: {
          body_en: string
          body_es: string
          campaign_id: string
          id: string
          image_url: string | null
          is_published: boolean
          published_at: string
          title_en: string
          title_es: string
        }
        Insert: {
          body_en?: string
          body_es?: string
          campaign_id: string
          id?: string
          image_url?: string | null
          is_published?: boolean
          published_at?: string
          title_en: string
          title_es: string
        }
        Update: {
          body_en?: string
          body_es?: string
          campaign_id?: string
          id?: string
          image_url?: string | null
          is_published?: boolean
          published_at?: string
          title_en?: string
          title_es?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_updates_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          beneficiaries: number
          community_id: string | null
          created_at: string
          goal_cents: number
          hero_image_url: string | null
          id: string
          is_featured: boolean
          is_published: boolean
          liters_per_usd: number
          name_en: string
          name_es: string
          need_en: string
          need_es: string
          seed_raised_cents: number
          slug: string
          status: string
          story_en: string
          story_es: string
          summary_en: string
          summary_es: string
          urgency: string
        }
        Insert: {
          beneficiaries?: number
          community_id?: string | null
          created_at?: string
          goal_cents?: number
          hero_image_url?: string | null
          id?: string
          is_featured?: boolean
          is_published?: boolean
          liters_per_usd?: number
          name_en: string
          name_es: string
          need_en: string
          need_es: string
          seed_raised_cents?: number
          slug: string
          status?: string
          story_en?: string
          story_es?: string
          summary_en?: string
          summary_es?: string
          urgency?: string
        }
        Update: {
          beneficiaries?: number
          community_id?: string | null
          created_at?: string
          goal_cents?: number
          hero_image_url?: string | null
          id?: string
          is_featured?: boolean
          is_published?: boolean
          liters_per_usd?: number
          name_en?: string
          name_es?: string
          need_en?: string
          need_es?: string
          seed_raised_cents?: number
          slug?: string
          status?: string
          story_en?: string
          story_es?: string
          summary_en?: string
          summary_es?: string
          urgency?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
        ]
      }
      communities: {
        Row: {
          created_at: string
          drought_level: number
          families_served: number
          id: string
          is_published: boolean
          latitude: number
          liters_delivered: number
          longitude: number
          name: string
          population: number
          region_en: string
          region_es: string
          slug: string
        }
        Insert: {
          created_at?: string
          drought_level?: number
          families_served?: number
          id?: string
          is_published?: boolean
          latitude: number
          liters_delivered?: number
          longitude: number
          name: string
          population?: number
          region_en?: string
          region_es?: string
          slug: string
        }
        Update: {
          created_at?: string
          drought_level?: number
          families_served?: number
          id?: string
          is_published?: boolean
          latitude?: number
          liters_delivered?: number
          longitude?: number
          name?: string
          population?: number
          region_en?: string
          region_es?: string
          slug?: string
        }
        Relationships: []
      }
      deliveries: {
        Row: {
          campaign_id: string | null
          community_id: string | null
          delivered_at: string
          families: number
          id: string
          is_published: boolean
          kind: string
          latitude: number | null
          liters: number
          longitude: number | null
          note_en: string
          note_es: string
        }
        Insert: {
          campaign_id?: string | null
          community_id?: string | null
          delivered_at?: string
          families?: number
          id?: string
          is_published?: boolean
          kind?: string
          latitude?: number | null
          liters?: number
          longitude?: number | null
          note_en?: string
          note_es?: string
        }
        Update: {
          campaign_id?: string | null
          community_id?: string | null
          delivered_at?: string
          families?: number
          id?: string
          is_published?: boolean
          kind?: string
          latitude?: number | null
          liters?: number
          longitude?: number | null
          note_en?: string
          note_es?: string
        }
        Relationships: [
          {
            foreignKeyName: "deliveries_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deliveries_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
        ]
      }
      donations: {
        Row: {
          amount_cents: number
          campaign_id: string | null
          created_at: string
          currency: string
          dedication: string | null
          donor_email: string | null
          donor_name: string | null
          frequency: string
          id: string
          is_anonymous: boolean
          liters_funded: number
          provider: string
          provider_payment_id: string | null
          provider_session_id: string | null
          status: string
        }
        Insert: {
          amount_cents: number
          campaign_id?: string | null
          created_at?: string
          currency?: string
          dedication?: string | null
          donor_email?: string | null
          donor_name?: string | null
          frequency?: string
          id?: string
          is_anonymous?: boolean
          liters_funded?: number
          provider?: string
          provider_payment_id?: string | null
          provider_session_id?: string | null
          status?: string
        }
        Update: {
          amount_cents?: number
          campaign_id?: string | null
          created_at?: string
          currency?: string
          dedication?: string | null
          donor_email?: string | null
          donor_name?: string | null
          frequency?: string
          id?: string
          is_anonymous?: boolean
          liters_funded?: number
          provider?: string
          provider_payment_id?: string | null
          provider_session_id?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "donations_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_reports: {
        Row: {
          admin_cents: number
          created_at: string
          families_served: number
          id: string
          is_published: boolean
          liters_delivered: number
          notes_en: string
          notes_es: string
          period: string
          processing_cents: number
          program_cents: number
          report_url: string | null
          total_raised_cents: number
        }
        Insert: {
          admin_cents?: number
          created_at?: string
          families_served?: number
          id?: string
          is_published?: boolean
          liters_delivered?: number
          notes_en?: string
          notes_es?: string
          period: string
          processing_cents?: number
          program_cents?: number
          report_url?: string | null
          total_raised_cents?: number
        }
        Update: {
          admin_cents?: number
          created_at?: string
          families_served?: number
          id?: string
          is_published?: boolean
          liters_delivered?: number
          notes_en?: string
          notes_es?: string
          period?: string
          processing_cents?: number
          program_cents?: number
          report_url?: string | null
          total_raised_cents?: number
        }
        Relationships: []
      }
      inquiries: {
        Row: {
          admin_notes: string
          allow_phone: boolean
          allow_sms: boolean
          allow_whatsapp: boolean
          created_at: string
          email: string
          id: string
          message: string
          name: string
          phone: string
          property_id: string | null
          status: string
        }
        Insert: {
          admin_notes?: string
          allow_phone?: boolean
          allow_sms?: boolean
          allow_whatsapp?: boolean
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          phone: string
          property_id?: string | null
          status?: string
        }
        Update: {
          admin_notes?: string
          allow_phone?: boolean
          allow_sms?: boolean
          allow_whatsapp?: boolean
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          phone?: string
          property_id?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "inquiries_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      partners: {
        Row: {
          id: string
          is_published: boolean
          name: string
          role_en: string
          role_es: string
          sort_order: number
          website: string | null
        }
        Insert: {
          id?: string
          is_published?: boolean
          name: string
          role_en?: string
          role_es?: string
          sort_order?: number
          website?: string | null
        }
        Update: {
          id?: string
          is_published?: boolean
          name?: string
          role_en?: string
          role_es?: string
          sort_order?: number
          website?: string | null
        }
        Relationships: []
      }
      properties: {
        Row: {
          address: string | null
          bathrooms: number
          bedrooms: number
          city: string
          contract_rights_verified: boolean
          created_at: string
          description: string
          id: string
          is_featured: boolean
          is_published: boolean
          latitude: number | null
          location: string
          longitude: number | null
          lot_size: number | null
          neighborhood: string | null
          opportunity_summary: string | null
          opportunity_type: string | null
          price: number
          property_type: string
          seller_or_contract_holder_label: string | null
          slug: string
          sqft: number
          status: string
          title: string
          updated_at: string
          written_disclosures_verified: boolean
        }
        Insert: {
          address?: string | null
          bathrooms?: number
          bedrooms?: number
          city?: string
          contract_rights_verified?: boolean
          created_at?: string
          description?: string
          id?: string
          is_featured?: boolean
          is_published?: boolean
          latitude?: number | null
          location: string
          longitude?: number | null
          lot_size?: number | null
          neighborhood?: string | null
          opportunity_summary?: string | null
          opportunity_type?: string | null
          price?: number
          property_type?: string
          seller_or_contract_holder_label?: string | null
          slug: string
          sqft?: number
          status?: string
          title: string
          updated_at?: string
          written_disclosures_verified?: boolean
        }
        Update: {
          address?: string | null
          bathrooms?: number
          bedrooms?: number
          city?: string
          contract_rights_verified?: boolean
          created_at?: string
          description?: string
          id?: string
          is_featured?: boolean
          is_published?: boolean
          latitude?: number | null
          location?: string
          longitude?: number | null
          lot_size?: number | null
          neighborhood?: string | null
          opportunity_summary?: string | null
          opportunity_type?: string | null
          price?: number
          property_type?: string
          seller_or_contract_holder_label?: string | null
          slug?: string
          sqft?: number
          status?: string
          title?: string
          updated_at?: string
          written_disclosures_verified?: boolean
        }
        Relationships: []
      }
      property_media: {
        Row: {
          caption: string | null
          created_at: string
          id: string
          media_type: string
          property_id: string
          sort_order: number
          storage_path: string | null
          url: string
        }
        Insert: {
          caption?: string | null
          created_at?: string
          id?: string
          media_type?: string
          property_id: string
          sort_order?: number
          storage_path?: string | null
          url?: string
        }
        Update: {
          caption?: string | null
          created_at?: string
          id?: string
          media_type?: string
          property_id?: string
          sort_order?: number
          storage_path?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_media_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      property_submissions: {
        Row: {
          address: string | null
          admin_notes: string | null
          asking_price: number
          authorization_confirmed: boolean
          bathrooms: number
          bedrooms: number
          city: string
          contract_document_path: string | null
          contract_notes: string | null
          contract_price: number | null
          contract_status: string | null
          contract_type: string | null
          created_at: string
          created_property_id: string | null
          description: string
          has_contract_rights: boolean
          id: string
          listing_status: string
          location: string
          lot_size: number | null
          media_paths: Json
          neighborhood: string | null
          preferred_contact_method: string
          property_type: string
          review_status: string
          reviewed_at: string | null
          seller_email: string
          seller_name: string
          seller_phone: string
          seller_role: string
          slug: string
          sqft: number
          title: string
          updated_at: string
          whatsapp_available: boolean
        }
        Insert: {
          address?: string | null
          admin_notes?: string | null
          asking_price?: number
          authorization_confirmed?: boolean
          bathrooms?: number
          bedrooms?: number
          city: string
          contract_document_path?: string | null
          contract_notes?: string | null
          contract_price?: number | null
          contract_status?: string | null
          contract_type?: string | null
          created_at?: string
          created_property_id?: string | null
          description?: string
          has_contract_rights?: boolean
          id?: string
          listing_status?: string
          location: string
          lot_size?: number | null
          media_paths?: Json
          neighborhood?: string | null
          preferred_contact_method?: string
          property_type: string
          review_status?: string
          reviewed_at?: string | null
          seller_email: string
          seller_name: string
          seller_phone: string
          seller_role: string
          slug: string
          sqft?: number
          title: string
          updated_at?: string
          whatsapp_available?: boolean
        }
        Update: {
          address?: string | null
          admin_notes?: string | null
          asking_price?: number
          authorization_confirmed?: boolean
          bathrooms?: number
          bedrooms?: number
          city?: string
          contract_document_path?: string | null
          contract_notes?: string | null
          contract_price?: number | null
          contract_status?: string | null
          contract_type?: string | null
          created_at?: string
          created_property_id?: string | null
          description?: string
          has_contract_rights?: boolean
          id?: string
          listing_status?: string
          location?: string
          lot_size?: number | null
          media_paths?: Json
          neighborhood?: string | null
          preferred_contact_method?: string
          property_type?: string
          review_status?: string
          reviewed_at?: string | null
          seller_email?: string
          seller_name?: string
          seller_phone?: string
          seller_role?: string
          slug?: string
          sqft?: number
          title?: string
          updated_at?: string
          whatsapp_available?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "property_submissions_created_property_id_fkey"
            columns: ["created_property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      stories: {
        Row: {
          author_name: string
          author_role_en: string
          author_role_es: string
          body_en: string
          body_es: string
          campaign_id: string | null
          community_id: string | null
          id: string
          image_url: string | null
          is_published: boolean
          published_at: string
          quote_en: string
          quote_es: string
          slug: string
          title_en: string
          title_es: string
          video_url: string | null
        }
        Insert: {
          author_name?: string
          author_role_en?: string
          author_role_es?: string
          body_en?: string
          body_es?: string
          campaign_id?: string | null
          community_id?: string | null
          id?: string
          image_url?: string | null
          is_published?: boolean
          published_at?: string
          quote_en?: string
          quote_es?: string
          slug: string
          title_en: string
          title_es: string
          video_url?: string | null
        }
        Update: {
          author_name?: string
          author_role_en?: string
          author_role_es?: string
          body_en?: string
          body_es?: string
          campaign_id?: string | null
          community_id?: string | null
          id?: string
          image_url?: string | null
          is_published?: boolean
          published_at?: string
          quote_en?: string
          quote_es?: string
          slug?: string
          title_en?: string
          title_es?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stories_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stories_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_campaign_totals: {
        Args: never
        Returns: {
          campaign_id: string
          donor_count: number
          raised_cents: number
        }[]
      }
      get_crisis_stats: { Args: never; Returns: Json }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
