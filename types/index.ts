// Common types used throughout the application

export interface Gadget {
  id: string;
  created_at?: string;
  created_by?: string;
  title: string;
  category?: string;
  image_urls?: string[];
  image_url?: string | string[];
  status?: 'pending' | 'approved';
  short_review?: string;
  buy_link_1?: string;
  buy_link_2?: string;
  source_url?: string;
  
  // Network and connectivity
  network_technology?: string;
  comms_wlan?: string;
  comms_bluetooth?: string;
  comms_positioning?: string;
  comms_nfc?: string;
  comms_radio?: string;
  comms_usb?: string;
  
  // Launch info
  launch_announced?: string;
  launch_status?: string;
  
  // Body specifications
  body_dimensions?: string;
  body_weight?: string;
  body_build?: string;
  body_sim?: string;
  
  // Display specifications
  display_type?: string;
  display_size?: string;
  display_resolution?: string;
  display_protection?: string;
  
  // Platform specifications
  platform_os?: string;
  platform_chipset?: string;
  platform_cpu?: string;
  platform_gpu?: string;
  
  // Memory
  memory_internal?: string;
  
  // Camera specifications
  main_camera?: string;
  main_camera_features?: string;
  main_camera_video?: string;
  selfie_camera?: string;
  selfie_camera_video?: string;
  
  // Sound
  sound_loudspeaker?: string;
  sound_3_5mm_jack?: string;
  
  // Features
  features_sensors?: string;
  
  // Battery
  battery_type?: string;
  battery_charging?: string;
  
  // Misc
  misc_colors?: string;
  misc_models?: string;
  misc_price?: string;
  
  // View tracking
  view_count?: number;
  
  // Additional fields for flexibility
  specifications?: Record<string, string>;
  [key: string]: unknown;
}

export interface UserData {
  id: string;
  email: string;
  name: string;
  role?: string;
}

export interface User extends UserData {
  gadgets?: Array<{ id: string; [key: string]: unknown }>;
  scrapedData?: Array<{ id: string; [key: string]: unknown }>;
}

export interface GadgetWithViewCount extends Gadget {
  view_count: number;
}

export interface ScrapedData {
  network?: string;
  launch?: {
    announced?: string;
    status?: string;
  };
  body?: {
    dimensions?: string;
    weight?: string;
    build?: string;
    sim?: string;
  };
  display?: {
    type?: string;
    size?: string;
    resolution?: string;
    protection?: string;
  };
  platform?: {
    os?: string;
    chipset?: string;
    cpu?: string;
    gpu?: string;
  };
  memory?: {
    internal?: string;
  };
  camera?: {
    main?: string;
    features?: string;
    video?: string;
  };
  selfie?: {
    camera?: string;
    video?: string;
  };
  sound?: {
    loudspeaker?: string;
    jack?: string;
  };
  comms?: {
    wlan?: string;
    bluetooth?: string;
    positioning?: string;
    nfc?: string;
    radio?: string;
    usb?: string;
  };
  features?: {
    sensors?: string;
  };
  battery?: {
    type?: string;
    charging?: string;
  };
  misc?: {
    colors?: string;
    models?: string;
    price?: string;
  };
  [key: string]: unknown;
}
