import { Query } from "mongoose";
import { excludeField } from "../constants";

export class QueryBuilder<T> {
  public modelQuery: Query<T[], T>;
  public readonly query: Record<string, string | undefined>;

  private filterQuery: Record<string, any> = {};

  constructor(
    modelQuery: Query<T[], T>,
    query: Record<string, string | undefined>
  ) {
    this.modelQuery = modelQuery;
    this.query = query;
  }

  filter(): this {
    const filter: Record<string, any> = { ...this.query };

    for (const field of excludeField) delete filter[field];

    for (const k of Object.keys(filter)) {
      if (filter[k] === undefined || filter[k] === "") delete filter[k];
    }

    this.filterQuery = { ...this.filterQuery, ...filter };
    return this;
  }

  search(searchableFields: string[]): this {
    const searchTerm = this.query.searchTerm;

    if (searchTerm) {
      this.filterQuery = {
        ...this.filterQuery,
        $or: searchableFields.map((field) => ({
          [field]: { $regex: searchTerm, $options: "i" },
        })),
      };
    }

    return this;
  }

  private isFilterApplied = false;

  private applyFilter(): void {
    if (this.isFilterApplied) return;
    this.modelQuery = this.modelQuery.find(this.filterQuery);
    this.isFilterApplied = true;
  }

  sort(): this {
    const sort = this.query.sort || "-createdAt";
    this.modelQuery = this.modelQuery.sort(sort);
    return this;
  }

  fields(): this {
    const fields = this.query.fields?.split(",").join(" ") || "";
    this.modelQuery = this.modelQuery.select(fields);
    return this;
  }

  paginate(): this {
    const page = Number(this.query.page) || 1;
    const limit = Number(this.query.limit) || 10;
    const skip = (page - 1) * limit;

    this.modelQuery = this.modelQuery.skip(skip).limit(limit);
    return this;
  }

  /**
   * Note:
   * 1. .lean() is used here to return plain JavaScript objects
   *    instead of full Mongoose Documents.
   * 2. This is intended for read-only queries (e.g., GET API).
   *    - Lean objects are faster to fetch and use less memory.
   *    - They do NOT have Mongoose methods like `.save()`, `.populate()`, or virtuals.
   * 3. Use this when you only need the data for reading/displaying,
   *    not for updating/saving back to the database.
   */

  build() {
    this.applyFilter();
    return this.modelQuery.lean();
  }

  async getMeta() {
    const page = Number(this.query.page) || 1;
    const limit = Number(this.query.limit) || 10;

    const total = await this.modelQuery.model.countDocuments(this.filterQuery);
    const totalPage = Math.ceil(total / limit);

    return { page, limit, total, totalPage };
  }
}
