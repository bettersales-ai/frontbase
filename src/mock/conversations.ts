import { conversationsTable } from "@/db";
import { type InferSelectModel } from "drizzle-orm";

type Conversation = Omit<InferSelectModel<typeof conversationsTable>, "contact_id" | "sales_rep_id"> & {
  contact: {
    name: string;
  };
  sales_rep: {
    name: string;
  };
};

export const mockConversations = [
  {
    id: "conv1",
    status: "running",
    deleted_at: null,
    created_at: new Date("2024-01-10T10:00:00"),
    updated_at: new Date("2024-01-10T10:30:00"),
    user_id: "user1",
    contact: {
      name: "John Doe",
    },
    messages: [
      ...Array(5),
      "I'll prepare a detailed proposal for your review by tomorrow.",
    ],
    sales_rep: {
      name: "Sales Bot Alpha"
    },
    handoff_active: false,
  },
  {
    id: "conv2",
    status: "success",
    deleted_at: null,
    created_at: new Date("2024-01-09T15:20:00"),
    updated_at: new Date("2024-01-09T16:45:00"),
    user_id: "user2",
    contact: {
      name: "Jane Smith",
    },
    messages:[
      ...Array(8),
      "Great! Looking forward to our meeting next week.",
    ],
    sales_rep: {
      name: "Sales Bot Beta"
    },
    handoff_active: false,
  },
  {
    id: "conv3",
    status: "failed",
    deleted_at: null,
    created_at: new Date("2024-01-08T09:15:00"),
    updated_at: new Date("2024-01-08T14:20:00"),
    user_id: "user3",
    contact: {
      name: "Alice Johnson",
    },
    messages: [
      ...Array(3),
      "Unfortunately, we'll have to pass on this opportunity.",
    ],
    sales_rep: {
      name: "Sales Bot Gamma"
    },
    handoff_active: false,
  },
  {
    id: "conv4",
    status: "running",
    deleted_at: null,
    created_at: new Date("2024-01-07T11:30:00"),
    updated_at: new Date("2024-01-07T16:15:00"),
    user_id: "user4",
    contact: {
      name: "Bob Brown",
    },
    messages: [
      ...Array(12),
      "Could you send me more information about the enterprise plan?"
    ],
    sales_rep: {
      name: "Sales Bot Delta"
    },
    handoff_active: false,
  },
] satisfies Conversation[];
