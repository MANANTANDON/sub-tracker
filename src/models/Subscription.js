import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    amount: {
      type: String,
      required: true,
    },
    currency: {
      type: String,
      default: "USD",
    },
    nextBillingDate: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      default: "Other",
    },
    status: {
      type: String,
      enum: ["active", "paused", "cancelled"],
      default: "active",
    },
    lastEmailDate: {
      type: Date,
      default: null,
    },
    billingCycle: {
      type: String,
      default: "monthly",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

export default mongoose.models.Subscription ||
  mongoose.model("Subscription", subscriptionSchema);
