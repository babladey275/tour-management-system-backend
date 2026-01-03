import { model, Schema } from "mongoose";
import { ITour, ITourType } from "./tour.interface";

const tourTypeSchema = new Schema<ITourType>(
  {
    name: { type: String, required: true, unique: true },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const TourType = model<ITourType>("TourType", tourTypeSchema);

const tourSchema = new Schema<ITour>(
  {
    title: { type: String, required: true },
    slug: { type: String, unique: true },
    description: { type: String },
    images: { type: [String], default: [] },
    location: { type: String },
    costFrom: { type: Number },
    startDate: { type: Date },
    endDate: { type: Date },
    departureLocation: {type: String},
    arrivalLocation: {type: String},
    included: { type: [String], default: [] },
    excluded: { type: [String], default: [] },
    amenities: { type: [String], default: [] },
    tourPlan: { type: [String], default: [] },
    maxGuest: { type: Number },
    minAge: { type: Number },
    division: {
      type: Schema.Types.ObjectId,
      ref: "Division",
      required: true,
    },
    tourType: {
      type: Schema.Types.ObjectId,
      ref: "TourType",
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Pre-save
tourSchema.pre("save", async function () {
  if (!this.isModified("title")) return;

  const baseSlug = this.title.toLowerCase().trim().replace(/\s+/g, "-");
  let slug = baseSlug;
  let counter = 0;

  while (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (this.constructor as any).exists({ slug, _id: { $ne: this._id } })
  ) {
    counter++;
    slug = `${baseSlug}-${counter}`;
  }

  this.slug = slug;
});

// Pre-findOneAndUpdate
tourSchema.pre("findOneAndUpdate", async function () {
  const update = this.getUpdate() as Partial<ITour>;
  if (!update?.title) return;

  const baseSlug = update.title.toLowerCase().trim().replace(/\s+/g, "-");
  let slug = baseSlug;
  let counter = 0;

  const query = this.getQuery() as { _id?: string };
  while (await this.model.exists({ slug, _id: { $ne: query._id } })) {
    counter++;
    slug = `${baseSlug}-${counter}`;
  }

  update.slug = slug;
  this.setUpdate(update);
});

export const Tour = model<ITour>("Tour", tourSchema);
