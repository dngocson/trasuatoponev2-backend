import { Query } from "mongoose";

class APIfeatures {
  public query: Query<any, any>;
  public queryString: Record<string, any>;
  constructor(query: Query<any, any>, queryString: Record<string, any>) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    // 1.Filtering
    const queryObj = { ...this.queryString };
    const excludedFields = ["page", "sort", "limit", "fields"];
    excludedFields.forEach((el: string) => delete queryObj[el]);

    // 2.Advance filtering
    let queryString = JSON.stringify(queryObj);
    queryString = queryString.replace(
      /\b(gte|gt|lte|lt)\b/g,
      (match) => `$${match}`
    );
    this.query = this.query.find(JSON.parse(queryString));
    return this;
  }

  sort() {
    if (this.queryString.sort) {
      // Sort multiple: sort('a','b')
      const sortBy = this.queryString.sort.split(",").join(" ");
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort("-createAt");
    }
    return this;
  }

  limitFields() {
    // 3. Limiting Fields
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(",").join(" ");
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select("-__v");
    }
    return this;
  }

  paginate() {
    // 4. Paginate
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}

/////////////////////////////////////////////////////////////////////////
export default APIfeatures;
