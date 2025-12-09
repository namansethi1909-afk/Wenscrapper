import { Request, Response } from 'express';
import axios from 'axios';

export const proxyVideo = async (req: Request, res: Response) => {
    const videoUrl = req.query.url as string;
    if (!videoUrl) {
        return res.status(400).send('No URL provided');
    }

    try {
        // Forward Range header if present (crucial for seeking/playback)
        const headers: any = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
            'Referer': 'https://www.xnxx.com/'
        };

        if (req.headers.range) {
            headers['Range'] = req.headers.range;
        }

        const response = await axios({
            method: 'GET',
            url: videoUrl,
            responseType: 'stream',
            headers
        });

        // Forward content headers
        if (response.headers['content-length']) res.setHeader('Content-Length', response.headers['content-length']);
        if (response.headers['content-type']) res.setHeader('Content-Type', response.headers['content-type']);
        if (response.headers['content-range']) res.setHeader('Content-Range', response.headers['content-range']);
        if (response.headers['accept-ranges']) res.setHeader('Accept-Ranges', response.headers['accept-ranges']);

        // Status code (206 for partial, 200 for full)
        res.status(response.status);

        // Pipe stream
        response.data.pipe(res);

    } catch (error: any) {
        console.error('Proxy Error:', error.message);
        if (!res.headersSent) res.status(500).send('Proxy Stream Failed');
    }
};
