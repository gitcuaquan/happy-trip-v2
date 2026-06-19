import mongoose from "mongoose"

const RouteSchema = new mongoose.Schema(
  {
    from: {
      id: { type: String, required: true },
      name: { type: String, required: true },
    },

    to: {
      id: { type: String, required: true },
      name: { type: String, required: true },
    },

    slug: { type: String, required: true, unique: true },

    aliases: [{ type: String }],

    distanceKm: Number,
    durationMin: Number,

    active: { type: Boolean, default: true }
  },
  { timestamps: true }
)

RouteSchema.index({ slug: 1 }, { unique: true })

RouteSchema.index(
  { "from.id": 1, "to.id": 1 },
  { unique: true }
)

RouteSchema.index({ aliases: 1 }, { sparse: true })

export default mongoose.model("Route", RouteSchema)
