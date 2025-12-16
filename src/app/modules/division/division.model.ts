import { model, Schema } from "mongoose";
import { IDivision } from "./division.interface";

const divisionSchema = new Schema<IDivision>(
  {
    name: { type: String, required: true, unique: true },
    slug: { type: String, unique: true },
    thumbnail: { type: String },
    description: { type: String },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Pre-save middleware (create)

divisionSchema.pre("save", async function (next) {
  if (!this.isModified("name")) return;

  const baseSlug = this.name.toLowerCase().trim().replace(/\s+/g, "-");
  let slug = `${baseSlug}-division`;
  let counter = 0;

  while (
    await (this.constructor as any).exists({
      slug,
      _id: { $ne: this._id }, // ignore self if updating
    })
  ) {
    counter++;
    slug = `${baseSlug}-division-${counter}`;
  }

  this.slug = slug;
});

// Pre-update middleware hook (findOneAndUpdate)

divisionSchema.pre("findOneAndUpdate", async function () {
  const update = this.getUpdate() as Partial<IDivision>;
  if (!update?.name) return; // name not updated, slug unchanged

  const baseSlug = update.name.toLowerCase().trim().replace(/\s+/g, "-");
  let slug = `${baseSlug}-division`;
  let counter = 0;

  const query = this.getQuery() as { _id?: string };
  while (
    await this.model.exists({
      slug,
      _id: { $ne: query._id }, // ignore the same document
    })
  ) {
    counter++;
    slug = `${baseSlug}-division-${counter}`;
  }

  update.slug = slug;
  this.setUpdate(update);
});

export const Division = model<IDivision>("Division", divisionSchema);
