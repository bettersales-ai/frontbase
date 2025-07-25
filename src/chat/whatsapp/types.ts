export type MessageType =
  | "audio"
  // | "button"
  | "document"
  // | "reaction"
  | "text"
  | "image"
  // | "interactive"
  // | "order"
  // | "sticker"
  // | "system"  // for customer number change messages
  // | "unknown"
  | "video";

export interface Text {
  body: string;
}

export interface Audio {
  id: string;
  sha256: string;
  voice: boolean;
  mime_type: string;
}

export interface Video {
  id: string;
  sha256: string;
  mime_type: string;
}

export interface Image {
  id: string;
  sha256: string;
  mime_type: string;
}

export interface Document {
  id: string;
  sha256: string;
  filename: string;
  mime_type: string;
}

export interface MessageEvent {
  id: string;
  timestamp: string;
  type: MessageType;
  file?: string; // Simulating `Path` as a string
  from: string; // Renaming `from_` to `from` directly
  text?: Text;
  image?: Image;
  audio?: Audio;
  video?: Video;
  document?: Document;
}

export interface Profile {
  name: string;
}

export interface Contact {
  wa_id: string;
  profile: Profile;
}

export interface Metadata {
  phone_number_id: string;
  display_phone_number: string;
}

export interface Origin {
  type: string;
}

export interface Conversation {
  id: string;
  origin: Origin;
  expiration_timestamp?: string;
}

export interface Pricing {
  billable: boolean;
  category: string;
  pricing_model: string;
}

export interface Status {
  id: string;
  status: string;
  timestamp: string;
  pricing?: Pricing;
  recipient_id: string;
  conversation?: Conversation;
}

export interface Value {
  metadata: Metadata;
  messaging_product: string; // Default value "whatsapp" cannot be enforced in an interface
  statuses?: Status[];
  contacts?: Contact[];
  messages?: MessageEvent[];
}

export interface Change {
  field: string;
  value: Value;
}

export interface Entry {
  id: string;
  changes: Change[];
}

export interface WhatsappEvent {
  object: string;
  entry: Entry[];
}

export interface Message {
  to: string;
  type: MessageType;
  message: MessageEvent;
  contacts: Contact[];
}


export interface ContactConversation {
  contactId: string;
  currentConversation: string;
}

export interface WhatsAppResponse {
    messaging_product: string;
    contacts: WhatsappResponseContact[];
    messages: WhatsappResponseMessage[];
}

interface WhatsappResponseContact {
    input: string;
    wa_id: string;
}

interface WhatsappResponseMessage {
    id: string;
}


export const mimeToExtension: { [key: string]: string } = {
  "audio/ogg": ".ogg",
  "audio/mpeg": ".mp3",
  "audio/wav": ".wav",
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/gif": ".gif",
  "image/bmp": ".bmp",
  "image/webp": ".webp",
  "text/plain": ".txt",
  "text/csv": ".csv",
  "text/calendar": ".ics",
  "application/zip": ".zip",
  "application/x-rar-compressed": ".rar",
  "application/x-tar": ".tar",
  "application/x-7z-compressed": ".7z",
  "application/x-xz": ".xz",
  "application/gzip": ".gz",
  "application/pdf": ".pdf",
  "application/msword": ".doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx",
  "application/vnd.ms-excel": ".xls",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": ".xlsx",
  "application/vnd.ms-powerpoint": ".ppt",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": ".pptx",
  "application/vnd.oasis.opendocument.text": ".odt",
  "application/vnd.oasis.opendocument.spreadsheet": ".ods",
  "application/vnd.oasis.opendocument.presentation": ".odp",
  "application/vnd.oasis.opendocument.graphics": ".odg",
  "application/vnd.oasis.opendocument.formula": ".odf",
  "application/vnd.ms-outlook": ".msg",
  "application/vnd.ms-publisher": ".pub",
  "application/vnd.visio": ".vsd",
  "application/vnd.visio2013": ".vsdx",
  "application/vnd.ms-access": ".mdb",
  "application/vnd.oasis.opendocument.database": ".odb",
  "application/vnd.oasis.opendocument.chart": ".odc",
  "video/mp4": ".mp4",
  "video/3gpp": ".3gp",
  "video/quicktime": ".mov",
  "video/x-msvideo": ".avi",
  "video/x-ms-wmv": ".wmv",
  "video/x-flv": ".flv",
};
