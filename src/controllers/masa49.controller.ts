import type { NextFunction, Request, Response } from "express";
import { BadRequestError, NotFoundError } from "../handler/error.handler";
import { Masa49 } from "../scrapper/masa49.scrapper";
import type { Details, Home, Search, Stream } from "../types";

export const getSearch = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const { search } = req.params;
        const page = req.query.page as string;

        if (!search || typeof search !== "string") {
            throw new BadRequestError("search is not provided");
        }

        const masa49 = new Masa49();
        let results: Search[] = [];

        for (let attempt = 0; attempt < 7; attempt++) {
            try {
                results = await masa49.getSearch(search, page);
                if (results.length > 0) break;
                await new Promise((res) => setTimeout(res, 200));
            } catch (error) {
                console.log(error);
            }
        }

        if (!results.length) {
            throw new NotFoundError(`search result not found for ${search}`);
        }

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
        const masa49 = new Masa49();
        let results: Details | undefined;

        for (let attempt = 0; attempt < 7; attempt++) {
            try {
                results = await masa49.getDetails(id as string);
                if (results) break;
                await new Promise((res) => setTimeout(res, 200));
            } catch (error) {
                console.log(error);
            }
        }

        if (!results) {
            throw new NotFoundError(`details not found for ${id}`);
        }

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

        if (!id) throw new BadRequestError("id is not provided");

        const masa49 = new Masa49();
        let results: Stream | undefined;

        for (let attempt = 0; attempt < 6; attempt++) {
            try {
                results = await masa49.getStreams(id);
                if (results) break;
                await new Promise((res) => setTimeout(res, 200));
            } catch (error) {
                console.log(error);
            }
        }

        if (!results) throw new NotFoundError(`streams not found for ${id}`);

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
        const masa49 = new Masa49();
        let results: Home[] = [];

        for (let attempt = 0; attempt < 8; attempt++) {
            try {
                results = await masa49.getHome(page);
                if (results.length > 0) break;
                await new Promise((res) => setTimeout(res, 600));
            } catch (error) {
                console.log(error);
            }
        }

        if (!results.length) {
            throw new NotFoundError(`result not found for page ${page}`);
        }

        return res.status(200).json(results);
    } catch (error) {
        next(error);
    }
};
