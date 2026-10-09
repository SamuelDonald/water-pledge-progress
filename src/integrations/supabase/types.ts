export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

type PropertyRow = {
  id: string;
  slug: string;
  title: string;
  location: string;
  city: string;
  status: string;
  property_type: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  lot_size: number | null;
  description: string;
  neighborhood: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  is_featured: boolean;
  is_published: boolean;
  created_at: string;
  updated_at: string;
};

type PropertyMediaRow = {
  id: string;
  property_id: string;
  media_type: string;
  url: string;
  caption: string | null;
  sort_order: number;
  created_at: string;
};

type InquiryRow = {
  id: string;
  property_id: string | null;
  name: string;
  phone: string;
  email: string;
  message: string;
  allow_phone: boolean;
  allow_sms: boolean;
  allow_whatsapp: boolean;
  created_at: string;
};

type AdminUserRow = {
  email: string;
};

type TableShape<Row, Insert, Update = Partial<Insert>> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

export type Database = {
  __InternalSupabase: { PostgrestVersion: "14.15" };
  public: {
    Tables: {
      properties: TableShape<
        PropertyRow,
        Omit<PropertyRow, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
          price?: number;
          bedrooms?: number;
          bathrooms?: number;
          sqft?: number;
          lot_size?: number | null;
          description?: string;
          status?: string;
          is_featured?: boolean;
          is_published?: boolean;
        }
      >;
      property_media: TableShape<
        PropertyMediaRow,
        Omit<PropertyMediaRow, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
          caption?: string | null;
          sort_order?: number;
        }
      >;
      inquiries: TableShape<
        InquiryRow,
        Omit<InquiryRow, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
          property_id?: string | null;
          allow_phone?: boolean;
          allow_sms?: boolean;
          allow_whatsapp?: boolean;
        }
      >;
      admin_users: TableShape<AdminUserRow, AdminUserRow>;
    };
    Views: Record<string, never>;
    Functions: {
      is_navalhomes_admin: { Args: Record<PropertyKey, never>; Returns: boolean };
      set_navalhomes_updated_at: { Args: Record<PropertyKey, never>; Returns: unknown };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
