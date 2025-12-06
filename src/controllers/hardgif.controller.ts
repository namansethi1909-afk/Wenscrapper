import type { NextFunction, Request, Response } from "express";
import { BadRequestError, NotFoundError } from "../handler/error.handler";
import { HardGif } from "../scrapper/hardgif.scrapper";
// import { ApiResponse } from "../handler/response.handler";
import type { Details, Home, Search, Stream } from "../types";

export const getSearch = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { search } = req.params;
    // console.log(search);

    const page = req.query.page as string;
    if (!search || typeof search !== "string") {
      throw new BadRequestError("search is not provided");
    }

    const hardGif = new HardGif();
    let results: Search[] = [];

    for (let attempt = 0; attempt < 7; attempt++) {
      try {
        results = await hardGif.getSearch(search, page);
        if (results.length > 0) break;
        await new Promise((res) => setTimeout(res, 200));
      } catch (error) {
        console.log(error);
      }
    }
    if (!results.length) {
      throw new NotFoundError(`search result not found for ${search}`);
    }

    // return ApiResponse.success(res, "HardGif search results", 200, results);
    return res.status(200).json(results);
  } catch (error) {
    next(error);
  }
};
export const getDetails = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.body;
    // const { page } = req.query;
    const hardGif = new HardGif();
    let results: Details | undefined;

    for (let attempt = 0; attempt < 7; attempt++) {
      try {
        results = await hardGif.getDetails(id as string);
        if (results) break;
        await new Promise((res) => setTimeout(res, 200));
      } catch (error) {
        console.log(error);
      }
    }
    if (!results) {
      throw new NotFoundError(`search result not found for ${id}`);
    }
    // return ApiResponse.success(res, "kambada search results", 200, results);
    return res.status(200).json(results);
  } catch (error) {
    next(error);
  }
};
export const getStreams = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.body;
    if (!id) throw new BadRequestError("searchQuery is not provided");
    const hardGif = new HardGif();
    let results: Stream | undefined;

    for (let attempt = 0; attempt < 6; attempt++) {
      try {
        results = await hardGif.getStreams(id);
        if (results) break;
        await new Promise((res) => setTimeout(res, 200));
      } catch (error) {
        console.log(error);
      }
    }

    if (!results) throw new NotFoundError(`streams not found for ${id}`);

    // return ApiResponse.success(res, "HardGif streams", 200, results);
    return res.status(200).json([results]);
  } catch (error) {
    next(error);
  }
};

export const getHome = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const page = (req.query.page as string) ?? "1";
    const hardGif = new HardGif();
    let results: Home[] = [];

    for (let attempt = 0; attempt < 8; attempt++) {
      try {
        results = await hardGif.getHome(page);
        if (results.length > 0) break;
        await new Promise((res) => setTimeout(res, 600));
      } catch (error) {
        console.log(error);
      }
    }

    if (!results.length) {
      throw new NotFoundError(`result not found for ${page}`);
    }
    // return ApiResponse.success(res, "HardGif search results", 200, results);
    return res.status(200).json(results);
  } catch (error) {
    next(error);
  }
};
