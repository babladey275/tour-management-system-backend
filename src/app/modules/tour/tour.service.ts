import { deleteImageFromCloudinary } from "../../config/cloudinary.config";
import { excludeField } from "../../constants";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { tourSearchableFields } from "./tour.constant";
import { ITour, ITourType } from "./tour.interface";
import { Tour, TourType } from "./tour.model";

const createTour = async (payload: ITour) => {
  const existingTour = await Tour.findOne({ title: payload.title });
  if (existingTour) {
    throw new Error("A tour with this title already exists.");
  }

  // const baseSlug = payload.title.toLowerCase().split(" ").join("-")
  // let slug = `${baseSlug}`

  // let counter = 0;
  // while (await Tour.exists({ slug })) {
  //     slug = `${slug}-${counter++}` // dhaka-division-2
  // }

  // payload.slug = slug;

  const tour = await Tour.create(payload);

  return tour;
};

// const getAllToursOld = async (query: Record<string, string>) => {
//   const {
//     searchTerm,
//     sort = "-createdAt",
//     fields,
//     page = 1,
//     limit = 10,
//   } = query;
//   const pageNumber = Number(page);
//   const limitNumber = Number(limit);
//   const skip = (pageNumber - 1) * limitNumber;

//   const filter = { ...query };

//   // Exclude fields that should not be part of the filter
//   for (const field of excludeField) {
//     delete filter[field];
//   }

//   // Field selection
//   const selectFields = fields ? fields.split(",").join(" ") : "";

//   // Search query
//   let searchQuery = {};

//   if (searchTerm) {
//     searchQuery = {
//       $or: tourSearchableFields.map((field) => ({
//         [field]: { $regex: searchTerm, $options: "i" },
//       })),
//     };
//   }

//   const finalQuery = { ...filter, ...searchQuery };

//   const tours = await Tour.find(finalQuery)
//     .sort(sort)
//     .select(selectFields)
//     .skip(skip)
//     .limit(limitNumber);

//   const totalTours = await Tour.countDocuments(finalQuery);

//   const totalPage = Math.ceil(totalTours / limitNumber);

//   const meta = {
//     page: pageNumber,
//     limit: limitNumber,
//     total: totalTours,
//     totalPage,
//   };
//   return {
//     data: tours,
//     meta,
//   };
// };

const getAllTours = async (query: Record<string, string>) => {
  const queryBuilder = new QueryBuilder(Tour.find(), query);

  const toursQuery = queryBuilder
    .search(tourSearchableFields)
    .filter()
    .sort()
    .fields()
    .paginate();

  const [data, meta] = await Promise.all([
    toursQuery.build(),
    queryBuilder.getMeta(),
  ]);

  return { data, meta };
};

const updateTour = async (id: string, payload: Partial<ITour>) => {
  const existingTour = await Tour.findById(id);

  if (!existingTour) {
    throw new Error("Tour not found.");
  }

  // if (payload.title) {
  //     const baseSlug = payload.title.toLowerCase().split(" ").join("-")
  //     let slug = `${baseSlug}`

  //     let counter = 0;
  //     while (await Tour.exists({ slug })) {
  //         slug = `${slug}-${counter++}` // dhaka-division-2
  //     }

  //     payload.slug = slug
  // }

  if (
    payload.images &&
    payload.images.length > 0 &&
    existingTour.images &&
    existingTour.images.length > 0
  ) {
    payload.images = [...payload.images, ...existingTour.images];
  }

  if (
    payload.deleteImages &&
    payload.deleteImages.length > 0 &&
    existingTour.images &&
    existingTour.images.length > 0
  ) {
    const restDBImages = existingTour.images.filter(
      (imageUrl) => !payload.deleteImages?.includes(imageUrl)
    );

    const updatedPayloadImages = (payload.images || [])
      .filter((imageUrl) => !payload.deleteImages?.includes(imageUrl))
      .filter((imageUrl) => !restDBImages.includes(imageUrl));

    payload.images = [...restDBImages, ...updatedPayloadImages];
  }

  const updatedTour = await Tour.findByIdAndUpdate(id, payload, { new: true });

  if (payload.deleteImages && payload.deleteImages.length > 0 && existingTour.images && existingTour.images.length > 0) {
        await Promise.all(payload.deleteImages.map(url => deleteImageFromCloudinary(url)))
    }

  return updatedTour;
};

const deleteTour = async (id: string) => {
  return await Tour.findByIdAndDelete(id);
};

const createTourType = async (payload: ITourType) => {
  const existingTourType = await TourType.findOne({ name: payload.name });

  if (existingTourType) {
    throw new Error("Tour type already exists.");
  }

  return await TourType.create(payload);
};

const getAllTourTypes = async () => {
  return await TourType.find();
};

const updateTourType = async (id: string, payload: ITourType) => {
  const existingTourType = await TourType.findById(id);
  if (!existingTourType) {
    throw new Error("Tour type not found.");
  }

  const updatedTourType = await TourType.findByIdAndUpdate(id, payload, {
    new: true,
  });
  return updatedTourType;
};

const deleteTourType = async (id: string) => {
  const existingTourType = await TourType.findById(id);
  if (!existingTourType) {
    throw new Error("Tour type not found.");
  }

  return await TourType.findByIdAndDelete(id);
};

export const TourService = {
  createTour,
  createTourType,
  deleteTourType,
  updateTourType,
  getAllTourTypes,
  getAllTours,
  updateTour,
  deleteTour,
};
