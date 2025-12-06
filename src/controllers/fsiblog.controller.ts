import type { NextFunction, Request, Response } from "express";
import { BadRequestError, NotFoundError } from "../handler/error.handler";
import { FsiBlog } from "../scrapper/fsiblog.scrapper";
import type { Details, Home, Search, Stream } from "../types";

export const fsiblogSearch = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { q } = req.query as { q?: string };
    const page = req.query.page as string | undefined;
    if (!q || typeof q !== "string") throw new BadRequestError("q is required");

    const scraper = new FsiBlog();
    let results: Search[] = [];

    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        results = await scraper.getSearch(q, page);
        if (results.length) break;
        await new Promise((r) => setTimeout(r, 200));
      } catch (err) {
        console.log(err);
      }
    }

    if (!results.length) throw new NotFoundError(`no results for ${q}`);
    return res.status(200).json(results);
  } catch (error) {
    next(error);
  }
};

export const fsiblogHome = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const page = (req.query.page as string) ?? "1";
    const scraper = new FsiBlog();
    let results: Home[] = [];

    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        results = await scraper.getHome(page);
        if (results.length) break;
        await new Promise((r) => setTimeout(r, 200));
      } catch (err) {
        console.log(err);
      }
    }

    if (!results.length) throw new NotFoundError(`no results for page ${page}`);
    return res.status(200).json(results);
  } catch (error) {
    next(error);
  }
};

export const fsiblogDetails = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.body as { id?: string };
    if (!id) throw new BadRequestError("id is required");
    const scraper = new FsiBlog();
    let details: Details | undefined;

    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        details = await scraper.getDetails(id);
        if (details) break;
        await new Promise((r) => setTimeout(r, 200));
      } catch (err) {
        console.log(err);
      }
    }

    if (!details) throw new NotFoundError(`details not found for ${id}`);
    return res.status(200).json(details);
  } catch (error) {
    next(error);
  }
};

export const fsiblogStreams = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.body as { id?: string };
    if (!id) throw new BadRequestError("id is required");
    const scraper = new FsiBlog();
    let stream: Stream | undefined;

    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        stream = await scraper.getStreams(id);
        if (stream) break;
        await new Promise((r) => setTimeout(r, 200));
      } catch (err) {
        console.log(err);
      }
    }

    if (!stream) throw new NotFoundError(`stream not found for ${id}`);
    return res.status(200).json([stream]);
  } catch (error) {
    next(error);
  }
};
